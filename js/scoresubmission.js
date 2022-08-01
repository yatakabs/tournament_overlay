const showDebugLog = false;
const submissionInterval = 1000;
const localTest = false;

// setup online score submission
const scoresHubUrl = localTest
    ? "https://localhost:7015/scoreshub"
    : "https://full.bott.archi/scoreshub";

// parse parameters
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

const matchId = params.match;
const playerId = params.player;

console.info("matchId", matchId);
console.info("playerId", playerId);

const statusElement = document.getElementById("score_submission_status");

if (!matchId || !playerId) {
    console.info("No match or player info specified. Score submission disabled.");
    statusElement.style.display = "none";
}
else {

    const setupConnection = () => {
        console.info("Setting up online score submission.");

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(scoresHubUrl)
            .withHubProtocol(new signalR.JsonHubProtocol())
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: retryContext => {
                    return Math.random() * 3000; // random within 3 sec.
                }
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        async function start() {
            statusElement.innerText = "■";
            statusElement.style.color = "red";

            try {
                await connection.start();
                console.log("SignalR Connected.");

                statusElement.innerText = "●"
                statusElement.style.color = "cyan";
            }
            catch (err) {
                console.log(err);
                setTimeout(start, 5000);
            }
        };

        connection.onclose(async () => {
            console.warn("SignalR Disconnected.");

            statusElement.innerText = "■";
            statusElement.style.color = "red";

            await start();
        });

        connection.onreconnecting(error => {
            console.warn("SignalR Disconnected. Reconnecting...", error);

            statusElement.innerText = "■";
            statusElement.style.color = "red";
        })

        connection.onreconnected(connectionId => {
            console.warn("SignalR Reconnected.", "state", connection.state, "connectionId", connectionId);

            statusElement.innerText = "●"
            statusElement.style.color = "cyan";
        });

        start();

        return connection;
    };

    console.info("connecting...");
    const hubConnection = setupConnection();

    const submissionList = [];

    let currentBeatmap = null;
    let currentPerformance = null;
    let currentHeadDistance = 0.0;
    let songStartEvent = null;
    let timestamp = 0;
    let isCurrentSongAcceptable = false;
    let hdtDataReceived = false;

    var onlineScore = {
        onEvent: data => {
            try {
                if (showDebugLog) {
                    console.debug("HttpSiraStatusEvent", data);
                }

                if (data.status.beatmap) {
                    currentBeatmap = data.status.beatmap;
                    timestamp = data.time;

                    currentBeatmap.songCover = null;

                    // console.debug("beatmap updated.", currentBeatmap);
                }

                if (data.status.performance) {
                    currentPerformance = data.status.performance;
                    timestamp = data.time;

                    // console.debug("performance updated.", currentPerformance);
                }

                if (data.event == "pause") {
                    if (currentPerformance.currentSongTime > 0) {
                        isCurrentSongAcceptable = false;
                        console.warn("Pause detected. Score submission disabled.");
                    }
                }

                if (data.event == "songStart") {
                    songStartEvent = data;
                    songStartEvent.status.beatmap.songCover = null;
                    isCurrentSongAcceptable = false;
                    hdtDataReceived = false;
                    console.warn("Received reset");

                    try {
                        isCurrentSongAcceptable = (
                            data.status.performance.currentSongTime < 20 &&
                            data.status.mod.multiplier == 1 &&
                            data.status.mod.songSpeedMultiplier == 1
                        );

                        console.info("Song started. isAcceptable:", isCurrentSongAcceptable, data);
                    }
                    catch (error) {
                        console.error("Failed to update acceptance status.", error, data);
                    }
                }

                if (data.event == "other") {
                    const other = data.other;
                    if (typeof other !== "undefined") {
                        if (typeof other.HeadDistanceTravelled !== "undefined") {
                            if (typeof other.HeadDistanceTravelled.Distance !== "undefined") {
                                hdtDataReceived = true;
                                currentHeadDistance = other.HeadDistanceTravelled.Distance;
                            }
                        }
                    }
                }

                if (data.event == "finished") {
                    if (!hdtDataReceived) {
                        console.warn("No HDT data received. Score submission disabled.");
                        isCurrentSongAcceptable = false;
                    }

                    var playedDuration = data.time - songStartEvent.status.beatmap.start;
                    if (showDebugLog) {
                        console.info("PlayedDuration: ", playedDuration, "songLength", currentBeatmap.length, "diff", currentBeatmap.length - playedDuration);
                    }

                    if (currentBeatmap.length - playedDuration > 10000) {
                        console.warn("Suspicious skip detected. Score submission disabled.");
                        isCurrentSongAcceptable = false;
                    }

                    console.info("Song finished. isAcceptable:", isCurrentSongAcceptable, data, songStartEvent);


                    submissionList.push({
                        MatchId: matchId,
                        PlayerId: playerId,
                        SongSessionId: `${matchId}-${playerId}-${currentBeatmap.songHash}-${currentBeatmap.start}`.toLowerCase(),
                        Timestamp: timestamp,
                        Performance: currentPerformance,
                        HeadDistance: currentHeadDistance,
                        Beatmap: currentBeatmap,
                        SongStartEvent: songStartEvent,
                        IsFinished: true,
                        IsAcceptable: isCurrentSongAcceptable,
                    });
                }
            }
            catch (error) {
                console.error("Failed to handle score event.", error);
            }
        },
    };

    let lastTimestamp = 0;
    const submissionTask = async () => {
        try {
            if (timestamp == lastTimestamp) {
                if (showDebugLog) {
                    console.debug("Timestamp is not changed. Skipping score submission.", timestamp, currentBeatmap, currentPerformance);
                }
                return;
            }

            if (!currentBeatmap || !currentBeatmap.songHash) {
                if (showDebugLog) {
                    console.warn("Current Beatmap is not set. Skipping score submission.", timestamp, currentBeatmap, currentPerformance);
                }
                return;
            }

            if (!currentPerformance) {
                if (showDebugLog) {
                    console.warn("Current Performance is not set. Skipping score submission.", timestamp, currentBeatmap, currentPerformance);
                }

                return;
            }

            if (hubConnection && hubConnection.state == "Connected") {
                const snapshot = {
                    MatchId: matchId,
                    PlayerId: playerId,
                    SongSessionId: `${matchId}-${playerId}-${currentBeatmap.songHash}-${currentBeatmap.start}`.toLowerCase(),
                    Timestamp: timestamp,
                    Performance: currentPerformance,
                    Beatmap: currentBeatmap,
                    SongStartEvent: songStartEvent,
                    HeadDistance: currentHeadDistance,
                    IsFinished: false,
                    IsAcceptable: isCurrentSongAcceptable,
                };

                if (showDebugLog) {
                    console.info(snapshot);
                }

                await hubConnection.invoke("SubmitScore", snapshot);
                if (showDebugLog) {
                    // console.info(await hubConnection.invoke("Ping"));
                    console.info("Score submitted.");
                }

                const count = submissionList.length;
                for (let i = 0; i < count; i++) {
                    try {
                        const finishedSnapshot = submissionList.shift();
                        console.info("Finished song submitting.", finishedSnapshot);

                        // TODO: Change endpoint.
                        await hubConnection.invoke("SubmitScore", finishedSnapshot);

                        console.info("Finished song submitted.", finishedSnapshot);
                    }
                    catch (error) {
                        submissionList.push(finishedSnapshot);
                        console.error("Failed to submit finished score.", i, error);
                    }
                }

                lastTimestamp = timestamp;
            }
        }
        catch (error) {
            console.error("Failed to submit score event.", error, currentBeatmap);
        }
    };

    setInterval(submissionTask, submissionInterval);
}
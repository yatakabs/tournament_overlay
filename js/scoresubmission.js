const showDebugLog = false;
const submissionInterval = 250;
const localTest = false;

// setup online score submission
const scoresHubUrl = localTest
    ? "https://localhost:7015/scoreshub"
    : "http://bg-bottachi.japaneast.cloudapp.azure.com/scoreshub";


// parse parameters
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

const matchId = params.match;
const playerId = params.player;

console.info("matchId", matchId);
console.info("playerId", playerId);

if (!matchId || !playerId) {
    console.info("No match or player info specified. Disable online score submission.");
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
            try {
                await connection.start();
                console.log("SignalR Connected.");
            }
            catch (err) {
                console.log(err);
                setTimeout(start, 5000);
            }
        };

        connection.onclose(async () => {
            console.warn("SignalR Disconnected.");
            await start();
        });

        connection.onreconnected(connectionId => {
            console.warn("SignalR Reconnected.", "state", connection.state, "connectionId", connectionId);
        });

        start();

        // var lockResolver;
        // if (navigator && navigator.locks && navigator.locks.request) {
        //     const promise = new Promise((res) => {
        //         lockResolver = res;
        //     });

        //     navigator.locks.request('unique_lock_name', { mode: "shared" }, () => {
        //         return promise;
        //     });
        // }

        return connection;
    };


    console.info("connecting...");
    const hubConnection = setupConnection();

    let currentBeatmap = null;
    let currentPerformance = null;
    let timestamp = 0;

    var onlineScore = {
        onEvent: data => {
            try {
                if (showDebugLog) {
                    console.debug("HttpSiraStatusEvent", data);
                }

                if (data.status.beatmap) {
                    currentBeatmap = data.status.beatmap;
                    timestamp = data.time;

                    console.debug("beatmap updated.", currentBeatmap);
                }

                if (data.status.performance) {
                    currentPerformance = data.status.performance;
                    timestamp = data.time;

                    console.debug("performance updated.", currentPerformance);
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
                    console.debug("Timestamp did not changed. Skipping score submission.", timestamp, currentBeatmap, currentPerformance);
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
                    SongSessionId: `${matchId}-${playerId}-${currentBeatmap.songHash}-${currentPerformance.start}`,
                    Timestamp: timestamp,
                    Performance: currentPerformance,
                    Beatmap: currentBeatmap,
                    // Beatmap: {
                    //     SongHash: currentBeatmap.songHash,
                    //     SongName: currentBeatmap.songName,
                    //     SongSubName: currentBeatmap.songSubName,
                    //     SongBpm: currentBeatmap.songBpm,
                    //     Start: currentBeatmap.start,
                    //     Difficulty: currentBeatmap.difficulty,
                    //     DifficultyEnum: currentBeatmap.difficultyEnum,
                    //     Characteritic: currentBeatmap.characteritic,
                    //     LevelId: currentBeatmap.levelId,
                    //     LevelAuthorName: currentBeatmap.levelAuthorName,
                    //     SongAuthorName: currentBeatmap.songAuthorName,
                    //     // SongCover: currentBeatmap.songCover,
                    // },
                    HeadDistance: 0,
                };

                console.info(snapshot);

                await hubConnection.invoke("SubmitScore", snapshot);
                // console.info(await hubConnection.invoke("Ping"));
                lastTimestamp = timestamp;

                console.debug("Score submitted.", snapshot)
            }
        }
        catch (error) {
            console.error("Failed to submit score event.", error, currentBeatmap);
        }
    };

    setInterval(submissionTask, submissionInterval);
}
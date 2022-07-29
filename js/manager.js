function connect() {
	var ip = query.get("ip") || "localhost";
	var port = query.get("port") || 6557;

	var socket = new WebSocket(`ws://${ip}:${port}/socket`);

	socket.addEventListener("open", () => {
		console.log("WebSocket opened");
	});

	socket.addEventListener("message", (message) => {
		var data = JSON.parse(message.data);
		var event = events[data.event];

		if (event) {
			event(data);
		}

		try {
			if (typeof onlineScore !== "undefined" && onlineScore.onEvent) {
				onlineScore.onEvent(data);
			}
		}
		catch (error) {
			console.error("unexpected error with online score submission.", error)
		}
	});

	socket.addEventListener("close", () => {
		console.log("Failed to connect to server, retrying in 3 seconds");
		setTimeout(connect, 3000);
	});
}

connect();
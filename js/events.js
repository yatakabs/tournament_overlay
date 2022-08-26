const events = {
	hello(data) {
		console.log("Connected to Beat Saber");

		if (data.status.beatmap && data.status.performance) {
			ui.beatmap(data);
			ui.performance(data);
			ui.show();
		}
		if (typeof op_hello !== "undefined") op_hello(data);
	},

	songStart(data) {
		ui.beatmap(data);
		ui.performance(data);
		ui.show();
		ui.songStarted();
		if (typeof op_songStart !== "undefined") op_songStart(data);
	},

	noteCut(data) {
		ui.performance(data);
		if (typeof op_noteCut !== "undefined") op_noteCut(data);
	},

	noteFullyCut(data) {
		ui.performance(data);
		if (typeof op_noteFullyCut !== "undefined") op_noteFullyCut(data);
	},

	obstacleEnter(data) {
		ui.performance(data);
		ui.obstacleEntered(data);
		if (typeof op_obstacleEnter !== "undefined") op_obstacleEnter(data);
	},

	obstacleExit(data) {
		ui.performance(data);
		ui.obstacleExited(data);
		if (typeof op_obstacleExit !== "undefined") op_obstacleExit(data);
	},

	noteMissed(data) {
		ui.performance(data);
		if (typeof op_noteMissed !== "undefined") op_noteMissed(data);
	},

	bombCut(data) {
		ui.performance(data);
		if (typeof op_bombCut !== "undefined") op_bombCut(data);
	},

	finished(data) {
		ui.performance(data);
		if (typeof op_finished !== "undefined") op_finished(data);
	},

	failed(data) {
		ui.performance(data);
		if (typeof op_failed !== "undefined") op_failed(data);
	},

	scoreChanged(data) {
		ui.performance(data);
		if (typeof op_scoreChanged !== "undefined") op_scoreChanged(data);
	},

	energyChanged(data) {
		ui.performance(data);
		if (typeof op_energyChanged !== "undefined") op_energyChanged(data);
	},

	beatmapEvent(data) {
		if (typeof data.status.performance !== "undefined") {
			var song_time = data.status.performance.currentSongTime;
			if (typeof song_time !== "undefined") {
				ui.timer.song_time_update(song_time);
			}
		}
	},
	

	pause(data) {
		var ip = query.get("ip");
		var diff_time = 0;
		if (ip && ip != "localhost" && ip != "127.0.0.1") {
			diff_time = Date.now() - data.time;
			console.log(diff_time);
		}
		ui.timer.pause(data.status.beatmap.paused + diff_time);
		if (typeof op_pause !== "undefined") op_pause(data);
	},

	resume(data) {
		var ip = query.get("ip");
		var diff_time = 0;
		if (ip && ip != "localhost" && ip != "127.0.0.1") {
			diff_time = Date.now() - data.time;
			console.log(diff_time);
		}
		ui.timer.start(data.status.beatmap.start + diff_time, data.status.beatmap.length, false);
		if (typeof op_resume !== "undefined") op_resume(data);
	},

	menu(data) {
		ui.timer.stop();
		if (disp_hidden) {
			ui.hide();
		}
		if (typeof op_menu !== "undefined") op_menu(data);
	},

	other(data) {
		ui.other(data);
		if (typeof op_other !== "undefined") op_other(data);
	}
}
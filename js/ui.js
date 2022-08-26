const ui = (() => {
	if (html_id["overlay"]) var main = document.getElementById("overlay");
	var now_map = null;
	var pre_map = null;
	var pre_songHash = null;
	var now_energy = 50;
	var mod_instaFail = false;
	var mod_batteryEnergy = false;
	var obstacle_time = 0;
	var full_combo = true;
	var before_combo = 0;

	let latestDistance = 0.0;
	let latestAccuracy = 0.0;

	let obstaclesHitCount = 0;
	let obstaclesHitDurationInMilliSeconds = 0;
	let obstaclesEnteredAt = 0;
	let obstaclesHitLastTime = 0;
	let obstacleHit = false;
	let inObstacle = false;
	let lastInObstacle = false;

	const hashBottachiFactorMap = new Map([
		// WR/LR
		["f7a8db3992e88a4d2f6959323214add66326d657", 20],
		["b66e094113eda9f6b3bb406dd4a696a0f270fcc7", 10],
		["7cb719cbeb9bc3dc3cd60af44eff03fcc729bbd7", 30],
		["aeec8f913e0b564e248488b2993e087fd952eb4c", 30],
		["b3eb8caf68e9abdbf8f3604f184e594d2f976a98", 20],
		["76d023a4eba97f9889adc007d358070b0b228daa", 20],
		["955b524cf6ca6aedd0419398cc975153eea0049b", 40],

		// SF
		["84bcff4756ac66bf1746824b0b221eb1e6a4aff2", 50],
		["735ae30c85939316e9fb8fd47d64d7fa2a969a77", 15],
		["cbe83b7c1a12caa37c533682bcbb2eed6cd05cf2", 10],
		["0edc32c8b6414dacc62562c41953193f29e3b159", 20],
		["8a21a022dc307435907c3595b8eaa9558de77ddd", 25],
		["c2f36200d0101a81b3941773530c55bd9ef435d4", 20],
		["739391bce83da64502bc2d02b68be852d22c33b3", 30],

		// GF
		["a5e944ec579c0885654584138f21ae9177faaa26", 30],
		["d0641ddd926cd58c2dad888ec27094bd8d7a0a4a", 40],
		["b2c9121d4a23184a419293ddfb00ec2bcc4b8a9c", 20],
		["e1ec23f952595429962cb12f6501506c85cc21d9", 60],
		["73ff0f6549288c081863f29a6a0c0090d91d5295", 100],
	]);

	const hashBottachiFailureThresholdMap = new Map();

	const updateBottachi = () => {
		if (enable_hdt) {
			const factor = pre_songHash
				? hashBottachiFactorMap.get(pre_songHash.toLowerCase()) || default_bp_factor
				: default_bp_factor;
			const threshold = pre_songHash
				? hashBottachiFailureThresholdMap.get(pre_songHash.toLowerCase()) || default_bp_failure_threshold
				: default_bp_failure_threshold;

			let bp = latestAccuracy - latestDistance * factor;
			let failed = threshold == 0
				? false
				: latestDistance >= threshold;

			if (failed) {
				bp /= 2.0;
			}

			if (bp < 0) {
				bp = 0;
			}

			// console.log(factor, threshold, latestAccuracy, latestDistance, failed);

			var bpFactorContianer = document.getElementById("bottachi_factor");
			if (bpFactorContianer) {
				bpFactorContianer.innerText = "x" + factor.toFixed(1);
			}

			var bpContainer = document.getElementById("bottachi_point");
			if (bpContainer) {
				bpContainer.innerText = bp.toFixed(2) + "bp";

				if (failed != bpContainer.classList.contains("failed")) {
					if (failed) {
						bpContainer.classList.add("failed");
					}
					else {
						bpContainer.classList.remove("failed");
					}
				}
			}

			var bpFailContainer = document.getElementById("bottachi_fail");
			if (bpFailContainer && failed == bpFailContainer.classList.contains("hidden")) {
				if (failed) {
					bpFailContainer.classList.remove("hidden");
				}
				else {
					bpFailContainer.classList.add("hidden");
				}
			}
		}
	};

	const updateObstaclesDisplay = (() => {
		if (html_id["obstacles_hit_count"]) var obstaclesHitCountElement = document.getElementById("obstacles_hit_count");
		if (html_id["obstacles_hit_duration"]) var obstaclesHitDurationElement = document.getElementById("obstacles_hit_duration");

		return () => {
			if (html_id["obstacles_hit_count"]) {
				obstaclesHitCountElement.innerText = obstaclesHitCount;

				if (obstacleHit) {
					obstaclesHitCountElement.classList.remove("nohit");
				}
			}

			if (html_id["obstacles_hit_duration"]) {
				const currentDuration = obstaclesHitLastTime - obstaclesEnteredAt;
				const totalTime = (obstaclesHitLastTime != 0 && obstaclesEnteredAt != 0)
					? obstaclesHitDurationInMilliSeconds + currentDuration
					: obstaclesHitDurationInMilliSeconds;

				obstaclesHitDurationElement.innerText = (totalTime / 1000.0).toFixed(3) + "s";
				console.info("hit_duration", obstaclesHitDurationInMilliSeconds, currentDuration, totalTime)

				if (inObstacle != lastInObstacle) {
					if (inObstacle) {
						obstaclesHitDurationElement.classList.add("hit");
					}
					else {
						obstaclesHitDurationElement.classList.remove("hit");
					}

					lastInObstacle = inObstacle;
				}
			}
		}
	})();

	const songStarted = (() => {
		return (data) => {
			obstaclesHitCount = 0;
			obstaclesHitDurationInMilliSeconds = 0;
			obstaclesEnteredAt = 0;
			lastInObstacle = false;
			obstacleHit = false;

			updateObstaclesDisplay();
		};
	})();

	const obstacleEntered = (() => {
		return (data) => {
			obstacleHit = true;
			inObstacle = true;
			obstaclesHitCount++;
			obstaclesEnteredAt = data.time;
			obstaclesHitLastTime = data.time;

			updateObstaclesDisplay();
		};
	})();

	const obstacleExited = (() => {
		return (data) => {
			if (!inObstacle) {
				return;
			}

			inObstacle = false;
			obstaclesHitLastTime = data.time;

			if (obstaclesHitLastTime != 0 && obstaclesEnteredAt != 0) {
				const currentDuration = obstaclesHitLastTime - obstaclesEnteredAt;
				obstaclesHitDurationInMilliSeconds += currentDuration;
			}

			obstaclesEnteredAt = 0;
			obstaclesHitLastTime = 0;

			updateObstaclesDisplay();
		};
	})();

	const performance = (() => {
		const cut_energy = 1;
		const misscut_energy = -10;
		const miss_energy = -15;
		const drain_energy = -0.13;  //per msec
		const battery_unit = 25;
		if (html_id["rank"]) var rank = document.getElementById("rank");
		if (html_id["percentage"]) var percentage = document.getElementById("percentage");
		if (html_id["score"]) var score = document.getElementById("score");
		if (html_id["raw_score"]) var raw_score = document.getElementById("raw_score");
		if (html_id["combo"]) var combo = document.getElementById("combo");
		if (html_id["miss"]) var miss = document.getElementById("miss");
		if (html_id["energy"]) var energy = document.getElementById("energy");
		if (html_id["energy_bar"]) var energy_bar = document.getElementById("energy_bar");
		if (html_id["mod_nf"]) var mod_nf = document.getElementById("mod_nf");
		if (html_id["head_distance"]) var headDistance = document.getElementById("head_distance");

		function format(number) {
			return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}

		return (data) => {
			var performance = data.status.performance;
			if (html_id["score"]) score.innerText = format(performance.score);
			if (html_id["raw_score"]) raw_score.innerText = format(performance.rawScore);
			if (html_id["combo"]) combo.innerText = performance.combo;
			if (html_id["rank"]) rank.innerText = performance.rank;
			if (full_combo) {
				if (before_combo > performance.combo) full_combo = false;
				switch (data.event) {
					case "noteMissed":
					case "bombCut":
					case "obstacleEnter":
						full_combo = false;
				}
			}
			before_combo = performance.combo;
			if (html_id["miss"]) {
				if (full_combo) {
					miss.innerText = "FC";
				} else {
					miss.innerText = performance.missedNotes;
				}
			}
			if (typeof performance.softFailed !== "undefined") {
				if (performance.softFailed === true) {
					now_energy = null;
					if (html_id["energy"]) energy.innerText = "NF";
					if (html_id["energy_group"] && energy_display) energy_group.setAttribute("style", "visibility: hidden");
					if (html_id["mod_nf"]) {
						mod_nf.style.color = "white";
						mod_nf.innerText = "Failed";
					}
				}
			}


			var accuracy = performance.currentMaxScore > 0
				? performance.score / performance.currentMaxScore * 100.0
				: 100.0;
			latestAccuracy = accuracy;


			if (inObstacle) {
				obstaclesHitLastTime = data.time;
				updateObstaclesDisplay();
			}

			updateBottachi();

			if (html_id["percentage"]) {
				percentage.innerText = accuracy.toFixed(2) + "%";
			}

			if (now_energy !== null) {
				if (typeof performance.energy !== "undefined") {
					if (data.event === "energyChanged") {
						now_energy = performance.energy * 100;
					}
				} else {
					if (data.event === "obstacleEnter") {
						obstacle_time = data.time;
					}
					if (mod_instaFail === false && mod_batteryEnergy === false) {
						switch (data.event) {
							case "noteCut":
								now_energy += cut_energy;
								break;
							case "noteMissed":
								if (data.noteCut.saberType == null) {
									now_energy += miss_energy;
								} else {
									now_energy += misscut_energy;
								}
								break;
							case "bombCut":
								now_energy += miss_energy;
								break;
							case "obstacleExit":
								var delta_t = data.time - obstacle_time;
								now_energy += delta_t * drain_energy;
								break;
						}
					} else {
						switch (data.event) {
							case "noteMissed":
							case "bombCut":
								if (mod_instaFail === true) {
									now_energy = 0;
								} else {
									now_energy -= battery_unit;
								}
								break;
							case "obstacleExit":
								if (mod_instaFail === true) {
									now_energy = 0;
								} else {
									var delta_t = data.time - obstacle_time;
									now_energy += parseInt(delta_t * drain_energy) * battery_unit;
								}
								break;
						}
					}
				}
				if (now_energy > 100) now_energy = 100;
				if (data.event === "failed") now_energy = 0;
				if (now_energy < 0) now_energy = 0;
				if (html_id["energy"]) energy.innerText = Math.round(now_energy) + "%";
				if (html_id["energy_bar"]) energy_bar.setAttribute("style", `width: ${Math.round(now_energy)}%`);

			}

			if (typeof op_performance !== "undefined") op_performance(data, now_energy);

			if (typeof performance.HeadDistanceTravelled !== "undefined") {
				if (typeof performance.HeadDistanceTravelled.Distance !== "undefined") {
					latestDistance = performance.HeadDistanceTravelled.Distance;
					updateBottachi();

					if (html_id["head_distance"]) {
						headDistance.innerText = performance.HeadDistanceTravelled.Distance.toFixed(3) + "s";
					}
				}
			}
		}
	})();

	const other = (() => {
		if (html_id["head_distance"]) var headDistance = document.getElementById("head_distance");

		return (data) => {
			const other = data.other;
			if (typeof other !== "undefined") {
				if (typeof other.HeadDistanceTravelled !== "undefined") {
					if (typeof other.HeadDistanceTravelled.Distance !== "undefined") {
						latestDistance = other.HeadDistanceTravelled.Distance;
						updateBottachi();

						if (html_id["head_distance"]) {
							headDistance.innerText = other.HeadDistanceTravelled.Distance.toFixed(3) + "m";
						}
					}
				}
			}
		}
	})();


	const timer = (() => {
		const radius = 30;
		const circumference = radius * Math.PI * 2;

		if (html_id["progress"]) var bar = document.getElementById("progress");
		if (html_id["song_time"]) var song_time = document.getElementById("song_time");

		var active = false;

		var began;
		var duration;
		var length_min;
		var length_sec;
		var song_speed;

		var display;

		function format(time) {
			var minutes = Math.floor(time / 60);
			var seconds = time % 60;

			if (seconds < 10) {
				seconds = "0" + seconds;
			}

			return `${minutes}:${seconds}`;
		}

		function update(time) {
			time = time || Date.now();

			var delta = (time - began) * song_speed;

			var progress = Math.floor(delta / 1000);
			var percentage = Math.min(delta / duration, 1);

			if (html_id["progress"]) bar.setAttribute("style", `stroke-dashoffset: ${(1 - percentage) * circumference}px`);
			if (typeof op_timer_update !== "undefined") op_timer_update(time, delta, progress, percentage);

			// Minor optimization
			if (progress != display) {
				display = progress;
				if (html_id["song_time"]) song_time.innerText = format(progress);
				if (typeof op_timer_update_sec !== "undefined") op_timer_update_sec(time, delta, progress, percentage);
			}

			if (inObstacle) {
				obstaclesHitLastTime = Date.now();
				updateObstaclesDisplay();
			}
		}

		function loop() {
			if (active) {
				update();
				requestAnimationFrame(loop);
			}
		}

		return {
			start(time, length, speed) {
				active = true;
				if (speed != false) song_speed = speed;
				began = time;
				duration = length * song_speed;

				length_min = Math.floor(duration / 1000 / 60);
				length_sec = Math.floor(duration / 1000) % 60;
				if (length_sec < 10) {
					length_sec = "0" + length_sec;
				}
				if (html_id["song_length"]) song_length.innerText = `${length_min}:${length_sec}`;

				loop();
			},

			pause(time) {
				active = false;

				update(time);
			},

			stop() {
				active = false;
				began = undefined;
				duration = undefined;
			},

			song_time_update(song_time) {
				began = Date.now() - Math.floor(song_time * 1000 / song_speed);
				update();
			}
		}
	})();

	const beatmap = (() => {
		const beatsaver_url = 'https://beatsaver.com/api/maps/by-hash/';
		const request_timeout = 5000; //msec
		if (html_id["image"]) var cover = document.getElementById("image");

		if (html_id["title"]) var title = document.getElementById("title");
		if (html_id["subtitle"]) var subtitle = document.getElementById("subtitle");
		if (html_id["artist"]) var artist = document.getElementById("artist");
		if (html_id["mapper_header"]) var mapper_header = document.getElementById("mapper_header");
		if (html_id["mapper"]) var mapper = document.getElementById("mapper");
		if (html_id["mapper_footer"]) var mapper_footer = document.getElementById("mapper_footer");

		if (html_id["difficulty"]) var difficulty = document.getElementById("difficulty");
		if (html_id["bpm"]) var bpm = document.getElementById("bpm");
		if (html_id["njs"]) var njs = document.getElementById("njs");
		if (html_id["njs_text"]) var njs_text = document.getElementById("njs_text");
		if (html_id["bsr"]) var bsr = document.getElementById("bsr");
		if (html_id["bsr_text"]) var bsr_text = document.getElementById("bsr_text");
		if (html_id["mod"]) var mod = document.getElementById("mod");
		if (html_id["mod_nf"]) var mod_nf = document.getElementById("mod_nf");
		if (html_id["pre_bsr"]) var pre_bsr = document.getElementById("pre_bsr");
		if (html_id["pre_bsr_text"]) var pre_bsr_text = document.getElementById("pre_bsr_text");
		if (html_id["energy"]) var energy = document.getElementById("energy");
		if (html_id["energy_group"]) var energy_group = document.getElementById("energy_group");
		var httpRequest = new XMLHttpRequest();

		function format(number) {
			if (Number.isNaN(number)) {
				return "NaN";
			}

			if (Math.floor(number) !== number) {
				return number.toFixed(2);
			}

			return number.toString();
		}

		return (data) => {
			var beatmap = data.status.beatmap;
			var time = data.time;
			var mod_data = data.status.mod;
			var visibility = "visible";
			var ip = query.get("ip");
			var diff_time = 0;
			full_combo = true;
			before_combo = 0;
			if (ip && ip != "localhost" && ip != "127.0.0.1") {
				diff_time = Date.now() - data.time;
				console.log(diff_time);
			}
			timer.start(beatmap.start + diff_time, beatmap.length, mod_data.songSpeedMultiplier);
			mod_instaFail = mod_data.instaFail;
			mod_batteryEnergy = mod_data.batteryEnergy;
			if (mod_instaFail === false && mod_batteryEnergy === false) {
				if (mod_data.noFail === true) {
					now_energy = null;
					visibility = "hidden";
					if (html_id["energy"]) energy.innerText = "NF";
				} else {
					now_energy = 50;
				}
			} else {
				now_energy = 100;
			}
			if (html_id["energy_group"]) energy_group.setAttribute("style", `visibility: ${visibility}`);
			if (beatmap.difficulty === "ExpertPlus") {
				beatmap.difficulty = "Expert+";
			}

			if (html_id["image"]) cover.setAttribute("src", `data:image/png;base64,${beatmap.songCover}`);

			if (html_id["title"]) title.innerText = beatmap.songName;
			if (html_id["subtitle"]) subtitle.innerText = beatmap.songSubName;
			if (html_id["bsr"]) bsr.innerText = '';
			if (html_id["bsr_text"]) bsr_text.innerText = '';

			httpRequest.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					now_map = this.response;
					if (now_map !== null) {
						if (html_id["bsr"]) bsr.innerText = now_map.key;
						if (html_id["bsr_text"]) bsr_text.innerText = bsr_text_org;
					}
					if (typeof op_beatsaver_res !== "undefined") op_beatsaver_res(now_map);
				}
			}

			if (pre_songHash === beatmap.songHash) {
				if (bsr_display && now_map !== null) {
					if (html_id["bsr"]) bsr.innerText = now_map.key;
					if (html_id["bsr_text"]) bsr_text.innerText = bsr_text_org;
				}
			} else {
				pre_songHash = beatmap.songHash;
				pre_map = now_map;
				now_map = null;
				if (bsr_display && beatmap.songHash !== null && beatmap.songHash.match(/^[0-9A-F]{40}/i)) {
					httpRequest.open('GET', beatsaver_url + beatmap.songHash.substr(0, 40), true);
					httpRequest.timeout = request_timeout;
					httpRequest.responseType = 'json';
					httpRequest.send(null);
				}
			}

			if (html_id["artist"]) artist.innerText = beatmap.songAuthorName;
			if (beatmap.levelAuthorName) {
				if (html_id["mapper_header"]) mapper_header.innerText = mapper_header_org;
				if (html_id["mapper"]) mapper.innerText = beatmap.levelAuthorName;
				if (html_id["mapper_footer"]) mapper_footer.innerText = mapper_footer_org;
			} else {
				if (html_id["mapper_header"]) mapper_header.innerText = "";
				if (html_id["mapper"]) mapper.innerText = "";
				if (html_id["mapper_footer"]) mapper_footer.innerText = "";
			}

			if (html_id["difficulty"]) difficulty.innerText = beatmap.difficulty;
			if (html_id["bpm"]) bpm.innerText = format(beatmap.songBPM);

			if (beatmap.noteJumpSpeed) {
				if (html_id["njs"]) njs.innerText = format(beatmap.noteJumpSpeed);
				if (html_id["njs_text"]) njs_text.innerText = njs_text_org;
			} else {
				if (html_id["njs"]) njs.innerText = "";
				if (html_id["njs_text"]) njs_text.innerText = "";
			}

			if (html_id["mod"]) {
				var mod_text = "";
				if (mod_data.instaFail === true) mod_text += "IF,";
				if (mod_data.batteryEnergy === true) mod_text += "BE,";
				if (mod_data.disappearingArrows === true) mod_text += "DA,";
				if (mod_data.ghostNotes === true) mod_text += "GN,";
				if (mod_data.songSpeed === "Faster") mod_text += "FS,";
				if (mod_data.songSpeed === "Slower") mod_text += "SS,";
				if (mod_data.noFail === true) mod_text += "NF,";
				if (mod_data.obstacles === false) mod_text += "NO,";
				if (mod_data.noBombs === true) mod_text += "NB,";
				if (mod_data.noArrows === true) mod_text += "NA,";
				mod_text = mod_text.slice(0, -1);
				mod.innerText = mod_text;
			}

			if (html_id["mod_nf"]) {
				if (mod_data.noFail === true) {
					mod_nf.innerText = "";
				} else {
					mod_nf.style.color = "yellow";
					mod_nf.innerText = "No NF!";
				}
			}

			if (pre_bsr_data === null) {
				if (html_id["pre_bsr"]) pre_bsr.innerText = "";
				if (html_id["pre_bsr_text"]) pre_bsr_text.innerText = "";
			} else {
				if (html_id["pre_bsr"]) pre_bsr.innerText = pre_map.key;
				if (html_id["pre_bsr_text"]) pre_bsr_text.innerText = pre_bsr_text_org;
			}
			if (typeof op_beatmap !== "undefined") op_beatmap(data, now_map, pre_map);
		}
	})();

	return {
		hide() {
			if (html_id["overlay"]) main.classList.add("hidden");
			if (typeof op_hide !== "undefined") op_hide();
		},

		show() {
			if (html_id["overlay"]) main.classList.remove("hidden");
			if (typeof op_show !== "undefined") op_show();
		},

		performance,
		other,
		timer,
		beatmap,

		songStarted,
		obstacleEntered,
		obstacleExited,

		testBottachi(
			minAcc,
			maxDistance,
			shouldFail,
			interval,
			songHash = null) {
			const update = () => {
				latestAccuracy = minAcc + Math.random() * (100 - minAcc);
				latestDistance = typeof shouldFail === "undefined"
					? Math.random() * maxDistance
					: shouldFail
						? default_bp_failure_threshold + Math.random() * (maxDistance - default_bp_failure_threshold)
						: Math.random() * (default_bp_failure_threshold - 0.01);

				pre_songHash = songHash;
				updateBottachi();
			};

			update();

			setInterval(
				update,
				interval);
		},

		testBottachi2(
			initialAcc,
			initialDistance,
			accStep,
			distnaceStep,
			minAcc,
			maxDistance,
			interval,
			songHash = null) {
			let acc = initialAcc;
			let distance = initialDistance;

			const update = () => {
				acc -= accStep;
				if (acc < minAcc) {
					acc = minAcc;
				}

				distance += distnaceStep;
				if (distance > maxDistance) {
					distance = maxDistance;
				}

				document.getElementById("head_distance").innerText = distance.toFixed(3) + "m";
				document.getElementById("percentage").innerText = acc.toFixed(2) + "%";

				latestAccuracy = acc
				latestDistance = distance;
				pre_songHash = songHash;
				updateBottachi();
			};

			update();

			setInterval(
				update,
				interval);
		},
	}
})();

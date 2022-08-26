const query = new URLSearchParams(location.search);
var bsr_display = false;
var disp_hidden = true;
var pre_bsr_data = null;
var enable_hdt = true;
var default_bp_factor = 20.0;
var default_bp_failure_threshold = 3.0;

const check_id = ["overlay", "rank", "percentage", "combo", "score", "progress", "mod_nf", "raw_score",
	"image", "title", "subtitle", "artist", "difficulty", "bpm", "njs", "bsr", "bsr_text",
	"mapper", "mapper_header", "mapper_footer", "song_time", "song_length", "mod", "miss",
	"pre_bsr", "pre_bsr_text", "njs_text", "energy", "energy_bar", "energy_group",
	"head_distance", "bottachi_point", "bottachi_fail",
	"obstacles_hit_count", "obstacles_hit_duration"];

var html_id = {};
for (var i = 0, len = check_id.length; i < len; ++i) {
	if (document.getElementById(check_id[i]) === null) {
		html_id[check_id[i]] = false;
	} else {
		html_id[check_id[i]] = true;
	}
}
if (html_id["mapper_header"]) var mapper_header_org = document.getElementById("mapper_header").textContent;
if (html_id["mapper_footer"]) var mapper_footer_org = document.getElementById("mapper_footer").textContent;
if (html_id["bsr_text"]) var bsr_text_org = document.getElementById("bsr_text").textContent;
if (html_id["pre_bsr_text"]) var pre_bsr_text_org = document.getElementById("pre_bsr_text").textContent;
if (html_id["njs_text"]) var njs_text_org = document.getElementById("njs_text").textContent;


(() => {
	const handlers = {
		modifiers(string) {
			string.split(",").forEach((modifier) => {
				if (modifier === "no-hidden") {
					disp_hidden = false;
					if (html_id["overlay"]) document.getElementById("overlay").classList.remove("hidden");
					return;
				}

				if (modifier === "bsr") {
					bsr_display = true;
				}

				if (modifier === "nohdt") {
					enable_hdt = false;
					try {
						for (const element of document.getElementsByClassName("hdt_param")) {
							element.classList.add("hidden");
						}
					}
					catch (error) {
						console.error("Failed to change visibility of HDT parameters.", error)
					}
				}

				if (modifier === "obstacles") {
					enable_hdt = false;
					try {
						for (const element of document.getElementsByClassName("obstacles")) {
							element.classList.remove("hidden");
						}
					}
					catch (error) {
						console.error("Failed to change visibility of obstacles hit parameters.", error)
					}
				}

				var link = document.createElement("link");

				link.setAttribute("rel", "stylesheet");
				link.setAttribute("href", `./modifiers/${modifier}.css`);

				document.head.appendChild(link);
			});
		},
		bpfactor(value) {
			try {
				const factor = parseFloat(value);
				if (factor <= 0) {
					console.error("Bottachi factor must be greater than 0.");
				}
				else if (100 <= factor) {
					console.error("Bottachi factor must be less than 100.");
				}
				else if (factor) {
					default_bp_factor = factor;
					console.info("Bottachi factor set.", default_bp_factor);
				}
				else {
					console.error("Failed to parse the default bottachi factor.");
				}
			}
			catch (error) {
				console.error("Failed to parse the default bottachi factor.", error)
			}
		},

		bpfailth(value) {
			try {
				const threshold = parseFloat(value);
				if (threshold < 0) {
					default_bp_failure_threshold = 0;
					console.warn("Detected negative value. Disabling bottachi failure.", threshold);
				}
				else if (threshold >= 0) {
					default_bp_failure_threshold = threshold;
					console.info("Bottachi failure threshold set.", default_bp_failure_threshold);
				}
				else {
					console.error("Failed to parse the default bottachi failure threshold.")
				}
			}
			catch (error) {
				console.error("Failed to parse the default bottachi failure threshold.", error);
			}
		},
	};

	Object.keys(handlers).forEach((key) => {
		var value = query.get(key);

		if (value) {
			handlers[key](value);
		}
	});

	if (location.hash) {
		// Legacy URL hash support
		handlers.modifiers(location.hash.slice(1));
	}
})();
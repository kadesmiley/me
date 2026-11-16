// Tool for tracing the clickable outlines on the cabin pictures.
//
// Normally this does nothing. Add ?edit to the end of the address
// (e.g. http://127.0.0.1:5500/living-room/?edit) and:
//   - a magnifying glass follows the mouse (4x zoom, crosshair in the
//     middle) so you can put the point exactly on a corner
//   - click each corner of a thing, going around its edge in order
//     (clockwise or counter-clockwise, just don't jump across)
//   - your shape fills in as you go, with a dot on every corner
//   - Backspace undoes the last corner; Esc clears them all
//   - TO FIX AN EXISTING OUTLINE: Shift+click on it to load its corners.
//     After that, each click adds a corner into whichever edge of the
//     shape is closest to where you clicked (instead of at the end), so
//     you can just click where the missing corners should be.
//   - the finished line, like
//       --shape: polygon(38.11% 65.12%, 39.06% 61.73%, ...);
//     is at the bottom of the screen, already selected — Ctrl+C, then
//     paste it over that thing's --shape in the HTML.
(function () {
	if (!/[?&]edit\b/.test(location.search)) return;

	var ZOOM = 4;
	var LENS = 180; // size of the magnifying glass, in screen pixels

	document.querySelectorAll(".scene").forEach(function (scene) {
		scene.classList.add("scene-edit");
		var picture = scene.querySelector("img");

		// the shape you're tracing, filled in as you click
		var preview = document.createElement("div");
		preview.className = "scene-draw";
		scene.appendChild(preview);

		// a dot for each corner
		var dots = document.createElement("div");
		dots.className = "scene-dots";
		scene.appendChild(dots);

		// the magnifying glass
		var lens = document.createElement("div");
		lens.className = "scene-lens";
		lens.style.width = lens.style.height = LENS + "px";
		document.body.appendChild(lens);

		// the line of code to copy
		var output = document.createElement("input");
		output.className = "scene-output";
		output.readOnly = true;
		scene.insertAdjacentElement("afterend", output);

		var points = [];
		var history = [];      // index of each corner added, so Backspace can take it back out
		var loaded = false;    // true after Shift+clicking an existing outline
		var HINT = "Click each corner, going around the edge. Backspace = undo, Esc = start over. Shift+click an outline to load it and add corners to it.";

		// read "38.11% 65.12%, 39.06% 61.73%, ..." into corner points
		function readShape(text) {
			var nums = (text.match(/-?[\d.]+(?=%)/g) || []).map(Number);
			var list = [];
			for (var i = 0; i + 1 < nums.length; i += 2) list.push({ x: nums[i], y: nums[i + 1] });
			return list;
		}

		// where a new corner fits best: the edge it adds the least length to
		function bestSpot(p) {
			var best = points.length, bestCost = Infinity;
			function d(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
			for (var i = 0; i < points.length; i++) {
				var a = points[i], b = points[(i + 1) % points.length];
				var cost = d(a, p) + d(p, b) - d(a, b);
				if (cost < bestCost) { bestCost = cost; best = i + 1; }
			}
			return best;
		}

		function round(n) { return (Math.round(n * 100) / 100).toFixed(2); }

		function show() {
			var list = points.map(function (p) { return round(p.x) + "% " + round(p.y) + "%"; }).join(", ");
			preview.style.clipPath = points.length >= 3 ? "polygon(" + list + ")" : "none";
			preview.hidden = points.length < 3;
			dots.innerHTML = "";
			points.forEach(function (p) {
				var d = document.createElement("span");
				d.style.left = p.x + "%";
				d.style.top = p.y + "%";
				dots.appendChild(d);
			});
			output.value = points.length ? "--shape: polygon(" + list + ");" : HINT;
			if (points.length) output.select(); // highlighted, ready for Ctrl+C
		}

		// mouse position as percentages of the picture
		function where(event) {
			var r = scene.getBoundingClientRect();
			return { x: (event.clientX - r.left) / r.width * 100, y: (event.clientY - r.top) / r.height * 100, r: r };
		}

		// links don't go anywhere while editing; each click adds a corner
		scene.addEventListener("click", function (event) {
			event.preventDefault();

			// Shift+click an outline: load its corners to fix them
			if (event.shiftKey) {
				var spot = event.target.closest(".hotspot");
				if (spot) {
					points = readShape(spot.style.getPropertyValue("--shape"));
					history = [];
					loaded = true;
					show();
				}
				return;
			}

			var p = where(event);
			var corner = { x: p.x, y: p.y };
			var at = loaded && points.length >= 3 ? bestSpot(corner) : points.length;
			points.splice(at, 0, corner);
			history.push(corner);
			show();
		});

		// move the magnifying glass with the mouse
		scene.addEventListener("mousemove", function (event) {
			var p = where(event);
			lens.style.display = "block";
			lens.style.left = (event.clientX - LENS / 2) + "px";
			lens.style.top = (event.clientY - LENS / 2) + "px";
			lens.style.backgroundImage = 'url("' + picture.currentSrc + '")';
			lens.style.backgroundSize = (p.r.width * ZOOM) + "px " + (p.r.height * ZOOM) + "px";
			lens.style.backgroundPosition =
				(LENS / 2 - p.x / 100 * p.r.width * ZOOM) + "px " +
				(LENS / 2 - p.y / 100 * p.r.height * ZOOM) + "px";
		});
		scene.addEventListener("mouseleave", function () { lens.style.display = "none"; });

		document.addEventListener("keydown", function (event) {
			if (event.key === "Escape") { points = []; history = []; loaded = false; show(); }
			if (event.key === "Backspace") {
				event.preventDefault();
				// take out the last corner you added (not a loaded one)
				var last = history.pop();
				if (last) points.splice(points.indexOf(last), 1);
				else if (!loaded) points.pop();
				show();
			}
		});

		show();
	});
})();

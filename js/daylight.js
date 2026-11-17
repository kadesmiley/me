// Makes the cabin on the home page match the visitor's time of day.
//
// images/scenes/outside/ has one Minecraft screenshot per time of day,
// named by the real time it stands for: 18-30.webp = 6:30 PM.
// The list of those times is in index.html, on the <img>:
//     data-times="00-00 04-30 05-00 ..."
//
// When the page loads, this picks the latest time that has already
// happened today (at 6:45 PM → 18-30) and shows that screenshot. It
// doesn't change while the page stays open.
//
// TO ADD A SCREENSHOT: save it as images/scenes/outside/HH-MM.webp and
// add HH-MM to data-times in index.html (any order is fine).
//
// The living room uses this too (sunrise / day / sunset / night, in
// images/scenes/living-room/). If a screenshot is missing, the picture
// just stays on whatever its src already was.
(function () {
	var img = document.querySelector("img[data-daylight]");
	if (!img) return;
	var folder = img.getAttribute("data-daylight");
	var times = img.getAttribute("data-times").trim().split(/\s+/).sort(); // "04-30" sorts correctly as text

	var now = new Date();
	var two = function (n) { return (n < 10 ? "0" : "") + n; };
	var nowText = two(now.getHours()) + "-" + two(now.getMinutes());

	// latest screenshot time at or before now; before the first one of the
	// day, use the last one (it's still last night)
	var pick = times[times.length - 1];
	for (var i = 0; i < times.length; i++) {
		if (times[i] <= nowText) pick = times[i];
	}

	// if that file doesn't exist (yet), go back to the original picture
	var original = img.src;
	img.onerror = function () { img.onerror = null; img.src = original; };
	img.src = folder + pick + ".webp";
})();

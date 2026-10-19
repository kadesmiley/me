// Fills the "Incidents and Occurrences" timeline on the home page from
// timeline.txt — same idea as now.js, so it's easy to edit from a phone.
//
// Each line is   YYYY-MM-DD | what happened
// and becomes one dot on the timeline, in the same order as the file
// (so newest-at-the-top in the file = newest at the top of the page).
// Blank lines and lines starting with # are skipped.
//
// Entries are evenly spaced for now. Spacing them by the number of days
// between dates would be done here later.
(function () {
	var list = document.getElementById("timeline");
	if (!list) return;

	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	// "2026-10-18" -> "Oct 18, 2026"; anything else is shown as typed
	function prettyDate(text) {
		var parts = text.split("-");
		if (parts.length !== 3) return text;
		var month = months[parseInt(parts[1], 10) - 1];
		if (!month) return text;
		return month + " " + parseInt(parts[2], 10) + ", " + parts[0];
	}

	fetch("timeline.txt", { cache: "no-store" })
		.then(function (response) {
			if (!response.ok) throw new Error("timeline.txt not found");
			return response.text();
		})
		.then(function (text) {
			list.innerHTML = "";
			text.split("\n").forEach(function (line) {
				line = line.trim();
				if (line === "" || line.charAt(0) === "#") return;

				var bar = line.indexOf("|");
				var date = bar >= 0 ? line.slice(0, bar).trim() : "";
				var what = bar >= 0 ? line.slice(bar + 1).trim() : line;

				var item = document.createElement("li");
				if (date) {
					var when = document.createElement("span");
					when.className = "timeline-date";
					when.textContent = prettyDate(date);
					item.appendChild(when);
				}
				item.appendChild(document.createTextNode(what));
				list.appendChild(item);
			});
		})
		.catch(function () {
			list.innerHTML = "<li>Couldn't load the timeline right now.</li>";
		});
})();

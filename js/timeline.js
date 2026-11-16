// Fills a timeline (dots joined by a line) from a plain text file —
// used by the Life Logbook, so adding an event is just adding a line.
//
// The page has a spot like:
//     <ul class="timeline" data-file="logbook.txt"></ul>
//
// Each line of the file is   YYYY-MM-DD | what happened
// and becomes one dot. New events go at the BOTTOM of the file; the page
// shows the newest first. Blank lines and lines starting with # are skipped.
//
// Entries are evenly spaced for now. Spacing them by the number of days
// between dates would be done here later.
(function () {
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	// "2026-10-18" -> "Oct 18, 2026"; anything else is shown as typed
	function prettyDate(text) {
		var parts = text.split("-");
		if (parts.length !== 3) return text;
		var month = months[parseInt(parts[1], 10) - 1];
		if (!month) return text;
		return month + " " + parseInt(parts[2], 10) + ", " + parts[0];
	}

	document.querySelectorAll(".timeline[data-file]").forEach(function (list) {
		fetch(list.getAttribute("data-file"), { cache: "no-store" }) // always the latest version
			.then(function (response) {
				if (!response.ok) throw new Error(response.status);
				return response.text();
			})
			.then(function (text) {
				var items = [];
				text.split(/\r?\n/).forEach(function (line) {
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
					items.push(item);
				});

				list.innerHTML = "";
				items.reverse().forEach(function (item) { list.appendChild(item); }); // newest first
				if (!items.length) list.innerHTML = '<li class="muted">Nothing logged yet.</li>';
			})
			.catch(function () {
				list.innerHTML = '<li class="muted">Couldn\'t load the logbook. (Opening the file directly? Use Live Server.)</li>';
			});
	});
})();

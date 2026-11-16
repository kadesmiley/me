// Fills a list (To-Read Pile, To-Watch List) from a plain text file, so
// adding something is just adding a line in Notepad or on github.com.
//
// The page has a spot like:
//     <ul class="text-list" data-file="list.txt" data-style="by"></ul>
//
// Each line of the file is   Title | extra
//   data-style="by"      ->  Title by extra        (books: the author)
//   data-style="paren"   ->  Title (extra)         (movie / show)
// Blank lines and lines starting with # are skipped. Order is kept.
(function () {
	document.querySelectorAll(".text-list").forEach(function (list) {
		var style = list.getAttribute("data-style");

		fetch(list.getAttribute("data-file"), { cache: "no-store" }) // always the latest version
			.then(function (response) {
				if (!response.ok) throw new Error(response.status);
				return response.text();
			})
			.then(function (text) {
				list.innerHTML = "";
				text.split(/\r?\n/).forEach(function (line) {
					line = line.trim();
					if (line === "" || line.charAt(0) === "#") return;

					var bar = line.indexOf("|");
					var title = bar >= 0 ? line.slice(0, bar).trim() : line;
					var extra = bar >= 0 ? line.slice(bar + 1).trim() : "";

					var item = document.createElement("li");
					var strong = document.createElement("strong");
					strong.textContent = title;
					item.appendChild(strong);
					if (extra) {
						var after = style === "by" ? " by " + extra : " (" + extra.toLowerCase() + ")";
						item.appendChild(document.createTextNode(after));
					}
					list.appendChild(item);
				});
				if (!list.children.length) list.innerHTML = '<li class="muted">Nothing here yet.</li>';
			})
			.catch(function () {
				list.innerHTML = '<li class="muted">Couldn\'t load the list. (Opening the file directly? Use Live Server.)</li>';
			});
	});
})();

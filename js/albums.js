// Builds the Album of the Week page from a plain text file (albums.txt),
// so a new album can be added in Notepad (or on github.com from a phone)
// instead of in HTML.
//
// The page has a spot like:
//     <div class="album-list" data-file="albums.txt"></div>
//
// In the text file: albums are separated by a line with just ---,
// lines starting with # are ignored, and each album is "Name: value"
// lines (Album, Artist, Week of, Art). Everything after "Notes:"
// (including later lines) is the notes; a blank line starts a new
// paragraph. The album at the BOTTOM of the file is this week's — it's
// shown big at the top. The rest go under "Past Albums", newest first.
// Art: is a file name inside the art/ folder next to albums.txt.
(function () {
	document.querySelectorAll(".album-list").forEach(function (list) {
		fetch(list.getAttribute("data-file"), { cache: "no-store" }) // always the latest version
			.then(function (response) {
				if (!response.ok) throw new Error(response.status);
				return response.text();
			})
			.then(function (text) {
				var albums = text
					.split(/\r?\n/)
					.filter(function (line) { return line.trim().charAt(0) !== "#"; })
					.join("\n")
					.split(/^\s*-{3,}\s*$/m)        // one chunk per album
					.map(readAlbum)
					.filter(function (a) { return a.album; });

				list.innerHTML = "";
				if (!albums.length) {
					list.innerHTML = '<p class="muted">No album picked yet.</p>';
					return;
				}

				// the week counter: the first album in the file is Week 1,
				// the next is Week 2, and so on — counted automatically
				albums.forEach(function (a, i) { a.number = i + 1; });

				albums.reverse(); // newest (bottom of the file) first

				// this week's album: the big box
				list.appendChild(makeFeatured(albums[0]));

				// every older one: a grid of small covers
				if (albums.length > 1) {
					var heading = document.createElement("h2");
					heading.className = "album-history-title";
					heading.textContent = "Past Albums";
					list.appendChild(heading);

					var grid = document.createElement("div");
					grid.className = "album-history";
					albums.slice(1).forEach(function (a) { grid.appendChild(makeCard(a)); });
					list.appendChild(grid);
				}
			})
			.catch(function () {
				list.innerHTML = '<p class="muted">Couldn\'t load the albums. (Opening the file directly? Use Live Server.)</p>';
			});

		// "Album: Blue" lines -> { album: "Blue", ... }; everything after Notes: is the notes
		function readAlbum(chunk) {
			var a = {}, noteLines = null;
			chunk.split("\n").forEach(function (line) {
				if (noteLines) { noteLines.push(line); return; }
				var m = line.match(/^\s*([A-Za-z ]+?)\s*:\s*(.*)$/);
				if (!m) return;
				var key = m[1].toLowerCase();
				if (key === "notes") noteLines = [m[2]];
				else a[key] = m[2].trim();
			});
			a.paragraphs = (noteLines || []).join("\n").trim().split(/\n\s*\n/)
				.map(function (p) { return p.replace(/\s*\n\s*/g, " ").trim(); })
				.filter(Boolean);
			return a;
		}

		// the cover picture, or a plain square with a ♪ if there isn't one
		function cover(a) {
			if (a.art) {
				var img = document.createElement("img");
				img.className = "album-art";
				img.src = "art/" + a.art;
				img.alt = "Cover of " + a.album + (a.artist ? " by " + a.artist : "");
				img.loading = "lazy";
				return img;
			}
			var blank = document.createElement("div");
			blank.className = "album-art album-art-blank";
			blank.textContent = "♪";
			blank.setAttribute("aria-hidden", "true");
			return blank;
		}

		function makeFeatured(a) {
			var box = document.createElement("div");
			box.className = "box c3 album-featured";
			box.appendChild(cover(a));

			var words = document.createElement("div");
			words.className = "album-words";

			var label = document.createElement("p");
			label.className = "meta album-label";
			label.textContent = "Week " + a.number + (a["week of"] ? " · " + a["week of"] : "");
			words.appendChild(label);

			var h = document.createElement("h2");
			h.textContent = a.album;
			words.appendChild(h);

			if (a.artist) {
				var artist = document.createElement("p");
				artist.className = "album-artist";
				artist.textContent = a.artist;
				words.appendChild(artist);
			}

			a.paragraphs.forEach(function (text) {
				var p = document.createElement("p");
				p.textContent = text;
				words.appendChild(p);
			});

			box.appendChild(words);
			return box;
		}

		function makeCard(a) {
			var card = document.createElement("div");
			card.className = "album-card";
			card.appendChild(cover(a));

			var week = document.createElement("p");
			week.className = "meta album-label";
			week.textContent = "Week " + a.number;
			card.appendChild(week);

			var h = document.createElement("h3");
			h.textContent = a.album;
			card.appendChild(h);

			var meta = document.createElement("p");
			meta.className = "meta";
			meta.textContent = [a.artist, a["week of"]].filter(Boolean).join(" · ");
			card.appendChild(meta);
			return card;
		}
	});
})();

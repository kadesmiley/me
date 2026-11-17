// Builds the review boxes from a plain text file (reviews.txt), so new
// reviews can be written in Notepad (or on github.com from a phone)
// instead of in HTML.
//
// The page has a spot like:
//     <div class="review-list" data-file="reviews.txt" data-kind="book"></div>
// data-kind is "book" or "watch" (movies & shows).
//
// In the text file: reviews are separated by a line with just ---,
// lines starting with # are ignored, and each review is "Name: value"
// lines. Everything after "Review:" (including later lines) is the
// review itself; a blank line starts a new paragraph. The newest review
// is the one at the BOTTOM of the file, and it shows first.
// If js/search.js is loaded first, a search box + Sort dropdown is added.
(function () {
	document.querySelectorAll(".review-list").forEach(function (list) {
		var kind = list.getAttribute("data-kind");

		fetch(list.getAttribute("data-file"), { cache: "no-store" }) // always the latest version
			.then(function (response) {
				if (!response.ok) throw new Error(response.status);
				return response.text();
			})
			.then(function (text) {
				var reviews = text
					.split(/\r?\n/)
					.filter(function (line) { return line.trim().charAt(0) !== "#"; })
					.join("\n")
					.split(/^\s*-{3,}\s*$/m)        // one chunk per review
					.map(readReview)
					.filter(function (r) { return r.title; });

				list.innerHTML = "";
				if (!reviews.length) {
					list.innerHTML = '<p class="muted">No reviews yet.</p>';
					return;
				}
				reviews.forEach(function (r, i) { r.order = i; }); // 0 = top of the file
				reviews.reverse().forEach(function (r) { list.appendChild(makeBox(r)); });

				// the search box + Sort dropdown (js/search.js)
				if (window.addSearch) addSearch(list, ["newest", "highest", "lowest", "az"]);
			})
			.catch(function () {
				list.innerHTML = '<p class="muted">Couldn\'t load the reviews. (Opening the file directly? Use Live Server.)</p>';
			});

		// "Title: Dune" lines -> { title: "Dune", ... }; everything after Review: is the review
		function readReview(chunk) {
			var r = {}, reviewLines = null;
			chunk.split("\n").forEach(function (line) {
				if (reviewLines) { reviewLines.push(line); return; }
				var m = line.match(/^\s*([A-Za-z ]+?)\s*:\s*(.*)$/);
				if (!m) return;
				var key = m[1].toLowerCase();
				if (key === "review") reviewLines = [m[2]];
				else r[key] = m[2].trim();
			});
			r.paragraphs = (reviewLines || []).join("\n").trim().split(/\n\s*\n/)
				.map(function (p) { return p.replace(/\s*\n\s*/g, " ").trim(); })
				.filter(Boolean);
			return r;
		}

		// ★★★★☆ from a number (0-5). Decimals work too: 4.5 fills half of
		// the fifth star, 4.25 a quarter of it, and so on. Each star is an
		// empty ☆ with a filled ★ laid on top, cut to the right width.
		function stars(value) {
			var n = Math.max(0, Math.min(5, parseFloat(value) || 0));
			var s = document.createElement("span");
			s.className = "stars";
			s.setAttribute("role", "img");
			s.setAttribute("aria-label", n + " out of 5 stars");
			for (var i = 0; i < 5; i++) {
				var star = document.createElement("span");
				star.className = "star";
				star.textContent = "☆";
				var fill = Math.max(0, Math.min(1, n - i)); // 0 = empty, 1 = full
				if (fill > 0) {
					var full = document.createElement("span");
					full.className = "star-fill";
					full.textContent = "★";
					full.style.width = (fill * 100) + "%";
					star.appendChild(full);
				}
				s.appendChild(star);
			}
			return s;
		}

		function makeBox(r) {
			var box = document.createElement("div");
			box.className = kind === "book" ? "box c4" : "box c3";
			// for js/search.js: place in the file, rating, and title to sort by
			box.dataset.order = r.order;
			box.dataset.stars = r.stars || "";
			box.dataset.title = r.title;

			var h = document.createElement("h3");
			h.textContent = r.title;
			box.appendChild(h);

			// the small line under the title
			var meta = document.createElement("p");
			meta.className = "meta";
			var bits = [];
			if (kind === "book") {
				if (r.author) bits.push("by " + r.author);
			} else {
				if (r.type) bits.push(r.type);
				if (r.season) bits.push("season " + r.season);
			}
			bits.forEach(function (b) { meta.appendChild(document.createTextNode(b + " · ")); });
			meta.appendChild(stars(r.stars));
			var when = kind === "book" ? r["date finished"] : r["date watched"];
			if (when) meta.appendChild(document.createTextNode(" · " + (kind === "book" ? "finished " : "watched ") + when));
			box.appendChild(meta);

			r.paragraphs.forEach(function (text) {
				var p = document.createElement("p");
				p.textContent = text;
				box.appendChild(p);
			});
			return box;
		}
	});
})();

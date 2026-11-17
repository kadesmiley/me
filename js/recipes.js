// Builds the recipe boxes from a plain text file (recipes.txt), so new
// recipes can be written in Notepad (or on github.com from a phone)
// instead of in HTML.
//
// The page has a spot like:
//     <div class="recipe-list" data-file="recipes.txt"></div>
//
// In the text file: recipes are separated by a line with just ---, and
// lines starting with # are ignored. Each recipe has:
//   Title: / Serves: / Time:   one line each
//   Ingredients:               then one ingredient per line
//   Steps:                     then one step per line (numbered for you)
//   Notes:                     then any text (blank line = new paragraph)
// If js/search.js is loaded first, a search box + Sort dropdown is added.
// The newest recipe is the one at the BOTTOM of the file; it shows first.
(function () {
	var list = document.querySelector(".recipe-list");
	if (!list) return;

	fetch(list.getAttribute("data-file"), { cache: "no-store" }) // always the latest version
		.then(function (response) {
			if (!response.ok) throw new Error(response.status);
			return response.text();
		})
		.then(function (text) {
			var recipes = text
				.split(/\r?\n/)
				.filter(function (line) { return line.trim().charAt(0) !== "#"; })
				.join("\n")
				.split(/^\s*-{3,}\s*$/m)        // one chunk per recipe
				.map(readRecipe)
				.filter(function (r) { return r.title; });

			list.innerHTML = "";
			if (!recipes.length) {
				list.innerHTML = '<p class="muted">No recipes yet.</p>';
				return;
			}
			recipes.forEach(function (r, i) { r.order = i; }); // 0 = top of the file
			recipes.reverse().forEach(function (r) { list.appendChild(makeBox(r)); });

			// the search box + Sort dropdown (js/search.js)
			if (window.addSearch) addSearch(list, ["newest", "az"]);
		})
		.catch(function () {
			list.innerHTML = '<p class="muted">Couldn\'t load the recipes. (Opening the file directly? Use Live Server.)</p>';
		});

	// sort each line into the right part of the recipe
	function readRecipe(chunk) {
		var r = { ingredients: [], steps: [], notes: [] };
		var section = null; // "ingredients", "steps", or "notes" once we hit those headings

		chunk.split("\n").forEach(function (line) {
			var m = line.match(/^\s*(title|serves|time|ingredients|steps|notes)\s*:\s*(.*)$/i);
			if (m) {
				var key = m[1].toLowerCase(), value = m[2].trim();
				if (key === "ingredients" || key === "steps" || key === "notes") {
					section = key;
					if (value) r[key].push(value);   // something written on the same line counts too
				} else {
					r[key] = value;
					section = null;
				}
				return;
			}
			if (!section) return;
			if (section === "notes") { r.notes.push(line); return; }
			// list items: skip blanks, and drop any "-", "*", or "1." someone typed anyway
			var item = line.trim().replace(/^([-*•]|\d+[.)])\s*/, "");
			if (item) r[section].push(item);
		});

		r.notes = r.notes.join("\n").trim().split(/\n\s*\n/)
			.map(function (p) { return p.replace(/\s*\n\s*/g, " ").trim(); })
			.filter(Boolean);
		return r;
	}

	function add(parent, tag, text, className) {
		var el = document.createElement(tag);
		if (text) el.textContent = text;
		if (className) el.className = className;
		parent.appendChild(el);
		return el;
	}

	function makeBox(r) {
		var box = document.createElement("div");
		box.className = "box c2";
		// for js/search.js: place in the file and title to sort by
		box.dataset.order = r.order;
		box.dataset.title = r.title;
		add(box, "h3", r.title);

		var meta = [];
		if (r.serves) meta.push("Serves " + r.serves);
		if (r.time) meta.push(r.time);
		if (meta.length) add(box, "p", meta.join(" · "), "meta");

		if (r.ingredients.length) {
			add(box, "h4", "Ingredients");
			var ul = add(box, "ul");
			r.ingredients.forEach(function (i) { add(ul, "li", i); });
		}
		if (r.steps.length) {
			add(box, "h4", "Steps");
			var ol = add(box, "ol");
			r.steps.forEach(function (s) { add(ol, "li", s); });
		}
		r.notes.forEach(function (p) { add(box, "p", p); });
		return box;
	}
})();

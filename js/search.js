// Adds a search box and a "Sort:" dropdown above a list of things
// (review boxes, recipe boxes, To-Read / To-Watch lines).
//
// This file only makes the search bar. The page's own script (reviews.js,
// recipes.js, lists.js) builds the list first, then calls:
//
//     addSearch(list, ["newest", "highest", "lowest", "az"]);
//
// so load THIS file before that one:
//     <script src="../../js/search.js"></script>
//     <script src="../../js/reviews.js"></script>
//
// Each thing in the list (each child of `list`) can carry:
//   data-order   its place in the text file (0 = top line/entry)
//   data-title   what A–Z sorts by
//   data-stars   its rating (reviews only)
// Search looks at all the text you can see in each thing.
//
// The sorts you can ask for (the first one in the list is the default):
//   "newest"   bottom of the file first   (how reviews/recipes show now)
//   "file"     top of the file first      (To-Read / To-Watch order)
//   "highest"  most stars first
//   "lowest"   fewest stars first
//   "az"       by title, A to Z
function addSearch(list, sortNames) {
	// the names shown in the dropdown, and how each sort compares two things
	var SORTS = {
		newest:  { label: "Newest first",  compare: function (a, b) { return num(b, "order") - num(a, "order"); } },
		file:    { label: "List order",    compare: function (a, b) { return num(a, "order") - num(b, "order"); } },
		highest: { label: "Highest rated", compare: function (a, b) { return num(b, "stars") - num(a, "stars") || num(b, "order") - num(a, "order"); } },
		lowest:  { label: "Lowest rated",  compare: function (a, b) { return num(a, "stars") - num(b, "stars") || num(b, "order") - num(a, "order"); } },
		az:      { label: "A–Z",           compare: function (a, b) { return (a.dataset.title || "").localeCompare(b.dataset.title || "", undefined, { sensitivity: "base" }); } }
	};

	var items = Array.prototype.slice.call(list.children);
	if (!items.length) return; // nothing to search

	// remember each thing's text once (lowercase), so typing stays quick
	items.forEach(function (item) { item.searchText = item.textContent.toLowerCase(); });

	// ---- build the bar: [ Search… ]  Sort: [ Newest first ▾ ]  Showing 3 of 12 ----
	var bar = document.createElement("div");
	bar.className = "search-bar";

	var input = document.createElement("input");
	input.type = "search";
	input.placeholder = "Search…";
	input.setAttribute("aria-label", "Search");
	bar.appendChild(input);

	var select = document.createElement("select");
	select.setAttribute("aria-label", "Sort");
	sortNames.forEach(function (name) {
		var option = document.createElement("option");
		option.value = name;
		option.textContent = SORTS[name].label;
		select.appendChild(option);
	});
	if (sortNames.length > 1) {
		var label = document.createElement("label");
		label.textContent = "Sort: ";
		label.appendChild(select);
		bar.appendChild(label);
	}

	var count = document.createElement("span");
	count.className = "search-count";
	bar.appendChild(count);

	// "Nothing matches" message, shown under the list when everything is hidden
	var none = document.createElement("p");
	none.className = "muted search-none";
	none.textContent = "Nothing matches that search.";
	none.hidden = true;

	// The bar goes above the list. A To-Read / To-Watch list sits inside a
	// box, so the bar goes above that box instead of inside it.
	var spot = list.parentNode.classList.contains("box") ? list.parentNode : list;
	spot.parentNode.insertBefore(bar, spot);
	spot.parentNode.insertBefore(none, spot.nextSibling);

	input.addEventListener("input", update);
	select.addEventListener("change", update);

	// re-sort, then hide whatever doesn't contain every word typed
	function update() {
		var words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
		var shown = 0;

		items.slice().sort(SORTS[select.value].compare).forEach(function (item) {
			list.appendChild(item); // moving each one to the end puts them in sorted order
			var matches = words.every(function (word) { return item.searchText.indexOf(word) !== -1; });
			item.hidden = !matches;
			if (matches) shown++;
		});

		count.textContent = words.length ? "Showing " + shown + " of " + items.length : "";
		none.hidden = shown > 0;
		spot.hidden = shown === 0; // don't leave an empty box behind
	}

	// a number from data-order / data-stars (no stars counts as -1, so it goes last)
	function num(item, key) {
		var n = parseFloat(item.dataset[key]);
		return isNaN(n) ? -1 : n;
	}
}

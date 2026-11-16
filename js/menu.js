// The ☰ Menu / ✕ Close button that shows and hides the see-through sidebar.
//
// Whether the sidebar starts open comes from the button in the HTML:
//   aria-expanded="false"  -> starts hidden (outside, inside, the book page)
//   aria-expanded="true"   -> starts open   (the room pages)
// Clicking the button flips it; Esc closes it. Without JavaScript the
// sidebar just stays open, so the links are never out of reach.
(function () {
	var button = document.querySelector(".menu-toggle");
	if (!button) return;

	function setOpen(open) {
		document.body.classList.toggle("menu-closed", !open);
		button.setAttribute("aria-expanded", open ? "true" : "false");
		button.textContent = open ? "✕ Close" : "☰ Menu";
	}

	setOpen(button.getAttribute("aria-expanded") === "true");

	button.addEventListener("click", function () {
		setOpen(document.body.classList.contains("menu-closed"));
	});

	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape") setOpen(false);
	});
})();

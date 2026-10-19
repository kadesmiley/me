// Light/dark button. Dark is the default; clicking flips it and
// remembers the choice for next time (localStorage). The small script in
// each page's <head> re-applies the saved choice before the page draws,
// so there's no flash of the wrong theme.
document.querySelectorAll(".theme-toggle").forEach(function (button) {
	button.addEventListener("click", function () {
		var html = document.documentElement;
		var next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
		html.setAttribute("data-theme", next);
		try { localStorage.setItem("theme", next); } catch (e) {}
	});
});

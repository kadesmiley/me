// Gallery popup.
//
// Clicking a photo opens it larger, with its <figcaption> underneath.
// Click anywhere or press Esc to close. Without JavaScript, clicking a
// photo just opens the image file on its own — nothing breaks.
//
// (Tag filtering used to live here; it's on hold. The tags would go back
// on each <figure> as data-tags="..." if it returns.)
(function () {
	var links = document.querySelectorAll(".gallery a");
	if (!links.length) return;

	// one popup, reused for every photo
	var popup = document.createElement("dialog");
	popup.className = "lightbox";
	var big = document.createElement("img");
	var caption = document.createElement("p");
	popup.appendChild(big);
	popup.appendChild(caption);
	document.body.appendChild(popup);

	links.forEach(function (link) {
		link.addEventListener("click", function (event) {
			event.preventDefault();
			var figure = link.closest("figure");
			var figcaption = figure ? figure.querySelector("figcaption") : null;
			var thumb = link.querySelector("img");

			big.src = link.getAttribute("href");
			big.alt = thumb ? thumb.alt : "";
			caption.textContent = figcaption ? figcaption.textContent : "";
			caption.hidden = caption.textContent === "";
			popup.showModal();
		});
	});

	// click anywhere (photo, caption, or the dark backdrop) to close; Esc also works
	popup.addEventListener("click", function () { popup.close(); });
})();

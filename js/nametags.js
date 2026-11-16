// Name tags over the clickable things in the cabin pictures, like
// Minecraft's name tags.
//
// Every hotspot with data-label="..." gets a little tag with that text,
// placed just above the top-middle of its outline (worked out from its
// --shape, so it follows the outline if you retrace it). The tags are
// hidden until you point at the thing — that part is in style.css.
(function () {
	document.querySelectorAll(".hotspot[data-label]").forEach(function (spot) {
		// read the outline's corners: "38.11% 65.12%, 39.06% 61.73%, ..."
		var shape = spot.style.getPropertyValue("--shape");
		var nums = (shape.match(/-?[\d.]+(?=%)/g) || []).map(Number);
		if (nums.length < 6) return;

		var xs = [], ys = [];
		for (var i = 0; i < nums.length; i += 2) { xs.push(nums[i]); ys.push(nums[i + 1]); }

		var tag = document.createElement("span");
		tag.className = "nametag";
		tag.textContent = spot.getAttribute("data-label");
		tag.style.left = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2 + "%";
		tag.style.top = Math.min.apply(null, ys) + "%";
		tag.setAttribute("aria-hidden", "true"); // screen readers already get aria-label
		spot.insertAdjacentElement("afterend", tag); // must come right after its hotspot (see style.css)
	});
})();

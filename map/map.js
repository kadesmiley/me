// Map prototype.
//
// Leaflet normally shows real-world maps, but with L.CRS.Simple it treats
// the map as a flat picture measured in plain units. This "world" is
// 1600 wide x 1000 tall. Positions below are [x, y] with y going UP
// (0 = bottom edge, 1000 = top edge).
//
// TO MOVE / ADD AN ISLAND: edit the ISLANDS list. Each one has
//   name    — label shown on the map
//   href    — page it opens when clicked
//   x, y    — center of the island
//   size    — rough radius
//   shape   — any number; changing it gives the coastline a different wobble
//   details — optional small labels that only appear when zoomed in
(function () {
	var WIDTH = 1600, HEIGHT = 1000;

	var ISLANDS = [
		{ name: "Home", href: "../", x: 800, y: 500, size: 170, shape: 1,
		  details: [
			{ name: "Notice Board (timeline)", x: 770, y: 545 },
			{ name: "Town Square", x: 830, y: 455 }
		  ] },
		{ name: "Gallery", href: "../gallery/", x: 360, y: 760, size: 115, shape: 4,
		  details: [{ name: "The Overlook", x: 345, y: 790 }] },
		{ name: "The Library", href: "../reviews/", x: 1250, y: 770, size: 125, shape: 7,
		  details: [{ name: "Reading Room", x: 1270, y: 740 }] },
		{ name: "Essays", href: "../essays/", x: 330, y: 250, size: 105, shape: 2,
		  details: [{ name: "Lighthouse", x: 290, y: 215 }] },
		{ name: "Projects", href: "../projects/", x: 1180, y: 230, size: 115, shape: 9,
		  details: [{ name: "Workshop", x: 1200, y: 260 }] },
		{ name: "Find Me Elsewhere", href: "../elsewhere/", x: 1500, y: 470, size: 60, shape: 5,
		  details: [{ name: "Far Harbor", x: 1495, y: 440 }] }
	];

	// dashed boat routes from Home out to each island
	var ROUTE_FROM = [800, 500];

	// ---------- set up the map ----------
	var map = L.map("map", {
		crs: L.CRS.Simple,
		minZoom: -3,
		maxZoom: 2,
		zoomSnap: 0.25,
		attributionControl: false,
		maxBounds: [[-300, -300], [HEIGHT + 300, WIDTH + 300]], // can't drag off into nothing
		maxBoundsViscosity: 0.8
	});
	map.fitBounds([[0, 0], [HEIGHT, WIDTH]]);

	// Leaflet wants [y, x]; this lets the lists above use [x, y]
	function at(x, y) { return [y, x]; }

	// a wobbly, island-shaped outline around a center point
	function coastline(cx, cy, r, shape) {
		var points = [];
		for (var i = 0; i < 48; i++) {
			var a = (i / 48) * Math.PI * 2;
			var wobble = 1
				+ 0.16 * Math.sin(3 * a + shape)
				+ 0.09 * Math.sin(5 * a + shape * 2.1)
				+ 0.05 * Math.sin(11 * a + shape * 3.7);
			points.push(at(cx + Math.cos(a) * r * wobble, cy + Math.sin(a) * r * wobble * 0.8));
		}
		return points;
	}

	// ---------- the sea: faint chart grid ----------
	for (var gx = 0; gx <= WIDTH; gx += 100) {
		L.polyline([at(gx, 0), at(gx, HEIGHT)], { color: "#0a3a46", weight: 1, interactive: false }).addTo(map);
	}
	for (var gy = 0; gy <= HEIGHT; gy += 100) {
		L.polyline([at(0, gy), at(WIDTH, gy)], { color: "#0a3a46", weight: 1, interactive: false }).addTo(map);
	}

	// ---------- boat routes ----------
	ISLANDS.forEach(function (island) {
		if (island.href === "../") return;
		L.polyline([at(ROUTE_FROM[0], ROUTE_FROM[1]), at(island.x, island.y)], {
			color: "#7e52a0", weight: 2, opacity: 0.6, dashArray: "4 10", interactive: false
		}).addTo(map);
	});

	// ---------- islands ----------
	ISLANDS.forEach(function (island) {
		// shallow water ring around the island (decoration only)
		L.polygon(coastline(island.x, island.y, island.size * 1.15, island.shape), {
			stroke: false, fillColor: "#7e52a0", fillOpacity: 0.18, interactive: false
		}).addTo(map);

		// the island itself — clickable
		var land = L.polygon(coastline(island.x, island.y, island.size, island.shape), {
			color: "#7e52a0", weight: 2, fillColor: "#29274c", fillOpacity: 1
		}).addTo(map);

		land.bindTooltip(island.name, { permanent: true, direction: "center", className: "island-label" });

		land.on("mouseover", function () { land.setStyle({ fillColor: "#3b3870", color: "#d295bf" }); });
		land.on("mouseout", function () { land.setStyle({ fillColor: "#29274c", color: "#7e52a0" }); });
		land.on("click", function () { window.location.href = island.href; });

		// small zoom-in-only labels
		(island.details || []).forEach(function (d) {
			L.circleMarker(at(d.x, d.y), {
				radius: 3, color: "#d295bf", fillColor: "#d295bf", fillOpacity: 1,
				className: "detail", interactive: false
			}).addTo(map)
			  .bindTooltip(d.name, { permanent: true, direction: "right", offset: [6, 0], className: "detail-label" });
		});
	});

	// ---------- show details only once zoomed in ----------
	var DETAIL_ZOOM = map.getZoom() + 1; // one zoom step closer than the starting view
	function updateDetails() {
		map.getContainer().classList.toggle("zoomed", map.getZoom() >= DETAIL_ZOOM);
	}
	map.on("zoomend", updateDetails);
	updateDetails();
})();

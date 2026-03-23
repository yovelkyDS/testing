document.addEventListener("DOMContentLoaded", function () {
    initRoutePage();
    initMonitoringMap();
    initMobileNav();
});

/* =========================
   RUTAS
========================= */
const routes = {
    1: {
        title: "Ciudad Quesada - Pital",
        subtitle: "Consulta de paradas y unidades activas",
        eta: "8 min",
        delay: "Sin retraso",
        stopsBadge: "4 registradas",
        stops: [
            {
                title: "Terminal Ciudad Quesada",
                subtitle: "Punto principal de salida"
            },
            {
                title: "Hospital San Carlos",
                subtitle: "Parada oficial intermedia"
            },
            {
                title: "Cruce de Muelle",
                subtitle: "Parada oficial intermedia"
            },
            {
                title: "Centro de Pital",
                subtitle: "Punto de llegada"
            }
        ]
    },
    2: {
        title: "Ciudad Quesada - Aguas Zarcas",
        subtitle: "Ruta con unidades activas y ligera demora",
        eta: "14 min",
        delay: "Demora de 6 min",
        stopsBadge: "3 registradas",
        stops: [
            {
                title: "Terminal Ciudad Quesada",
                subtitle: "Punto principal de salida"
            },
            {
                title: "Santa Clara",
                subtitle: "Parada oficial intermedia"
            },
            {
                title: "Centro de Aguas Zarcas",
                subtitle: "Punto de llegada"
            }
        ]
    },
    3: {
        title: "Florencia - Ciudad Quesada",
        subtitle: "Ruta activa con recorrido corto",
        eta: "5 min",
        delay: "En horario",
        stopsBadge: "3 registradas",
        stops: [
            {
                title: "Centro de Florencia",
                subtitle: "Punto principal de salida"
            },
            {
                title: "Puente de La Vieja",
                subtitle: "Parada oficial intermedia"
            },
            {
                title: "Terminal Ciudad Quesada",
                subtitle: "Punto de llegada"
            }
        ]
    },
    4: {
        title: "Pital - Santa Rosa",
        subtitle: "Ruta sin paradas registradas",
        eta: "--",
        delay: "Sin información",
        stopsBadge: "0 registradas",
        stops: []
    }
};

function initRoutePage() {
    const routeCards = document.querySelectorAll(".route-card");
    const detailTitle = document.getElementById("detailTitle");
    const detailSubtitle = document.getElementById("detailSubtitle");
    const etaText = document.getElementById("etaText");
    const delayText = document.getElementById("delayText");
    const stopsBadge = document.getElementById("stopsBadge");
    const stopsList = document.getElementById("stopsList");
    const emptyStops = document.getElementById("emptyStops");
    const searchInput = document.getElementById("searchInput");

    // Si no estamos en la página de rutas, no hacer nada
    if (
        !routeCards.length ||
        !detailTitle ||
        !detailSubtitle ||
        !etaText ||
        !delayText ||
        !stopsBadge ||
        !stopsList ||
        !emptyStops
    ) {
        return;
    }

    function renderStops(stops) {
        if (!stops.length) {
            stopsList.innerHTML = "";
            emptyStops.classList.remove("is-hidden");
            return;
        }

        emptyStops.classList.add("is-hidden");

        stopsList.innerHTML = stops
            .map(
                (stop) => `
                <div class="stop-item">
                    <span class="stop-dot"></span>
                    <div>
                        <p class="stop-title">${stop.title}</p>
                        <p class="stop-subtitle">${stop.subtitle}</p>
                    </div>
                </div>
            `
            )
            .join("");
    }

    function selectRoute(routeId) {
        const route = routes[routeId];
        if (!route) return;

        routeCards.forEach((card) => {
            card.classList.toggle("selected", card.dataset.route === routeId);
        });

        detailTitle.textContent = route.title;
        detailSubtitle.textContent = route.subtitle;
        etaText.textContent = route.eta;
        delayText.textContent = route.delay;
        stopsBadge.textContent = route.stopsBadge;

        renderStops(route.stops);
    }

    routeCards.forEach((card) => {
        card.addEventListener("click", () => {
            selectRoute(card.dataset.route);
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const value = e.target.value.toLowerCase().trim();

            routeCards.forEach((card) => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(value) ? "block" : "none";
            });
        });
    }

    selectRoute("1");
}

/* =========================
   MONITOREO / MAPA
========================= */
function initMonitoringMap() {
    const mapElement = document.getElementById("busMap");

    // Si no estamos en monitoreo, salir
    if (!mapElement) return;

    // Verificar que Leaflet esté cargado
    if (typeof L === "undefined") {
        console.error("Leaflet no está cargado.");
        return;
    }

    const start = [10.3234, -84.4271];       // Ciudad Quesada
    const end = [10.5617, -84.2746];         // Pital
    const busPosition = [10.4385, -84.3380];

    const map = L.map("busMap").setView(start, 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const startIcon = L.divIcon({
        className: "custom-div-icon",
        html: '<div class="start-marker"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    const endIcon = L.divIcon({
        className: "custom-div-icon",
        html: '<div class="end-marker"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    const busIcon = L.divIcon({
        className: "custom-div-icon",
        html: '<div class="bus-marker"><i class="fa-solid fa-bus"></i></div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });

    L.marker(start, { icon: startIcon }).addTo(map).bindPopup("Inicio: Ciudad Quesada");
    L.marker(end, { icon: endIcon }).addTo(map).bindPopup("Destino: Pital");

    const bus = L.marker(busPosition, { icon: busIcon })
        .addTo(map)
        .bindPopup("Unidad NB-01 en ruta");

    // Dibujar ruta solo si el plugin de routing está cargado
    if (L.Routing) {
        L.Routing.control({
            waypoints: [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ],
            addWaypoints: false,
            draggableWaypoints: false,
            routeWhileDragging: false,
            show: false,
            createMarker: function () {
                return null;
            },
            lineOptions: {
                styles: [
                    { color: "#2563eb", opacity: 0.9, weight: 6 }
                ]
            }
        }).addTo(map);
    }

    const positions = [
        [10.4385, -84.3380],
        [10.4520, -84.3240],
        [10.4685, -84.3120],
        [10.4860, -84.3010]
    ];

    let i = 0;

    setInterval(() => {
        i = (i + 1) % positions.length;
        bus.setLatLng(positions[i]);
    }, 3000);
}

/* =========================
   NAV
========================= */
function initMobileNav() {
    const navItems = document.querySelectorAll(".mobile-nav-item");

    if (!navItems.length) return;

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            navItems.forEach((nav) => nav.classList.remove("active"));
            item.classList.add("active");
        });
    });
}
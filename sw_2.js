// El service worker se ejecuta aparte de app_2.js.
// No puede usar document.querySelector ni localStorage.
const nombreCache = "saladillo-pwa-v2";
const archivos = [
    "./index.html",
    "./style_2.css",
    "./app_2.js",
    "./manifest_2.webmanifest",
    "./icon-192_2.png",
    "./icon-512_2.png"
];

// PASO 1: descargar y guardar los archivos de la PWA.
async function guardarArchivos() {
    const cache = await caches.open(nombreCache);
    await cache.addAll(archivos);
}

// self representa al service worker. install ocurre al instalarlo.
self.addEventListener("install", function (evento) {
    // waitUntil le pide al navegador que espere a terminar el guardado.
    evento.waitUntil(guardarArchivos());
});

// PASO 2: quitar las cachés anteriores de ESTE ejercicio.
async function borrarCacheAnterior() {
    const nombres = await caches.keys();
    // for...of repite el bloque una vez por cada nombre de la lista.
    for (const nombre of nombres) {
        if (nombre.startsWith("saladillo-pwa-") && nombre !== nombreCache) {
            await caches.delete(nombre);
        }
    }
}

self.addEventListener("activate", function (evento) {
    evento.waitUntil(borrarCacheAnterior());
});

// PASO 3: buscar primero en la caché; si no está, pedir a Internet.
async function buscarArchivo(pedido) {
    const cache = await caches.open(nombreCache);
    const copia = await cache.match(pedido);

    if (copia) {
        return copia;
    }
    return fetch(pedido);
}

self.addEventListener("fetch", function (evento) {
    // Solo atendemos los archivos _2 de nuestra lista.
    // La API y los archivos de la web simple siguen su camino normal.
    for (const archivo of archivos) {
        const direccion = new URL(archivo, self.location.href);
        if (evento.request.url === direccion.href) {
            evento.respondWith(buscarArchivo(evento.request));
            return;
        }
    }
});

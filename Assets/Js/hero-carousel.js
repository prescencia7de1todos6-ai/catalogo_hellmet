/* =========================================================
   HELLMET — Assets/Js/hero-carousel.js
   =========================================================
   Carrusel de la portada (index.html): se mueve solo, lento
   y sin pausas, en un ciclo interminable (nunca "salta" ni
   se detiene al volver a la primera imagen).

   *** PARA AGREGAR TUS IMÁGENES ***
   1. Coloca los archivos en: Assets/Img/Hero/
   2. Agrégalos a la lista HERO_IMAGES de aquí abajo, con su
      ruta y un texto alternativo. El orden en la lista es el
      orden en que se muestran.
   Mientras no pongas las tuyas, se ven las de respaldo (un
   cuadro con el nombre) para que el diseño no se vea vacío.
   ========================================================= */

const HERO_IMAGES = [
  { src: "Img/Hero/paisaje_parrilada.png", alt: "Horno HELLMET" },
  { src: "Img/Hero/horno1.png", alt: "Parrilla HELLMET" },
  { src: "Img/Hero/pizzero1.png", alt: "Broastera HELLMET" },
  { src: "Img/Hero/pizzero2.png", alt: "Cocina HELLMET" },
];

function renderHeroCarousel(rutaAssets) {
  const contenedor = document.getElementById("hero-carousel-container");
  if (!contenedor) return;

  const slidesHtml = HERO_IMAGES.map((img) => `
    <div class="hero-slide">
      <img
        src="${rutaAssets}/${img.src}"
        alt="${img.alt}"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      >
      <span class="hero-slide-fallback">${img.alt}</span>
    </div>
  `).join("");

  // El truco del ciclo interminable: se repite la lista de imágenes
  // dos veces seguidas, y la animación solo recorre la MITAD del ancho
  // total. Al llegar justo a la mitad, lo que se ve es idéntico al
  // inicio, así que el salto de vuelta al 0% es invisible para el ojo.
  contenedor.innerHTML = `
    <div class="hero-carousel">
      <div class="hero-track" id="hero-track">
        ${slidesHtml}
        ${slidesHtml}
      </div>
    </div>
  `;

  activarArrastreHero();
}

/* =========================================================
   Arrastre manual: mientras el mouse/dedo está presionado,
   se pausa la animación automática y el carrusel sigue al
   puntero. Al soltar, se retoma la animación de siempre
   (vuelve a moverse sola, lenta y continua).
   ========================================================= */
function activarArrastreHero() {
  const track = document.getElementById("hero-track");
  if (!track) return;

  track.querySelectorAll("img").forEach((img) => { img.draggable = false; });

  // Tiempo sin interacción (ms) antes de que el carrusel vuelva a
  // moverse solo, luego de tocarlo/arrastrarlo.
  const ESPERA_REANUDAR = 2000;

  let arrastrando = false;
  let posInicial = 0;
  let offsetInicial = 0;
  let temporizadorReanudar = null;

  const obtenerOffsetActual = () => {
    const matriz = getComputedStyle(track).transform;
    if (matriz === "none") return 0;
    // matrix(a, b, c, d, tx, ty) -> nos interesa "tx"
    const valores = matriz.match(/matrix\(([^)]+)\)/);
    return valores ? parseFloat(valores[1].split(",")[4]) : 0;
  };

  const cancelarReanudacion = () => {
    if (temporizadorReanudar) {
      clearTimeout(temporizadorReanudar);
      temporizadorReanudar = null;
    }
  };

  // Retoma la animación automática desde la MISMA posición donde el
  // carrusel quedó al soltarlo (sin salto visual): calcula qué tan
  // avanzado está dentro de un ciclo y usa un animation-delay
  // negativo equivalente, en vez de reiniciar desde el principio.
  const reanudarAutomatico = () => {
    temporizadorReanudar = null;
    const offsetActual = obtenerOffsetActual(); // px, normalmente negativo
    const mitadAncho = track.scrollWidth / 2; // ancho de un ciclo completo
    if (mitadAncho > 0) {
      const avance = ((-offsetActual % mitadAncho) + mitadAncho) % mitadAncho;
      const fraccion = avance / mitadAncho;
      const duracion = parseFloat(getComputedStyle(track).animationDuration) || 60;
      track.style.animationDelay = `${-(fraccion * duracion)}s`;
    }
    track.style.transform = ""; // suelta el control manual
    track.classList.remove("hero-track-dragging"); // la animación retoma sola
  };

  const programarReanudacion = () => {
    cancelarReanudacion();
    temporizadorReanudar = setTimeout(reanudarAutomatico, ESPERA_REANUDAR);
  };

  track.addEventListener("pointerdown", (e) => {
    cancelarReanudacion(); // si estaba por reanudar, se cancela: seguimos tocando
    arrastrando = true;
    posInicial = e.clientX;
    offsetInicial = obtenerOffsetActual();
    track.classList.add("hero-track-dragging"); // esto pausa la animación (ver CSS)
    track.style.transform = `translateX(${offsetInicial}px)`;
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener("pointermove", (e) => {
    if (!arrastrando) return;
    const delta = e.clientX - posInicial;
    track.style.transform = `translateX(${offsetInicial + delta}px)`;
  });

  const soltar = () => {
    if (!arrastrando) return;
    arrastrando = false;
    // Se queda quieto donde lo soltaste; recién tras ESPERA_REANUDAR
    // sin ninguna interacción nueva, vuelve a moverse solo.
    programarReanudacion();
  };

  track.addEventListener("pointerup", soltar);
  track.addEventListener("pointercancel", soltar);
  track.addEventListener("pointerleave", soltar);
}

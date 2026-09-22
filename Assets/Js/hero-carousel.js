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
      <div class="hero-track">
        ${slidesHtml}
        ${slidesHtml}
      </div>
    </div>
  `;
}

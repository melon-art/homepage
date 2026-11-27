(() => {
  'use strict';
  const defaults = Object.freeze({ x: 50, y: 50, zoom: 100 });
  function normalize(crop) {
    const within = (value, min, max, fallback) =>
      Number.isInteger(value) && value >= min && value <= max ? value : fallback;
    return {
      x: within(crop?.x, 0, 100, defaults.x),
      y: within(crop?.y, 0, 100, defaults.y),
      zoom: within(crop?.zoom, 100, 300, defaults.zoom)
    };
  }
  window.BlogCrop = {
    defaults, normalize,
    apply(image, crop) {
      const { x, y, zoom } = normalize(crop);
      const position = x + '% ' + y + '%';
      image.style.objectPosition = position;
      image.style.transformOrigin = position;
      image.style.transform = zoom === 100 ? '' : 'scale(' + zoom / 100 + ')';
    }
  };
})();

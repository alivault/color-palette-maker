window.onload = () => {
  const colorPicker = document.querySelector('#color-picker');
  const hueSlider = document.querySelector('#hue-slider');
  const saturationSlider = document.querySelector('#saturation-slider');
  const lightnessSlider = document.querySelector('#lightness-slider');
  const numTilesSlider = document.querySelector('#num-tiles-slider');
  const colorPalette = document.querySelector('#color-palette');

  const updatePalette = () => {
    colorPalette.innerHTML = '';

    let color = chroma(colorPicker.value)
      .set('hsl.s', saturationSlider.value / 100)
      .set('hsl.h', hueSlider.value);

    colorPicker.value = color.hex();
    const [L, C, H] = color.oklch();
    const lightnessScale = parseFloat(lightnessSlider.value);
    const saturationScale = saturationSlider.value / 100;

    for (let i = 0; i < numTilesSlider.value; i++) {
      const tile = document.createElement('div');
      tile.className = 'color-tile';
      tile.innerHTML = `
        <span class="color-contrast"></span>
        <span class="color-hex"></span>
      `;

      const l = (1 - (i * (1 - 0.1)) / numTilesSlider.value) * lightnessScale;
      const c = C;
      const s = saturationScale;
      const tileColor = chroma.oklch(l, c, H).set('hsl.s', s);
      const contrastColor =
        chroma.contrast(tileColor, 'white') >
        chroma.contrast(tileColor, 'black')
          ? 'white'
          : 'black';
      tile.style.backgroundColor = tileColor.css();
      tile.style.color = contrastColor;

      const hexElement = tile.querySelector('.color-hex');
      const contrastElement = tile.querySelector('.color-contrast');

      hexElement.textContent = tileColor.hex().substring(1);
      contrastElement.textContent = `${chroma
        .contrast(tileColor, contrastColor)
        .toFixed(1)}`;

      colorPalette.appendChild(tile);
    }
  };

  saturationSlider.addEventListener('input', updatePalette);
  colorPicker.addEventListener('input', () => {
    const color = chroma(colorPicker.value);
    const saturation = Math.round(color.get('hsl.s') * 100);
    const hue = Math.round(color.get('hsl.h'));
    saturationSlider.value = saturation;
    hueSlider.value = hue;
    updatePalette();
  });

  lightnessSlider.addEventListener('input', updatePalette);
  hueSlider.addEventListener('input', updatePalette);
  numTilesSlider.addEventListener('input', () => {
    updatePalette();
    document.querySelector('#num-tiles-value').innerText = numTilesSlider.value;
  });

  updatePalette();
  document.querySelector('#num-tiles-value').innerText = numTilesSlider.value;
};

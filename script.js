window.onload = () => {
  const colorPicker = document.querySelector('#color-picker');
  const hueSlider = document.querySelector('#hue-slider');
  const saturationSlider = document.querySelector('#saturation-slider');
  const lightnessSlider = document.querySelector('#lightness-slider');
  const darkPalette = document.querySelector('.color-row.dark');
  const lightPalette = document.querySelector('.color-row.light');

  const updatePalette = () => {
    let color = chroma(colorPicker.value)
      .set('hsl.s', saturationSlider.value / 100)
      .set('hsl.h', hueSlider.value);

    colorPicker.value = color.hex();
    const [L, C, H] = color.oklch();
    const lightnessScale = parseFloat(lightnessSlider.value);
    const saturationScale = saturationSlider.value / 100;

    const setDivColors = (palette, startL, endL) => {
      Array.from(palette.children).forEach((div, i) => {
        const l = (startL + (i * (endL - startL)) / 4) * lightnessScale;
        const c = C;
        const s = saturationScale;
        const color = chroma.oklch(l, c, H).set('hsl.s', s);
        const contrastColor =
          chroma.contrast(color, 'white') > chroma.contrast(color, 'black')
            ? 'white'
            : 'black';
        div.style.backgroundColor = color.css();
        div.style.color = contrastColor;

        const hexElement = div.querySelector('.color-hex');
        const contrastElement = div.querySelector('.color-contrast');

        hexElement.textContent = color.hex();
        contrastElement.textContent = `${chroma
          .contrast(color, contrastColor)
          .toFixed(1)}`;
      });
    };

    setDivColors(darkPalette, 0.1, 0.4);
    setDivColors(lightPalette, 0.7, 1);
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
  updatePalette();
};

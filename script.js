window.onload = () => {
  const selectors = {
    startHueSlider: '#start-hue-slider',
    endHueSlider: '#end-hue-slider',
    saturationSlider: '#saturation-slider',
    numTilesSlider: '#num-tiles-slider',
    colorPalette: '#color-palette',
    startLightnessSlider: '#start-lightness-slider',
    endLightnessSlider: '#end-lightness-slider',
    hueSlider: '#hue-slider',
    lightnessSlider: '#lightness-slider',
    startHueOutput: '#start-hue-output',
    endHueOutput: '#end-hue-output',
  };

  const el = Object.keys(selectors).reduce((acc, selector) => {
    acc[selector] = document.querySelector(selectors[selector]);
    return acc;
  }, {});

  const updateOutputs = () => {
    const hueShift = el.hueSlider.value - 180;
    document.querySelector('#hue-output').value =
      hueShift > 0 ? `+${hueShift}` : hueShift;
    document.querySelector('#start-hue-output').value = el.startHueSlider.value;
    document.querySelector('#end-hue-output').value = el.endHueSlider.value;
    document.querySelector('#lightness-output').value =
      el.lightnessSlider.value;
    document.querySelector('#start-lightness-output').value =
      el.startLightnessSlider.value;
    document.querySelector('#end-lightness-output').value =
      el.endLightnessSlider.value;
    document.querySelector('#saturation-output').value =
      el.saturationSlider.value;
    document.querySelector('#num-tiles-output').value = el.numTilesSlider.value;
  };

  const wrapHue = hue => ((hue % 360) + 360) % 360;

  const updatePalette = () => {
    el.colorPalette.innerHTML = '';

    const startColor = chroma.hsl(
      parseFloat(el.startHueSlider.value),
      parseFloat(el.saturationSlider.value),
      parseFloat(el.startLightnessSlider.value)
    );
    const endColor = chroma.hsl(
      parseFloat(el.endHueSlider.value),
      parseFloat(el.saturationSlider.value),
      parseFloat(el.endLightnessSlider.value)
    );

    const colorScale = chroma
      .scale([startColor, endColor])
      .mode('oklch')
      .colors(parseFloat(el.numTilesSlider.value));

    colorScale.forEach(colorHex => {
      const tile = document.createElement('div');
      tile.className = 'color-tile';
      tile.innerHTML = `
        <span class="color-contrast"></span>
        <span class="color-hex"></span>
      `;

      const tileColor = chroma(colorHex);
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

      el.colorPalette.appendChild(tile);
    });

    updateOutputs();
  };

  let prevHueSliderValue = parseFloat(el.hueSlider.value);
  let prevLightnessSliderValue = el.lightnessSlider.value;

  el.hueSlider.addEventListener('input', () => {
    const hueShift = el.hueSlider.value - prevHueSliderValue;
    prevHueSliderValue = el.hueSlider.value;
    el.startHueSlider.value = wrapHue(
      parseInt(el.startHueSlider.value) + hueShift
    );
    el.endHueSlider.value = wrapHue(parseInt(el.endHueSlider.value) + hueShift);
    updatePalette();
  });

  el.lightnessSlider.addEventListener('input', () => {
    let lightnessShift = el.lightnessSlider.value - prevLightnessSliderValue;
    let newStartLightness =
      parseFloat(el.startLightnessSlider.value) + lightnessShift;
    let newEndLightness =
      parseFloat(el.endLightnessSlider.value) + lightnessShift;

    newStartLightness = Math.max(0, Math.min(newStartLightness, 1));
    newEndLightness = Math.max(0, Math.min(newEndLightness, 1));

    el.startLightnessSlider.value = newStartLightness;
    el.endLightnessSlider.value = newEndLightness;

    prevLightnessSliderValue = el.lightnessSlider.value;

    updatePalette();
  });

  el.startHueSlider.addEventListener('input', () => {
    el.startHueOutput.value = el.startHueSlider.value;
    updatePalette();
  });
  el.endHueSlider.addEventListener('input', () => {
    el.endHueOutput.value = el.endHueSlider.value;
    updatePalette();
  });
  el.saturationSlider.addEventListener('input', updatePalette);
  el.startLightnessSlider.addEventListener('input', updatePalette);
  el.endLightnessSlider.addEventListener('input', updatePalette);
  el.numTilesSlider.addEventListener('input', updatePalette);
  el.numTilesSlider.addEventListener('input', () => {
    updatePalette();
  });

  el.numTilesSlider.value = 12;
  el.hueSlider.value = 180;
  el.startHueSlider.value = 31;
  el.endHueSlider.value = 243;
  el.saturationSlider.value = 1;
  el.lightnessSlider.value = 0.5;
  el.startLightnessSlider.value = 0.8;
  el.endLightnessSlider.value = 0.4;

  updatePalette();
};

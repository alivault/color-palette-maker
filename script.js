window.onload = () => {
  const selectors = {
    colorPalette: '#color-palette',
    numTilesSlider: '#num-tiles-slider',
    numTilesOutput: '#num-tiles-output',
    hueSlider: '#hue-slider',
    hueOutput: '#hue-output',
    startHueSlider: '#start-hue-slider',
    endHueSlider: '#end-hue-slider',
    startHueOutput: '#start-hue-output',
    endHueOutput: '#end-hue-output',
    saturationSlider: '#saturation-slider',
    saturationOutput: '#saturation-output',
    startSaturationSlider: '#start-saturation-slider',
    endSaturationSlider: '#end-saturation-slider',
    startSaturationOutput: '#start-saturation-output',
    endSaturationOutput: '#end-saturation-output',
    lightnessSlider: '#lightness-slider',
    lightnessOutput: '#lightness-output',
    startLightnessSlider: '#start-lightness-slider',
    endLightnessSlider: '#end-lightness-slider',
    startLightnessOutput: '#start-lightness-output',
    endLightnessOutput: '#end-lightness-output',
  };

  const el = Object.keys(selectors).reduce((acc, selector) => {
    acc[selector] = document.querySelector(selectors[selector]);
    return acc;
  }, {});

  const updateOutputs = () => {
    const hueShift = el.hueSlider.value - 180;
    el.hueOutput.value = hueShift > 0 ? `+${hueShift}` : hueShift;
    el.startHueOutput.value = el.startHueSlider.value;
    el.endHueOutput.value = el.endHueSlider.value;
    el.lightnessOutput.value = el.lightnessSlider.value;
    el.startLightnessOutput.value = el.startLightnessSlider.value;
    el.endLightnessOutput.value = el.endLightnessSlider.value;
    el.saturationOutput.value = el.saturationSlider.value;
    el.numTilesOutput.value = el.numTilesSlider.value;
    el.startSaturationOutput.value = el.startSaturationSlider.value;
    el.endSaturationOutput.value = el.endSaturationSlider.value;
  };

  const wrapHue = hue => ((hue % 360) + 360) % 360;

  const updatePalette = () => {
    el.colorPalette.innerHTML = '';

    const startColor = chroma.hsl(
      parseFloat(el.startHueSlider.value),
      parseFloat(el.startSaturationSlider.value),
      parseFloat(el.startLightnessSlider.value)
    );

    const endColor = chroma.hsl(
      parseFloat(el.endHueSlider.value),
      parseFloat(el.endSaturationSlider.value),
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

  function updateSliderBackgroundsAndThumbColors() {
    const hueStart = el.startHueSlider.value;
    const hueEnd = el.endHueSlider.value;

    document.documentElement.style.setProperty(
      '--start-hue-thumb',
      `hsl(${hueStart}, 100%, 50%)`
    );
    document.documentElement.style.setProperty(
      '--end-hue-thumb',
      `hsl(${hueEnd}, 100%, 50%)`
    );

    el.startSaturationSlider.style.background = `linear-gradient(to right, hsl(${hueStart}, 0%, 50%), hsl(${hueStart}, 100%, 50%))`;
    el.endSaturationSlider.style.background = `linear-gradient(to right, hsl(${hueEnd}, 0%, 50%), hsl(${hueEnd}, 100%, 50%))`;

    const saturationStart = el.startSaturationSlider.value;
    const saturationEnd = el.endSaturationSlider.value;
    document.documentElement.style.setProperty(
      '--start-saturation-thumb',
      `hsl(${hueStart}, ${saturationStart * 100}%, 50%)`
    );
    document.documentElement.style.setProperty(
      '--end-saturation-thumb',
      `hsl(${hueEnd}, ${saturationEnd * 100}%, 50%)`
    );
  }

  el.numTilesSlider.addEventListener('input', updatePalette);
  el.numTilesSlider.addEventListener('input', () => {
    updatePalette();
  });

  el.hueSlider.addEventListener('input', () => {
    const hueShift = el.hueSlider.value - prevHueSliderValue;
    prevHueSliderValue = el.hueSlider.value;
    el.startHueSlider.value = wrapHue(
      parseInt(el.startHueSlider.value) + hueShift
    );
    el.endHueSlider.value = wrapHue(parseInt(el.endHueSlider.value) + hueShift);
    updatePalette();
    updateSliderBackgroundsAndThumbColors();
  });
  el.startHueSlider.addEventListener('input', () => {
    el.startHueOutput.value = el.startHueSlider.value;
    updatePalette();
    updateSliderBackgroundsAndThumbColors();
  });
  el.endHueSlider.addEventListener('input', () => {
    el.endHueOutput.value = el.endHueSlider.value;
    updatePalette();
    updateSliderBackgroundsAndThumbColors();
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
  el.startLightnessSlider.addEventListener('input', updatePalette);
  el.endLightnessSlider.addEventListener('input', updatePalette);

  el.saturationSlider.addEventListener('input', () => {
    let saturationShift = el.saturationSlider.value - prevSaturationSliderValue;
    let newStartSaturation =
      parseFloat(el.startSaturationSlider.value) + saturationShift;
    let newEndSaturation =
      parseFloat(el.endSaturationSlider.value) + saturationShift;

    newStartSaturation = Math.max(0, Math.min(newStartSaturation, 1));
    newEndSaturation = Math.max(0, Math.min(newEndSaturation, 1));

    el.startSaturationSlider.value = newStartSaturation;
    el.endSaturationSlider.value = newEndSaturation;

    prevSaturationSliderValue = el.saturationSlider.value;

    updatePalette();
    updateSliderBackgroundsAndThumbColors();
  });
  el.startSaturationSlider.addEventListener('input', () => {
    el.startSaturationOutput.value = el.startSaturationSlider.value;
    updatePalette();
    updateSliderBackgroundsAndThumbColors();
  });
  el.endSaturationSlider.addEventListener('input', () => {
    el.endSaturationOutput.value = el.endSaturationSlider.value;
    updatePalette();
    updateSliderBackgroundsAndThumbColors();
  });

  el.numTilesSlider.value = 12;
  el.hueSlider.value = 180;
  el.startHueSlider.value = 31;
  el.endHueSlider.value = 243;
  el.saturationSlider.value = 1;
  el.startSaturationSlider.value = 1;
  el.endSaturationSlider.value = 1;
  el.lightnessSlider.value = 0.5;
  el.startLightnessSlider.value = 0.8;
  el.endLightnessSlider.value = 0.4;

  let prevHueSliderValue = parseFloat(el.hueSlider.value);
  let prevLightnessSliderValue = el.lightnessSlider.value;
  let prevSaturationSliderValue = el.saturationSlider.value;

  updatePalette();
  updateSliderBackgroundsAndThumbColors();
};

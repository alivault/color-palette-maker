window.onload = () => {
  const selectors = {
    colorPicker: '#color-picker',
    startHueSlider: '#start-hue-slider',
    endHueSlider: '#end-hue-slider',
    chromaSlider: '#chroma-slider',
    numTilesSlider: '#num-tiles-slider',
    colorPalette: '#color-palette',
    startLightnessSlider: '#start-lightness-slider',
    endLightnessSlider: '#end-lightness-slider',
    hueSlider: '#hue-slider',
    lightnessSlider: '#lightness-slider',
    startHueOutput: '#start-hue-output',
    endHueOutput: '#end-hue-output',
  };

  const wrapHue = hue => ((hue % 360) + 360) % 360;

  const el = Object.keys(selectors).reduce((acc, selector) => {
    acc[selector] = document.querySelector(selectors[selector]);
    return acc;
  }, {});

  const updateOutputs = () => {
    document.querySelector('#hue-output').value = el.hueSlider.value;
    document.querySelector('#start-hue-output').value = el.startHueSlider.value;
    document.querySelector('#end-hue-output').value = el.endHueSlider.value;
    document.querySelector('#lightness-output').value =
      el.lightnessSlider.value;
    document.querySelector('#start-lightness-output').value =
      el.startLightnessSlider.value;
    document.querySelector('#end-lightness-output').value =
      el.endLightnessSlider.value;
    document.querySelector('#chroma-output').value = el.chromaSlider.value;
    document.querySelector('#num-tiles-output').value = el.numTilesSlider.value;
    document.querySelector('#color-output').value = el.colorPicker.value;
  };

  const updatePalette = () => {
    el.colorPalette.innerHTML = '';

    let hueRange = [];
    let startHue = parseInt(el.startHueSlider.value);
    let endHue = parseInt(el.endHueSlider.value);
    let startLightness = parseFloat(el.startLightnessSlider.value);
    let endLightness = parseFloat(el.endLightnessSlider.value);
    let chromaValue = parseFloat(el.chromaSlider.value);
    let numSteps = parseInt(el.numTilesSlider.value);
    let hueStep = (endHue - startHue) / numSteps;
    let lightnessStep = (endLightness - startLightness) / numSteps;

    for (let i = 0; i < numSteps; i++) {
      hueRange.push(
        chroma(el.colorPicker.value)
          .set('oklch.h', startHue + hueStep * i)
          .set('oklch.l', startLightness + lightnessStep * i)
          .set('oklch.c', chromaValue)
      );
    }

    const colorScale = chroma.scale(hueRange).mode('oklch').colors(numSteps);

    for (let i = 0; i < numSteps; i++) {
      const tile = document.createElement('div');
      tile.className = 'color-tile';
      tile.style.backgroundColor = colorScale[i];

      const contrastColor =
        chroma.contrast(colorScale[i], 'white') >
        chroma.contrast(colorScale[i], 'black')
          ? 'white'
          : 'black';
      tile.style.color = contrastColor;

      const contrastCode = document.createElement('div');
      contrastCode.textContent = `${chroma
        .contrast(colorScale[i], contrastColor)
        .toFixed(1)}`;
      tile.appendChild(contrastCode);

      const hexCode = document.createElement('div');
      hexCode.className = 'color-hex';
      hexCode.textContent = colorScale[i].substring(1);
      tile.appendChild(hexCode);

      el.colorPalette.appendChild(tile);
    }
    updateOutputs();
  };

  let prevHueSliderValue = 0;
  let prevLightnessSliderValue = el.lightnessSlider.value;

  el.colorPicker.addEventListener('input', () => {
    prevHueSliderValue = el.hueSlider.value;
    updatePalette();
  });

  el.hueSlider.addEventListener('input', () => {
    const hueShift = el.hueSlider.value - prevHueSliderValue;
    prevHueSliderValue = el.hueSlider.value;
    el.startHueSlider.value = wrapHue(
      parseInt(el.startHueSlider.value) + hueShift
    );
    el.endHueSlider.value = wrapHue(parseInt(el.endHueSlider.value) + hueShift);
    let color = chroma(el.colorPicker.value);
    color = color.set('oklch.h', el.hueSlider.value);
    el.colorPicker.value = color.hex();
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
  el.chromaSlider.addEventListener('input', updatePalette);
  el.startLightnessSlider.addEventListener('input', updatePalette);
  el.endLightnessSlider.addEventListener('input', updatePalette);
  el.numTilesSlider.addEventListener('input', updatePalette);
  el.colorPicker.addEventListener('input', updatePalette);
  el.numTilesSlider.addEventListener('input', () => {
    updatePalette();
  });

  el.colorPicker.dispatchEvent(new Event('input'));
  el.numTilesSlider.dispatchEvent(new Event('input'));
  el.hueSlider.dispatchEvent(new Event('input'));
  el.startHueSlider.dispatchEvent(new Event('input'));
  el.endHueSlider.dispatchEvent(new Event('input'));
  el.chromaSlider.dispatchEvent(new Event('input'));
  el.lightnessSlider.dispatchEvent(new Event('input'));
  el.startLightnessSlider.dispatchEvent(new Event('input'));
  el.endLightnessSlider.dispatchEvent(new Event('input'));

  updatePalette();
};

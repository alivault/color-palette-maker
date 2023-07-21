window.onload = () => {
  const colorPicker = document.querySelector('#color-picker');
  const hueSlider = document.querySelector('#hue-slider');
  const startHueSlider = document.querySelector('#start-hue-slider');
  const endHueSlider = document.querySelector('#end-hue-slider');
  const saturationSlider = document.querySelector('#saturation-slider');
  const lightnessSlider = document.querySelector('#lightness-slider');
  const numTilesSlider = document.querySelector('#num-tiles-slider');
  const colorPalette = document.querySelector('#color-palette');
  const colorOutput = document.querySelector('#color-output');
  const hueOutput = document.querySelector('#hue-output');
  const saturationOutput = document.querySelector('#saturation-output');
  const lightnessOutput = document.querySelector('#lightness-output');
  const startHueOutput = document.querySelector('#start-hue-output');
  const endHueOutput = document.querySelector('#end-hue-output');
  const startLightnessSlider = document.querySelector(
    '#start-lightness-slider'
  );
  const endLightnessSlider = document.querySelector('#end-lightness-slider');
  const startLightnessOutput = document.querySelector(
    '#start-lightness-output'
  );
  const endLightnessOutput = document.querySelector('#end-lightness-output');

  let hueShift = 0;
  let prevHueSliderValue = hueSlider.value;
  let lightnessShift = 0;
  let prevLightnessSliderValue = lightnessSlider.value;

  const wrapHue = hue => ((hue % 360) + 360) % 360;

  const updatePalette = () => {
    colorPalette.innerHTML = '';

    let color = chroma(colorPicker.value)
      .set('hsl.s', saturationSlider.value / 100)
      .set('hsl.h', hueSlider.value);

    colorPicker.value = color.hex();
    const [L, C, H] = color.oklch();
    const saturationScale = saturationSlider.value / 100;
    let hueRange = endHueSlider.value - startHueSlider.value;
    const hueStep = hueRange / numTilesSlider.value;

    for (let i = 0; i < numTilesSlider.value; i++) {
      const tile = document.createElement('div');
      tile.className = 'color-tile';
      tile.innerHTML = `
        <span class="color-contrast"></span>
        <span class="color-hex"></span>
      `;

      const lightnessStart = parseFloat(startLightnessSlider.value);
      const lightnessEnd = parseFloat(endLightnessSlider.value);
      const lightnessStep =
        (lightnessEnd - lightnessStart) / numTilesSlider.value;
      const l = lightnessStart + lightnessStep * i;
      const c = C;
      const s = saturationScale;
      const h = (parseFloat(startHueSlider.value) + hueStep * i) % 360;
      const tileColor = chroma.oklch(l, c, h).set('hsl.s', s).set('hsl.h', h);
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

  colorPicker.addEventListener('input', () => {
    colorOutput.value = colorPicker.value;
    const color = chroma(colorPicker.value);
    const hue = Math.round(color.get('hsl.h'));
    hueSlider.value = hue;
    hueOutput.value = hue;
    startHueOutput.value = startHueSlider.value;
    endHueOutput.value = endHueSlider.value;
    updatePalette();
  });

  hueSlider.addEventListener('input', () => {
    hueOutput.value = hueSlider.value;
    hueShift = hueSlider.value - prevHueSliderValue;
    startHueSlider.value = wrapHue(parseInt(startHueSlider.value) + hueShift);
    endHueSlider.value = wrapHue(parseInt(endHueSlider.value) + hueShift);
    prevHueSliderValue = hueSlider.value;
    startHueOutput.value = startHueSlider.value;
    endHueOutput.value = endHueSlider.value;

    let color = chroma(colorPicker.value);
    color = color.set('hsl.h', hueSlider.value);
    colorPicker.value = color.hex();
    colorOutput.value = colorPicker.value;
    updatePalette();
  });

  saturationSlider.addEventListener('input', () => {
    saturationOutput.value = saturationSlider.value;
  });
  lightnessSlider.addEventListener('input', () => {
    lightnessOutput.value = lightnessSlider.value;
    lightnessShift = lightnessSlider.value - prevLightnessSliderValue;

    let newStartLightness =
      parseFloat(startLightnessSlider.value) + lightnessShift;
    let newEndLightness = parseFloat(endLightnessSlider.value) + lightnessShift;

    newStartLightness = Math.max(0, Math.min(newStartLightness, 2));
    newEndLightness = Math.max(0, Math.min(newEndLightness, 2));

    startLightnessSlider.value = newStartLightness;
    endLightnessSlider.value = newEndLightness;

    startLightnessOutput.value = startLightnessSlider.value;
    endLightnessOutput.value = endLightnessSlider.value;

    prevLightnessSliderValue = lightnessSlider.value;

    updatePalette();
  });
  startHueSlider.addEventListener('input', () => {
    startHueOutput.value = startHueSlider.value;
  });
  endHueSlider.addEventListener('input', () => {
    endHueOutput.value = endHueSlider.value;
  });
  startLightnessSlider.addEventListener('input', () => {
    startLightnessOutput.value = startLightnessSlider.value;
    updatePalette();
  });
  endLightnessSlider.addEventListener('input', () => {
    endLightnessOutput.value = endLightnessSlider.value;
    updatePalette();
  });
  saturationSlider.addEventListener('input', updatePalette);
  colorPicker.addEventListener('input', () => {
    const color = chroma(colorPicker.value);
    const saturation = Math.round(color.get('hsl.s') * 100);
    const hue = Math.round(color.get('hsl.h'));
    saturationSlider.value = saturation;
    hueSlider.value = hue;
    startHueSlider.value = hue;
    endHueSlider.value = hue;
    prevHueSliderValue = hueSlider.value;
    updatePalette();
  });
  lightnessSlider.addEventListener('input', updatePalette);
  hueSlider.addEventListener('input', () => {
    hueShift = hueSlider.value - prevHueSliderValue;
    startHueSlider.value = wrapHue(parseInt(startHueSlider.value) + hueShift);
    endHueSlider.value = wrapHue(parseInt(endHueSlider.value) + hueShift);
    prevHueSliderValue = hueSlider.value;
    startHueOutput.value = startHueSlider.value;
    endHueOutput.value = endHueSlider.value;
    updatePalette();
  });
  startHueSlider.addEventListener('input', updatePalette);
  endHueSlider.addEventListener('input', updatePalette);
  numTilesSlider.addEventListener('input', () => {
    updatePalette();
    document.querySelector('#num-tiles-value').innerText = numTilesSlider.value;
  });

  startHueOutput.value = startHueSlider.value;
  endHueOutput.value = endHueSlider.value;

  hueSlider.dispatchEvent(new Event('input'));
  saturationSlider.dispatchEvent(new Event('input'));
  lightnessSlider.dispatchEvent(new Event('input'));
  startHueSlider.dispatchEvent(new Event('input'));
  endHueSlider.dispatchEvent(new Event('input'));
  startLightnessSlider.dispatchEvent(new Event('input'));
  endLightnessSlider.dispatchEvent(new Event('input'));

  updatePalette();
  document.querySelector('#num-tiles-value').innerText = numTilesSlider.value;
};

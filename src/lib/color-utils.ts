export const wrapHue = (h: number) => ((h % 360) + 360) % 360

export const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max))

export const getHueGradient = () =>
  `linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`

export const getSatGradient = (hue: number) =>
  `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`

export const getLightGradient = (hue: number, sat: number) =>
  `linear-gradient(to right, hsl(${hue}, ${sat * 100}%, 0%), hsl(${hue}, ${sat * 100}%, 50%), hsl(${hue}, ${
    sat * 100
  }%, 100%))`


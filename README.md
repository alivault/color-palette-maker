# Color Palette Maker

A simple tool that helps users generate vibrant color palettes using a clever color system (OKLCH) to maintain equal brightness, irrespective of the hue. This app makes use of Chroma.js, a small JavaScript library for color conversions and color scale generation.

## How to Use

1. Select a color using the color picker or adjust the hue and saturation with the sliders.
2. Adjust the overall lightness with the lightness slider.
3. Specify the number of color tiles you want in your palette using the "Number of Tiles" slider.
4. Adjust the minimum and maximum lightness values with the respective sliders.
5. The color tiles will be generated in real time based on your settings.
6. Each tile will display its contrast level and its color code (hex).

## How it's Made

This app is created using HTML, CSS, and JavaScript. It also utilizes Chroma.js for advanced color manipulation and uses the OKLCH color space.

1. **HTML**: The HTML markup is straightforward. It includes input elements for selecting color, adjusting hue, saturation, and lightness, and specifying the number of tiles. It also includes a section to display the generated color tiles.
2. **CSS**: The CSS (not shown in the sample provided) styles the application and provides a clean and intuitive interface for the user.
3. **JavaScript**: The JavaScript part is where the core functionality of the app resides. It listens for changes on the input elements and updates the color tiles accordingly. It also creates the required number of tiles dynamically based on the value from the "Number of Tiles" slider.
4. **Chroma.js**: This small JS library is used for all color manipulations, including hue and saturation adjustments, contrast calculation, and conversion to hex codes for display.

## Prerequisites

You only need a modern web browser to use this application.

## Contributing

We welcome contributions from the community. Please open an issue or create a pull request with your changes.

## License

This project is open source and available under the [MIT License](LICENSE).

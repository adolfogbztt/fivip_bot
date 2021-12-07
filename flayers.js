// Import dependencies
const fs = require("fs");
const Jimp = require("jimp");

(async function () {
  // Read the image

  const rawdata = fs.readFileSync("cambios.json");

  const cambios = JSON.parse(rawdata);

  const arr = Object.keys(cambios);

  for (let i = 0; i < arr.length; i++) {
    const cambio = cambios[arr[i]];
    console.log("Ajustando Imagen " + cambio.imagen_rename);

    const image = await Jimp.read(cambio.img);

    // // Add text
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK); // bitmap fonts
    const font_white = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE); // bitmap fonts
    const tasas = Object.keys(cambio.tasas);
    image.print(font, 220, 355, cambio.tasas[tasas[0]]);
    image.print(font, 220, 540, cambio.tasas[tasas[1]]);
    image.print(font, 220, 725, cambio.tasas[tasas[2]]);
    image.print(font, 220, 905, cambio.tasas[tasas[3]]);
    image.print(font_white, 915, 1135, cambio.contactanos);

    const date = new Date().toISOString().split("T");
    const fecha = date[0];
    const hora = date[1].replaceAll(":", "-");
    // Save the image
    image.write(
      "./images/history/" + fecha + "-" + hora + "-" + cambio.imagen_rename
    ); // writeAsync
    image.write("./images/" + cambio.imagen_rename); // writeAsync
    console.log("Se creo correctamente " + cambio.imagen_rename);
  }
})();

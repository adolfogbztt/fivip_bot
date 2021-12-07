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
    
    image.resize(900, 900, Jimp.RESIZE_BEZIER, function (err) {
      if (err) throw err;
    });
    // // Add text
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK); // bitmap fonts
    const font_white = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE); // bitmap fonts
    const tasas = Object.keys(cambio.tasas);
    image.print(font, 130, 240, cambio.tasas[tasas[0]]);
    image.print(font, 130, 370, cambio.tasas[tasas[1]]);
    image.print(font, 130, 499, cambio.tasas[tasas[2]]);
    image.print(font, 130, 626, cambio.tasas[tasas[3]]);
    image.print(font_white, 628, 795, cambio.contactanos);

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

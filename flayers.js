// Import dependencies
const fs = require("fs");
const Jimp = require("jimp");
const cambios = process.argv.slice(2);

const cambios_flayer1 = cambios.slice(0, 4);
const cambios_flayer2 = cambios.slice(4, 8);

(async function () {
  // Read the image

  const rawdata = fs.readFileSync("cambios.json");

  const cambios = JSON.parse(rawdata);

  const arr = cambios["tasas"];

  vuelta = 0;

  for (let i = 0; i < arr.length; i++) {
    const e = arr[i];
    const image = await Jimp.read(e.imagen);
    let value;
    if (i % 2 === 0) {
      value = cambios_flayer1;
    } else {
      value = cambios_flayer2;
    }

    image.resize(900, 900, Jimp.RESIZE_BEZIER, function (err) {
      if (err) throw err;
    });

    //   image.resize(900, 900, Jimp.RESIZE_BEZIER, function (err) {
    //     if (err) throw err;
    //   });

    const tasas = Object.keys(e.cambios);

    for (let ii = 0; ii < tasas.length; ii++) {
      tasa = e.cambios[tasas[ii]];

      tasa.value = value[ii] || tasa.value;
      let _var_text = "FONT_SANS_" + tasa.text_size + "_" + tasa.text_color;
      const font = await Jimp.loadFont(Jimp[_var_text]); // bitmap fonts
      image.print(font, tasa.x, tasa.y, tasa.value);
    }

    const date = new Date().toISOString().split("T");
    const fecha = date[0];
    const hora = date[1].replaceAll(":", "-");

    // Save the image
    image.write(
      "./images/history/" + fecha + "-" + hora + "-" + e.imagen_rename
    ); // writeAsync
    image.write("./images/" + e.imagen_rename); // writeAsync
    console.log("Se creo correctamente " + e.imagen_rename);
    vuelta++;
  }
})();

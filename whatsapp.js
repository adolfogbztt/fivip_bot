require('dotenv').config();
const fs = require("fs");
const dialogflow = require("@google-cloud/dialogflow");
const { Client, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");
const Jimp = require("jimp");

const { User, History, Cliente, _Cliente, Remesa, _Tasas, Bot, Pagos } = require("./db");

const app = express();

require("./db");
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);
const dialogFlowConfig = require("./assets/newagent.json");
const user = require("./models/usuarios");
const { DefaultDeserializer } = require('v8');
const SESSION_FILE_PATH = "./assets/session.json";

// console.log(dialogFlowConfig)

// Your google dialogflow project-id
const PROJECID = dialogFlowConfig.project_id;
// Configuration for the client
const CONFIGURATION = {
  credentials: {
    private_key: dialogFlowConfig.private_key,
    client_email: dialogFlowConfig.client_email,
  },
};

// Create a new session
const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);

// Detect intent method
const dialog = async (languageCode, queryText, sessionId) => {
  let sessionPath = sessionClient.projectAgentSessionPath(PROJECID, sessionId);

  // The text query request.
  let request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: queryText,
        // The language used by the client (en-US)
        languageCode: languageCode,
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);

  const result = responses[0].queryResult;
  return {
    response: result.fulfillmentText,
    parameters: result.parameters,
  };
};

// iniciar session

const parse = (texto) => {
  let de = "ÁÃÀÄÂÉËÈÊÍÏÌÎÓÖÒÔÚÜÙÛÑÇáãàäâéëèêíïìîóöòôúüùûñç",
    a = "AAAAAEEEEIIIIOOOOUUUUNCaaaaaeeeeiiiioooouuuunc",
    re = new RegExp("[" + de + "]", "ug");
  texto = texto.toLowerCase();
  return texto.replace(re, (match) => a.charAt(de.indexOf(match)));
};

const withSession = () => {
  console.log("Validando Session de WhatsApp");

  sessionData = require(SESSION_FILE_PATH);

  client = new Client({
    session: sessionData,
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    console.log('EMPRESA ID', process.env.EMPRESA_ID)

    connectionReady();
  });

  client.on("auth_failure", () => {
    console.log(
      "** Error de autentificacion vuelve a generar el QRCODE (Borrar el archivo session.json) **"
    );
  });

  client.initialize();
};

const withOutSession = () => {
  console.log("No tenemos session guardada");
  client = new Client();
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    connectionReady();
  });

  client.on("auth_failure", () => {
    console.log("** Error de autentificacion vuelve a generar el QRCODE **");
  });

  client.on("authenticated", (session) => {
    // Guardamos credenciales de de session para usar luego
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
      if (err) {
        console.log(err);
      }
    });
  });

  client.initialize();
};

const connectionReady = () => {
  listenMessage();
  catchMessage();
};

const listenMessage = () => {
  client.on("message", async ({ from, to, body }) => {
    const cliente_id = await saludar(from);
    await replyAsk(from, body, cliente_id);
  });
};

const replyAsk = async (from, answer, cliente_id) => {
  const msg = parse(answer);
  const flow = await dialog("es", msg, "12312371231656765765123");
  console.log(JSON.stringify(flow, null, 2))

  return new Promise((resolve, reject) => {
    if (answer.includes("/nombre")) {
      let st = rename(cliente_id, answer, from);
      resolve(true);
    }

    if (msg === "menu" || msg === "ayuda" || msg === "help") {
      menu(from);
      resolve(true);
    }

    /***COMANDOS */
    if (msg === "1") {
      comando1(from);
      resolve(true);
    }
    if (msg === "2") {
      comando2(from);
      resolve(true);
    }
    if (msg === "3") {
      comando3(from);
      resolve(true);
    }
    if (msg === "4") {
      comando4(from);
      resolve(true);
    }
    if (msg === "4") {
      comando4(from);
      resolve(true);
    }

    if (msg === "5") {
      comando5(from);
      resolve(true);
    }

    if (msg === "9") {
      comando9(from);
      resolve(true);
    }


    if (msg === "mrc") {
      console.log({ from });
      client.sendMessage(from, "ere loco?");
      resolve(true);
    }

    if (flow.response === "[send_tasa]") {
      const rawdata = fs.readFileSync("cambios.json");

      const cambios = JSON.parse(rawdata);
      const cam = Object.keys(cambios);

      const enviable = cam.filter((v, index) => {
        return cambios[v].enviable;
      });

      const cambio_actual = cambios[enviable];

      // From file path
      const photo = `./images/${cambio_actual.imagen_rename}`;

      const media = MessageMedia.fromFilePath(photo);
      client.sendMessage(from, media);
      resolve(true);
    }

    // if (flow.response === "[send_tasa_recarga]") {
    //   const rawdata = fs.readFileSync("cambios.json");

    //   const cambios = JSON.parse(rawdata);
    //   const cam = Object.keys(cambios);

    //   const recarga = cam.filter((v, index) => {
    //     return cambios[v].recarga;
    //   });

    //   const cambio_actual = cambios[recarga];

    //   // From file path
    //   const photo = `./images/${cambio_actual.imagen_rename}`;

    //   const media = MessageMedia.fromFilePath(photo);
    //   client.sendMessage(from, media);
    //   resolve(true);
    // }


    if (flow.response === "[send_cuentas]") {
      console.log(flow);
      client.sendMessage(from, "🏦 banco bcp 5616516551");
      client.sendMessage(from, "🏦 banco bcp 5616516551");
      resolve(true);
    }

    if (flow.response === "[send_calculo_cambio]") {

      const monto_base =
        flow.parameters.fields["unit-currency"].structValue?.fields.amount
          .numberValue;

      const moneda_base =
        flow.parameters.fields["unit-currency"].structValue?.fields.currency
          .stringValue;


      let a = flow.parameters.fields["currency-name"].stringValue;
      a = a ? true : flow.parameters.fields["currency-name"].listValue?.values[0]?.stringValue;

      console.log({ monto_base, moneda_base, a })

      _Tasas.findOne({ where: { empresa_id: process.env.EMPRESA_ID, iso_from: moneda_base, iso_to: a } }).then(cambio => {
        if (!!cambio) {
          const total = calcularCambios(
            cambio.tasa_c,
            moneda_base,
            a,
            monto_base
          );
          client.sendMessage(from, "son:  " + total + ' ' + cambio.simbolo_to);
        } else {
          client.sendMessage(
            from,
            "Lo siento pero la moneda de envio no se encuantra disponible o la escribiste mal usa *soles, dolares, pesos colombianos, pesos chilenos* " +
            moneda_base
          );
        }
      }, err => {
        client.sendMessage(
          from,
          "Lo siento pero la moneda de envio no se encuantra disponible o la escribiste mal usa *soles, dolares, pesos colombianos, pesos chilenos* " +
          moneda_base
        );
      })
    }

    if (flow.response === "[crear_ticket_recarga]") {
    }
  });
};

const calcularCambios = (cambio, from, to, amount) => {
  return (parseFloat(cambio) * parseFloat(amount)).toFixed(3);
};

const catchMessage = () => {
  client.on("message_create", async ({ to, body }) => {
    const msg = parse(body);
    await replyInformationDefault(to, msg);
  });
};

const replyInformationDefault = (to, msg) => {
  return new Promise((resolve, reject) => {
    console.log(`---------->`, msg);
    if (msg === "cuenta peru") {
      client.sendMessage(to, "banco bcp 5616516551");
      client.sendMessage(to, "banco scotia 5616516551");
      resolve(true);
    }

    if (msg === "cuenta venezuela") {
      client.sendMessage(to, "banco de venezuela 6666666");
      client.sendMessage(to, "banco de banesco 666666612323");
      resolve(true);
    }
  });
};

/**
 * Se ejecutara para validar que el usuario sea nuevo,
 * registrara dicho usuario
 * si cumple la condicion de que sea nuevo
 * se le enviara los comandos disponibles
 * esta funcion retorna el id del usuario
 */
const saludar = async (from) => {
  let cliente = await _Cliente.findOne({ where: { empresa_id: process.env.EMPRESA_ID, _whatsapp: from.replace("@c.us", "") } });
  if (!cliente) {
    cliente = await Cliente.create({ nombre: "new client", telefono: from.replace("@c.us", ""), empresa_id: process.env.EMPRESA_ID });
    menu(from);
  }
  return cliente.id;
};

const menu = async (from) => {
  const menus = await Bot.findAll({ where: { empresa_id: process.env.EMPRESA_ID, code: '[menu]' } });
  menus.map((v) => {
    client.sendMessage(from, v.respuesta);
  })
};

const comando1 = async (from) => {
  const bot = await Bot.findAll({ where: { empresa_id: process.env.EMPRESA_ID, code: 1 } });
  bot.map((v) => {
    client.sendMessage(from, v.respuesta);
  })
}
const comando2 = async (from) => {
  const bot = await Bot.findAll({ where: { empresa_id: process.env.EMPRESA_ID, code: 2 } });
  bot.map((v) => {
    client.sendMessage(from, v.respuesta);
  })
}
const comando3 = async (from) => {
  const bot = await Bot.findAll({ where: { empresa_id: process.env.EMPRESA_ID, code: 3 } });
  bot.map((v) => {
    client.sendMessage(from, v.respuesta);
  })
}
const comando4 = async (from) => {
  const bot = await Bot.findAll({ where: { empresa_id: process.env.EMPRESA_ID, code: 4 } });
  bot.map((v) => {
    client.sendMessage(from, v.respuesta);
  })
}
const comando5 = async (from) => {
  const bot = await Bot.findAll({ where: { empresa_id: process.env.EMPRESA_ID, code: 5 } });
  bot.map((v) => {
    client.sendMessage(from, v.respuesta);
  })
}
const comando9 = async (from) => {
  const cliente = await _Cliente.findOne({ where: { empresa_id: process.env.EMPRESA_ID, _whatsapp: from.replace("@c.us", "") } });
  const remesas = await Remesa.findAll({
    where: { empresa_id: process.env.EMPRESA_ID, cliente_id: cliente.id }, limit: 10, order: [
      ['id', 'DESC']]
  });
  remesas.map((v) => {
    const estatus = v.estado === -1 ? "❌ Por Pagar" : v.estado === 0 ? '⏳ Por Verificar' : '✔️ Pagado'
    const respuesta = `${v.correlativo} ${new Date(v.created_at).toISOString().slice(0, 10)}\n${v.receptor}\n${v.banco}\n${estatus} *${Number(v.total_remesa).toFixed(2)}${v.simbolo_tasa}*`;
    client.sendMessage(from, respuesta);
  })
};


const rename = async (cliente_id, body, from) => {

  const name = body.replace("/nombre", "").slice(1);
  const [nombres, apellidos] = name.split(' ')

  await Cliente.update(
    { nombres, apellidos },
    {
      where: { id: cliente_id },
    }
  );
  client.sendMessage(from, "Nombre cambiado: *" + name + "*");
  return true;
};

const sendMedia = (number, fileName) => {
  number = number.replace("@c.us", "");
  number = `${number}@c.us`;
  const media = MessageMedia.fromFilePath(`./mediaSend/${fileName}`);
  client.sendMessage(number, media);
};

/**
 * Revisamos si existe archivo con credenciales!
 */
fs.existsSync(SESSION_FILE_PATH) ? withSession() : withOutSession();

/**
 * Rutas
 */

app.get("/", (req, res) => {
  res.send({ status: "conectado" });
});

app.get("/cliente", async (req, res) => {
  const users = await Cliente.findAll();
  res.json(users);
});

app.post("/cliente", async (req, res) => {
  console.log(req.body);
  const user = await Cliente.create(req.body);
  res.json(user);
});

app.put("/cliente/:id", async (req, res) => {
  const user = await Cliente.update(req.body, {
    where: { id: req.params.id },
  });
  res.json({ success: true });
});

app.get("/cliente/:email", async (req, res) => {
  try {
    const body = await Cliente.findOne({ where: { name: "adolfo" } });
    res.json(body);
  } catch (error) {
    res.json({ error: 400 });
  }

  // const user = await User.update(req.body, {
  //   where: { id: req.params.id },
  // });
});

app.get("/", (req, res) => {
  res.send({ status: "conectado" });
});


app.get("/img/:remesa_id", async (req, res) => {
  console.log(req.params.remesa_id);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK); // bitmap fonts
  const remesa = await Remesa.findOne({ where: { id: req.params.remesa_id } });
  const cliente = await _Cliente.findOne({ where: { id: remesa.cliente_id } });
  const pagos = await Pagos.findAll({ where: { remesas_id: remesa.id } });

  console.log({ remesa, cliente })
  const imagen = await Jimp.read('assets/BASE-RECIBO.png');
  /**SIDE LEFT */
  imagen.print(font, 15, 120, `Envio a: ${remesa.receptor}`);
  imagen.print(font, 15, 135, `${remesa.tipo_doc}: ${remesa.n_doc}`);
  imagen.print(font, 15, 150, `${'Banco'}: ${remesa.banco}`);
  imagen.print(font, 15, 165, `${'Numero de Cuenta'}: ${remesa.n_cuenta}`);

  imagen.print(font, 15, 195, `Fecha: ${new Date(remesa.fecha).toISOString().slice(0, 10)}`);
  imagen.print(font, 15, 210, `${'Correlativo'}: ${remesa.correlativo}`);
  imagen.print(font, 15, 225, `${'Cliente'}: ${cliente.nombres} ${cliente.apellidos}`);
  imagen.print(font, 15, 240, `${'Teléfono'}: ${cliente.telefono}`);
  /**END SIDE LEFT */

  /**SIDE RIGHT */
  imagen.print(font, 290, 20, `Estado: ${remesa.estado === -1 ? "Por Pagar" : remesa.estado === 0 ? 'Por Verificar' : ' Pagado'}`);
  /**END SIDE LEFT */


  /**OBSERVACION */
  imagen.print(font, 15, 270, `DETALLES`);
  imagen.print(font, 15, 285, `Metodo de Cobro`);
  imagen.print(font, 150, 285, `Monto Cobro`);
  imagen.print(font, 285, 285, `Acción`);
  imagen.print(font, 420, 285, `Fecha`);
  /**END OBSERVACION */

  /**LOOP OBSERVACIONES */
  /**SETTING */
  let first_line = 305;

  console.log({pagos});

  



  /**END LOOP OBSERVACIONES */

  /**FOOTER */
  imagen.print(font, 15, 450, `Tasas: ${Number(remesa.tasa).toFixed(3)}`);
  imagen.print(font, 150, 450, `Monto: ${Number(remesa.total_envio).toFixed(3)}`);
  imagen.print(font, 285, 450, `Total: ${Number(remesa.total_remesa).toFixed(3)}`);

  /**END FOOTER */

  const name = `images/${process.env.EMPRESA_ID}/${remesa.correlativo}.jpg`
  await imagen.writeAsync(name)


  const media = MessageMedia.fromFilePath(name);
  client.sendMessage(cliente._whatsapp + "@c.us", media);

  res.send({ status: "enviado exitosamente" });

  // Jimp.read('assets/BASE-RECIBO.png', (err, recibo) => {
  //   if (err) throw err;
  //   recibo
  //     .quality(100) // set JPEG quality
  //     .greyscale() // set greyscale
  //     .write('output.jpg', res.download('output.jpg')); // save
  // });

  // res.send({ status: "conectado" });
});

app.get("/remesas-enviar/:remesa_id", async (req, res) => {
  console.log(req.params.remesa_id);
  const remesas = await Remesa.findOne({ where: { id: req.params.remesa_id } });
  const _cliente = await _Cliente.findByPk(remesas?.cliente_id);
  try {
    console.log(_cliente?._whatsapp + "@c.us");
    await client.sendMessage(
      _cliente?._whatsapp + "@c.us",
      JSON.stringify(remesas, 2, null)
    );
    res.json(remesas);
  } catch (error) {
    res.json({
      errors: [
        "error al enviar recibo de remesa",
        _cliente?._whatsapp + "@c.us",
      ],
    });
  }
});

app.post("/enviar", async (req, res) => {
  const { to, msg } = req.body;
  const st = await client.sendMessage(to + "@c.us", msg);
  console.log(st);
  res.send({ status: "mensaje enviado" });
});

app.listen(9000, () => {
  console.log("Server ready!");
});

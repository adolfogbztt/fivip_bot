const fs = require("fs");
const dialogflow = require("@google-cloud/dialogflow");
const { Client, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");

const { User, History, Cliente, Remesa } = require("./db");

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
    const user_id = await saludar(from);
    await replyAsk(from, body, user_id);
  });
};

const replyAsk = async (from, answer, user_id) => {
  const msg = parse(answer);
  const flow = await dialog("es", msg, "12312371231656765765123");

  return new Promise((resolve, reject) => {
    if (answer.includes("/nombre")) {
      let st = rename(user_id, answer, from);
      resolve(true);
    }

    if (msg === "menu" || msg === "ayuda" || msg === "help") {
      menu(from);
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

    if (flow.response === "[send_tasa_recarga]") {
      const rawdata = fs.readFileSync("cambios.json");

      const cambios = JSON.parse(rawdata);
      const cam = Object.keys(cambios);

      const recarga = cam.filter((v, index) => {
        return cambios[v].recarga;
      });

      const cambio_actual = cambios[recarga];

      // From file path
      const photo = `./images/${cambio_actual.imagen_rename}`;

      const media = MessageMedia.fromFilePath(photo);
      client.sendMessage(from, media);
      resolve(true);
    }

    if (flow.response === "[send_cuenta_bcp]") {
      console.log(flow);
      client.sendMessage(from, "🏦 banco bcp 5616516551");
      client.sendMessage(from, "🏦 banco bcp 5616516551");
      resolve(true);
    }

    if (flow.response === "[send_cuenta_banesco]") {
      client.sendMessage(from, "🏦 banco banesco 5616516551");
      client.sendMessage(from, "🏦 banco banesco  5616516551");
      resolve(true);
    }

    if (flow.response === "[send_calculo_cambio]") {
      const rawdata = fs.readFileSync("cambios.json");

      const monto_base =
        flow.parameters.fields["unit-currency"].structValue?.fields.amount
          .numberValue;
      const moneda_base =
        flow.parameters.fields["unit-currency"].structValue?.fields.currency
          .stringValue;
      const a = flow.parameters.fields["currency-name"].stringValue;

      const cambios = JSON.parse(rawdata);
      const cam = Object.keys(cambios);

      const enviable = cam.filter((v, index) => {
        return cambios[v].enviable;
      });

      const cambio_actual = cambios[enviable];

      console.log({ cambio_actual });

      if (cambio_actual.tasas[moneda_base]) {
        const a = flow.parameters.fields["currency-name"].stringValue;
        const total = calcularCambios(
          cambio_actual,
          moneda_base,
          a,
          monto_base
        );
        client.sendMessage(from, "son: " + total);
      } else {
        console.log({ cambio_actual, moneda_base, a, monto_base });
        client.sendMessage(
          from,
          "Lo siento pero la moneda de envio no se encuantra disponible o la escribiste mal usa *soles, dolares, pesos colombianos, pesos chilenos* " +
            moneda_base
        );
      }

      console.log(flow.parameters);

      // console.log({moneda_base,monto_base,a})
    }

    if (flow.response === "[crear_ticket_recarga]") {
    }
  });
};

const calcularCambios = (model, from, to, amount) => {
  const montoFrom = model.tasas[from];
  return parseFloat(montoFrom) * parseFloat(amount);
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
  let user = await User.findOne({ where: { phone: from } });
  if (!user) {
    user = await User.create({ name: "nulled", phone: from });
    menu(from);
  }
  return user.id;
};

const menu = (from) => {
  client.sendMessage(from, "FIVIP ⭐⭐⭐⭐⭐");
  client.sendMessage(from, "Consulta las tasas actuales escribiendo: *tasas*");
  client.sendMessage(
    from,
    "Consulta las tasas de recargas actuales escribiendo: *recargas*"
  );
  //   client.sendMessage(
  //     from,
  //     "Consulta Nuestas cuentas escribiendo: *todas las cuentas*"
  //   );

  client.sendMessage(
    from,
    `*Consulta Nuestras Cuentas Bancarias*
🇵🇪 BCP Peru escribiendo: *cuenta bcp*
🇻🇪 Banesco escribiendo: *cuenta banesco*`
  );

  //   client.sendMessage(
  //     from,
  //     " "
  //   );
  //   client.sendMessage(
  //     from,
  //     "🇻🇪 Consulta Nuesta cuenta Banesco de Venezuela escribiendo: *cuenta banesco*"
  //   );
};

const rename = async (user_id, body, from) => {
  const name = body.replace("/nombre", "").slice(1);
  await User.update(
    { name },
    {
      where: { id: user_id },
    }
  );
  client.sendMessage(from, "Nombre cambiado: *" + name + "*");
  return true;
};

// const sendMedia = (number, fileName) => {
//   number = number.replace("@c.us", "");
//   number = `${number}@c.us`;
//   const media = MessageMedia.fromFilePath(`./mediaSend/${fileName}`);
//   client.sendMessage(number, media);
// };

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

app.get("/remesas-enviar/:remesa_id", async (req, res) => {
  console.log(req.params.remesa_id)
  const remesas = await Remesa.findOne({where:{id:req.params.remesa_id}});
  const cliente = await Cliente.findByPk(remesas?.cliente_id);
  try {
    console.log(cliente?._whatsapp+'@c.us');
    await client.sendMessage(cliente?._whatsapp+'@c.us',JSON.stringify(remesas,2,null))
    res.json(remesas);
  } catch (error) {
    res.json({ errors: ["error al enviar recibo de remesa",cliente?._whatsapp+'@c.us'] });
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

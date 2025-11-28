const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Token de tu bot (de BotFather)
const token = '8334095736:AAEuq-17zU5YuWaXZckiSjAqHVFAkBFVeAM';

// URL de tu Web App (termina en /exec)
const webAppUrl = 'https://script.google.com/macros/s/AKfycbygs7Ool64d04e9ENMZOWZyAa1XHh1LgGkDbpeBRdFsjGAiGs_XkmpVnXfdexGOyvbF/exec';

const bot = new TelegramBot(token, { polling: true });

// Guardar progreso de cada usuario
const userData = {};

const preguntas = [
  { campo: "cliente", texto: "👤 ¿Cuál es el nombre del cliente?" },
  { campo: "operacion", texto: "📌 ¿Qué tipo de operación es (ej. Préstamo, Venta)?" },
  { campo: "monto", texto: "💰 ¿Cuál es el monto?" },
  { campo: "interes", texto: "📈 ¿Cuál es el interés (ej. 0.05)?" },
  { campo: "fechaPago", texto: "📅 ¿Cuál es la fecha de pago (YYYY-MM-DD)?" },
  { campo: "plazoMeses", texto: "⏳ ¿Cuál es el plazo en meses?" },
  { campo: "estado", texto: "⚡ ¿Cuál es el estado (Pendiente, Pagado, etc.)?" },
  { campo: "cobrado", texto: "💵 ¿Cuánto se ha cobrado?" },
  { campo: "observaciones", texto: "📝 ¿Observaciones adicionales?" }
];

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const texto = msg.text;

  // Si el usuario no tiene sesión iniciada, empezamos
  if (!userData[chatId]) {
    userData[chatId] = { paso: 0, datos: {} };
    bot.sendMessage(chatId, "🚀 Vamos a registrar un nuevo dato.");
    bot.sendMessage(chatId, preguntas[0].texto);
    return;
  }

  const pasoActual = userData[chatId].paso;
  const campo = preguntas[pasoActual].campo;

  // Guardar respuesta
  userData[chatId].datos[campo] = texto;

  // Pasar a la siguiente pregunta
  if (pasoActual + 1 < preguntas.length) {
    userData[chatId].paso++;
    bot.sendMessage(chatId, preguntas[pasoActual + 1].texto);
  } else {
    // Ya tenemos todas las respuestas → enviar a la hoja
    try {
      await axios.post(webAppUrl, userData[chatId].datos, {
        headers: { "Content-Type": "application/json" }
      });
      bot.sendMessage(chatId, "✅ Registro completo guardado en la hoja");
    } catch (err) {
      bot.sendMessage(chatId, "❌ Error al guardar: " + (err.response ? err.response.data : err.message));
    }
    // Reiniciar para nuevo registro
    delete userData[chatId];
  }
});

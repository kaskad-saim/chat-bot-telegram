import TelegramBot from 'node-telegram-bot-api';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { config } from '../config/config.js';
import { handleMessage, handleCallbackQuery, handleHelp } from './buttonHandlers.js';

// Список авторизованных пользователей с фамилиями
const AUTHORIZED_USERS = new Map(
  (process.env.AUTHORIZED_USERS || '')
    .split(',')
    .map(entry => entry.split(':'))
    .map(([id, surname]) => [parseInt(id), { surname }])
);

const createTelegramBot = (app) => {
  const proxyAgent = new HttpsProxyAgent(config.PROXY_URL);
  const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, {
    polling: true,
    request: {
      agent: proxyAgent,
    },
  });

  // Функция для проверки авторизации
  const checkAuthorization = (userId) => {
    return AUTHORIZED_USERS.has(userId);
  };

  // Функция для получения фамилии пользователя
  const getUserSurname = (userId) => {
    const user = AUTHORIZED_USERS.get(userId);
    return user ? user.surname : 'Неизвестный';
  };

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Проверка авторизации
    if (!checkAuthorization(userId)) {
      await bot.sendMessage(chatId, `У вас нет доступа к этому боту. Обратитесь к администратору. Вы - ${getUserSurname(userId)} пользователь`);
      return;
    }

    if (msg.text) {
      // Обработка команды /help
      if (msg.text === '/help') {
        await handleHelp(bot, chatId, null); // null для messageId, если это не нужно
      } else if (!msg.reply_to_message) {
        handleMessage(bot, chatId);
      }
    }
  });

  bot.on('callback_query', async (query) => {
    const userId = query.from.id;

    // Проверка авторизации
    if (!checkAuthorization(userId)) {
      await bot.answerCallbackQuery(query.id, {
        text: `У вас нет доступа к этому боту. Пользователь: ${getUserSurname(userId)}`,
        show_alert: true,
      });
      return;
    }

    handleCallbackQuery(bot, app, query);
  });

  return bot;
};

export default createTelegramBot;

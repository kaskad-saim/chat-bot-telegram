import TelegramBot from 'node-telegram-bot-api';
// import { HttpsProxyAgent } from 'https-proxy-agent';
import { config } from '../config/config.js';
import { startMessage } from '../telegram-bot/buttons/startMessage.js';
import { handleCallbackQuery } from '../telegram-bot/buttons/callbackQueryHandler.js';
import { handleHelp } from '../telegram-bot/buttons/helpHandler.js';
import { handleTextMessage } from './buttons/handleTextMessage.js';

// Список авторизованных пользователей с фамилиями
const AUTHORIZED_USERS = new Map(
  (process.env.AUTHORIZED_USERS || '')
    .split(',')
    .map(entry => entry.split(':'))
    .map(([id, surname]) => [parseInt(id), { surname }])
);

const createTelegramBot = (app) => {
  const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, {
    polling: true,
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

  // Обработка команды /start
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Проверка авторизации
    if (!checkAuthorization(userId)) {
      bot.sendMessage(chatId, `У вас нет доступа к этому боту. Обратитесь к администратору. Вы - ${getUserSurname(userId)} пользователь`);
      return;
    }

    startMessage(bot, chatId, '/start');
  });

  // Обработка команды /help
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Проверка авторизации
    if (!checkAuthorization(userId)) {
      bot.sendMessage(chatId, `У вас нет доступа к этому боту. Обратитесь к администратору. Вы - ${getUserSurname(userId)} пользователь`);
      return;
    }

    // Отправляем сообщение, чтобы получить messageId
    const sentMessage = await bot.sendMessage(chatId, 'Загрузка справки...', {
      parse_mode: 'Markdown'
    });

    // Редактируем отправленное сообщение
    handleHelp(bot, chatId, sentMessage.message_id);
  });

  // Слушаем все сообщения, кроме команд
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Игнорируем команды, чтобы избежать двойной обработки
    if (msg.text && msg.text.startsWith('/')) {
      return;
    }

    // Проверка авторизации
    if (!checkAuthorization(userId)) {
      await bot.sendMessage(chatId, `У вас нет доступа к этому боту. Обратитесь к администратору. Вы - ${getUserSurname(userId)} пользователь`);
      return;
    }

    // Обработка других текстовых сообщений
    await handleTextMessage(bot, app, msg);
  });

  // Обработка обратных вызовов
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
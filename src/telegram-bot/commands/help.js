import { handleAuth } from '../handlers/auth.js';

export const handleHelp = async (bot, chatId, messageId, isHelpCommand = false) => {
  const helpMessage = `
    **Инструкция по работе с приложением:**

    1. Карбон: Выберите печь карбонизации для просмотра текущих параметров или графиков.
    2. ПК: Вы можете выбрать одну из печей карбонизации для просмотра текущих параметров и графиков. Также можно вернуться к предыдущему меню.
    3. Текущие параметры: Просмотр параметров, таких как температура и давление, для выбранной печи.
    4. Графики: Просмотр графиков температуры, давления и уровня для выбранной печи.
    5. Алармы: Проверка и уведомления об ошибках и тревожных сигналах для печи.
    6. Назад: Возвращение к предыдущему меню.

    Для получения дополнительной помощи, пожалуйста, обратитесь к администратору системы.
  `;

  const replyMarkup = isHelpCommand ? {} : {
    inline_keyboard: [[{ text: 'Назад', callback_data: 'back_to_main' }]],
  };

  await bot.editMessageText(helpMessage, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'Markdown',
    reply_markup: replyMarkup,
  });
};

export const helpCommand = async (bot, chatId, userId) => {
  if (!await handleAuth(bot, chatId, userId)) {
    return;
  }

  const sentMessage = await bot.sendMessage(chatId, 'Загрузка справки...', {
    parse_mode: 'Markdown',
  });

  handleHelp(bot, chatId, sentMessage.message_id, true); // Передаем true, чтобы указать, что это команда /help
};
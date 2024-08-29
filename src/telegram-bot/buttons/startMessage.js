import { sendMessageWithButtons } from '../sendMessage.js';

export const startMessage = (bot, chatId, command) => {
  if (command === '/start') {
    sendMessageWithButtons(bot, chatId, 'Выберите интересующую опцию:', [
      [
        { text: 'Карбон', callback_data: 'production_carbon' },
        { text: 'Справка', callback_data: 'help' },
      ],
    ]);
  }
};

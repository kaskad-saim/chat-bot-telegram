import {
  generateTemperatureChartArchiveVR1,
  generateTemperatureChartArchiveVR2,
  generatePressureChartArchiveVR1,
  generatePressureChartArchiveVR2,
  generateWaterLevelChartArchiveVR1,
  generateWaterLevelChartArchiveVR2
} from '../generateArchives.js';

// Определяем меню для печи 1
const charts_archive_1 = [
  [
    { text: 'Температура', callback_data: 'archive_temperature_1' },
    { text: 'Давление/разрежение', callback_data: 'archive_pressure_1' },
  ],
  [
    { text: 'Уровень', callback_data: 'archive_level_1' },
    { text: 'Назад', callback_data: 'furnace_1' },
  ],
];

// Определяем меню для печи 2
const charts_archive_2 = [
  [
    { text: 'Температура', callback_data: 'archive_temperature_2' },
    { text: 'Давление/разрежение', callback_data: 'archive_pressure_2' },
  ],
  [
    { text: 'Уровень', callback_data: 'archive_level_2' },
    { text: 'Назад', callback_data: 'furnace_2' },
  ],
];

// Обновленный код для функции handleTextMessage
export const handleTextMessage = async (bot, app, msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text; // Дата или число, введенное пользователем

  // Проверяем состояние пользователя
  const state = app.locals.userStates && app.locals.userStates[chatId];

  if (state) {
    const furnaceNumber = state.action.includes('1') ? 1 : 2;

    // Определяем нужное меню
    const menu = furnaceNumber === 1 ? charts_archive_1 : charts_archive_2;

    try {
      // Определяем нужную функцию для генерации графика
      let generateChartForDate;

      if (state.action.startsWith('archive_temperature_')) {
        generateChartForDate = furnaceNumber === 1
          ? () => generateTemperatureChartArchiveVR1(userMessage)
          : () => generateTemperatureChartArchiveVR2(userMessage);
      } else if (state.action.startsWith('archive_pressure_')) {
        generateChartForDate = furnaceNumber === 1
          ? () => generatePressureChartArchiveVR1(userMessage)
          : () => generatePressureChartArchiveVR2(userMessage);
      } else if (state.action.startsWith('archive_level_')) {
        generateChartForDate = furnaceNumber === 1
          ? () => generateWaterLevelChartArchiveVR1(userMessage)
          : () => generateWaterLevelChartArchiveVR2(userMessage);
      } else {
        throw new Error('Unknown action type.');
      }

      console.log('Generating chart with:', generateChartForDate);

      const buffer = await generateChartForDate();

      // Отправляем график
      await bot.sendPhoto(chatId, buffer);

      // Определяем описание сообщения с включением введенной пользователем даты
      let description;
      if (state.action.startsWith('archive_temperature_')) {
        description = `Сгенерирован график температур за ${userMessage}.`;
      } else if (state.action.startsWith('archive_pressure_')) {
        description = `Сгенерирован график давления за ${userMessage}.`;
      } else if (state.action.startsWith('archive_level_')) {
        description = `Сгенерирован график уровня воды за ${userMessage}.`;
      } else {
        description = 'Генерация графика завершена.';
      }

      // Отправляем текстовое сообщение с описанием
      await bot.sendMessage(chatId, description);

      // Отправляем меню с кнопками
      await bot.sendMessage(chatId, 'Выберите нужный параметр или вернитесь назад:', {
        reply_markup: {
          inline_keyboard: menu
        }
      });

      // Удаляем сообщение с запросом даты
      await bot.deleteMessage(chatId, state.messageId);

      // Очищаем состояние
      delete app.locals.userStates[chatId];
    } catch (error) {
      await bot.sendMessage(chatId, `Ошибка: нет данных за этот период, либо вы ввели некорректную дату. Пожалуйста, попробуйте еще раз или нажмите "Назад" для выхода.`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Назад', callback_data: `furnace_${furnaceNumber}` }]
          ]
        }
      });
      // Не очищаем состояние, чтобы позволить повторный ввод
    }
  }
};

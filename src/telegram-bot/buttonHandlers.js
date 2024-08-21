import { sendMessageWithButtons } from './sendMessage.js';
import { editMessageWithButtons } from './editMessage.js';
import { generateTablePechVr } from './generateTable.js';
import { checkAndNotify } from './alarms.js';
import {
  generateTemperatureChartVR1,
  generateTemperatureChartVR2,
  generatePressureChartVR1,
  generatePressureChartVR2,
  generateWaterLevelChartVR1,
  generateWaterLevelChartVR2,
} from './generateCharts.js';

const chartGenerators = {
  chart_temperature_1: generateTemperatureChartVR1,
  chart_temperature_2: generateTemperatureChartVR2,
  chart_pressure_1: generatePressureChartVR1,
  chart_pressure_2: generatePressureChartVR2,
  chart_level_1: generateWaterLevelChartVR1,
  chart_level_2: generateWaterLevelChartVR2,
};

export const handleMessage = (bot, chatId) => {
  sendMessageWithButtons(bot, chatId, 'Выберите интересующую опцию:', [
    [{ text: 'Производство Карбон', callback_data: 'production_carbon' }],
  ]);
};

const getButtonsByAction = (action) => {
  const buttons = {
    furnace_1: [
      [{ text: 'Текущие параметры', callback_data: 'get_temperature_1' }],
      [
        { text: 'Графики', callback_data: 'charts_1' },
        { text: 'Алармы', callback_data: 'check_alarms_1' },
      ],
      [{ text: 'Назад', callback_data: 'production_carbon' }],
    ],
    furnace_2: [
      [{ text: 'Текущие параметры', callback_data: 'get_temperature_2' }],
      [
        { text: 'Графики', callback_data: 'charts_2' },
        { text: 'Алармы', callback_data: 'check_alarms_2' },
      ],
      [{ text: 'Назад', callback_data: 'production_carbon' }],
    ],
    production_carbon: [
      [
        { text: 'Печь карбонизации 1', callback_data: 'furnace_1' },
        { text: 'Печь карбонизации 2', callback_data: 'furnace_2' },
      ],
      [{ text: 'Назад', callback_data: 'back_to_production' }],
    ],
    charts_1: [
      [
        { text: 'Температура', callback_data: 'chart_temperature_1' },
        { text: 'Давление/разрежение', callback_data: 'chart_pressure_1' },
      ],
      [
        { text: 'Уровень', callback_data: 'chart_level_1' },
        { text: 'Назад', callback_data: 'furnace_1' },
      ],
    ],
    charts_2: [
      [
        { text: 'Температура', callback_data: 'chart_temperature_2' },
        { text: 'Давление/разрежение', callback_data: 'chart_pressure_2' },
      ],
      [
        { text: 'Уровень', callback_data: 'chart_level_2' },
        { text: 'Назад', callback_data: 'furnace_2' },
      ],
    ],
    back_to_production: [[{ text: 'Производство Карбон', callback_data: 'production_carbon' }]],
  };

  return buttons[action] || buttons.back_to_production;
};

const handleChartGeneration = async (bot, chatId, action, messageId) => {
  const generateChart = chartGenerators[action];
  if (!generateChart) return;

  try {
    const chartBuffer = await generateChart();
    if (!chartBuffer || chartBuffer.length === 0) {
      throw new Error(`График не был создан для ${action}`);
    }
    const furnaceNumber = action.includes('1') ? 1 : 2;
    const chartType = action.includes('temperature')
      ? 'Температура'
      : action.includes('pressure')
      ? 'Давление/разрежение'
      : 'Уровень';

    await bot.sendPhoto(chatId, chartBuffer, {
      caption: `График ${chartType} для печи ВР${furnaceNumber} за последний час`,
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Обновить', callback_data: action },
            { text: 'Назад', callback_data: `charts_${furnaceNumber}` },
          ],
        ],
      },
    });
  } catch (error) {
    console.error(`Ошибка при генерации или отправке графика ${action}:`, error);
    await bot.sendMessage(chatId, 'Произошла ошибка при создании графика. Пожалуйста, попробуйте позже.');
  }
};

export const handleCallbackQuery = async (bot, app, query) => {
  const chatId = query.message.chat.id;
  const action = query.data;
  const currentTime = new Date().toLocaleString();
  const data = app.locals.data;

  if (action.startsWith('get_temperature_')) {
    const furnaceNumber = action.includes('1') ? 1 : 2;
    const table = generateTablePechVr(data, furnaceNumber, currentTime);
    editMessageWithButtons(bot, chatId, query.message.message_id, table, [
      [
        { text: 'Алармы', callback_data: `check_alarms_${furnaceNumber}` },
        { text: 'Обновить', callback_data: action },
      ],
      [{ text: 'Назад', callback_data: `furnace_${furnaceNumber}` }],
    ]);
  } else if (action.startsWith('check_alarms_')) {
    const furnaceNumber = action.includes('1') ? 1 : 2;
    checkAndNotify(data, bot, chatId, furnaceNumber, query.message.message_id);
  } else if (chartGenerators[action]) {
    await handleChartGeneration(bot, chatId, action, query.message.message_id);
  } else {
    const buttonSet = getButtonsByAction(action);
    sendMessageWithButtons(bot, chatId, 'Выберите интересующую опцию:', buttonSet);
  }
};

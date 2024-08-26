import { sendMessageWithButtons } from './sendMessage.js';
import { editMessageWithButtons } from './editMessage.js';
import { generateTablePechVr } from './generateTable.js';
import { checkAndNotify } from './alarms.js';
import {
  generateTemperature24HourChartVR1,
  generateTemperature24HourChartVR2,
  generateTemperatureOneHourChartVR1,
  generateTemperatureOneHourChartVR2,
  generateTemperature12HourChartVR1,
  generateTemperature12HourChartVR2,
  generatePressure24HourChartVR1,
  generatePressure24HourChartVR2,
  generatePressureOneHourChartVR1,
  generatePressureOneHourChartVR2,
  generatePressure12HourChartVR1,
  generatePressure12HourChartVR2,
  generateLevel24HourChartVR1,
  generateLevel24HourChartVR2,
  generateLevelOneHourChartVR1,
  generateLevelOneHourChartVR2,
  generateLevel12HourChartVR1,
  generateLevel12HourChartVR2,
} from './generateCharts.js';

const chartGenerators = {
  chart_temperature_1_Day: (params) => generateTemperature24HourChartVR1(params),
  chart_temperature_1_Twelve: (params) => generateTemperature12HourChartVR1(params),
  chart_temperature_1_Hour: (params) => generateTemperatureOneHourChartVR1(params),

  chart_temperature_2_Day: (params) => generateTemperature24HourChartVR2(params),
  chart_temperature_2_Twelve: (params) => generateTemperature12HourChartVR2(params),
  chart_temperature_2_Hour: (params) => generateTemperatureOneHourChartVR2(params),

  chart_pressure_1_Day: (params) => generatePressure24HourChartVR1(params),
  chart_pressure_1_Twelve: (params) => generatePressure12HourChartVR1(params),
  chart_pressure_1_Hour: (params) => generatePressureOneHourChartVR1(params),

  chart_pressure_2_Day: (params) => generatePressure24HourChartVR2(params),
  chart_pressure_2_Twelve: (params) => generatePressure12HourChartVR2(params),
  chart_pressure_2_Hour: (params) => generatePressureOneHourChartVR2(params),

  chart_level_1_Day: (params) => generateLevel24HourChartVR1(params),
  chart_level_1_Twelve: (params) => generateLevel12HourChartVR1(params),
  chart_level_1_Hour: (params) => generateLevelOneHourChartVR1(params),

  chart_level_2_Day: (params) => generateLevel24HourChartVR2(params),
  chart_level_2_Twelve: (params) => generateLevel12HourChartVR2(params),
  chart_level_2_Hour: (params) => generateLevelOneHourChartVR2(params),
};

export const handleMessage = (bot, chatId) => {
  sendMessageWithButtons(bot, chatId, 'Выберите интересующую опцию:', [
    [
      { text: 'Карбон', callback_data: 'production_carbon' },
      { text: 'Справка', callback_data: 'help' },
    ],
  ]);
};

const getButtonsByAction = (action) => {
  const buttons = {
    furnace_1: [
      [
        { text: 'Текущие параметры', callback_data: 'get_temperature_1' },
        { text: 'Графики', callback_data: 'charts_1' },
      ],
      // [{ text: 'Архив графиков', callback_data: 'charts_archive_1' }],
      [{ text: 'Назад', callback_data: 'production_carbon' }],
    ],
    furnace_2: [
      [
        { text: 'Текущие параметры', callback_data: 'get_temperature_2' },
        { text: 'Графики', callback_data: 'charts_2' },
      ],
      // [{ text: 'Архив графиков', callback_data: 'charts_archive_2' }],
      [{ text: 'Назад', callback_data: 'production_carbon' }],
    ],
    production_carbon: [
      [
        { text: 'ПК 1', callback_data: 'furnace_1' },
        { text: 'ПК 2', callback_data: 'furnace_2' },
      ],
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
    chart_temperature_1: [
      [
        { text: 'За 1 час', callback_data: 'chart_temperature_1_Hour' },
        { text: 'За 12 часов', callback_data: 'chart_temperature_1_Twelve' },
      ],
      [
        { text: 'За 24 часа', callback_data: 'chart_temperature_1_Day' },
        { text: 'Назад', callback_data: 'charts_1' },
      ],
    ],
    chart_pressure_1: [
      [
        { text: 'За 1 час', callback_data: 'chart_pressure_1_Hour' },
        { text: 'За 12 часов', callback_data: 'chart_pressure_1_Twelve' },
      ],
      [
        { text: 'За 24 часа', callback_data: 'chart_pressure_1_Day' },
        { text: 'Назад', callback_data: 'charts_1' },
      ],
    ],
    chart_level_1: [
      [
        { text: 'За 1 час', callback_data: 'chart_level_1_Hour' },
        { text: 'За 12 часов', callback_data: 'chart_level_1_Twelve' },
      ],
      [
        { text: 'За 24 часа', callback_data: 'chart_level_1_Day' },
        { text: 'Назад', callback_data: 'charts_1' },
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
    chart_temperature_2: [
      [
        { text: 'За 1 час', callback_data: 'chart_temperature_2_Hour' },
        { text: 'За 12 часов', callback_data: 'chart_temperature_2_Twelve' },
      ],
      [
        { text: 'За 24 часа', callback_data: 'chart_temperature_2_Day' },
        { text: 'Назад', callback_data: 'charts_2' },
      ],
    ],
    chart_pressure_2: [
      [
        { text: 'За  1час', callback_data: 'chart_pressure_2_Hour' },
        { text: 'За 12 часов', callback_data: 'chart_pressure_2_Twelve' },
      ],
      [
        { text: 'За 24 часа', callback_data: 'chart_pressure_2_Day' },
        { text: 'Назад', callback_data: 'charts_2' },
      ],
    ],
    chart_level_2: [
      [
        { text: 'За 1 час', callback_data: 'chart_level_2_Hour' },
        { text: 'За 12 часов', callback_data: 'chart_level_2_Twelve' },
      ],
      [
        { text: 'За 24 часа', callback_data: 'chart_level_2_Day' },
        { text: 'Назад', callback_data: 'charts_2' },
      ],
    ],
    // charts_archive_1: [
    //   [
    //     { text: 'Температура', callback_data: 'archive_temperature_1' },
    //     { text: 'Давление/разрежение', callback_data: 'archive_pressure_1' },
    //   ],
    //   [
    //     { text: 'Уровень', callback_data: 'archive_level_1' },
    //     { text: 'Назад', callback_data: 'furnace_1' },
    //   ],
    // ],
    // charts_archive_2: [
    //   [
    //     { text: 'Температура', callback_data: 'archive_temperature_2' },
    //     { text: 'Давление/разрежение', callback_data: 'archive_pressure_2' },
    //   ],
    //   [
    //     { text: 'Уровень', callback_data: 'archive_level_2' },
    //     { text: 'Назад', callback_data: 'furnace_2' },
    //   ],
    // ],
    back_to_production: [[{ text: 'Карбон', callback_data: 'production_carbon' }]],
    help: [[{ text: 'Назад', callback_data: 'back_to_main' }]],
    back_to_main: [
      [
        { text: 'Карбон', callback_data: 'production_carbon' },
        { text: 'Справка', callback_data: 'help' },
      ],
    ],
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
      ? 'температуры'
      : action.includes('pressure')
      ? 'давления/разрежения'
      : 'уровня';

    await bot.sendPhoto(chatId, chartBuffer, {
      caption: `График ${chartType} для печи карбонизации №${furnaceNumber} `,
    });

    // После отправки графика вернем пользователю меню с выбором графика
    const buttonSet = getButtonsByAction(`charts_${furnaceNumber}`);
    await sendMessageWithButtons(bot, chatId, 'Выберите следующий график или вернитесь назад:', buttonSet);
  } catch (error) {
    console.error(`Ошибка при генерации или отправке графика ${action}:`, error);
    await bot.sendMessage(chatId, 'Произошла ошибка при создании графика. Пожалуйста, попробуйте позже.');
  }
};

export const handleHelp = async (bot, chatId, messageId) => {
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

  const buttonSet = [[{ text: 'Назад', callback_data: 'back_to_main' }]];

  await bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: buttonSet,
    },
  });
};

export const handleCallbackQuery = async (bot, app, query) => {
  const chatId = query.message.chat.id;
  const action = query.data;

  // Ответ на callback_query, чтобы остановить моргание кнопки и избежать ошибки "query is too old"
  await bot.answerCallbackQuery(query.id);

  try {
    if (action.startsWith('get_temperature_')) {
      const furnaceNumber = action.includes('1') ? 1 : 2;
      const currentTime = new Date().toLocaleString();
      const data = app.locals.data;

      const table = generateTablePechVr(data, furnaceNumber, currentTime);

      await bot.editMessageText(table, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Алармы', callback_data: `check_alarms_${furnaceNumber}` },
              { text: 'Обновить', callback_data: action },
            ],
            [{ text: 'Назад', callback_data: `furnace_${furnaceNumber}` }],
          ],
        },
      });
    } else if (action.startsWith('check_alarms_')) {
      const furnaceNumber = action.includes('1') ? 1 : 2;
      const data = app.locals.data;

      await checkAndNotify(data, bot, chatId, furnaceNumber, query.message.message_id);
    } else if (chartGenerators[action]) {
      await handleChartGeneration(bot, chatId, action, query.message.message_id);
    } else if (action === 'furnace_1' || action === 'furnace_2') {
      const buttonSet = getButtonsByAction(action);
      const furnaceNumber = action === 'furnace_1' ? 1 : 2;
      await bot.editMessageText(`Выберите опции для Печи карбонизации ${furnaceNumber}:`, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: buttonSet,
        },
      });
    } else if (action === 'help') {
      await handleHelp(bot, chatId, query.message.message_id);
    } else if (action === 'back_to_main') {
      await bot.editMessageText('Выберите интересующую опцию:', {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: getButtonsByAction('back_to_main'),
        },
      });
    } else {
      const buttonSet = getButtonsByAction(action);
      await bot.editMessageText('Выберите интересующую опцию:', {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: buttonSet,
        },
      });
    }
  } catch (error) {
    console.error(`Ошибка обработки действия ${action}:`, error);
    await bot.sendMessage(chatId, 'Произошла ошибка при выполнении вашего запроса. Пожалуйста, попробуйте позже.');
  }
};

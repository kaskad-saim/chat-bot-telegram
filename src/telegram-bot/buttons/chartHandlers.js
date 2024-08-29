import { chartGenerators } from './chartGenerators.js';
import { sendMessageWithButtons } from '../sendMessage.js';
import { getButtonsByAction } from '../buttons/buttonSets.js';

export const handleChartGeneration = async (bot, chatId, action) => {
  const generateChart = chartGenerators[action];
  if (!generateChart) {
    await bot.sendMessage(chatId, 'Неизвестный тип графика. Пожалуйста, выберите другой график.');
    return;
  }

  try {
    const chartBuffer = await generateChart();
    if (!chartBuffer || chartBuffer.length === 0) {
      throw new Error(`График не был создан для ${action}`);
    }

    const furnaceNumber = action.includes('1') ? 1 : 2;
    const chartType = action.includes('temperature') ? 'температуры' :
                      action.includes('pressure') ? 'давления/разрежения' : 'уровня';

    await bot.sendPhoto(chatId, chartBuffer, {
      caption: `График ${chartType} для печи карбонизации №${furnaceNumber}`,
    });

    const buttonSet = getButtonsByAction(`charts_${furnaceNumber}`);
    await sendMessageWithButtons(bot, chatId, 'Выберите следующий график или вернитесь назад:', buttonSet);
  } catch (error) {
    console.error(`Ошибка при генерации или отправке графика ${action}:`, error);
    await bot.sendMessage(chatId, 'Произошла ошибка при создании графика. Пожалуйста, попробуйте позже.');
  }
};

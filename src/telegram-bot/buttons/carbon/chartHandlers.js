import { chartGenerators } from './chartGenerators.js';
import { sendMessageWithButtons } from '../../sendMessage.js';
import { getButtonsByAction } from './buttonSets.js';
import { FurnaceVR1, FurnaceVR2 } from '../../../models/FurnanceModel.js'; // Только для VR

export const handleChartGeneration = async (bot, chatId, action) => {
  const generateChart = chartGenerators[action];
  if (!generateChart) {
    await bot.sendMessage(chatId, 'Неизвестный тип графика. Пожалуйста, выберите другой график.');
    return;
  }

  let loadingMessage;
  try {
    loadingMessage = await bot.sendMessage(chatId, 'Загрузка графика, пожалуйста подождите...');

    // Определение модели и параметров
    let FurnaceModel, furnaceNumber, furnaceType, data;
    if (action.includes('vr1') || action.includes('vr2')) {
      // Логика для VR
      FurnaceModel = action.includes('vr1') ? FurnaceVR1 : FurnaceVR2;
      furnaceNumber = action.includes('vr1') ? 1 : 2;
      furnaceType = 'печи карбонизации';

      // Извлечение данных из последнего документа для VR
      const furnaceDocument = await FurnaceModel.findOne().sort({ timestamp: -1 });
      if (!furnaceDocument || !furnaceDocument.data) {
        throw new Error(`Данные для ${furnaceType} №${furnaceNumber} отсутствуют.`);
      }

      data = Object.fromEntries(furnaceDocument.data); // Преобразование Map в объект
    } else if (action.includes('mpa2') || action.includes('mpa3')) {
      // Логика для MPA
      furnaceNumber = action.includes('mpa2') ? 2 : 3;
      furnaceType = 'МПА';

      // Для MPA данные обрабатываются через генератор напрямую
      data = null; // MPA не используют предварительно извлекаемые данные
    } else {
      throw new Error('Неверный тип печи.');
    }

    const chartType = action.includes('temperature')
      ? 'температуры'
      : action.includes('pressure')
      ? 'давления/разрежения'
      : action.includes('level')
      ? 'уровня'
      : action.includes('dose')
      ? 'Дозы (Кг/час)'
      : 'неизвестного параметра';

    // Генерация графика
    const chartBuffer = await generateChart(data);
    if (!chartBuffer || chartBuffer.length === 0) {
      throw new Error(`График не был создан для ${action}`);
    }

    // Отправка графика
    await bot.sendPhoto(chatId, chartBuffer, {
      caption: `График ${chartType} для ${furnaceType} №${furnaceNumber}`,
    });

    await bot.deleteMessage(chatId, loadingMessage.message_id);

    // Определение набора кнопок
    const buttonSet = getButtonsByAction(
      furnaceType === 'печи карбонизации' ? `charts_vr${furnaceNumber}` : `charts_mpa${furnaceNumber}`
    );
    await sendMessageWithButtons(bot, chatId, 'Выберите следующий график или вернитесь назад:', buttonSet);
  } catch (error) {
    console.error(`Ошибка при генерации или отправке графика ${action}:`, error);
    if (loadingMessage) {
      await bot.deleteMessage(chatId, loadingMessage.message_id); // Удаление сообщения о загрузке
    }
    await bot.sendMessage(chatId, 'Произошла ошибка при создании графика. Пожалуйста, попробуйте позже.');
  }
};

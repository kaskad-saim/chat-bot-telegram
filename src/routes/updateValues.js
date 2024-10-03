import { initialData } from '../data/initialData.js';
import { FurnaceVR1, FurnaceVR2 } from '../models/FurnanceModel.js';
import { NotisVR1, NotisVR2 } from '../models/NotisModel.js';
import { generateDoseTableNotis } from '../telegram-bot/generates/notis/generateTable.js';

// Функция для получения последних 5 значений параметра "Кг/час" из базы данных
export async function getLastValuesNotis(furnaceModel, parameterKey) {
  try {
    const results = await furnaceModel
      .find({ key: parameterKey }) // Фильтруем по ключу (Кг/час)
      .sort({ timestamp: -1 }) // Сортируем по времени (от новых к старым)
      .limit(3); // Ограничиваем количество записей до 5

    return results.map((doc) => doc.value);
  } catch (error) {
    console.error('Ошибка при получении данных:', error.message);
    return [];
  }
}

// Обновленная функция checkLoading
export function checkLoading(values) {
  // Преобразуем запятую в точку и затем выполняем parseFloat
  const convertedValues = values
    .map((value) => (value === 'Нет данных' ? null : parseFloat(value.replace(',', '.'))))
    .filter((value) => value !== null); // Исключаем значения "Нет данных"

  // Если массив пуст или не содержит данных, считаем, что загрузки нет
  if (convertedValues.length === 0) {
    return 'Загрузки нет';
  }

  // Проверяем, одинаковы ли все значения
  const allSame = convertedValues.every((val, _, arr) => val === arr[0]);

  if (allSame) {
    return 'Загрузки нет';
  } else {
    return 'Идет загрузка';
  }
}

// Обновление данных и сохранение в базу данных
export const updateValuesRoute = (app) => {
  app.post('/update-values', async (req, res) => {
    const data = req.body;
    const key = Object.keys(data)[0];
    let value = data[key];

    // Инициализация данных в памяти
    if (!app.locals.data) {
      app.locals.data = initialData;
    }

    // Если значение содержит "Ош.43", устанавливаем значение "Нет данных"
    if (value === 'Ош.43') {
      value = 'Нет данных';
    }

    // Обновляем данные в памяти
    app.locals.data[key] = value;

    // Определяем коллекцию для сохранения данных
    let model;

    // Проверяем ключи для печей и нотисов
    if (key.includes('печь ВР1')) {
      model = FurnaceVR1;
    } else if (key.includes('печь ВР2')) {
      model = FurnaceVR2;
    } else if (key.includes('Нотис ВР1')) {
      model = NotisVR1;
    } else if (key.includes('Нотис ВР2')) {
      model = NotisVR2;
    } else {
      return res.status(400).send('Некорректный ключ данных.');
    }

    try {
      // Сохраняем данные в соответствующей коллекции
      await model.create({ key, value });

      // Проверка режима работы после обновления данных
      if (key.includes('Кг/час')) {
        const lastFiveValues = await getLastValuesNotis(model, key);
        const loadStatus = checkLoading(lastFiveValues);

        // Генерация таблицы дозатора с учетом статуса работы
        const furnaceNumber = key.includes('ВР1') ? 1 : 2;
        const doseTable = generateDoseTableNotis(app.locals.data, furnaceNumber, loadStatus);
        // для дальнейшего использования doseTable
      }

      res.send('Данные успешно сохранены.');
    } catch (err) {
      console.error('Ошибка при сохранении данных:', err);
      res.status(500).send('Ошибка при сохранении данных.');
    }
  });
};

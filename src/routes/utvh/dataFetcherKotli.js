import axios from 'axios';
import mongoose from 'mongoose';
import { Kotel1, Kotel2, Kotel3 } from '../../models/KotliModel.js';

export async function fetchDataKotels() {
  const fetchAndProcessData = async (url, model, kotelName) => {
    try {
      const response = await axios.get(url);

      if (!response.data) {
        console.error(`Ошибка: данные для ${kotelName} не получены или пусты`);
        return;
      }

      let data = response.data;

      // Проверяем структуру данных
      if (!data.parameters || !data.info || !data.alarms) {
        console.error(`Ошибка: данные ${kotelName} не соответствуют ожидаемой структуре`);
        return;
      }

      // Проверяем и заменяем _id
      if (data._id) {
        const existingDoc = await model.findById(data._id);
        if (existingDoc) {
          console.log(`Обнаружен дубликат _id для ${kotelName}. Генерация нового _id...`);
          data._id = new mongoose.Types.ObjectId();
          console.log(`Новый _id для ${kotelName}: ${data._id}`);
        }
      }

      // Вставляем данные
      await model.create(data);
    } catch (error) {
      console.error(`Ошибка при получении данных для ${kotelName}:`, error.response?.data || error.message);
    }
  };

  // Обрабатываем каждый котел независимо
  await fetchAndProcessData('http://169.254.0.166:3002/api/kotel1-data', Kotel1, 'Kotel1');
  await fetchAndProcessData('http://169.254.0.166:3002/api/kotel2-data', Kotel2, 'Kotel2');
  await fetchAndProcessData('http://169.254.0.166:3002/api/kotel3-data', Kotel3, 'Kotel3');
}

setInterval(fetchDataKotels, 10000);
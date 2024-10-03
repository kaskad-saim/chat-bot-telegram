import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';  // Подключаем библиотеку для преобразования кодировок

export async function fetchData() {
  try {
    // Запрашиваем страницы с дозаторами и печами
    const responsePechiVr = await axios.get(
      'http://169.254.0.156/kaskad/Web_Clnt.dll/ShowPage?production/carbon/pechiVr/pechiVrTelegram.htm',
      { responseType: 'arraybuffer' }  // Указываем тип ответа
    );

    const responseNotis = await axios.get(
      'http://169.254.0.164/kaskad/Web_Clnt.dll/ShowPage?production/carbon/notisi/pechiVrNotisTelegram.htm',
      { responseType: 'arraybuffer' }  // Указываем тип ответа
    );

    // Преобразуем данные в нужную кодировку (Windows-1251)
    const decodedDataPechiVr = iconv.decode(Buffer.from(responsePechiVr.data), 'windows-1251');
    const decodedDataNotis = iconv.decode(Buffer.from(responseNotis.data), 'windows-1251');

    // Парсинг данных с помощью cheerio
    const $Vr = cheerio.load(decodedDataPechiVr);
    const $Notis = cheerio.load(decodedDataNotis);

    const extractData = (selectors, $) => selectors.map((selector) => $(selector).text().trim());

    const categories = {
      temperatureVr1: [
        '.bot-vr1-temper-1-skolz',
        '.bot-vr1-temper-2-skolz',
        '.bot-vr1-temper-3-skolz',
        '.bot-vr1-temper-topka',
        '.bot-vr1-temper-verh-kam',
        '.bot-vr1-temper-niz-kam',
        '.bot-vr1-temper-vhod-pechi',
        '.bot-vr1-temper-vihod-dozhig',
        '.bot-vr1-temper-kamer-vygruz',
        '.bot-vr1-temper-kotel',
        '.bot-vr1-temper-do-skruber',
        '.bot-vr1-temper-posle-skruber',
        '.bot-vr1-temper-skruber',
        '.bot-vr1-temper-granul',
      ],
      temperatureVr2: [
        '.bot-vr2-temper-1-skolz',
        '.bot-vr2-temper-2-skolz',
        '.bot-vr2-temper-3-skolz',
        '.bot-vr2-temper-topka',
        '.bot-vr2-temper-verh-kam',
        '.bot-vr2-temper-niz-kam',
        '.bot-vr2-temper-vhod-pechi',
        '.bot-vr2-temper-vihod-dozhig',
        '.bot-vr2-temper-kamer-vygruz',
        '.bot-vr2-temper-kotel',
        '.bot-vr2-temper-do-skruber',
        '.bot-vr2-temper-posle-skruber',
        '.bot-vr2-temper-skruber',
        '.bot-vr2-temper-granul',
      ],
      levelVr1: ['.bot-vr1-uroven-skrubber', '.bot-vr1-uroven-hvo', '.bot-vr1-uroven-kotla'],
      levelVr2: ['.bot-vr2-uroven-skrubber', '.bot-vr2-uroven-hvo', '.bot-vr2-uroven-kotla'],
      pressureVr1: ['.bot-vr1-davl-posle-skruber', '.bot-vr1-davl-kotla'],
      pressureVr2: ['.bot-vr2-davl-posle-skruber', '.bot-vr2-davl-kotla'],
      underPressureVr1: ['.bot-vr1-razr-topka', '.bot-vr1-razr-kotel', '.bot-vr1-razr-niz-kam'],
      underPressureVr2: ['.bot-vr2-razr-topka', '.bot-vr2-razr-kotel', '.bot-vr2-razr-niz-kam'],
      imVr1: ['.bot-vr1-im-kotla'],
      imVr2: ['.bot-vr2-im-kotla'],
      gorelkaVr1: ['.bot-vr1-mosh-gorelki'],
      gorelkaVr2: ['.bot-vr2-mosh-gorelki'],
      timeVr: ['.bot-vr-time'],
    };

    const categoriesNotis = {
      doseVr1: [
        '.bot-vr1-dose-g-min',
        '.bot-vr1-dose-kg-h',
        '.bot-vr1-dose-g',
        '.bot-vr1-dose-number-pieces',
        '.bot-vr1-total-weight-tons',
        '.bot-vr1-test',
      ],
      doseVr2: [
        '.bot-vr2-dose-g-min',
        '.bot-vr2-dose-kg-h',
        '.bot-vr2-dose-g',
        '.bot-vr2-dose-number-pieces',
        '.bot-vr2-total-weight-tons',
        '.bot-vr2-test',
      ],
      timeNotis: ['.bot-vr-notis-time'],
    };

    const data = {};
    for (const [key, selectors] of Object.entries(categories)) {
      data[key] = extractData(selectors, $Vr);
    }

    for (const [key, selectors] of Object.entries(categoriesNotis)) {
      data[key] = extractData(selectors, $Notis);
    }

    const namedData = {
      'Температура 1-СК печь ВР1': data.temperatureVr1[0],
      'Температура 2-СК печь ВР1': data.temperatureVr1[1],
      'Температура 3-СК печь ВР1': data.temperatureVr1[2],
      'Температура в топке печь ВР1': data.temperatureVr1[3],
      'Температура вверху камеры загрузки печь ВР1': data.temperatureVr1[4],
      'Температура внизу камеры загрузки печь ВР1': data.temperatureVr1[5],
      'Температура на входе печи дожига печь ВР1': data.temperatureVr1[6],
      'Температура на выходе печи дожига печь ВР1': data.temperatureVr1[7],
      'Температура камеры выгрузки печь ВР1': data.temperatureVr1[8],
      'Температура дымовых газов котла печь ВР1': data.temperatureVr1[9],
      'Температура газов до скруббера печь ВР1': data.temperatureVr1[10],
      'Температура газов после скруббера печь ВР1': data.temperatureVr1[11],
      'Температура воды в ванне скруббер печь ВР1': data.temperatureVr1[12],
      'Температура гранул после холод-ка печь ВР1': data.temperatureVr1[13],
      'Уровень в ванне скруббера печь ВР1': data.levelVr1[0],
      'Уровень воды в емкости ХВО печь ВР1': data.levelVr1[1],
      'Уровень воды в барабане котла печь ВР1': data.levelVr1[2],
      'Давление газов после скруббера печь ВР1': data.pressureVr1[0],
      'Давление пара в барабане котла печь ВР1': data.pressureVr1[1],
      'Разрежение в топке печи печь ВР1': data.underPressureVr1[0],
      'Разрежение в пространстве котла утилизатора печь ВР1': data.underPressureVr1[1],
      'Разрежение низ загрузочной камеры печь ВР1': data.underPressureVr1[2],
      'Исполнительный механизм котла печь ВР1': data.imVr1[0],
      'Мощность горелки печь ВР1': data.gorelkaVr1[0],
      'Время записи на сервер для печь ВР1': data.timeVr[0],

      'Температура 1-СК печь ВР2': data.temperatureVr2[0],
      'Температура 2-СК печь ВР2': data.temperatureVr2[1],
      'Температура 3-СК печь ВР2': data.temperatureVr2[2],
      'Температура в топке печь ВР2': data.temperatureVr2[3],
      'Температура вверху камеры загрузки печь ВР2': data.temperatureVr2[4],
      'Температура внизу камеры загрузки печь ВР2': data.temperatureVr2[5],
      'Температура на входе печи дожига печь ВР2': data.temperatureVr2[6],
      'Температура на выходе печи дожига печь ВР2': data.temperatureVr2[7],
      'Температура камеры выгрузки печь ВР2': data.temperatureVr2[8],
      'Температура дымовых газов котла печь ВР2': data.temperatureVr2[9],
      'Температура газов до скруббера печь ВР2': data.temperatureVr2[10],
      'Температура газов после скруббера печь ВР2': data.temperatureVr2[11],
      'Температура воды в ванне скруббер печь ВР2': data.temperatureVr2[12],
      'Температура гранул после холод-ка печь ВР2': data.temperatureVr2[13],
      'Уровень в ванне скруббера печь ВР2': data.levelVr2[0],
      'Уровень воды в емкости ХВО печь ВР2': data.levelVr2[1],
      'Уровень воды в барабане котла печь ВР2': data.levelVr2[2],
      'Давление газов после скруббера печь ВР2': data.pressureVr2[0],
      'Давление пара в барабане котла печь ВР2': data.pressureVr2[1],
      'Разрежение в топке печи печь ВР2': data.underPressureVr2[0],
      'Разрежение в пространстве котла утилизатора печь ВР2': data.underPressureVr2[1],
      'Разрежение низ загрузочной камеры печь ВР2': data.underPressureVr2[2],
      'Исполнительный механизм котла печь ВР2': data.imVr2[0],
      'Мощность горелки печь ВР2': data.gorelkaVr2[0],
      'Время записи на сервер для печь ВР2': data.timeVr[0],

      // Дозаторы Нотис ВР1
      'Нотис ВР1 Г/мин': data.doseVr1[0],
      'Нотис ВР1 Кг/час': data.doseVr1[1],
      'Нотис ВР1 Общий вес в граммах': data.doseVr1[2],
      'Нотис ВР1 Количество штук': data.doseVr1[3],
      'Нотис ВР1 Общий вес в тоннах': data.doseVr1[4],
      'Время записи на сервер Нотис ВР1': data.timeNotis[0],

      // Дозаторы Нотис ВР2
      'Нотис ВР2 Г/мин': data.doseVr2[0],
      'Нотис ВР2 Кг/час': data.doseVr2[1],
      'Нотис ВР2 Общий вес в граммах': data.doseVr2[2],
      'Нотис ВР2 Количество штук': data.doseVr2[3],
      'Нотис ВР2 Общий вес в тоннах': data.doseVr2[4],
      'Время записи на сервер Нотис ВР2': data.timeNotis[0],
    };

    for (const [key, value] of Object.entries(namedData)) {
      try {
        const response = await axios.post('http://169.254.0.167:3001/update-values', JSON.stringify({ [key]: value }), {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error(
          `Ошибка при отправке данных для ключа: ${key}`,
          error.response ? error.response.data : error.message
        );
      }
    }
  } catch (error) {
    console.error('Ошибка при получении данных:', error.message);
  }
}

// Устанавливаем интервал обновления данных каждые 30 секунд
setInterval(fetchData, 30000);

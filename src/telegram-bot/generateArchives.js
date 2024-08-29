import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { FurnaceVR1, FurnaceVR2 } from '../models/FurnanceModel.js';

const generateChartForDate = async (
  FurnaceModel,
  keys,
  labels,
  yAxisTitle,
  chartTitle,
  yMin,
  yMax,
  yAxisStep,
  userDate // новый аргумент
) => {
  // Преобразуем введённую дату в формат yyyy-mm-dd
  const [day, month, year] = userDate.split('.').map(Number);
  const formattedDate = `${year}-${month}-${day}`;
  const userDateObject = new Date(formattedDate);

  if (isNaN(userDateObject.getTime())) {
    throw new Error('Неверный формат даты. Пожалуйста, введите дату в формате dd.mm.yyyy.');
  }

  // Определяем временной диапазон (например, за один день) для графика
  const timeRangeInMillis = 24 * 60 * 60 * 1000; // 24 часа
  const timeAgo = new Date(userDateObject.getTime() - timeRangeInMillis);

  const datasetsPromises = keys.map((key) => {
    return FurnaceModel.find({ key, timestamp: { $gte: timeAgo, $lt: userDateObject } }).sort({ timestamp: 1 });
  });

  const datasets = await Promise.all(datasetsPromises);

  datasets.forEach((dataset, index) => {
    if (dataset.length === 0) {
      console.error(`No data found for ${keys[index]} for the selected date range.`);
      throw new Error(`Нет данных для ${keys[index]} за выбранный период времени для ${chartTitle}.`);
    }
  });

  const timestamps = datasets[0].map((d) => new Date(d.timestamp).toLocaleString());
  const values = datasets.map((dataset) => dataset.map((d) => parseFloat(d.value.replace(',', '.'))));

  const colors = [
    'rgb(54, 162, 235)',
    'rgb(255, 99, 132)',
    'rgb(255, 206, 86)',
    'rgb(75, 192, 192)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
    'rgb(201, 203, 207)',
    'rgb(100, 100, 100)',
    'rgb(0, 200, 100)',
    'rgb(255, 100, 0)',
    'rgb(0, 0, 255)',
    'rgb(100, 255, 100)',
    'rgb(255, 0, 255)',
    'rgb(200, 200, 0)',
    'rgb(0, 255, 255)',
  ];

  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 1280, height: 1024 });
  const config = {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: values.map((data, index) => ({
        label: labels[index],
        data,
        fill: false,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length],
        borderWidth: 1.5,
        tension: 0.1,
        pointRadius: 0,
      })),
    },
    options: {
      scales: {
        x: {
          title: { display: true, text: 'Время' },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 24,
          },
        },
        y: {
          title: { display: true, text: yAxisTitle },
          min: yMin,
          max: yMax,
          beginAtZero: false,
          ticks: {
            stepSize: yAxisStep,
          },
        },
      },
      plugins: {
        title: { display: true, text: chartTitle },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(config);

  if (!buffer || buffer.length === 0) {
    throw new Error(`Не удалось создать график для ${chartTitle}`);
  }

  return buffer;
};


const generateTemperatureChartArchive = async (FurnaceModel, chartTitle, userDate, suffix) => {

  const Keys = [
    `Температура 1-СК печь ${suffix}`,
    `Температура 2-СК печь ${suffix}`,
    `Температура 3-СК печь ${suffix}`,
    `Температура в топке печь ${suffix}`,
    `Температура вверху камеры загрузки печь ${suffix}`,
    `Температура внизу камеры загрузки печь ${suffix}`,
    `Температура на входе печи дожига печь ${suffix}`,
    `Температура на выходе печи дожига печь ${suffix}`,
    `Температура камеры выгрузки печь ${suffix}`,
    `Температура дымовых газов котла печь ${suffix}`,
    `Температура газов до скруббера печь ${suffix}`,
    `Температура газов после скруббера печь ${suffix}`,
    `Температура воды в ванне скруббер печь ${suffix}`,
    `Температура гранул после холод-ка печь ${suffix}`,
  ];

  const labels = [
    'Температура 1-СК',
    'Температура 2-СК',
    'Температура 3-СК',
    'Температура в топке',
    'Температура вверху камеры загрузки',
    'Температура внизу камеры загрузки',
    'Температура на входе печи дожига',
    'Температура на выходе печи дожига',
    'Температура камеры выгрузки',
    'Температура дымовых газов котла',
    'Температура газов до скруббера',
    'Температура газов после скруббера',
    'Температура воды в ванне скруббер',
    'Температура гранул после холод-ка',
  ];

  return generateChartForDate(
    FurnaceModel,
    Keys,
    labels,
    'Температура (°C)',
    chartTitle,
    0,
    1500,
    100,
    userDate
  );
};

// Вызов температур
export const generateTemperatureChartArchiveVR1 = () =>
  generateTemperatureChartArchive(FurnaceVR1, 'График температуры печи карбонизации №1 за сутки', userDate, 'ВР1');
export const generateTemperatureChartArchiveVR2 = () =>
  generateTemperatureChartArchive(FurnaceVR2, 'График температуры печи карбонизации №2 за сутки', userDate, 'ВР2');
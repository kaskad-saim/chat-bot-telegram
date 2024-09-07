import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { FurnaceVR1, FurnaceVR2 } from '../../../models/FurnanceModel.js';

const generateChart = async (
  FurnaceModel,
  keys,
  labels,
  yAxisTitle,
  chartTitle,
  yMin,
  yMax,
  yAxisStep,
  timeRangeInHours // новый аргумент
) => {
  const currentTime = new Date();
  const timeRangeInMillis = timeRangeInHours * 60 * 60 * 1000; // переводим время в миллисекунды
  const timeAgo = new Date(currentTime.getTime() - timeRangeInMillis);

  const datasetsPromises = keys.map((key) => {
    return FurnaceModel.find({ key, timestamp: { $gte: timeAgo } }).sort({ timestamp: 1 });
  });

  const datasets = await Promise.all(datasetsPromises);

  datasets.forEach((dataset, index) => {
    if (dataset.length === 0) {
      console.error(`No data found for ${keys[index]}`);
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
        y2: {
          title: { display: true, text: yAxisTitle },
          position: 'right',
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

// Температура: от 0 до 1500
// Функция генерации графиков температуры
const generateTemperatureChart = async (FurnaceModel, chartTitle, timeRangeInHours, suffix) => {

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

  return generateChart(
    FurnaceModel,
    Keys,
    labels,
    'Температура (°C)',
    chartTitle,
    0,
    1500,
    50,
    timeRangeInHours
  );
};

// Функция генерации графиков давления/разрежения
const generatePressureChart = async (FurnaceModel, chartTitle, timeRangeInHours, suffix) => {

  const Keys = [
    `Давление газов после скруббера печь ${suffix}`,
    `Давление пара в барабане котла печь ${suffix}`,
    `Разрежение в топке печи печь ${suffix}`,
    `Разрежение в пространстве котла утилизатора печь ${suffix}`,
    `Разрежение низ загрузочной камеры печь ${suffix}`,
  ];

  const labels = [
    'Давление газов после скруббера',
    'Давление пара в барабане котла',
    'Разрежение в топке',
    'Разрежение в пространстве котла утилизатора',
    'Разрежение низ загрузочной камеры',
    'Мощность горелки'
  ];

  return generateChart(
    FurnaceModel,
    Keys,
    labels,
    'Давление/Разрежение (кгс/м2, кгс/см2)',
    chartTitle,
    -30,
    30,
    5,
    timeRangeInHours
  );
};

// / Функция генерации графиков уровня
const generateWaterLevelChart = async (FurnaceModel, chartTitle, timeRangeInHours, suffix) => {

  const Keys = [
    `Уровень воды в барабане котла печь ${suffix}`,
    `Исполнительный механизм котла ${suffix}`
  ];

  const labels = [
    'Уровень воды',
    'Степень открытия исполнительного механизма'
  ];

  return generateChart(
    FurnaceModel,
    Keys,
    labels,
    'Уровень (мм)',
    chartTitle,
    -200,
    200,
    10,
    timeRangeInHours
  );
};

// Вызов температур
export const generateTemperature24HourChartVR1 = () =>
  generateTemperatureChart(FurnaceVR1, 'График температуры печи карбонизации №1 за сутки', 24, 'ВР1');
export const generateTemperature24HourChartVR2 = () =>
  generateTemperatureChart(FurnaceVR2, 'График температуры печи карбонизации №2 за сутки', 24, 'ВР2');

export const generateTemperature12HourChartVR1 = () =>
  generateTemperatureChart(FurnaceVR1, 'График температуры печи карбонизации №1 за 12 часов', 12, 'ВР1');
export const generateTemperature12HourChartVR2 = () =>
  generateTemperatureChart(FurnaceVR2, 'График температуры печи карбонизации №2 за 12 часов', 12, 'ВР2');

export const generateTemperatureOneHourChartVR1 = () =>
  generateTemperatureChart(FurnaceVR1, 'График температуры печи карбонизации №1 за последний час', 1, 'ВР1');
export const generateTemperatureOneHourChartVR2 = () =>
  generateTemperatureChart(FurnaceVR2, 'График температуры печи карбонизации №2 за последний час', 1, 'ВР2');

// Вызов разрежения/давления
export const generatePressure24HourChartVR1 = () =>
generatePressureChart(FurnaceVR1, 'График давления/разрежения печи карбонизации №1 за сутки', 24, 'ВР1');
export const generatePressure24HourChartVR2 = () =>
generatePressureChart(FurnaceVR2, 'График давления/разрежения печи карбонизации №2 за сутки', 24, 'ВР2');

export const generatePressure12HourChartVR1 = () =>
generatePressureChart(FurnaceVR1, 'График давления/разрежения печи карбонизации №1 за 12 часов', 12, 'ВР1');
export const generatePressure12HourChartVR2 = () =>
generatePressureChart(FurnaceVR2, 'График давления/разрежения печи карбонизации №2 за 12 часов', 12, 'ВР2');

export const generatePressureOneHourChartVR1 = () =>
generatePressureChart(FurnaceVR1, 'График давления/разрежения печи карбонизации №1 за последний час', 1, 'ВР1');
export const generatePressureOneHourChartVR2 = () =>
generatePressureChart(FurnaceVR2, 'График давления/разрежения печи карбонизации №2 за последний час', 1, 'ВР2');

// Вызов уровня
export const generateLevel24HourChartVR1 = () =>
  generateWaterLevelChart(FurnaceVR1, 'График уровня печи карбонизации №1 за сутки', 24, 'ВР1');
  export const generateLevel24HourChartVR2 = () =>
  generateWaterLevelChart(FurnaceVR2, 'График уровня печи карбонизации №2 за сутки', 24, 'ВР2');

  export const generateLevel12HourChartVR1 = () =>
  generateWaterLevelChart(FurnaceVR1, 'График уровня печи карбонизации №1 за 12 часов', 12, 'ВР1');
  export const generateLevel12HourChartVR2 = () =>
  generateWaterLevelChart(FurnaceVR2, 'График уровня печи карбонизации №2 за 12 часов', 12, 'ВР2');

  export const generateLevelOneHourChartVR1 = () =>
  generateWaterLevelChart(FurnaceVR1, 'График уровня печи карбонизации №1 за последний час', 1, 'ВР1');
  export const generateLevelOneHourChartVR2 = () =>
  generateWaterLevelChart(FurnaceVR2, 'График уровня печи карбонизации №2 за последний час', 1, 'ВР2');


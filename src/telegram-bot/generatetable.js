export const generateTablePechVr = (data, furnaceNumber, currentTime) => {
  if (!data) return 'Нет данных для отображения.';

  // Функция проверки допустимого диапазона
  const checkRange = (value, min, max) => {
    // Проверяем, работает ли печь
    const isFurnaceWorking = data[`Печь ВР${furnaceNumber} Режим работы печи:`] !== 'Печь не работает';

    if (!isFurnaceWorking) {
      return '❓ '; // Если печь не работает, возвращаем знак вопроса
    }

    const transformedValue = parseFloat(value.replace(',', '.'));
    return transformedValue >= min && transformedValue <= max ? '✅ ' : '❌ ';
  };

  // Функции для форматирования различных параметров
  const formatTemp = (label, key, min, max) => `${checkRange(data[key], min, max)} ${label}: ${data[key]} °C`;

  const formatLevel = (label, key, min, max) => `${checkRange(data[key], min, max)} ${label}: ${data[key]} мм`;

  const formatPressure = (label, key, min, max) => `${checkRange(data[key], min, max)} ${label}: ${data[key]} кгс/см2`;

  const formatVacuum = (label, key, min, max) => `${checkRange(data[key], min, max)} ${label}: ${data[key]} кгс/м2`;

  // Параметры температур
  const temperatures = [
    formatTemp('1-СК', `Температура 1-СК печь ВР${furnaceNumber}`, 550, 800),
    formatTemp('2-СК', `Температура 2-СК печь ВР${furnaceNumber}`, 0, 700),
    formatTemp(
      '3-СК',
      `Температура 3-СК печь ВР${furnaceNumber}`,
      0,
      data[`Печь ВР${furnaceNumber} Режим работы печи:`] === 'Установившийся режим' ? 400 : 750
    ),
    formatTemp('В топке', `Температура в топке печь ВР${furnaceNumber}`, 0, 1000),
    formatTemp('Вверху камеры загрузки', `Температура вверху камеры загрузки печь ВР${furnaceNumber}`, 0, 1000),
    formatTemp('Внизу камеры загрузки', `Температура внизу камеры загрузки печь ВР${furnaceNumber}`, 1000, 1100),
    formatTemp('На входе печи дожига', `Температура на входе печи дожига печь ВР${furnaceNumber}`, 0, 1200),
    formatTemp('На выходе печи дожига', `Температура на выходе печи дожига печь ВР${furnaceNumber}`, 0, 1200),
    formatTemp('Камеры выгрузки', `Температура камеры выгрузки печь ВР${furnaceNumber}`, 0, 750),
    formatTemp('Дымовых газов котла', `Температура дымовых газов котла печь ВР${furnaceNumber}`, 0, 1100),
    formatTemp('Газов до скруббера', `Температура газов до скруббера печь ВР${furnaceNumber}`, 0, 400),
    formatTemp('Газов после скруббера', `Температура газов после скруббера печь ВР${furnaceNumber}`, 0, 100),
    formatTemp('Воды в ванне скруббер', `Температура воды в ванне скруббер печь ВР${furnaceNumber}`, 0, 90),
    formatTemp('Гранул после холод-ка', `Температура гранул после холод-ка печь ВР${furnaceNumber}`, 0, 70),
  ];

  // Параметры уровней
  const levels = [
    formatLevel('В ванне скруббера', `Уровень в ванне скруббера печь ВР${furnaceNumber}`, 250, 850),
    formatLevel('В емкости ХВО', `Уровень воды в емкости ХВО печь ВР${furnaceNumber}`, 1500, 4500),
    formatLevel('В барабане котла', `Уровень воды в барабане котла печь ВР${furnaceNumber}`, -100, 100),
  ];

  // Параметры давления
  const pressures = [
    formatPressure('Газов после скруббера', `Давление газов после скруббера печь ВР${furnaceNumber}`, 0, 20),
    formatPressure('Пара в барабане котла', `Давление пара в барабане котла печь ВР${furnaceNumber}`, 0, 10),
  ];

  // Параметры разрежения
  const vacuums = [
    formatVacuum('В топке печи', `Разрежение в топке печи печь ВР${furnaceNumber}`, -4, -1),
    formatVacuum('В котле утилизаторе', `Разрежение в пространстве котла утилизатора печь ВР${furnaceNumber}`, -12, -3),
    formatVacuum('Низ загрузочной камеры', `Разрежение низ загрузочной камеры печь ВР${furnaceNumber}`, -5, -1),
  ];

  // Объединение всех параметров в один массив
  const parameters = [
    `Режим работы печи: ${data[`Печь ВР${furnaceNumber} Режим работы печи:`]}`,
    `Время записи на сервер: ${data[`Время записи на сервер для печь ВР${furnaceNumber}`]}`,
    '',
    'Температуры:',
    ...temperatures,
    '',
    'Уровни:',
    ...levels,
    '',
    'Давления:',
    ...pressures,
    '',
    'Разрежения:',
    ...vacuums,
    '',
    `Обновлено: ${currentTime}`,
  ];

  // Формирование итоговой строки
  return ['Текущие параметры', `Печь карбонизации №${furnaceNumber}`, '', ...parameters].join('\n');
};

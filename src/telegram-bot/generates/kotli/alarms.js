export const checkAlarms = (alarmsData, kotelNumber, currentTime) => {
  if (!alarmsData) {
    return 'Нет данных о авариях.';
  }

  // Преобразуем объект Mongoose в обычный JavaScript-объект, если необходимо
  const cleanAlarmsData = alarmsData.toObject
    ? alarmsData.toObject({ flattenMaps: true })
    : alarmsData;

  // Получаем раздел с аварийными сигналами
  const alarmsSection = cleanAlarmsData.alarms || {};

  // Массив для хранения сработавших аварий
  const triggeredAlarms = [];

  // Список всех аварийных сигналов (без указания номера котла)
  const alarmKeys = [
    'Уровень высок',
    'Уровень низок',
    'Разрежение мало',
    'Давление воздуха низко',
    'Давление газа низко',
    'Давление газа высоко',
    'Факел горелки погас',
    'Дымосос отключен',
    'Останов по команде',
  ];

  // Проверяем, есть ли данные в разделе alarms
  const isNoData = Object.keys(alarmsSection).length === 0 || Object.values(alarmsSection).every(val => val === '—' || val === null || val === undefined);

  if (isNoData) {
    return `❓ Нет связи с объектом Котел №${kotelNumber}.\n\nВремя записи на сервер: ${cleanAlarmsData.lastUpdated || 'Нет данных'}\n\nПоследнее обновление: ${new Date().toLocaleString()}`;
  }

  // Проверяем каждый аварийный сигнал
  alarmKeys.forEach(key => {
    const fullKey = `${key} котел №${kotelNumber}`; // Формируем полный ключ
    const alarmValue = alarmsSection[fullKey];

    // Если значение прочерк или отсутствует, пропускаем
    if (alarmValue === '—' || alarmValue === null || alarmValue === undefined) {
      return;
    }

    // Если авария активна (true), добавляем в список
    if (alarmValue === true) {
      triggeredAlarms.push(`❌ ${key}`); // Добавляем только название параметра
    }
  });

  // Время записи на сервер (аналогично логике из generateTableUtvhKotel)
  const serverTime = cleanAlarmsData.lastUpdated || 'Нет данных';

  // Время последнего обновления
  const lastUpdated = new Date().toLocaleString();

  // Формируем итоговую строку
  if (triggeredAlarms.length > 0) {
    return `⚠️ Сработавшие аварии Котла №${kotelNumber}:\n\nВремя записи на сервер: ${serverTime}\n\n${triggeredAlarms.join('\n')}\n\nПоследнее обновление: ${lastUpdated}`;
  } else {
    return `✅ Все параметры котла №${kotelNumber} в пределах нормы.\n\nВремя записи на сервер: ${serverTime}\n\nПоследнее обновление: ${lastUpdated}`;
  }
};
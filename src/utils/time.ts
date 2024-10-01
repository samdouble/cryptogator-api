import { DateTime } from 'luxon';

export const isSameDay = (dateTime1: DateTime, dateTime2: DateTime): boolean => {
  return dateTime1.toISODate() === dateTime2.toISODate();
};

export default {
  isSameDay,
};

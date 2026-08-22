const internetDateTimePattern = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})(?:\.\d+)?(?<zone>Z|(?<offsetSign>[+-])(?<offsetHour>\d{2}):(?<offsetMinute>\d{2}))$/;

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year, month) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

export function isRFC3339InternetDateTime(value) {
  if (typeof value !== "string") return false;

  const match = internetDateTimePattern.exec(value);
  if (!match) return false;

  const fields = Object.fromEntries(
    Object.entries(match.groups).map(([key, field]) => [key, Number(field)]),
  );

  if (fields.month < 1 || fields.month > 12) return false;
  if (fields.day < 1 || fields.day > daysInMonth(fields.year, fields.month)) return false;
  if (fields.hour > 23 || fields.minute > 59 || fields.second > 59) return false;

  if (match.groups.zone !== "Z") {
    if (fields.offsetMinute > 59 || fields.offsetHour > 14) return false;
    if (fields.offsetHour === 14 && fields.offsetMinute !== 0) return false;
  }

  return true;
}

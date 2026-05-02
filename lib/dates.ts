import {
  formatDistanceToNowStrict,
  isSameDay,
  parseISO
} from "date-fns";

const locale = "es-MX";
const appTimeZone = "America/Mexico_City";
const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function toDate(date: string | Date) {
  if (typeof date !== "string") return date;
  return new Date(dateOnlyPattern.test(date) ? `${date}T12:00:00` : date);
}

export function getAppDateKey(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: appTimeZone
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function getAppWeekday(date: Date = new Date()) {
  const shortDay = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: appTimeZone
  }).format(date);
  const days: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  return days[shortDay] ?? date.getDay();
}

function getTimeZoneOffsetMs(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: appTimeZone
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const localAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return localAsUtc - date.getTime();
}

export function fromAppLocalDateTime(dateKey: string, time: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offset = getTimeZoneOffsetMs(utcGuess);

  return new Date(utcGuess.getTime() - offset);
}

export function startOfAppDayIso(date: Date = new Date()) {
  return fromAppLocalDateTime(getAppDateKey(date), "00:00:00").toISOString();
}

export function endOfAppDayIso(date: Date = new Date()) {
  return fromAppLocalDateTime(getAppDateKey(date), "23:59:59").toISOString();
}

export function formatLongDate(date: string | Date) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: appTimeZone
  }).format(toDate(date));
}

export function formatShortDate(date: string | Date) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    timeZone: appTimeZone
  }).format(toDate(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: appTimeZone
  }).format(toDate(date));
}

export function formatClock(date: string | Date) {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: appTimeZone
  }).format(toDate(date));
}

export function relativeFromNow(date: string) {
  return formatDistanceToNowStrict(parseISO(date), { addSuffix: true });
}

export function isToday(date: string | Date) {
  return isSameDay(toDate(date), new Date());
}

export function toLocalDatetimeValue(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: appTimeZone
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

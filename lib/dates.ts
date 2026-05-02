import {
  formatDistanceToNowStrict,
  isSameDay,
  parseISO
} from "date-fns";

const locale = "es-MX";
const appTimeZone = "America/Mexico_City";

export function formatLongDate(date: string | Date) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: appTimeZone
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatShortDate(date: string | Date) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    timeZone: appTimeZone
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: appTimeZone
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatClock(date: string | Date) {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: appTimeZone
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function relativeFromNow(date: string) {
  return formatDistanceToNowStrict(parseISO(date), { addSuffix: true });
}

export function isToday(date: string | Date) {
  return isSameDay(typeof date === "string" ? new Date(date) : date, new Date());
}

export function toLocalDatetimeValue(date: Date = new Date()) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 16);
}

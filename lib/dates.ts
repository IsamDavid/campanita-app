import {
  format,
  formatDistanceToNowStrict,
  isSameDay,
  parseISO
} from "date-fns";

const locale = "es-MX";

export function formatLongDate(date: string | Date) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatShortDate(date: string | Date) {
  return format(typeof date === "string" ? new Date(date) : date, "dd MMM");
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatClock(date: string | Date) {
  return format(typeof date === "string" ? new Date(date) : date, "hh:mm a");
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

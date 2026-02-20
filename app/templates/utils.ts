function getOrdinal(day: number) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Formats a Date as a human-readable CET/CEST string.
 * Example: "Wednesday, June 18th, 2025, at 14:30 CET"
 */
export function formatDateCET(date: Date) {
  const timeZone = "Europe/Paris";

  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone,
  }).format(date);

  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone,
  }).format(date);

  const day = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone,
  }).format(date);

  const year = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone,
  }).format(date);

  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
    timeZoneName: "short",
  }).formatToParts(date);

  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  const tz = parts.find((p) => p.type === "timeZoneName")?.value;

  return `${dayName}, ${month} ${day}${getOrdinal(Number(day))}, ${year}, at ${hour}:${minute} ${tz}`;
}

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

  return `${dayName}, ${month} ${day}${getOrdinal(
    Number(day)
  )}, ${year}, at ${hour}:${minute} ${tz}`;
}

export function getSPLabel(spCode: string) {
  switch (spCode.toUpperCase()) {
    case "SP01":
      return "BREEDING FOR TOMORROW";
    case "SP02":
      return "SUSTAINABLE FARMING";
    case "SP03":
      return "SUSTAINABLE ANIMAL AND AQUATIC FOODS";
    case "SP04":
      return "MULTIFUNCTIONAL LANDSCAPES";
    case "SP05":
      return "BETTER DIETS AND NUTRITION";
    case "SP06":
      return "CLIMATE ACTION";
    case "SP07":
      return "POLICY INNOVATIONS";
    case "SP08":
      return "FOOD FRONTIERS AND SECURITY";
    case "SP09":
      return "SCALLING FOR IMPACT";
    case "SP10":
      return "GENDER EQUALITY AND INCLUSION";
    case "SP11":
      return "CAPACITY SHARING";
    case "SP12":
      return "DIGITAL TRANSFORMATION";
    case "SP13":
      return "GENEBANKS";
    default:
      return null;
  }
}

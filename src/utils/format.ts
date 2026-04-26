export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Computes layover minutes between consecutive segments using arrival/departure date+time.
export function layoverMinutes(arrDate: string, arrTime: string, depDate: string, depTime: string): number {
  const a = new Date(`${arrDate}T${arrTime}:00`);
  const d = new Date(`${depDate}T${depTime}:00`);
  return Math.max(0, Math.round((d.getTime() - a.getTime()) / 60000));
}

export function formatPrice(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

export function airlineLogoUrl(code: string): string {
  return `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;
}

interface BookingLinkOpts {
  from: string;
  to: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
}

export function googleFlightsUrl(o: BookingLinkOpts): string {
  const tripWord = o.returnDate ? `to ${o.to} on ${o.departureDate} returning ${o.returnDate}` : `to ${o.to} on ${o.departureDate}`;
  const q = `Flights from ${o.from} ${tripWord}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

// Skyscanner uses YYMMDD (no separators) for dates.
function ymd(date: string): string {
  return date.replace(/-/g, "").slice(2);
}

export function skyscannerUrl(o: BookingLinkOpts): string {
  const dep = ymd(o.departureDate);
  const ret = o.returnDate ? `/${ymd(o.returnDate)}` : "";
  const url = `https://www.skyscanner.net/transport/flights/${o.from.toLowerCase()}/${o.to.toLowerCase()}/${dep}${ret}/`;
  const q = new URLSearchParams({
    adultsv2: String(o.adults),
    childrenv2: o.children > 0 ? Array(o.children).fill("8").join("|") : "",
    infantsv2: String(o.infants),
  });
  // Drop empty values for cleaner URLs
  for (const [k, v] of [...q.entries()]) if (!v) q.delete(k);
  const qs = q.toString();
  return qs ? `${url}?${qs}` : url;
}

export function airlineWebsiteSearch(airlineName: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${airlineName} book flight`)}`;
}

import type { SearchParams, SearchResponse } from "./types";
import { getCached, setCached } from "../utils/cache";

const HOST = "google-flights-data.p.rapidapi.com";
const BASE_URL = `https://${HOST}`;
const TIMEOUT_MS = 20_000;

function getKey(): string {
  const key = (import.meta.env.VITE_RAPIDAPI_KEY as string | undefined) ?? "";
  if (!key) {
    throw new Error(
      "VITE_RAPIDAPI_KEY is not set. Copy .env.example to .env and add your RapidAPI key."
    );
  }
  return key;
}

async function getJson<T>(path: string, query: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    url.searchParams.set(k, String(v));
  }

  const cacheKey = url.toString();
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": getKey(),
        "X-RapidAPI-Host": HOST,
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API error ${res.status}: ${text || res.statusText}`);
    }
    const json = (await res.json()) as T;
    setCached(cacheKey, json);
    return json;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error("Request timed out after 20 seconds. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Maps form fields to the API's `stops` enum.
// Spec: directOnly OR maxStops dropdown (0/1/2).
//   0 -> "Nonstop only" (1)
//   1 -> "1 stop or fewer" (2)
//   2 -> "2 stops or fewer" (3)
function mapStops(directOnly: boolean, maxStops: 0 | 1 | 2): number {
  if (directOnly) return 1;
  if (maxStops === 0) return 1;
  if (maxStops === 1) return 2;
  return 3;
}

// Format max duration as the API expects (HHhMM).
function formatDuration(hours: number): string {
  const h = Math.max(1, Math.floor(hours));
  return `${String(h).padStart(2, "0")}h00`;
}

export async function searchFlights(params: SearchParams): Promise<SearchResponse> {
  const path =
    params.tripType === "roundtrip"
      ? "/flights/search-roundtrip"
      : "/flights/search-oneway";

  const query: Record<string, string | number | undefined> = {
    departureId: params.departureId.toUpperCase(),
    arrivalId: params.arrivalId.toUpperCase(),
    departureDate: params.departureDate,
    adults: params.adults,
    children: params.children,
    infantsInSeat: params.infantsInSeat,
    currency: params.currency,
    sort: 2, // price
    stops: mapStops(params.directOnly, params.maxStops),
    flightDuration: formatDuration(params.maxDurationHours),
  };
  if (params.tripType === "roundtrip" && params.arrivalDate) {
    query.arrivalDate = params.arrivalDate;
  }

  return getJson<SearchResponse>(path, query);
}

// Loads return-leg options for a selected outbound roundtrip flight.
// Endpoint: GET /flights/roundtrip-returning?returningToken=...
// Same response envelope as /flights/search-roundtrip.
export async function searchReturningFlights(returningToken: string): Promise<SearchResponse> {
  return getJson<SearchResponse>("/flights/roundtrip-returning", {
    returningToken,
  });
}


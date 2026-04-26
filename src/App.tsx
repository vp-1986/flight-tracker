import { useEffect, useState } from "react";
import { SearchForm } from "./components/SearchForm";
import { SummaryBar } from "./components/SummaryBar";
import { ResultsList } from "./components/ResultsList";
import { searchFlights } from "./api/client";
import type { Flight, SearchParams, SearchResponse } from "./api/types";
import { readPrefs, writePrefs } from "./utils/cookies";

const DEFAULTS: SearchParams = {
  tripType: "roundtrip",
  departureId: "HEL",
  arrivalId: "MIA",
  departureDate: "2027-03-26",
  arrivalDate: "2027-04-06",
  adults: 2,
  children: 2,
  infantsInSeat: 0,
  directOnly: false,
  maxStops: 1,
  maxDurationHours: 16,
  currency: "EUR",
};

export default function App() {
  const [params, setParams] = useState<SearchParams>(() => {
    const saved = readPrefs<SearchParams>();
    return saved ? { ...DEFAULTS, ...saved } : DEFAULTS;
  });
  const [results, setResults] = useState<Flight[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formExpanded, setFormExpanded] = useState(true);

  useEffect(() => {
    document.title = "Flight Price Tracker";
  }, []);

  async function runSearch(p: SearchParams) {
    setParams(p);
    writePrefs(p);
    setLoading(true);
    setError(null);
    setResults(null);
    setFormExpanded(false);
    try {
      const res: SearchResponse = await searchFlights(p);
      const all = [...(res.data?.topFlights ?? []), ...(res.data?.otherFlights ?? [])];
      if (all.length === 0) {
        setError("No flights returned by the API for this search.");
      }
      setResults(all);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setFormExpanded(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Flight Price Tracker
        </h1>
        <p className="text-sm text-muted mt-1">
          Live fares via the Google Flights Data API on RapidAPI.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-12 space-y-4">
        {formExpanded ? (
          <SearchForm initial={params} onSearch={runSearch} />
        ) : (
          <SummaryBar params={params} onEdit={() => setFormExpanded(true)} />
        )}

        {loading && (
          <div className="card p-10 flex flex-col items-center gap-3">
            <div className="spinner" />
            <p className="text-sm text-muted">
              Searching flights… this can take 10–15 seconds.
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="card p-4 border-danger/40 bg-danger/10 text-sm">
            <strong className="text-danger">Error:</strong> {error}
          </div>
        )}

        {results && !loading && !error && (
          <ResultsList flights={results} params={params} />
        )}
      </main>
    </div>
  );
}

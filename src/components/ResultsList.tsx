import { useMemo, useState } from "react";
import type { Flight, SearchParams, SortKey } from "../api/types";
import { FlightCard } from "./FlightCard";

interface Props {
  flights: Flight[];
  params: SearchParams;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function ResultsList({ flights, params }: Props) {
  const [sort, setSort] = useState<SortKey>("price");

  const visible = useMemo(() => {
    const maxMinutes = params.maxDurationHours * 60;
    const filtered = flights.filter((f) => f.durationMinutes <= maxMinutes);
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "duration") return a.durationMinutes - b.durationMinutes;
      return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime);
    });
    return sorted;
  }, [flights, sort, params.maxDurationHours]);

  if (flights.length === 0) {
    return (
      <div className="card p-6 text-center text-muted">
        No flights found for these criteria. Try widening your filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="card px-4 py-3 flex items-center gap-3 sticky top-2 z-10 backdrop-blur">
        <span className="text-xs text-muted uppercase tracking-wide">Sort by</span>
        <SortButton active={sort === "price"} onClick={() => setSort("price")}>
          Price
        </SortButton>
        <SortButton active={sort === "duration"} onClick={() => setSort("duration")}>
          Duration
        </SortButton>
        <SortButton active={sort === "departure"} onClick={() => setSort("departure")}>
          Departure
        </SortButton>
        <span className="ml-auto text-xs text-muted">
          {visible.length} of {flights.length} results
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="card p-6 text-center text-muted">
          All results filtered out by max duration. Increase the limit to see more.
        </div>
      ) : (
        visible.map((f, i) => (
          <FlightCard
            key={`${f.airlineCode}-${f.departureTime}-${f.price}-${i}`}
            flight={f}
            params={params}
          />
        ))
      )}
    </div>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3 py-1 rounded-md transition ${
        active ? "bg-accent text-white" : "text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

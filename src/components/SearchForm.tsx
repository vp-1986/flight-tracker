import { useState } from "react";
import type { SearchParams } from "../api/types";

interface Props {
    initial: SearchParams;
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
}

export function SearchForm({ initial, onSearch, loading = false }: Props) {
  const [form, setForm] = useState<SearchParams>(initial);

  const update = <K extends keyof SearchParams>(key: K, value: SearchParams[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!form.departureId || !form.arrivalId) return;
    onSearch(form);
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 bg-surface2 rounded-lg p-1">
          <button
            type="button"
            onClick={() => update("tripType", "roundtrip")}
            className={`px-3 py-1.5 text-sm rounded-md transition ${
              form.tripType === "roundtrip" ? "bg-accent text-white" : "text-muted hover:text-text"
            }`}
          >
            Roundtrip
          </button>
          <button
            type="button"
            onClick={() => update("tripType", "oneway")}
            className={`px-3 py-1.5 text-sm rounded-md transition ${
              form.tripType === "oneway" ? "bg-accent text-white" : "text-muted hover:text-text"
            }`}
          >
            One-way
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.directOnly}
            onChange={(e) => update("directOnly", e.target.checked)}
            className="accent-accent"
          />
          Direct flights only
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label">From</label>
          <input
            className="input uppercase"
            value={form.departureId}
            maxLength={3}
            onChange={(e) => update("departureId", e.target.value.toUpperCase())}
            placeholder="HEL"
          />
        </div>
        <div>
          <label className="label">To</label>
          <input
            className="input uppercase"
            value={form.arrivalId}
            maxLength={3}
            onChange={(e) => update("arrivalId", e.target.value.toUpperCase())}
            placeholder="MIA"
          />
        </div>
      </div>
      <p className="text-xs text-muted -mt-2">Use IATA codes, e.g. HEL, MIA, JFK</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label">Departure date</label>
          <input
            type="date"
            className="input"
            value={form.departureDate}
            onChange={(e) => update("departureDate", e.target.value)}
          />
        </div>
        {form.tripType === "roundtrip" && (
          <div>
            <label className="label">Return date</label>
            <input
              type="date"
              className="input"
              value={form.arrivalDate ?? ""}
              onChange={(e) => update("arrivalDate", e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 items-end">
        <div>
          <label className="label">Adults</label>
          <input
            type="number"
            min={1}
            className="input"
            value={form.adults}
            onChange={(e) => update("adults", Math.max(1, Number(e.target.value)))}
          />
        </div>
        <div>
          <label className="label">Children (2–11)</label>
          <input
            type="number"
            min={0}
            className="input"
            value={form.children}
            onChange={(e) => update("children", Math.max(0, Number(e.target.value)))}
          />
        </div>
        <div>
          <label className="label">Infants (0–2)</label>
          <input
            type="number"
            min={0}
            className="input"
            value={form.infantsInSeat}
            onChange={(e) => update("infantsInSeat", Math.max(0, Number(e.target.value)))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label">Max stops per direction</label>
          <select
            className="input"
            value={form.maxStops}
            onChange={(e) => update("maxStops", Number(e.target.value) as 0 | 1 | 2)}
            disabled={form.directOnly}
          >
            <option value={0}>0 (nonstop)</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </div>
        <div>
          <label className="label">Max total flight duration (hours)</label>
          <input
            type="number"
            min={1}
            max={48}
            className="input"
            value={form.maxDurationHours}
            onChange={(e) => update("maxDurationHours", Math.max(1, Number(e.target.value)))}
          />
        </div>
      </div>

        <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full md:w-auto md:px-8 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Searching…" : "Search flights"}
      </button>
    </form>
  );
}

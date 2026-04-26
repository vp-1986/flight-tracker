import type { SearchParams } from "../api/types";

interface Props {
  params: SearchParams;
  onEdit: () => void;
}

export function SummaryBar({ params, onEdit }: Props) {
  const passengers = params.adults + params.children + params.infantsInSeat;
  const dates =
    params.tripType === "roundtrip" && params.arrivalDate
      ? `${params.departureDate} → ${params.arrivalDate}`
      : params.departureDate;
  return (
    <div className="card px-4 py-3 flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">{params.departureId}</span>
        <span className="text-muted">→</span>
        <span className="font-semibold">{params.arrivalId}</span>
      </div>
      <div className="text-sm text-muted">{dates}</div>
      <div className="text-sm text-muted">
        {passengers} {passengers === 1 ? "passenger" : "passengers"}
      </div>
      <div className="ml-auto">
        <button onClick={onEdit} className="btn-ghost">
          Edit search
        </button>
      </div>
    </div>
  );
}

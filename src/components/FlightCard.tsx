import { useState } from "react";
import type { Flight, SearchParams } from "../api/types";
import {
  airlineLogoUrl,
  airlineWebsiteSearch,
  formatDuration,
  formatPrice,
  googleFlightsUrl,
  layoverMinutes,
  skyscannerUrl,
} from "../utils/format";
import { searchReturningFlights } from "../api/client";

interface Props {
  flight: Flight;
  params: SearchParams;
}

export function FlightCard({ flight, params }: Props) {
  const isRoundtrip = params.tripType === "roundtrip";
  const currency = params.currency;
  const [expanded, setExpanded] = useState(false);
  const [returnFlights, setReturnFlights] = useState<Flight[] | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);

  async function toggleReturns() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (returnFlights || returnLoading) return;
    if (!flight.returningToken) {
      setReturnError("This flight has no return token.");
      return;
    }
    setReturnLoading(true);
    setReturnError(null);
    try {
      const res = await searchReturningFlights(flight.returningToken);
      const all = [...(res.data?.topFlights ?? []), ...(res.data?.otherFlights ?? [])];
      setReturnFlights(all);
      if (all.length === 0) setReturnError("No return flights returned for this outbound.");
    } catch (e) {
      setReturnError(e instanceof Error ? e.message : String(e));
    } finally {
      setReturnLoading(false);
    }
  }

  return (
    <div className="card p-4 md:p-5 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <img
          src={airlineLogoUrl(flight.airlineCode)}
          alt={flight.airlineName}
          className="w-10 h-10 rounded bg-white/5 object-contain p-1 flex-shrink-0"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium">{flight.airlineName}</div>
          <div className="text-xs text-muted">
            {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
            {" · "}
            {formatDuration(flight.durationMinutes)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold">{formatPrice(flight.price, currency)}</div>
          <div className="text-xs text-muted">{isRoundtrip ? "from" : "total"}</div>
        </div>
      </div>

      <Leg flight={flight} />

      {isRoundtrip ? (
        <>
          <button
            onClick={toggleReturns}
            className="btn-ghost w-full justify-between"
            disabled={!flight.returningToken}
          >
            <span>{expanded ? "Hide return flights" : "View return flights"}</span>
            <span className="text-muted text-xs">
              {returnFlights ? `${returnFlights.length} options` : ""}
            </span>
          </button>

          {expanded && (
            <div className="border-t border-border pt-3 space-y-3">
              {returnLoading && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span className="spinner spinner-sm" />
                  Loading return flights…
                </div>
              )}
              {returnError && !returnLoading && (
                <div className="text-sm text-danger">{returnError}</div>
              )}
              {returnFlights && !returnLoading && (
                <div className="space-y-3">
                  {returnFlights.map((rf, i) => (
                    <ReturnRow
                      key={`${rf.airlineCode}-${rf.departureTime}-${rf.price}-${i}`}
                      flight={rf}
                      params={params}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <BookingLinks flight={flight} params={params} />
      )}
    </div>
  );
}

function BookingLinks({ flight, params }: { flight: Flight; params: SearchParams }) {
  const linkOpts = {
    from: params.departureId,
    to: params.arrivalId,
    departureDate: params.departureDate,
    returnDate: params.tripType === "roundtrip" ? params.arrivalDate : undefined,
    adults: params.adults,
    children: params.children,
    infants: params.infantsInSeat,
  };
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      <span className="text-xs text-muted sm:mr-2">
        Book via:
      </span>
      <div className="flex gap-2 flex-wrap">
        <a
          href={googleFlightsUrl(linkOpts)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Google Flights
        </a>
        <a
          href={skyscannerUrl(linkOpts)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          Skyscanner
        </a>
        <a
          href={airlineWebsiteSearch(flight.airlineName)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          {flight.airlineName} site
        </a>
      </div>
    </div>
  );
}

function Leg({ flight }: { flight: Flight }) {
  const segments = flight.segments;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-sm">
        <div className="text-center min-w-[70px]">
          <div className="text-lg font-semibold">{flight.departureTime}</div>
          <div className="text-muted">{flight.departureAirport}</div>
        </div>
        <div className="flex-1 flex items-center gap-2 text-muted text-xs">
          <div className="flex-1 border-t border-border" />
          <span>{formatDuration(flight.durationMinutes)}</span>
          <div className="flex-1 border-t border-border" />
        </div>
        <div className="text-center min-w-[70px]">
          <div className="text-lg font-semibold">{flight.arrivalTime}</div>
          <div className="text-muted">{flight.arrivalAirport}</div>
        </div>
      </div>

      {segments.length > 1 && (
        <div className="text-xs text-muted space-y-1 pl-1">
          {segments.slice(0, -1).map((seg, i) => {
            const next = segments[i + 1];
            const lay = layoverMinutes(
              seg.arrivalDate,
              seg.arrivalTime,
              next.departureDate,
              next.departureTime
            );
            return (
              <div key={i}>
                {formatDuration(lay)} layover in {seg.arrivalAirportCode}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReturnRow({ flight, params }: { flight: Flight; params: SearchParams }) {
  return (
    <div className="bg-surface2 rounded-lg p-3 space-y-3">
      <div className="flex items-start gap-3">
        <img
          src={airlineLogoUrl(flight.airlineCode)}
          alt={flight.airlineName}
          className="w-8 h-8 rounded bg-white/5 object-contain p-1 flex-shrink-0"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{flight.airlineName}</div>
          <div className="text-[11px] text-muted">
            {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
            {" · "}
            {formatDuration(flight.durationMinutes)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-semibold">{formatPrice(flight.price, params.currency)}</div>
          <div className="text-[11px] text-muted">total</div>
        </div>
      </div>
      <Leg flight={flight} />
      <BookingLinks flight={flight} params={params} />
    </div>
  );
}

// Schema reflects the playground response from
// google-flights-data.p.rapidapi.com (vibapidev) for /flights/search-roundtrip
// and /flights/search-oneway.

export interface SharedAirline {
  airlineCode: string;
  flightNumber: string;
  airlineName: string;
}

export interface FlightSegment {
  departureAirportCode: string;
  departureAirportName: string;
  arrivalAirportName: string;
  arrivalAirportCode: string;
  departureTime: string; // "HH:mm"
  arrivalTime: string;
  cabinClass: number | null;
  seatPitch: string | null;
  aircraftName: string | null;
  airlineCode: string;
  flightNumber: string;
  airlineName: string;
  overnight: boolean | null;
  departureDate: string; // "YYYY-MM-DD"
  arrivalDate: string;
  delayed: unknown;
  seatWidth: string | null;
  flightId: number;
  someFlag: number | null;
  sharedAirlines: SharedAirline[] | null;
  aircraftType: unknown;
  duration: number; // minutes for this leg
}

export interface FlightAirlineRef {
  airlineCode: string;
  airlineName: string;
  airlineLink: string;
}

export interface Flight {
  airlineCode: string;
  airlineName: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  arrivalDate: string;
  durationMinutes: number;
  hasStop: boolean;
  stops: number;
  price: number;
  segments: FlightSegment[];
  returningToken: string | null;
  bookingToken: string | null;
  departureTime: string;
  arrivalTime: string;
  isAvailable: boolean;
  airlines: FlightAirlineRef[];
}

export interface FilterAirline {
  code: string;
  name: string;
}

export interface SearchData {
  topFlights: Flight[];
  otherFlights: Flight[];
  filters: {
    airlines: FilterAirline[];
    alliances: FilterAirline[];
    airports: FilterAirline[];
  };
  priceHistory?: Array<{ time: string; price: string }>;
}

export interface SearchResponse {
  status: boolean;
  status_code: number;
  data: SearchData;
  message: string;
}

export type TripType = "roundtrip" | "oneway";

export interface SearchParams {
  tripType: TripType;
  departureId: string;
  arrivalId: string;
  departureDate: string;
  arrivalDate?: string;
  adults: number;
  children: number;
  infantsInSeat: number;
  // form-level extras
  directOnly: boolean;
  maxStops: 0 | 1 | 2;
  maxDurationHours: number;
  currency: string;
}

export type SortKey = "price" | "duration" | "departure";

// --- OTP TYPES ---
export interface Route {
    route_number: string;
    route_name?: string;
    otp_percentage: number;
    total_trips: number;
    avg_deviation?: number; // [NEW]
    color?: string;
    text_color?: string;
}

export interface OTPMetadata {
    total_trips_analyzed: number;
    overall_otp_percentage: number;
    average_deviation: number; // [NEW]
    trends: {
        otp_change: number;
        trip_change: number;
        deviation_change: number;
        current_avg_deviation?: number; // [NEW]
    };
}
// --- RIDERSHIP TYPES ---
export interface RidershipSeason {
    season: string;
    total_boardings: number;
}

export interface RidershipRoute {
    route_number: string;
    total_boardings: number;
}

export interface RidershipHeatPoint {
    lat: number;
    lng: number;
    boardings: number;
    stop_name?: string;
    stop_number?: string;
}

// --- PASSUP TYPES ---
export interface PassupMonth {
    month: string;
    total_passups: number;
    full_bus_total: number;
    wheelchair_total: number;
}

export interface PassupTrends {
    total_change: number;
    full_bus_change: number;
    wheelchair_change: number;
}

export interface PassupRoute {
    route_number: string;
    count: number;
    route_destination?: string;
}

export interface PassupHeatPoint {
    lat: number;
    lng: number;
    pass_up_type: string;
}
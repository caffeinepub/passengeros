import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AiMessageState {
    content: string;
    role: Role;
    timestamp: bigint;
}
export interface QueueStatusState {
    checkpoint: Checkpoint;
    lastUpdated: bigint;
    waitMinutes: bigint;
    congestionLevel: CongestionLevel;
}
export interface BaggageItemState {
    status: Status__1;
    lastUpdated: bigint;
    description: string;
    tagNumber: string;
}
export interface DigitalIdentityDocState {
    expiryDate: bigint;
    isReady: boolean;
    notes: string;
    docType: DocType;
}
export interface FlightStatusState {
    status: Status;
    flightNumber: string;
    gate: string;
    message: string;
    delayMinutes?: bigint;
    terminal: string;
}
export interface TripState {
    bookingReference: string;
    arrivalAirport: string;
    flightNumber: string;
    seat: string;
    departureTimestamp: bigint;
    passengerName: string;
    airline: string;
    departureAirport: string;
}
export interface TravelRightsInfoState {
    actionSteps: Array<string>;
    compensationAmount: bigint;
    disruptionType: DisruptionType;
    applicableRegulation: string;
    keyRights: Array<string>;
}
export interface UserProfile {
    name: string;
}
export enum Checkpoint {
    checkin = "checkin",
    security = "security",
    boarding = "boarding"
}
export enum CongestionLevel {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum DisruptionType {
    overbooking = "overbooking",
    delay = "delay",
    cancellation = "cancellation",
    missedConnection = "missedConnection"
}
export enum DocType {
    passport = "passport",
    visa = "visa",
    hotelBooking = "hotelBooking",
    boardingPass = "boardingPass",
    travelInsurance = "travelInsurance"
}
export enum Role {
    user = "user",
    assistant = "assistant"
}
export enum Status {
    delayed = "delayed",
    cancelled = "cancelled",
    gateChange = "gateChange",
    onTime = "onTime"
}
export enum Status__1 {
    arrived = "arrived",
    loaded = "loaded",
    inTransit = "inTransit",
    collected = "collected",
    checkedIn = "checkedIn",
    atCarousel = "atCarousel"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAiMessage(message: AiMessageState): Promise<void>;
    addOrUpdateBaggageItem(baggageItem: BaggageItemState): Promise<void>;
    addOrUpdateDigitalIdentityDoc(doc: DigitalIdentityDocState): Promise<void>;
    addOrUpdateQueueStatus(queueStatus: QueueStatusState): Promise<void>;
    addTravelRightsInfo(info: TravelRightsInfoState): Promise<void>;
    addTrip(trip: TripState): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    computeLeaveHomeTime(): Promise<bigint>;
    getAiMessages(user: Principal): Promise<Array<AiMessageState>>;
    getBaggageItems(user: Principal): Promise<Array<BaggageItemState>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDigitalIdentityDocs(user: Principal): Promise<Array<DigitalIdentityDocState>>;
    getFlightStatus(flightNumber: string): Promise<FlightStatusState>;
    getQueueStatuses(): Promise<Array<QueueStatusState>>;
    getTravelRightsInfo(disruptionType: string): Promise<TravelRightsInfoState>;
    getTrip(user: Principal): Promise<TripState>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedDemoData(): Promise<void>;
    updateFlightStatus(flightStatus: FlightStatusState): Promise<void>;
}

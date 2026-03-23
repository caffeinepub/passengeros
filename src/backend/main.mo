import Array "mo:core/Array";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module Trip {
    public type TripState = {
      flightNumber : Text;
      airline : Text;
      departureAirport : Text;
      arrivalAirport : Text;
      departureTimestamp : Int;
      passengerName : Text;
      seat : Text;
      bookingReference : Text;
    };

    public func compare(trip1 : TripState, trip2 : TripState) : Order.Order {
      Text.compare(trip1.flightNumber, trip2.flightNumber);
    };
  };

  module BaggageItem {
    public type Status = {
      #checkedIn;
      #loaded;
      #inTransit;
      #arrived;
      #atCarousel;
      #collected;
    };

    public type BaggageItemState = {
      tagNumber : Text;
      status : Status;
      lastUpdated : Int;
      description : Text;
    };

    public func compare(item1 : BaggageItemState, item2 : BaggageItemState) : Order.Order {
      Text.compare(item1.tagNumber, item2.tagNumber);
    };
  };

  module FlightStatus {
    public type Status = {
      #onTime;
      #delayed;
      #cancelled;
      #gateChange;
    };

    public type FlightStatusState = {
      flightNumber : Text;
      status : Status;
      gate : Text;
      terminal : Text;
      delayMinutes : ?Nat;
      message : Text;
    };

    public func compare(status1 : FlightStatusState, status2 : FlightStatusState) : Order.Order {
      Text.compare(status1.flightNumber, status2.flightNumber);
    };
  };

  module QueueStatus {
    public type Checkpoint = {
      #security;
      #boarding;
      #checkin;
    };

    public type CongestionLevel = {
      #low;
      #medium;
      #high;
    };

    public type QueueStatusState = {
      checkpoint : Checkpoint;
      waitMinutes : Nat;
      congestionLevel : CongestionLevel;
      lastUpdated : Int;
    };

    public func compare(status1 : QueueStatusState, status2 : QueueStatusState) : Order.Order {
      Int.compare(status1.lastUpdated, status2.lastUpdated);
    };
  };

  module DigitalIdentityDoc {
    public type DocType = {
      #passport;
      #boardingPass;
      #visa;
      #travelInsurance;
      #hotelBooking;
    };

    public type DigitalIdentityDocState = {
      docType : DocType;
      isReady : Bool;
      expiryDate : Int;
      notes : Text;
    };

    public func compare(doc1 : DigitalIdentityDocState, doc2 : DigitalIdentityDocState) : Order.Order {
      Int.compare(doc1.expiryDate, doc2.expiryDate);
    };
  };

  module TravelRightsInfo {
    public type DisruptionType = {
      #delay;
      #cancellation;
      #overbooking;
      #missedConnection;
    };

    public type TravelRightsInfoState = {
      disruptionType : DisruptionType;
      applicableRegulation : Text;
      compensationAmount : Nat;
      keyRights : [Text];
      actionSteps : [Text];
    };

    public func compare(info1 : TravelRightsInfoState, info2 : TravelRightsInfoState) : Order.Order {
      Text.compare(info1.applicableRegulation, info2.applicableRegulation);
    };
  };

  module AiMessage {
    public type Role = {
      #user;
      #assistant;
    };

    public type AiMessageState = {
      role : Role;
      content : Text;
      timestamp : Int;
    };

    public func compare(message1 : AiMessageState, message2 : AiMessageState) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let trips = Map.empty<Principal, Trip.TripState>();
  let baggageItems = Map.empty<Principal, List.List<BaggageItem.BaggageItemState>>();
  let messages = Map.empty<Principal, List.List<AiMessage.AiMessageState>>();
  let statuses = Map.empty<Text, FlightStatus.FlightStatusState>();
  let queues = Map.empty<Text, QueueStatus.QueueStatusState>();
  let documents = Map.empty<Principal, List.List<DigitalIdentityDoc.DigitalIdentityDocState>>();
  let rights = Map.empty<Text, TravelRightsInfo.TravelRightsInfoState>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Trip CRUD
  public shared ({ caller }) func addTrip(trip : Trip.TripState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add trips");
    };
    trips.add(caller, trip);
  };

  public query ({ caller }) func getTrip(user : Principal) : async Trip.TripState {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own trip");
    };
    switch (trips.get(user)) {
      case (null) { Runtime.trap("Trip does not exist") };
      case (?trip) { trip };
    };
  };

  // BaggageItem management
  public shared ({ caller }) func addOrUpdateBaggageItem(baggageItem : BaggageItem.BaggageItemState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage baggage items");
    };
    let existingItems = switch (baggageItems.get(caller)) {
      case (null) { List.empty<BaggageItem.BaggageItemState>() };
      case (?items) { items };
    };
    let newItems = List.empty<BaggageItem.BaggageItemState>();
    for (item in existingItems.values()) {
      if (item.tagNumber != baggageItem.tagNumber) {
        newItems.add(item);
      };
    };
    newItems.add(baggageItem);
    baggageItems.add(caller, newItems);
  };

  public query ({ caller }) func getBaggageItems(user : Principal) : async [BaggageItem.BaggageItemState] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own baggage items");
    };
    switch (baggageItems.get(user)) {
      case (null) { [] };
      case (?items) { items.toArray().sort() };
    };
  };

  // FlightStatus management
  public shared ({ caller }) func updateFlightStatus(flightStatus : FlightStatus.FlightStatusState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update flight status");
    };
    statuses.add(flightStatus.flightNumber, flightStatus);
  };

  public query ({ caller }) func getFlightStatus(flightNumber : Text) : async FlightStatus.FlightStatusState {
    switch (statuses.get(flightNumber)) {
      case (null) { Runtime.trap("Status does not exist") };
      case (?status) { status };
    };
  };

  // QueueStatus handling
  public shared ({ caller }) func addOrUpdateQueueStatus(queueStatus : QueueStatus.QueueStatusState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update queue status");
    };
    queues.add("congestionLevel", queueStatus);
  };

  public query ({ caller }) func getQueueStatuses() : async [QueueStatus.QueueStatusState] {
    queues.values().toArray().sort();
  };

  // DigitalIdentityDoc handling
  public shared ({ caller }) func addOrUpdateDigitalIdentityDoc(doc : DigitalIdentityDoc.DigitalIdentityDocState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage identity documents");
    };
    let existingDocs = switch (documents.get(caller)) {
      case (null) { List.empty<DigitalIdentityDoc.DigitalIdentityDocState>() };
      case (?docs) { docs };
    };
    let newDocs = List.empty<DigitalIdentityDoc.DigitalIdentityDocState>();
    for (d in existingDocs.values()) {
      if (d.notes != doc.notes) {
        newDocs.add(d);
      };
    };
    newDocs.add(doc);
    documents.add(caller, newDocs);
  };

  public query ({ caller }) func getDigitalIdentityDocs(user : Principal) : async [DigitalIdentityDoc.DigitalIdentityDocState] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own identity documents");
    };
    switch (documents.get(user)) {
      case (null) { [] };
      case (?docs) { docs.toArray().sort() };
    };
  };

  // Travel Rights Info
  public shared ({ caller }) func addTravelRightsInfo(info : TravelRightsInfo.TravelRightsInfoState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add travel rights info");
    };
    rights.add("disruptionType", info);
  };

  public query ({ caller }) func getTravelRightsInfo(disruptionType : Text) : async TravelRightsInfo.TravelRightsInfoState {
    switch (rights.get(disruptionType)) {
      case (null) { Runtime.trap("Travel rights info does not exist") };
      case (?info) { info };
    };
  };

  // AI Messages
  public shared ({ caller }) func addAiMessage(message : AiMessage.AiMessageState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add AI messages");
    };
    let existingMsgs = switch (messages.get(caller)) {
      case (null) { List.empty<AiMessage.AiMessageState>() };
      case (?msgs) { msgs };
    };
    existingMsgs.add(message);
    messages.add(caller, existingMsgs);
  };

  public query ({ caller }) func getAiMessages(user : Principal) : async [AiMessage.AiMessageState] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own AI messages");
    };
    switch (messages.get(user)) {
      case (null) { [] };
      case (?msgs) { msgs.toArray().sort() };
    };
  };

  // Compute leave home time
  public query ({ caller }) func computeLeaveHomeTime() : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can compute leave home time");
    };
    let trip = switch (trips.get(caller)) {
      case (null) { Runtime.trap("Trip does not exist") };
      case (?t) { t };
    };
    let bufferMinutes = 180;
    let bufferMillis = bufferMinutes * 60 * 1_000_000_000;
    trip.departureTimestamp - bufferMillis;
  };

  // Seed demo data
  public shared ({ caller }) func seedDemoData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed demo data");
    };
    let demoTrip : Trip.TripState = {
      flightNumber = "AB123";
      airline = "Demo Airline";
      departureAirport = "LHR";
      arrivalAirport = "JFK";
      departureTimestamp = Time.now() + (12 * 60 * 60 * 1_000_000_000);
      passengerName = "Demo User";
      seat = "12A";
      bookingReference = "BOOK123";
    };
    trips.add(caller, demoTrip);

    let demoBaggageItem : BaggageItem.BaggageItemState = {
      tagNumber = "BAG123";
      status = #checkedIn;
      lastUpdated = Time.now();
      description = "Demo baggage item";
    };
    let baggageList = List.empty<BaggageItem.BaggageItemState>();
    baggageList.add(demoBaggageItem);
    baggageItems.add(caller, baggageList);

    let demoFlightStatus : FlightStatus.FlightStatusState = {
      flightNumber = "AB123";
      status = #onTime;
      gate = "A1";
      terminal = "T5";
      delayMinutes = null;
      message = "On time";
    };
    statuses.add("AB123", demoFlightStatus);

    let demoQueueStatus : QueueStatus.QueueStatusState = {
      checkpoint = #security;
      waitMinutes = 15;
      congestionLevel = #medium;
      lastUpdated = Time.now();
    };
    queues.add("security", demoQueueStatus);

    let demoDoc : DigitalIdentityDoc.DigitalIdentityDocState = {
      docType = #passport;
      isReady = true;
      expiryDate = Time.now() + (365 * 24 * 60 * 60 * 1_000_000_000);
      notes = "Valid passport";
    };
    let docList = List.empty<DigitalIdentityDoc.DigitalIdentityDocState>();
    docList.add(demoDoc);
    documents.add(caller, docList);

    let demoRightsInfo : TravelRightsInfo.TravelRightsInfoState = {
      disruptionType = #delay;
      applicableRegulation = "Regulation XYZ";
      compensationAmount = 200;
      keyRights = ["Right 1", "Right 2"];
      actionSteps = ["Step 1", "Step 2"];
    };
    rights.add("delay", demoRightsInfo);
  };
};

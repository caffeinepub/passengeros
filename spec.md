# PassengerOS

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A full-featured Passenger Operating System dashboard for airline travelers
- Trip setup: flight details entry (flight number, departure date, home address)
- Departure timer: AI-recommended leave-home time based on flight time, airport, and estimated journey
- Airport navigation: step-by-step terminal flow (check-in, security, gates) with estimated times
- Queue prediction: live-style security and boarding queue status indicators with wait times
- Disruption management: flight status alerts (delays, gate changes, cancellations) with suggested actions
- Baggage tracking: real-time baggage status timeline (checked in, loaded, in transit, carousel)
- Travel rights: context-aware passenger rights info based on disruption type (EU261, US DOT, etc.)
- Digital identity: document checklist and readiness status (passport, boarding pass, visa)
- AI assistant chat panel: natural language travel assistant for any journey question
- Bottom navigation with 7 sections: Home, Navigate, Queues, Disruptions, Baggage, Rights, Identity

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: flight trip data model, queue/status simulation, baggage tracking states, travel rights rules, digital identity checklist
2. Frontend: dashboard home with departure countdown, per-section screens with rich status UIs, AI assistant floating panel
3. Authorization for personal trip data

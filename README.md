# IoT-Based Fire Detection and Safety System

A responsive Next.js dashboard for monitoring an ESP32-based fire detection and safety system through Firebase Realtime Database.

## Hardware
- ESP32
- MQ-2 smoke/gas sensor
- Flame sensor
- Buzzer
- Relay module
- Water pump/sprinkler
- GSM module
- 16x2 LCD

## Live data
The dashboard reads the current device state from `/fireSafety` in Firebase Realtime Database. It does not generate fake live sensor values.

Expected current-state fields:

- `smokeValue`
- `flameDetected`
- `fireStatus`
- `buzzerStatus`
- `relayStatus`
- `pumpStatus`
- `gsmStatus`
- `emergencyStatus`
- `timestamp`

Historical readings and alert events can be stored under separate Firebase paths such as `/sensorHistory` and `/alertHistory`.

## Local setup
1. Install Node.js.
2. Clone the repository.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Add the Firebase Web App configuration values.
6. Run `npm run dev`.

## Vercel
Import this GitHub repository into Vercel and add the same `NEXT_PUBLIC_FIREBASE_*` values under Project Settings → Environment Variables.

The dashboard displays **Device Offline** when the latest ESP32 timestamp is older than 30 seconds.

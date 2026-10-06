# API Contract

## Base URL

http://127.0.0.1:8787/api

## Equipment

### GET /equipment

Returns all equipment.

Success:
- 200 OK

Example response:

[
  {
    "id": "eq-1",
    "name": "Projector A",
    "location": "Building 1"
  },
  {
    "id": "eq-2",
    "name": "Camera A",
    "location": "Building 2"
  }
]

---

# Bookings

## Booking Object

A booking contains:

```json
{
  "id": 1,
  "equipmentId": "eq-1",
  "borrowerName": "Aubolwan",
  "startAt": "2026-10-07T09:00:00",
  "endAt": "2026-10-07T10:00:00",
  "purpose": "Midterm test"
}
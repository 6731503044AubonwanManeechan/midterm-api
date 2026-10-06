# Campus Equipment Booking API

A REST API for managing shared campus equipment bookings.

Built with **TypeScript, Hono, Cloudflare Workers, and Cloudflare D1**.

---

## Live API

**Base API URL**

https://midterm-api.job-board-api-aubolwan044.workers.dev/api

**Source Code**

https://github.com/6731503044AubonwanManeechan/midterm-api

---

## Project Overview

This project provides a REST API for managing bookings of shared
campus equipment such as projectors and cameras.

The API supports booking CRUD operations and applies validation rules
to prevent invalid and overlapping bookings.

### Main Features

- List available equipment
- List all bookings
- Get a booking by ID
- Create a booking
- Update a booking
- Delete a booking
- Validate equipment existence
- Validate booking time
- Prevent overlapping bookings
- Return appropriate HTTP status codes
- Return JSON error responses

---

## Technology Stack

- TypeScript
- Hono
- Cloudflare Workers
- Cloudflare D1 / SQLite
- PowerShell
- GitHub

---

## Database Schema

### Equipment Table

| Field | Type | Description |
|---|---|---|
| `id` | TEXT | Unique equipment ID |
| `name` | TEXT | Equipment name |
| `location` | TEXT | Equipment location |

Sample equipment:

| ID | Name | Location |
|---|---|---|
| `eq-1` | Projector A | Building 1 |
| `eq-2` | Camera A | Building 2 |

### Bookings Table

| Field | Type | Description |
|---|---|---|
| `id` | INTEGER | Booking ID |
| `equipmentId` | TEXT | Equipment ID |
| `borrowerName` | TEXT | Borrower's name |
| `startAt` | TEXT | Booking start time |
| `endAt` | TEXT | Booking end time |
| `purpose` | TEXT | Booking purpose |

The complete database schema is available in
[`schema.sql`](schema.sql).

---

## API Endpoints

| Method | Endpoint | Success Status |
|---|---|---:|
| GET | `/equipment` | 200 OK |
| GET | `/bookings` | 200 OK |
| GET | `/bookings/:id` | 200 OK |
| POST | `/bookings` | 201 Created |
| PATCH | `/bookings/:id` | 200 OK |
| DELETE | `/bookings/:id` | 204 No Content |

For the complete API contract, see
[`API_CONTRACT.md`](API_CONTRACT.md).

---

## Request Format

### Create Booking

`POST /bookings`

Example request:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Aubolwan",
  "startAt": "2026-10-09T09:00:00",
  "endAt": "2026-10-09T10:00:00",
  "purpose": "Exam test"
}

Update Booking
PATCH /bookings/:id
Example request:
{
  "equipmentId": "eq-1",
  "borrowerName": "Aubolwan Updated",
  "startAt": "2026-10-09T09:00:00",
  "endAt": "2026-10-09T10:00:00",
  "purpose": "Exam test - updated"
}

Validation and Business Rules
1. Equipment Must Exist
The equipmentId must exist in the equipment table.
If the equipment does not exist, the API returns:
{
  "error": "Equipment not found"
}

2. Start Time Must Be Before End Time
The booking must satisfy:
startAt < endAt

Invalid time ranges are rejected with HTTP 400 Bad Request.
3. No Overlapping Bookings
Two bookings for the same equipment cannot overlap.
The overlap rule checks whether:
existing start time < new end time
AND
existing end time > new start time

If a conflict exists, the API returns HTTP 409 Conflict.
Example:
Existing booking: 09:00 - 10:00
New booking:      09:30 - 10:30
Result:           409 Conflict

4. SQL Parameter Binding
Request data is passed to SQL queries using parameter binding
with ? placeholders and .bind().
This avoids directly concatenating request data into SQL queries.
Error Handling
Error responses use the following JSON format:
{
  "error": "Error message"
}

Status	Meaning
400	Missing or invalid request data
404	Resource not found
409	Booking time conflict
500	Unexpected server error


Testing
The API was tested using PowerShell HTTP requests against the
Cloudflare deployment.
Test Results
Test Case	Expected Result	Result
GET /equipment	200	Passed
POST /bookings	201	Passed
GET /bookings/:id	200	Passed
PATCH /bookings/:id	200	Passed
Overlapping booking	409	Passed
DELETE /bookings/:id	204	Passed
GET deleted booking	404	Passed


Error Response Examples
409 Conflict
{
  "error": "Booking time conflicts with an existing booking"
}

404 Not Found
{
  "error": "Booking not found"
}

Test Evidence
Test screenshots are stored in the
[`evidence`](evidence/) directory.
evidence/
├── 01-get-equipment.png
├── 02-post-booking.png
├── 03-get-booking.png
├── 04-patch-booking.png
├── 05-conflict-409.png
├── 06-delete-204.png
└── 07-not-found-404.png

The evidence covers successful CRUD operations and important
error-handling cases.
Run Locally
1. Install dependencies
npm install

2. Start the development server
npx wrangler dev

Local Base URL
http://127.0.0.1:8787/api

Project Structure
midterm-api/
├── src/
├── test/
├── evidence/
│   ├── 01-get-equipment.png
│   ├── 02-post-booking.png
│   ├── 03-get-booking.png
│   ├── 04-patch-booking.png
│   ├── 05-conflict-409.png
│   ├── 06-delete-204.png
│   └── 07-not-found-404.png
├── AI_LOG.md
├── API_CONTRACT.md
├── QUALITY_GATE_REVIEW.md
├── README.md
├── schema.sql
├── package.json
├── package-lock.json
├── vitest.config.mjs
└── wrangler.jsonc

Deployment
The API is deployed using Cloudflare Workers
with Cloudflare D1 as the database.
Live API:
https://midterm-api.job-board-api-aubolwan044.workers.dev/api
AI Usage
AI was used as an assistant during development for:
- API structure analysis
- Validation logic
- Error handling
- SQL parameter binding review
- Test case planning
- Debugging
The final implementation was reviewed and tested manually using
PowerShell HTTP requests.
AI usage and personal verification are documented in
[`AI_LOG.md`](AI_LOG.md).
Quality Gate Review
The project was reviewed using the Quality Gate process.
The review includes findings, fixes, and verification evidence.
See:
[`QUALITY_GATE_REVIEW.md`](QUALITY_GATE_REVIEW.md)
Documentation
- [`API_CONTRACT.md`](API_CONTRACT.md) — API endpoints and request/response contract
- [`schema.sql`](schema.sql) — Database schema and seed data
- [`AI_LOG.md`](AI_LOG.md) — AI usage and personal verification
- [`QUALITY_GATE_REVIEW.md`](QUALITY_GATE_REVIEW.md) — Quality Gate review
-[`evidence/`](evidence/) — API testing screenshots


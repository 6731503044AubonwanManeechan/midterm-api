# AI_LOG

## AI Use

I used AI as an assistant for API analysis, coding, debugging,
and test planning during the practical lab test.

## Important Prompts / Requests

I asked AI to:

- Review the REST API structure and required endpoints.
- Help implement and review CRUD operations.
- Help with validation and HTTP status codes.
- Help review SQL parameter binding.
- Help plan API test cases.
- Help debug API behavior and test results.
- Review the submission requirements and Quality Gate checklist.

## What I Used

I used AI suggestions for:

- API route structure
- Validation logic
- Error handling
- SQL parameter binding
- API test cases
- Debugging and test planning

I reviewed the suggestions and applied them to my own project.

## What I Verified Myself

I tested the API using PowerShell HTTP requests and
verified the following cases:

1. GET `/api/equipment` returned `200`.
2. GET `/api/bookings` returned `200`.
3. POST `/api/bookings` returned `201` and created a booking.
4. GET `/api/bookings/:id` returned `200` for an existing booking.
5. PATCH `/api/bookings/:id` returned `200` and updated a booking.
6. DELETE `/api/bookings/:id` returned `204`.
7. GET `/api/bookings/9999` returned `404`.
8. An invalid time range returned `400`.
9. An invalid `equipmentId` returned `400`.
10. An overlapping booking returned `409 Conflict`.

I also reviewed the code and verified that SQL queries
use parameter binding instead of concatenating request data.

## Verification

I checked the API responses, HTTP status codes, validation
behaviour, booking conflict behaviour, and CRUD operations
myself before submission.
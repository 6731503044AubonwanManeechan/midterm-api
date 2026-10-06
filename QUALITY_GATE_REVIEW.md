# Quality Gate Review

## Finding 1 — Reliability / Accuracy

### What I found
Invalid JSON was handled by the general catch block and returned HTTP 500.
Invalid client input should return HTTP 400 according to the API contract.

### How I fixed it
I separated SyntaxError from unexpected server errors.
Invalid JSON now returns HTTP 400, while unexpected errors return HTTP 500.

### Evidence
Tested the API with malformed JSON and verified the response uses HTTP 400.

---

## Finding 2 — Security

### What I found
SQL queries receive request data such as equipment IDs and booking IDs.

### How I fixed it
I used SQL parameter binding with `?` placeholders and `.bind()` instead of concatenating request data into SQL strings.

### Evidence
Example:
`.prepare("SELECT id FROM equipment WHERE id = ?").bind(body.equipmentId)`

---

## Finding 3 — Business Rule / Reliability

### What I found
Two bookings for the same equipment could overlap if the overlap rule was not checked before insertion or update.

### How I fixed it
I added an overlap query that checks:
start_at < requested end time
and
end_at > requested start time.

If a conflict exists, the API returns HTTP 409.

### Evidence
A booking from 09:00–11:00 was created successfully.
A second booking for the same equipment from 10:00–12:00 returned:
"Booking time conflicts with an existing booking"
with HTTP 409.

---

## Finding 4 — Reasoning / You Own It

### What I found
I needed to verify that each HTTP status code matched the API contract rather than relying only on generated code.

### How I fixed it
I manually tested successful and error cases using PowerShell HTTP requests and checked the API responses.

### Evidence
Verified:
- POST → 201
- PATCH → 200
- DELETE → 204
- Missing booking → 404
- Overlapping booking → 409
export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: corsHeaders(),
			});
		}

		try {
			// GET /api/equipment
			if (request.method === "GET" && url.pathname === "/api/equipment") {
				const { results } = await env.DB
					.prepare("SELECT id, name, location FROM equipment ORDER BY id")
					.all();

				return jsonResponse(results);
			}

			// GET /api/bookings
			if (request.method === "GET" && url.pathname === "/api/bookings") {
				const { results } = await env.DB
					.prepare(`
						SELECT
							id,
							equipment_id AS equipmentId,
							borrower_name AS borrowerName,
							start_at AS startAt,
							end_at AS endAt,
							purpose
						FROM bookings
						ORDER BY start_at
					`)
					.all();

				return jsonResponse(results);
			}

			// GET /api/bookings/:id
			if (
				request.method === "GET" &&
				url.pathname.startsWith("/api/bookings/")
			) {
				const id = Number(url.pathname.split("/").pop());

				if (!Number.isInteger(id)) {
					return jsonResponse({ error: "Invalid booking ID" }, 400);
				}

				const booking = await env.DB
					.prepare(`
						SELECT
							id,
							equipment_id AS equipmentId,
							borrower_name AS borrowerName,
							start_at AS startAt,
							end_at AS endAt,
							purpose
						FROM bookings
						WHERE id = ?
					`)
					.bind(id)
					.first();

				if (!booking) {
					return jsonResponse({ error: "Booking not found" }, 404);
				}

				return jsonResponse(booking);
			}

			// POST /api/bookings
			if (
				request.method === "POST" &&
				url.pathname === "/api/bookings"
			) {
				const body = await request.json();

				const validation = validateBooking(body);

				if (validation) {
					return jsonResponse({ error: validation }, 400);
				}

				// Check equipment exists
				const equipment = await env.DB
					.prepare("SELECT id FROM equipment WHERE id = ?")
					.bind(body.equipmentId)
					.first();

				if (!equipment) {
					return jsonResponse(
						{ error: "Equipment not found" },
						400
					);
				}

				// Check overlapping booking
				const conflict = await env.DB
					.prepare(`
						SELECT id
						FROM bookings
						WHERE equipment_id = ?
						AND start_at < ?
						AND end_at > ?
						LIMIT 1
					`)
					.bind(
						body.equipmentId,
						body.endAt,
						body.startAt
					)
					.first();

				if (conflict) {
					return jsonResponse(
						{
							error:
								"Booking time conflicts with an existing booking",
						},
						409
					);
				}

				const result = await env.DB
					.prepare(`
						INSERT INTO bookings
						(equipment_id, borrower_name, start_at, end_at, purpose)
						VALUES (?, ?, ?, ?, ?)
					`)
					.bind(
						body.equipmentId,
						body.borrowerName,
						body.startAt,
						body.endAt,
						body.purpose
					)
					.run();

				return jsonResponse(
					{
						id: result.meta.last_row_id,
						equipmentId: body.equipmentId,
						borrowerName: body.borrowerName,
						startAt: body.startAt,
						endAt: body.endAt,
						purpose: body.purpose,
					},
					201
				);
			}

			// PATCH /api/bookings/:id
			if (
				request.method === "PATCH" &&
				url.pathname.startsWith("/api/bookings/")
			) {
				const id = Number(url.pathname.split("/").pop());

				if (!Number.isInteger(id)) {
					return jsonResponse({ error: "Invalid booking ID" }, 400);
				}

				const body = await request.json();

				const validation = validateBooking(body);

				if (validation) {
					return jsonResponse({ error: validation }, 400);
				}

				// Check equipment exists
				const equipment = await env.DB
					.prepare("SELECT id FROM equipment WHERE id = ?")
					.bind(body.equipmentId)
					.first();

				if (!equipment) {
					return jsonResponse(
						{ error: "Equipment not found" },
						400
					);
				}

				// Check booking exists
				const existing = await env.DB
					.prepare("SELECT id FROM bookings WHERE id = ?")
					.bind(id)
					.first();

				if (!existing) {
					return jsonResponse(
						{ error: "Booking not found" },
						404
					);
				}

				// Check overlapping booking, excluding current booking
				const conflict = await env.DB
					.prepare(`
						SELECT id
						FROM bookings
						WHERE equipment_id = ?
						AND id != ?
						AND start_at < ?
						AND end_at > ?
						LIMIT 1
					`)
					.bind(
						body.equipmentId,
						id,
						body.endAt,
						body.startAt
					)
					.first();

				if (conflict) {
					return jsonResponse(
						{
							error:
								"Booking time conflicts with an existing booking",
						},
						409
					);
				}

				await env.DB
					.prepare(`
						UPDATE bookings
						SET
							equipment_id = ?,
							borrower_name = ?,
							start_at = ?,
							end_at = ?,
							purpose = ?
						WHERE id = ?
					`)
					.bind(
						body.equipmentId,
						body.borrowerName,
						body.startAt,
						body.endAt,
						body.purpose,
						id
					)
					.run();

				return jsonResponse({
					id,
					equipmentId: body.equipmentId,
					borrowerName: body.borrowerName,
					startAt: body.startAt,
					endAt: body.endAt,
					purpose: body.purpose,
				});
			}

			// DELETE /api/bookings/:id
			if (
				request.method === "DELETE" &&
				url.pathname.startsWith("/api/bookings/")
			) {
				const id = Number(url.pathname.split("/").pop());

				if (!Number.isInteger(id)) {
					return jsonResponse({ error: "Invalid booking ID" }, 400);
				}

				const result = await env.DB
					.prepare("DELETE FROM bookings WHERE id = ?")
					.bind(id)
					.run();

				if (result.meta.changes === 0) {
					return jsonResponse(
						{ error: "Booking not found" },
						404
					);
				}

				return new Response(null, {
					status: 204,
					headers: corsHeaders(),
				});
			}

			return jsonResponse({ error: "Route not found" }, 404);
		} catch (error) {
			return jsonResponse(
				{ error: "Invalid JSON or internal server error" },
				500
			);
		}
	},
};

function validateBooking(body) {
	if (
		!body ||
		!body.equipmentId ||
		!body.borrowerName ||
		!body.startAt ||
		!body.endAt ||
		!body.purpose
	) {
		return "equipmentId, borrowerName, startAt, endAt, and purpose are required";
	}

	const start = new Date(body.startAt);
	const end = new Date(body.endAt);

	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
		return "startAt and endAt must be valid ISO date-time values";
	}

	if (start >= end) {
		return "startAt must be before endAt";
	}

	return null;
}

function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods":
			"GET, POST, PATCH, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};
}

function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json",
			...corsHeaders(),
		},
	});
}
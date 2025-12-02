export async function onRequest(context) {
  const db = context.env.dreamgirl_db;
  const url = new URL(context.request.url);
  const method = context.request.method;
  const pathname = url.pathname;

  // GET /api/interviews/all → list all interviews
  if (method === "GET" && pathname.endsWith("/all")) {
    try {
      const { results } = await db.prepare(
        "SELECT * FROM interviews ORDER BY date DESC"
      ).all();
      return Response.json({ interviews: results });
    } catch (err) {
      // Table might not exist yet
      return Response.json({ interviews: [] });
    }
  }

  // POST /api/interviews/add → add new interview
  if (method === "POST" && pathname.endsWith("/add")) {
    try {
      const { title, date, video_url, thumbnail_url } = await context.request.json();
      
      if (!title || !date || !video_url) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
      }
      
      await db
        .prepare(
          "INSERT INTO interviews (title, date, video_url, thumbnail_url) VALUES (?, ?, ?, ?)"
        )
        .bind(title, date, video_url, thumbnail_url || "")
        .run();
      
      return Response.json({ success: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  // DELETE /api/interviews/delete/:id → delete interview
  if (method === "DELETE" && pathname.includes("/delete/")) {
    try {
      const id = pathname.split("/").pop();
      await db.prepare("DELETE FROM interviews WHERE id = ?").bind(id).run();
      return Response.json({ success: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  // GET /api/interviews/:id → get single interview
  if (method === "GET") {
    const id = pathname.split("/").pop();
    if (id && !isNaN(id)) {
      try {
        const interview = await db
          .prepare("SELECT * FROM interviews WHERE id = ?")
          .bind(id)
          .first();
        
        if (!interview) {
          return Response.json({ error: "Interview not found" }, { status: 404 });
        }
        
        return Response.json(interview);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }
  }

  return new Response("Method not allowed", { status: 405 });
}

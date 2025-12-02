export async function onRequest(context) {
  const db = context.env.dreamgirl_db;
  const url = new URL(context.request.url);
  const method = context.request.method;
  const pathname = url.pathname;

  // GET /api/pictures/all → list all pictures
  if (method === "GET" && pathname.endsWith("/all")) {
    try {
      const { results } = await db.prepare(
        "SELECT * FROM pictures ORDER BY date DESC"
      ).all();
      return Response.json({ pictures: results });
    } catch (err) {
      // Table might not exist yet
      return Response.json({ pictures: [] });
    }
  }

  // POST /api/pictures/add → add new picture
  if (method === "POST" && pathname.endsWith("/add")) {
    try {
      const { title, date, image_url } = await context.request.json();
      
      if (!title || !date || !image_url) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
      }
      
      await db
        .prepare(
          "INSERT INTO pictures (title, date, image_url) VALUES (?, ?, ?)"
        )
        .bind(title, date, image_url)
        .run();
      
      return Response.json({ success: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  // DELETE /api/pictures/delete/:id → delete picture
  if (method === "DELETE" && pathname.includes("/delete/")) {
    try {
      const id = pathname.split("/").pop();
      await db.prepare("DELETE FROM pictures WHERE id = ?").bind(id).run();
      return Response.json({ success: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  // GET /api/pictures/:id → get single picture
  if (method === "GET") {
    const id = pathname.split("/").pop();
    if (id && !isNaN(id)) {
      try {
        const picture = await db
          .prepare("SELECT * FROM pictures WHERE id = ?")
          .bind(id)
          .first();
        
        if (!picture) {
          return Response.json({ error: "Picture not found" }, { status: 404 });
        }
        
        return Response.json(picture);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }
  }

  return new Response("Method not allowed", { status: 405 });
}

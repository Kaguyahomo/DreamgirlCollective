export async function onRequest(context) {
  const db = context.env.dreamgirl_db;
  const url = new URL(context.request.url);
  const method = context.request.method;

  // GET /api/words → list all words
  if (method === "GET") {
    const { results } = await db.prepare("SELECT * FROM words").all();
    return Response.json(results);
  }

  // POST /api/words → add new word
  if (method === "POST") {
    const { word, definition } = await context.request.json();
    await db
      .prepare("INSERT INTO words (word, definition) VALUES (?, ?)")
      .bind(word, definition)
      .run();
    return Response.json({ success: true });
  }

  // DELETE /api/words/:word
  if (method === "DELETE") {
    const word = url.pathname.split("/").pop();
    await db.prepare("DELETE FROM words WHERE word = ?").bind(word).run();
    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
}

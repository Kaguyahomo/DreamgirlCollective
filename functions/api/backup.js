export async function onRequest(context) {
  const db = context.env.dreamgirl_db;
  const method = context.request.method;

  if (method === "GET") {
    const { results } = await db.prepare("SELECT * FROM backup_words").all();
    return Response.json(results);
  }

  if (method === "POST") {
    const { word, definition } = await context.request.json();
    await db
      .prepare("INSERT INTO backup_words (word, definition) VALUES (?, ?)")
      .bind(word, definition)
      .run();
    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
}

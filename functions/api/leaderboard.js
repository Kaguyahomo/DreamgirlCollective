export async function onRequest(context) {
  const db = context.env.dreamgirl_db;
  const method = context.request.method;

  if (method === "GET") {
    const { results } = await db.prepare("SELECT * FROM leaderboard ORDER BY score DESC").all();
    return Response.json(results);
  }

  if (method === "POST") {
    const { username, score } = await context.request.json();
    await db
      .prepare("INSERT INTO leaderboard (username, score) VALUES (?, ?)")
      .bind(username, score)
      .run();
    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
}

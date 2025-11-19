export async function onRequest(context) {
  const db = context.env.dreamgirl_db;
  const words = await db.prepare("SELECT * FROM words").all();
  return Response.json(words.results);
}

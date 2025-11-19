export default {
  async scheduled(controller, env) {
    const db = env.dreamgirl_db;

    // Clear weekly words
    await db.prepare("DELETE FROM words").run();

    // Refill from backup
    const { results } = await db.prepare("SELECT * FROM backup_words").all();

    for (const row of results) {
      await db
        .prepare("INSERT INTO words (word, definition) VALUES (?, ?)")
        .bind(row.word, row.definition)
        .run();
    }

    return new Response("OK");
  },
};

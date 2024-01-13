import sqlite from "better-sqlite3";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const db = sqlite("foobar.db");
db.pragma("journal_mode = WAL");

db.exec("DROP TABLE IF EXISTS foobar; CREATE TABLE foobar (a int);");
const app = express();

const getA = db.prepare("SELECT a FROM foobar");
const incA = db.prepare("UPDATE foobar SET a = a + 1");

db.exec("INSERT INTO foobar VALUES(0)");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.join(__dirname, "..", "react-sqlite", "dist");

app.use(express.static(staticDir));

app.get("/counter/get", (_, res) => {
  const row = getA.get();
  res.json(row.a);
})

app.get("/counter", (_, res) => {
  const result = incA.run();
  if (result.changes != 1) {
    res.status(500).send("why");
    return;
  }
  const row = getA.get();
  res.json(row.a);
});

app.get("/", () => {
  res.sendFile(path.join(staticDir, "index.html"));
});

const port = 8000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

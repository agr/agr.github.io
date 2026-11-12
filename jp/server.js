import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
const allowed = new Set(["index.html", "styles.css", "app.js", "engine.js", "dictionary.js"]);
const port = Number(process.env.PORT ?? 5173);
createServer(async (request, response) => {
  let name;
  try {
    name = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/^\/+/, "") || "index.html";
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }
  if (!allowed.has(name)) {
    response.writeHead(404).end("Not found");
    return;
  }
  try {
    const content = await readFile(path.join(root, name));
    response.writeHead(200, { "Content-Type": types[path.extname(name)], "Cache-Control": "no-cache" }).end(content);
  } catch (error) {
    console.error(`Unable to serve ${name}:`, error);
    response.writeHead(500).end("Unable to read application file");
  }
}).listen(port, "127.0.0.1", () => console.log(`Kana Daily is ready at http://localhost:${port}`));

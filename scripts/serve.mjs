// Servidor local que imita a produção (mesmos cabeçalhos de segurança do Netlify).
// Uso: npm run serve   e abra http://localhost:8080
import http from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
const pub = join(fileURLToPath(new URL(".", import.meta.url)), "../public");
const tipos = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain" };
const regras = []; let atual = null;
for (const l of readFileSync(join(pub, "_headers"), "utf8").split("\n")) {
  if (!l.trim()) continue;
  if (!l.startsWith(" ")) { atual = { padrao: l.trim(), h: {} }; regras.push(atual); }
  else { const i = l.indexOf(":"); atual.h[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
}
const casa = (p, u) => p === "/*" || (p.endsWith("/*") ? u.startsWith(p.slice(0, -1)) : p === u);
export function criar() {
  return http.createServer((q, r) => {
    const url = decodeURIComponent(q.url.split("?")[0]);
    let f = normalize(join(pub, url === "/" ? "index.html" : url)); const h = {};
    for (const g of regras) if (casa(g.padrao, url)) Object.assign(h, g.h);
    if (!f.startsWith(pub) || !existsSync(f) || statSync(f).isDirectory()) { r.writeHead(404, { ...h, "Content-Type": tipos[".html"] }); return r.end(readFileSync(join(pub, "404.html"))); }
    r.writeHead(200, { ...h, "Content-Type": tipos[extname(f)] || "application/octet-stream" }); r.end(readFileSync(f));
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) criar().listen(process.env.PORT || 8080, () => console.log("DJF em http://localhost:" + (process.env.PORT || 8080)));

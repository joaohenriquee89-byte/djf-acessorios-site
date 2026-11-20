const fs = require("node:fs"), path = require("node:path");
const { t, igual, verdade } = require("./helpers/harness");
const { ler, PUB } = require("./helpers/site");
const raiz = path.join(PUB, "..");
const html = ler("index.html");

t("arquivos essenciais existem", () => {
  for (const f of ["index.html", "404.html", "robots.txt", "favicon.svg", "_headers", "css/styles.css", "js/config.js", "js/utils.js", "js/catalog-data.js", "js/catalog.js", "js/content.js", "js/fluxlines.js", "js/app.js"])
    verdade(fs.existsSync(path.join(PUB, f)), "falta public/" + f);
  for (const f of ["data/catalogo.csv", "netlify.toml", "package.json", "README.md", "apps-script/leads.gs", "scripts/build-catalog.mjs"]) verdade(fs.existsSync(path.join(raiz, f)), "falta " + f);
});
t("index.html não tem script inline nem atributos on*=", () => {
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].filter((m) => !/application\/ld\+json/.test(m[1]));
  igual(inline.length, 0, "scripts inline");
  verdade(!/\son[a-z]+\s*=/i.test(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, "")), "atributo on*= encontrado");
});
t("todas as referências locais existem", () => {
  for (const m of html.matchAll(/(?:src|href)="([^"#:]+?)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(m[1])) continue;
    verdade(fs.existsSync(path.join(PUB, m[1])), "referência quebrada: " + m[1]);
  }
  for (const m of ler("css/styles.css").matchAll(/url\(([^)]+)\)/g)) { const u = m[1].replace(/["']/g, ""); if (/^data:/.test(u)) continue; verdade(fs.existsSync(path.join(PUB, "css", u)), "url() quebrada no CSS: " + u); }
});
t("não há imagens ou fontes embutidas em base64", () => {
  for (const f of ["index.html", "css/styles.css", "js/app.js", "js/catalog.js", "js/catalog-data.js"]) verdade(!/data:(image|font)\//.test(ler(f)), "base64 em " + f);
});
t("fotos citadas no catálogo existem e são WebP", () => {
  const IMG = new Function(ler("js/catalog-data.js") + ";return IMG")();
  let n = 0;
  for (const arr of Object.values(IMG)) for (const f of arr) { const p = path.join(PUB, f); verdade(fs.existsSync(p), "foto ausente: " + f); igual(fs.readFileSync(p).slice(8, 12).toString(), "WEBP", "não é WebP: " + f); n++; }
  verdade(n >= 46, "poucas fotos: " + n);
});
t("catalog-data.js está sincronizado com o CSV", () => {
  const { gerar } = require("node:module").createRequire(__filename)("./helpers/gerar.js");
  igual(gerar(), ler("js/catalog-data.js"), "rode: npm run build:catalog");
});
t("textos sem caracteres quebrados", () => {
  for (const f of ["index.html", "js/app.js", "js/catalog.js", "js/content.js", "js/catalog-data.js"]) verdade(!/�|Ã[¡-¿]|â€/.test(ler(f)), "texto corrompido em " + f);
});

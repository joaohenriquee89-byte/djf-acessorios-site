// Gera public/js/catalog-data.js a partir de data/catalogo.csv e das fotos em public/assets/img/products.
// Uso: npm run build:catalog   (falha com mensagem clara se o CSV tiver algum erro)
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV = join(raiz, "data/catalogo.csv"), SAIDA = join(raiz, "public/js/catalog-data.js"), IMG_DIR = join(raiz, "public/assets/img/products");
const COLUNAS = ["id", "categoria", "linha", "nome", "preco", "a_partir_de", "premium", "entrada", "novo", "estoque", "promocao", "promocao_ate", "foto_de", "selo", "descricao"];

function lerCsv(txt) {
  txt = txt.replace(/^﻿/, "");
  const linhas = []; let lin = [], cel = "", asp = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (asp) { if (c === '"') { if (txt[i + 1] === '"') { cel += '"'; i++; } else asp = false; } else cel += c; }
    else if (c === '"') asp = true;
    else if (c === ";") { lin.push(cel); cel = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && txt[i + 1] === "\n") i++; lin.push(cel); cel = ""; if (lin.some((x) => x !== "")) linhas.push(lin); lin = []; }
    else cel += c;
  }
  if (cel !== "" || lin.length) { lin.push(cel); if (lin.some((x) => x !== "")) linhas.push(lin); }
  return linhas;
}

export function gerar() {
  const { C, SUBS } = vm.runInNewContext(readFileSync(join(raiz, "public/js/catalog.js"), "utf8") + "\n;({C,SUBS})");
  const fotos = {};
  for (const f of readdirSync(IMG_DIR).sort()) {
    const m = f.match(/^(.+?)(?:__(\d+))?\.webp$/); if (!m) continue;
    (fotos[m[1]] ||= []).push([Number(m[2] || 1), "assets/img/products/" + f]);
  }
  const IMG = {}; for (const k of Object.keys(fotos).sort()) IMG[k] = fotos[k].sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const [cab, ...dados] = lerCsv(readFileSync(CSV, "utf8"));
  const erros = [], ids = new Set(), P = [];
  if (cab.join(";") !== COLUNAS.join(";")) erros.push("Cabeçalho do CSV diferente do esperado: " + COLUNAS.join(";"));
  const num = (s) => Number(String(s).trim().replace(/\./g, "").replace(",", "."));
  dados.forEach((r, n) => {
    const L = "linha " + (n + 2) + " (" + (r[0] || "?") + ")";
    const o = Object.fromEntries(COLUNAS.map((c, i) => [c, (r[i] ?? "").trim()]));
    if (!/^[a-z0-9-]+$/.test(o.id)) erros.push(L + ": id inválido (use letras minúsculas, números e hífen)");
    if (ids.has(o.id)) erros.push(L + ": id repetido"); ids.add(o.id);
    if (!C[o.categoria]) erros.push(L + ": categoria '" + o.categoria + "' não existe. Válidas: " + Object.keys(C).join(", "));
    if (o.linha && !(SUBS[o.categoria] && SUBS[o.categoria][o.linha])) erros.push(L + ": linha '" + o.linha + "' não existe nesta categoria");
    if (!o.nome || /[<>]/.test(o.nome)) erros.push(L + ": nome vazio ou com < >");
    if (!o.descricao || /[<>]/.test(o.descricao)) erros.push(L + ": descrição vazia ou com < >");
    const preco = num(o.preco); if (!(preco > 0)) erros.push(L + ": preço inválido");
    for (const f of ["a_partir_de", "premium", "entrada", "novo"]) if (o[f] && o[f] !== "sim") erros.push(L + ": '" + f + "' aceita apenas 'sim' ou vazio");
    if (o.estoque !== "" && !/^\d+$/.test(o.estoque)) erros.push(L + ": estoque deve ser número inteiro ou vazio");
    const promo = o.promocao ? num(o.promocao) : 0;
    if (o.promocao && !(promo > 0 && promo < preco)) erros.push(L + ": promoção deve ser menor que o preço");
    if (o.promocao_ate && !/^\d{4}-\d{2}-\d{2}$/.test(o.promocao_ate)) erros.push(L + ": promocao_ate deve ser AAAA-MM-DD");
    if (o.foto_de && !IMG[o.foto_de]) erros.push(L + ": foto_de '" + o.foto_de + "' não existe em assets/img/products");
    const p = { id: o.id, c: o.categoria }; if (o.linha) p.s = o.linha;
    p.n = o.nome; p.p = preco; if (o.a_partir_de) p.ap = 1; p.d = o.descricao;
    if (o.selo) p.t = o.selo; if (o.foto_de) p.im = o.foto_de; if (o.entrada) p.ent = 1; if (o.premium) p.dest = 1; if (o.novo) p.novo = 1;
    if (o.estoque !== "") p.est = Number(o.estoque); if (o.promocao) p.promo = promo; if (o.promocao_ate) p.ate = o.promocao_ate;
    P.push(p);
  });
  if (erros.length) { const e = new Error("Erros em data/catalogo.csv:\n - " + erros.join("\n - ")); e.erros = erros; throw e; }
  return "/* ARQUIVO GERADO. Não edite aqui.\n   Edite data/catalogo.csv (produtos) ou adicione fotos em public/assets/img/products/<id>.webp e rode: npm run build:catalog */\n"
    + "const IMG=" + JSON.stringify(IMG) + ";\nconst P=[\n" + P.map((p) => JSON.stringify(p)).join(",\n") + "\n];\n";
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { const out = gerar(); writeFileSync(SAIDA, out); console.log("catalog-data.js gerado:", (out.match(/\n\{"id"/g) || []).length, "produtos"); }
  catch (e) { console.error(e.message); process.exit(1); }
}

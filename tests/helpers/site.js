// Carrega o site (index.html + scripts) dentro do jsdom, como o navegador faria.
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const { JSDOM, VirtualConsole } = require("jsdom");
const PUB = path.join(__dirname, "../../public");
const ler = (f) => fs.readFileSync(path.join(PUB, f), "utf8");

function carregar(hash, opcoes = {}) {
  const html = ler("index.html").replace(/<script[^>]*\bsrc=[^>]*><\/script>/g, "");
  const erros = [];
  const vc = new VirtualConsole(); vc.on("jsdomError", (e) => erros.push(String(e.message || e))); vc.on("error", (e) => erros.push(String(e)));
  const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" + (hash ? "#" + hash : ""), pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  w.scrollTo = () => {}; w.HTMLCanvasElement.prototype.getContext = () => null;
  w.open = (...a) => { (w.__abertas ||= []).push(a); return null; };
  w.fetch = (...a) => { (w.__fetches ||= []).push(a); return Promise.resolve({}); };
  if (opcoes.antes) opcoes.antes(w);
  const ctx = dom.getInternalVMContext();
  const srcs = [...ler("index.html").matchAll(/<script[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)].map((m) => m[1]);
  for (const s of srcs) new vm.Script(ler(s), { filename: s }).runInContext(ctx);
  const avaliar = (c) => new vm.Script(c).runInContext(ctx);
  return { dom, w, doc: w.document, erros, avaliar, srcs };
}
module.exports = { carregar, ler, PUB };

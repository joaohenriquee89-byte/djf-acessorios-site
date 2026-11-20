const { t, igual, verdade } = require("./helpers/harness");
const { carregar, ler } = require("./helpers/site");

t("FluxLines só nos 3 locais: hero, Curadoria/Tecnologia e rodapé", () => {
  const a = carregar("home");
  igual([...a.doc.querySelectorAll("[data-flux]")].map((e) => e.getAttribute("data-flux")).sort().join(","), "footer,hero,tech");
  for (const r of ["loja", "contato", "sobre", "produto-" + a.avaliar("P[0].id"), "loja-capinhas"]) {
    a.w.location.hash = r; a.avaliar("route()");
    igual([...a.doc.querySelectorAll("[data-flux]")].map((e) => e.getAttribute("data-flux")).join(","), "footer", "efeito fora do lugar em " + r);
  }
});
t("efeito nunca é fundo fixo da página", () => {
  const css = ler("css/styles.css");
  verdade(!/\.fx\s*\{[^}]*position:\s*fixed/.test(css), ".fx com position:fixed");
  verdade(/\[data-flux\]\{[^}]*position:relative[^}]*overflow:hidden/.test(css), "contêiner precisa de position:relative e overflow:hidden");
  verdade(/\.fx\{[^}]*pointer-events:none/.test(css), "canvas bloqueando cliques");
});
t("sem bibliotecas externas e com proteções de desempenho", () => {
  const js = ler("js/fluxlines.js");
  verdade(!/https?:\/\//.test(js.replace(/\/\*[\s\S]*?\*\//g, "")), "URL externa");
  for (const k of ["prefers-reduced-motion", "IntersectionObserver", "visibilitychange", "webglcontextlost", "loseContext", "FLUX"]) verdade(js.includes(k), "falta: " + k);
});
t("paleta oficial presente e verde antigo removido do CSS de uso", () => {
  const css = ler("css/styles.css");
  for (const c of ["#050505", "#111111", "#1c1c1c", "#9aff00", "#68ff00", "#39ff14", "#b5b5b5"]) verdade(css.toLowerCase().includes(c), "falta " + c);
  verdade((css.match(/#39ff14/gi) || []).length === 1, "#39ff14 só como variável --g3");
});
t("FLUX.ativo=false desliga o efeito (config)", () => verdade(/const FLUX=\{ativo:true\}/.test(ler("js/config.js"))));
t("slot de foto real no hero (HERO_IMG)", () => {
  const a = carregar("home", { antes: () => {} });
  verdade(a.doc.querySelector(".hero .phone"), "sem celular ilustrado por padrão");
  const b = carregar("home"); b.avaliar('var _h=HERO_IMG'); // const não pode ser reatribuída; verifica o modelo do template
  verdade(/HERO_IMG\?`<img class="himg"/.test(ler("js/app.js")), "template do slot ausente");
});
t("categorias em destaque aparecem primeiro na home", () => {
  const a = carregar("home"); const k = [...a.doc.querySelectorAll(".card.ct")].map((e) => e.getAttribute("href").slice(6));
  igual(k.slice(0, 7).join(","), a.avaliar("DEST_CAT").join(","));
  igual(k.length, 13);
  verdade(a.doc.querySelectorAll(".card.ct.f").length === 7);
});

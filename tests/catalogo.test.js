const vm = require("node:vm");
const { t, igual, verdade } = require("./helpers/harness");
const { ler } = require("./helpers/site");
const ctx = vm.createContext({ Date });
vm.runInContext(ler("js/catalog.js") + "\n" + ler("js/catalog-data.js"), ctx);
const g = (c) => vm.runInContext(c, ctx);
const P = g("P"), C = g("C"), SUBS = g("SUBS"), SEO = g("SEO");

t("13 categorias e 65+ produtos", () => { igual(Object.keys(C).length, 13); verdade(P.length >= 65); });
t("ids únicos e válidos", () => { igual(new Set(P.map((p) => p.id)).size, P.length); for (const p of P) verdade(/^[a-z0-9-]+$/.test(p.id), p.id); });
t("categoria e linha de cada produto existem", () => { for (const p of P) { verdade(C[p.c], p.id + " categoria"); if (p.s) verdade(SUBS[p.c] && SUBS[p.c][p.s], p.id + " linha"); } });
t("preços válidos e textos sem HTML", () => { for (const p of P) { verdade(p.p > 0, p.id + " preço"); verdade(!/[<>]/.test(p.n + p.d), p.id + " html"); } });
t("toda categoria tem produto", () => { for (const k of Object.keys(C)) verdade(P.some((p) => p.c === k), "categoria vazia: " + k); });
t("rotas de SEO apontam para categorias válidas", () => { for (const [k, v] of Object.entries(SEO)) { verdade(v[0] === null || C[v[0]], k); if (v[3]) verdade(SUBS[v[0]] && SUBS[v[0]][v[3]], k + " linha"); } });
t("regras de promoção", () => {
  g("var _a={p:100,promo:80}, _b={p:100,promo:80,ate:'2000-01-01'}, _c={p:100,promo:80,ate:'2999-01-01'}, _d={p:100,promo:120}");
  igual(g("pv(_a)"), 80); igual(g("pv(_b)"), 100, "promoção vencida"); igual(g("pv(_c)"), 80); igual(g("pv(_d)"), 100, "promo maior que preço");
});
t("regras de estoque", () => {
  g("var _e={est:0},_f={est:2},_h={est:9},_i={}");
  igual(g("esgot(_e)"), true); igual(g("poucas(_f)"), true); igual(g("poucas(_h)"), false); igual(g("esgot(_i)"), false);
});
t("faixa de preço", () => { const f = g("faixa([{p:10},{p:30}])"); igual(f[0], 10); igual(f[1], 30); igual(g("faixa([])"), null); });

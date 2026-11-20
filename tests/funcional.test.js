const { t, igual, verdade } = require("./helpers/harness");
const { carregar } = require("./helpers/site");

const base = carregar("home");
const g = base.avaliar;
const P = g("P"), C = g("C"), SEO = g("SEO"), ART = g("ART");
const rotas = ["home", "loja", "ofertas", "sobre", "depoimentos", "contato", "blog", "privacidade", ...Object.keys(SEO), ...Object.keys(C).map((k) => "loja-" + k), ...P.map((p) => "produto-" + p.id), ...ART.map((a) => "blog-" + a.id)];

t("todas as rotas renderizam sem lixo", () => {
  for (const r of rotas) {
    base.w.location.hash = r; g("route()");
    const txt = base.doc.querySelector("#app").textContent;
    verdade(txt.trim().length > 40, "rota vazia: " + r);
    verdade(!/undefined|NaN|\[object/.test(txt), "texto quebrado em " + r);
    verdade(!/Página não encontrada/.test(txt), "rota não reconhecida: " + r);
  }
});
t("sem erros de execução ao carregar", () => igual(base.erros.length, 0, base.erros.join(" | ")));
t("rota inexistente mostra 404 interno", () => { base.w.location.hash = "xyz-nao-existe"; g("route()"); verdade(/Página não encontrada/.test(base.doc.querySelector("#app").textContent)); });
t("título muda por página", () => { base.w.location.hash = "produto-" + P[0].id; g("route()"); verdade(base.doc.title.includes(P[0].n)); });
t("carrinho: adicionar, somar e remover", () => {
  const a = carregar("home"), id = P[0].id;
  a.doc.body.insertAdjacentHTML("beforeend", `<button id="tb" data-add="${id}"></button>`);
  a.doc.getElementById("tb").click(); a.doc.getElementById("tb").click();
  igual(a.doc.querySelector("#cc").textContent, "2");
  verdade(a.doc.querySelector("#ci").textContent.includes(P[0].n.slice(0, 10)));
  a.doc.body.insertAdjacentHTML("beforeend", `<button id="tm" data-q="${id}:-1"></button>`); a.doc.getElementById("tm").click(); a.doc.getElementById("tm").click();
  igual(a.doc.querySelector("#cc").textContent, "0");
});
t("carrinho ignora dados corrompidos no localStorage", () => {
  const a = carregar("home", { antes: (w) => w.localStorage.setItem("djf", JSON.stringify([{ id: "<img src=x onerror=alert(1)>", q: 999 }, { id: P[0].id, q: 5000 }])) });
  igual(a.doc.querySelector("#cc").textContent, "99");
  verdade(!a.doc.querySelector("#ci").innerHTML.includes("<img"));
});
t("botões de WhatsApp e Instagram corretos", () => {
  const h = base.doc.documentElement.innerHTML;
  verdade(h.includes("wa.me/5581999216309") && h.includes("wa.me/5582999025126"), "WhatsApp das lojas");
  verdade(h.includes("instagram.com/djfacessorios"), "Instagram");
  for (const a of base.doc.querySelectorAll('a[target="_blank"]')) verdade(/noopener/.test(a.rel), "link externo sem noopener: " + a.href);
});
t("atendimento: nome inválido não abre WhatsApp nem envia lead", () => {
  const a = carregar("home"); a.doc.querySelector("#ln").value = "<b>"; a.avaliar('goChat("PE")');
  verdade(!a.w.__abertas && !a.w.__fetches, "abriu mesmo com nome inválido");
});
t("atendimento: nome válido abre a loja certa", () => {
  const a = carregar("home"); a.doc.querySelector("#ln").value = "João Silva"; a.avaliar('openChat("Quero uma capa","botao")'); a.doc.querySelector("#ln").value = "João Silva"; a.avaliar('goChat("AL")');
  verdade(a.w.__abertas && a.w.__abertas[0][0].startsWith("https://wa.me/5582999025126?text="), "não abriu o WhatsApp de AL");
});
t("atendimento: honeypot impede o envio à planilha", () => {
  const a = carregar("home"); a.doc.querySelector("#ln").value = "Maria Souza"; a.doc.querySelector("#lw").value = "robo"; a.avaliar('goChat("PE")');
  verdade(!a.w.__fetches, "enviou lead de robô"); verdade(a.w.__abertas, "deve abrir o WhatsApp mesmo assim");
});
t("ordenação por preço na loja", () => {
  const a = carregar("loja"); const sel = a.doc.querySelector("#so"); verdade(sel, "sem ordenação");
  sel.value = "a"; sel.dispatchEvent(new a.w.Event("change", { bubbles: true }));
  const pr = [...a.doc.querySelectorAll("#gr .card")].length; verdade(pr > 10, "poucos cards: " + pr);
});
module.exports = { base };

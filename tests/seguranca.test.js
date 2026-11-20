const { t, igual, verdade } = require("./helpers/harness");
const { carregar, ler } = require("./helpers/site");
const a = carregar("home"), g = a.avaliar;

t("esc() neutraliza HTML", () => igual(g('esc(`<img src=x onerror="a()">&\'`)'), "&lt;img src=x onerror=&quot;a()&quot;&gt;&amp;&#39;"));
t("LIM() remove caracteres de controle e direcionais", () => igual(g('LIM("a\\u0000b\\u202Ec")').replace(/\s/g, ""), "abc"));
t("CSP não permite script inline nem origem externa de script", () => {
  const csp = ler("_headers").match(/Content-Security-Policy: (.+)/)[1];
  verdade(/script-src 'self'(;|$)/.test(csp), "script-src");
  verdade(!/script-src[^;]*unsafe/.test(csp), "unsafe em script-src");
  verdade(/frame-ancestors 'none'/.test(csp) && /object-src 'none'/.test(csp) && /base-uri 'none'/.test(csp));
  verdade(!/img-src[^;]*data:/.test(csp), "img-src com data:");
});
t("cabeçalhos de segurança presentes", () => { const h = ler("_headers"); for (const k of ["Strict-Transport-Security", "X-Content-Type-Options: nosniff", "X-Frame-Options: DENY", "Referrer-Policy", "Permissions-Policy", "Cross-Origin-Opener-Policy"]) verdade(h.includes(k), k); });
t("nenhum eval, document.write ou innerHTML com entrada do usuário direta", () => {
  const js = ["app.js", "utils.js", "config.js", "catalog.js", "content.js"].map((f) => ler("js/" + f)).join("\n");
  verdade(!/\beval\s*\(|new Function|document\.write/.test(js), "eval/document.write");
  verdade(!/\$\("#(ln|lp|fn|fm)"\)\.value\s*\)?\s*[,;]?\s*[^\n]{0,40}innerHTML/.test(js));
});
t("pedido por WhatsApp usa dados escapados/codificados", () => verdade(/enc\(msg\)/.test(ler("js/app.js"))));
t("formulário de contato tem campos limitados", () => { for (const id of ["ln", "lp"]) verdade(a.doc.getElementById(id).maxLength > 0, id + " sem maxlength"); });
t("honeypot invisível e fora do foco", () => { const h = a.doc.getElementById("lw"); verdade(h, "sem honeypot"); verdade(h.tabIndex === -1 || h.getAttribute("tabindex") === "-1", "honeypot focável"); });
t("Apps Script: proteções presentes", () => {
  const s = require("node:fs").readFileSync(require("node:path").join(__dirname, "../apps-script/leads.gs"), "utf8");
  for (const k of ["function doPost", "function doGet", "p.website", "LockService", "MAX_POR_MINUTO", "limpa_", "aviso-v1", "setNumberFormat(\"@\")"]) verdade(s.includes(k), "falta: " + k);
});
t("sem segredos no repositório público", () => {
  const todos = ["js/config.js", "js/app.js", "index.html"].map(ler).join("\n");
  verdade(!/(api[_-]?key|secret|password|senha|token)\s*[:=]\s*["'][^"']{6,}/i.test(todos), "possível segredo");
});
t("política de privacidade acessível e consentimento citado", () => { g("location.hash='privacidade'"); a.w.location.hash = "privacidade"; g("route()"); verdade(/LGPD|Seus direitos/.test(a.doc.querySelector("#app").textContent)); });

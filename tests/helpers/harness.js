// Mini executor de testes (sem dependências além do Node).
const resultados = { ok: 0, falhas: [] };
function t(nome, fn) {
  try { fn(); resultados.ok++; }
  catch (e) { resultados.falhas.push(nome + ": " + (e && e.message || e)); }
}
function igual(a, b, msg) { if (a !== b) throw new Error((msg || "valores diferentes") + " (esperado " + JSON.stringify(b) + ", veio " + JSON.stringify(a) + ")"); }
function verdade(c, msg) { if (!c) throw new Error(msg || "condição falsa"); }
module.exports = { t, igual, verdade, resultados };

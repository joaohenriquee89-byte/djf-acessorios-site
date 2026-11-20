// DJF Acessórios - Base de clientes (v2, endurecida contra spam e injeção)
// Planilha > Extensões > Apps Script > cole este código > Implantar > Nova versão.
// Implantação: Executar como "Eu" | Quem pode acessar "Qualquer pessoa".

const ABA = "Leads";
const COLS = ["Data/Hora","Ref","Loja","Origem","Nome","WhatsApp do cliente","Interesse / Pedido","Página","Status","Responsável","Observações","Consentimento (LGPD)"];
const LOJAS = ["PE", "AL"];
const ORIGENS = ["home", "botao", "produto", "carrinho", "contato"];
const MAX_POR_MINUTO = 40;      // limite global de cadastros por minuto (proteção contra inundação)

// Texto seguro: remove caracteres de controle, corta no tamanho máximo e
// neutraliza fórmulas (= + - @), que seriam executadas pela planilha (Formula Injection).
function limpa_(v, max) {
  let s = String(v == null ? "" : v)
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, " ")
    .trim().slice(0, max);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}

function ok_() { return ContentService.createTextOutput("ok"); }   // resposta sempre igual: não revela o motivo de rejeição

function doPost(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.website) { console.log("rejeitado: honeypot"); return ok_(); }
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(8000)) { console.log("rejeitado: fila cheia"); return ok_(); }
    try {
      const cache = CacheService.getScriptCache();
      const kmin = "rl_" + Math.floor(Date.now() / 60000);
      const n = Number(cache.get(kmin) || 0);
      if (n >= MAX_POR_MINUTO) { console.log("rejeitado: limite por minuto"); return ok_(); }
      cache.put(kmin, String(n + 1), 120);

      const ref = String(p.ref || "");
      if (!/^DJF-[A-Z0-9]{3,8}$/.test(ref)) { console.log("rejeitado: ref inválida"); return ok_(); }
      if (cache.get("ref_" + ref)) { console.log("rejeitado: ref duplicada"); return ok_(); }
      cache.put("ref_" + ref, "1", 21600);

      const loja = String(p.loja || "");
      if (LOJAS.indexOf(loja) < 0) { console.log("rejeitado: loja"); return ok_(); }
      if (p.consentimento !== "aviso-v1") { console.log("rejeitado: sem aviso de privacidade"); return ok_(); }
      const nome = limpa_(p.nome, 80);
      if (nome.length < 2 || !/^[\p{L}\p{M}'’ .\-]+$/u.test(nome.replace(/^'/, ""))) { console.log("rejeitado: nome"); return ok_(); }
      let tel = String(p.telefone || "").replace(/\D/g, "");
      if (tel && (tel.length < 10 || tel.length > 13)) tel = "";
      const origem = ORIGENS.indexOf(p.origem) >= 0 ? p.origem : "outro";
      const interesse = limpa_(p.interesse, 500);
      const pagina = /^#[a-z0-9-]{0,80}$/.test(String(p.pagina || "")) ? p.pagina : "";

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sh = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
      if (sh.getLastRow() === 0) {
        sh.appendRow(COLS);
        sh.setFrozenRows(1);
        sh.getRange(1, 1, 1, COLS.length).setFontWeight("bold").setBackground("#0a0a0a").setFontColor("#39ff14");
        sh.getRange("I2:I2000").setDataValidation(
          SpreadsheetApp.newDataValidation()
            .requireValueInList(["Novo", "Em atendimento", "Orçamento enviado", "Vendido", "Perdido"], true).build());
      }
      const linha = [new Date(), ref, loja, origem, nome, tel, interesse, pagina, "Novo", "", "", p.consentimento];
      const r = sh.getLastRow() + 1;
      const faixa = sh.getRange(r, 1, 1, linha.length);
      faixa.setNumberFormat("@");               // formato texto: nada é interpretado como fórmula
      faixa.setValues([linha]);
      sh.getRange(r, 1).setNumberFormat("dd/MM/yyyy HH:mm");
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err);                         // detalhes só nos logs do Apps Script (visíveis apenas ao dono)
  }
  return ok_();
}

function doGet() { return ContentService.createTextOutput("DJF leads ativo"); }

# Segurança

- **CSP rígida** (`public/_headers`): scripts só do próprio site, sem inline; sem frames; sem objetos; conexões só ao Google Apps Script.
- **HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP/CORP.**
- **Saída escapada** (`esc`) e entradas saneadas (`LIM`); validação de nome e telefone.
- **Formulário:** honeypot, tempo mínimo (800 ms) e intervalo (8 s) entre envios.
- **Planilha:** limite por minuto, anti-fórmula, validação de campos e aviso de privacidade (LGPD) obrigatório.
- **Sem chaves ou segredos no repositório.** A URL do Apps Script é pública por natureza e protegida pelas regras acima.
- **Rotina:** mantenha o Dependabot ativo, revise `data/catalogo.csv` antes de publicar e rode `npm test` (o Netlify já faz isso no build).

Limites conhecidos: o site é estático e o pedido é concluído no WhatsApp; não há pagamento online nem dados de cartão.

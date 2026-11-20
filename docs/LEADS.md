# Planilha de clientes (Google Sheets)

Todo cliente que pede atendimento pelo site é registrado na aba **Leads** (data, ref, loja, origem, nome, WhatsApp, interesse, página, status, responsável, observações, consentimento).

## Ativar

1. Abra a planilha > **Extensões > Apps Script**.
2. Apague o código que estiver lá e cole o conteúdo de `apps-script/leads.gs`. Salve.
3. **Implantar > Nova implantação > Aplicativo da Web**. Executar como **Eu**; quem pode acessar: **Qualquer pessoa**.
4. Copie a URL que termina em `/exec` e cole em `LEAD_URL` no arquivo `public/js/config.js`.
5. Ao alterar o código depois, use **Implantar > Gerenciar implantações > editar > Nova versão** (a URL continua a mesma).

Teste: abra a URL `/exec` no navegador. Deve aparecer "DJF leads ativo". Se aparecer "Script function not found: doGet", o código novo ainda não foi colado ou falta publicar uma nova versão.

## Proteções

Honeypot, tempo mínimo e intervalo entre envios no site; limite de 40 cadastros por minuto, validação de loja/origem/nome/telefone e neutralização de fórmulas (`=`, `+`, `-`, `@`) na planilha. Dados só são gravados com o aviso de privacidade (LGPD) aceito.

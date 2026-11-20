# DJF Acessórios — site oficial

Loja e vitrine de acessórios para celular da DJF Acessórios (Shopping Guararapes, PE, e Shopping Pátio Maceió, AL).
Site estático (HTML, CSS e JavaScript puros, sem framework), com pedido finalizado pelo WhatsApp de cada loja.

## Estrutura

```
public/                    pasta publicada pelo Netlify
  index.html               página única (rotas por # no endereço)
  404.html, robots.txt, favicon.svg
  _headers                 cabeçalhos de segurança e cache
  css/styles.css           todo o visual
  js/config.js             WhatsApp das lojas, Instagram e endereço da planilha de clientes
  js/utils.js              funções utilitárias
  js/catalog-data.js       produtos e fotos (GERADO, não editar)
  js/catalog.js            categorias, linhas, SEO e regras de preço/estoque/promoção
  js/content.js            blog e depoimentos
  js/app.js                páginas, carrinho e atendimento
  js/fluxlines.js          efeito visual do hero, da seção Tecnologia DJF e do rodapé
  assets/fonts/            fontes Inter e Montserrat (hospedadas aqui)
  assets/img/products/     fotos dos produtos (<id>.webp)
data/catalogo.csv          fonte dos produtos e preços (edite este arquivo)
apps-script/leads.gs       código da planilha de clientes (Google Apps Script)
scripts/                   gerador do catálogo e servidor local
tests/                     testes automáticos
docs/                      catálogo, segurança e planilha de clientes
netlify.toml               publicação contínua
.github/workflows/ci.yml   testes a cada push
```

## Como publicar (Netlify)

1. No Netlify: **Add new site > Import an existing project > GitHub** e escolha este repositório.
2. Não precisa preencher nada: o `netlify.toml` já define a pasta `public` e o comando de build.
3. A partir daí, todo push na branch `main` roda os testes e publica. **Se algum teste falhar, o Netlify não publica** e o site anterior continua no ar.

## Como atualizar

- **Preços, estoque, promoções e novos produtos:** edite `data/catalogo.csv` (veja `docs/CATALOGO.md`) e rode `npm run build:catalog`.
- **Fotos:** coloque `public/assets/img/products/<id>.webp` (id igual ao do CSV), quadrada e com menos de 150 KB.
- **WhatsApp, Instagram e planilha de clientes:** `public/js/config.js`.
- **Textos e visual:** `public/index.html`, `public/js/app.js` e `public/css/styles.css`.

## Rodar no computador

```
npm ci
npm run build:catalog
npm test          # testes automáticos
npm run serve     # http://localhost:8080 (com os mesmos cabeçalhos de segurança da produção)
```

Requer Node 20 ou mais novo.

## Mais informações

- `docs/CATALOGO.md`: colunas do CSV, categorias e como usar estoque e promoção
- `docs/LEADS.md`: planilha de clientes no Google Sheets
- `docs/SEGURANCA.md`: proteções, limites e rotina de cuidados

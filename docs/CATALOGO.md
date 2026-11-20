# Catálogo de produtos

A fonte única é `data/catalogo.csv` (separador `;`, abre no Excel e no Google Planilhas). Depois de editar, rode `npm run build:catalog`: ele valida tudo e gera `public/js/catalog-data.js`. Se houver erro, o comando diz a linha e o motivo.

| Coluna | O que é |
|---|---|
| id | identificador único (minúsculas, números e hífen). Também é o nome da foto: `id.webp` |
| categoria | chave da categoria (veja abaixo) |
| linha | subcategoria dentro da categoria (opcional) |
| nome, descricao | textos exibidos (sem `<` ou `>`) |
| preco | preço base, com vírgula (ex.: 99,90) |
| a_partir_de | `sim` mostra "a partir de" (o valor final depende do modelo) |
| premium | `sim` destaca o produto como premium |
| entrada | `sim` coloca em "Porta de entrada" |
| novo | `sim` marca como novo |
| estoque | vazio = sem controle; 0 = indisponível ("Avise-me"); 1 a 3 = "Últimas unidades" |
| promocao, promocao_ate | preço promocional (menor que o preço) e data final AAAA-MM-DD; depois da data volta ao preço normal |
| foto_de | reaproveita a foto de outro produto (id) |
| selo | selo curto opcional |

**Categorias:** peliculas, capinhas, cabos, carregadores, smartwatches, eletronicos (Power Banks), fones, headphones, microfone, suportes, teclados, hub, outros.

**Nova foto:** coloque `public/assets/img/products/<id>.webp` (quadrada, até 150 KB). Fotos extras: `<id>__2.webp`, `<id>__3.webp`.

Preços e textos atuais são os informados pela DJF; confirme antes de divulgar.

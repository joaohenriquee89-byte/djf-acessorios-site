const C={peliculas:"Películas",capinhas:"Capas Premium",cabos:"Cabos",carregadores:"Carregadores Completos",smartwatches:"Smartwatches Premium",eletronicos:"Power Banks",fones:"Fones",headphones:"Headphones Premium",microfone:"Microfone",suportes:"Suportes para Celular",teclados:"Teclados",hub:"Hub USB",outros:"Outros Eletrônicos"};
const A={capinhas:'<rect x="34" y="12" width="52" height="96" rx="12"/><circle cx="50" cy="30" r="6"/><circle cx="66" cy="30" r="6"/>',peliculas:'<rect x="30" y="14" width="60" height="92" rx="8"/><path d="M42 80L78 36M42 96L90 36"/>',carregadores:'<rect x="38" y="30" width="44" height="60" rx="8"/><path d="M52 12v18M68 12v18M64 44l-10 16h12l-10 16"/>',cabos:'<path d="M20 90c30 0 10-60 40-60s10 60 40 60"/><rect x="12" y="84" width="14" height="12" rx="3"/><rect x="94" y="84" width="14" height="12" rx="3"/>',fones:'<path d="M26 70V56a34 34 0 0 1 68 0v14"/><rect x="20" y="66" width="16" height="30" rx="8"/><rect x="84" y="66" width="16" height="30" rx="8"/>',smartwatches:'<rect x="36" y="30" width="48" height="60" rx="14"/><path d="M46 30l4-18h20l4 18M46 90l4 18h20l4-18M60 52v10l8 5"/>',eletronicos:'<rect x="28" y="34" width="64" height="52" rx="10"/><path d="M92 52h6v16h-6M52 50l-8 12h10l-6 12"/>',suportes:'<rect x="38" y="14" width="44" height="64" rx="8"/><path d="M60 78v16M38 104h44M48 94h24"/>',};
A.headphones=A.fones;A.microfone='<rect x="46" y="14" width="28" height="52" rx="14"/><path d="M34 52a26 26 0 0 0 52 0M60 78v22M46 104h28"/>';
A.teclados='<rect x="14" y="36" width="92" height="52" rx="8"/><path d="M28 52h6M42 52h6M56 52h6M70 52h6M84 52h6M32 70h56"/>';
A.hub='<rect x="20" y="52" width="80" height="34" rx="8"/><path d="M36 52V36M60 52V28M84 52V36M32 70h8M52 70h8M72 70h8"/>';
A.outros='<rect x="32" y="16" width="56" height="88" rx="14"/><circle cx="60" cy="40" r="8"/><circle cx="60" cy="74" r="14"/>';
const DEST_CAT=["capinhas","peliculas","carregadores","cabos","smartwatches","eletronicos","fones"]; // categorias em destaque na home (nesta ordem)
const svg=c=>`<svg viewBox="0 0 120 120">${A[c]}</svg>`;
/* ============ CATÁLOGO DJF (fonte única de produtos, preços e estoque) ============
 Cada produto é uma linha de P. Campos:
  id (único) | c categoria (chave de C) | s linha/subcategoria (chave de SUBS[c]) | n nome | p preço base (R$)
  ap:1  mostra "a partir de" (preço inicial; o valor final depende do modelo do celular)
  d descrição | t selo curto (opcional) | im: reutiliza a foto de outro produto (id da foto)
  dest:1 produto premium (destaque visual) | ent:1 produto de entrada (aparece em "Porta de entrada") | novo:1 selo "Novo"
 PREPARADO PARA O FUTURO (opcionais, ainda não usados nos produtos atuais):
  est: estoque. Ausente = sem controle | 0 = indisponível (botão vira "Avise-me") | 1 a 3 = selo "Últimas unidades"
  promo: preço promocional (menor que p) | ate: "AAAA-MM-DD" fim da promoção (depois disso volta ao preço normal)
 Novo produto = nova linha em P. Nova foto = nova entrada em IMG com o mesmo id. Promoção = campos promo/ate.
================================================================================ */
const hoje=()=>new Date().toISOString().slice(0,10);
const emPromo=p=>p.promo>0&&p.promo<p.p&&(!p.ate||p.ate>=hoje());
const pv=p=>emPromo(p)?p.promo:p.p;
const esgot=p=>p.est===0,poucas=p=>p.est>0&&p.est<=3;
const im=p=>IMG[p.id]||IMG[p.im]||null;
const SUBS={peliculas:{vidro:"Vidro",ceramica:"Cerâmica",hidrogel:"Hidrogel",privacidade:"Privacidade"},capinhas:{premium:"Premium",exclusiva:"Design exclusivo",carbono:"Fibra de carbono",couro:"Couro premium",magsafe:"Compatíveis com MagSafe"},eletronicos:{tradicional:"Tradicional",magsafe:"MagSafe Premium"},fones:{semfio:"Sem fio",comfio:"Com fio"},outros:{caixas:"Caixas de som Bluetooth",adaptadores:"Adaptadores",veiculares:"Carregadores veiculares",tecnologicos:"Acessórios tecnológicos"}};
const subLabel=p=>(SUBS[p.c]&&SUBS[p.c][p.s])||"";
const tagOf=p=>emPromo(p)?"Promoção":esgot(p)?"Indisponível":poucas(p)?"Últimas unidades":p.dest?"Premium":p.ent?"Para começar":p.novo?"Novo":(p.t||"");
const faixa=l=>{const v=l.map(pv);return v.length?[Math.min(...v),Math.max(...v)]:null};
const SEO={"capinhas-iphone": ["capinhas", "Capas para iPhone", "Capas premium com encaixe preciso e proteção reforçada."], "pelicula-privacidade": ["peliculas", "Película de privacidade e proteção", "Linha de privacidade em vidro, cerâmica e hidrogel.", "privacidade"], "carregador-turbo": ["carregadores", "Carregador turbo", "Carregadores completos de 33 W e 45 W."], "acessorios-celular": [null, "Acessórios para celular", "Tudo para proteger e potencializar o seu aparelho."], "capas-magsafe": ["capinhas", "Capas compatíveis com MagSafe", "Capas com anel magnético.", "magsafe"], "capas-couro": ["capinhas", "Capas de couro premium", "Capas com acabamento em couro.", "couro"], "capas-fibra-de-carbono": ["capinhas", "Capas fibra de carbono", "Capas com textura de fibra de carbono.", "carbono"], "power-bank": ["eletronicos", "Power bank", "Power banks tradicionais e MagSafe."], "suporte-celular": ["suportes", "Suportes para celular", "Suportes veiculares e tripés."], "fone-bluetooth": ["fones", "Fone Bluetooth", "Fones sem fio.", "semfio"], "headphone-premium": ["headphones", "Headphones premium", "Headphones de qualidade."], "smartwatch-premium": ["smartwatches", "Smartwatches premium", "Relógios inteligentes."], "cabos-celular": ["cabos", "Cabos para celular", "Lightning, USB-C e Micro USB."], "hub-usb": ["hub", "Hub USB", "Hub USB com 4 portas USB 3.0."], "teclado-bluetooth": ["teclados", "Teclado Bluetooth", "Teclados sem fio."]};

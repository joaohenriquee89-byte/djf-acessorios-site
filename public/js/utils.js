const enc=encodeURIComponent;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const $=s=>document.querySelector(s),money=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const LIM=s=>String(s==null?"":s).replace(/[\u0000-\u0008\u000B-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g," ").replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();

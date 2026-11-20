/* FluxLines — linhas de fluxo em WebGL puro (sem bibliotecas).
   Aparece somente em elementos marcados com data-flux="hero|tech|footer".
   Parâmetros: cor #9AFF00, direção para baixo, velocidade lenta, brilho suave, turbulência baixa,
   interação com o mouse e redemoinho no clique. Desliga com FLUX.ativo=false (config.js).
   Respeita prefers-reduced-motion (um quadro estático), pausa fora da tela e com a aba oculta. */
(function () {
  "use strict";
  var CFG = window.FLUX || { ativo: true };
  var PRE = { hero: { op: 0.42, v: 0.3, t: 0.4 }, tech: { op: 0.3, v: 0.26, t: 0.35 }, footer: { op: 0.24, v: 0.24, t: 0.3 } };
  var COR = [[0.604, 1, 0], [0.408, 1, 0], [0.224, 1, 0.078]]; // #9AFF00, #68FF00, #39FF14
  var reduz = false;
  try { reduz = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  var VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  var FS = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH", "precision highp float;", "#else", "precision mediump float;", "#endif",
    "uniform vec2 uR,uM;uniform vec3 uK,uC0,uC1,uC2;uniform float uT,uTurb,uMs;",
    "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
    "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}",
    "float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+vec2(11.7,5.3);a*=.5;}return s;}",
    "void main(){",
    " vec2 uv=vec2(gl_FragCoord.x,uR.y-gl_FragCoord.y)/uR.y;", // y para baixo, altura = 1
    " vec2 p=uv*1.6;float t=uT;",
    " vec2 d=uv-uM;float r=length(d);float f=exp(-r*r/(.35*.35))*uMs;", // raio .35, força 1
    " p+=vec2(-d.y,d.x)*f*1.1+d*f*.25;",
    " if(uK.z>=0.){vec2 dc=uv-uK.xy;float rc=length(dc);float w=exp(-pow((rc-uK.z*.55)*6.,2.))*exp(-uK.z*1.5);p+=vec2(-dc.y,dc.x)/(rc+.05)*w*.5;}",
    " vec2 q=vec2(fbm(p*.9+vec2(0.,-t)),fbm(p*.9+vec2(5.2,1.3-t)));",
    " float ph=p.x*5.5+(q.x-.5)*uTurb*5.+(fbm(vec2(p.x*.6,p.y*.35-t))-.5)*1.8;",
    " float dl=abs(fract(ph)-.5);",
    " float core=1.-smoothstep(0.,.045,dl);float halo=exp(-dl*9.)*.35;",
    " float flow=.22+.78*smoothstep(.3,.8,fbm(vec2(p.x*1.1,p.y*.55-t*1.6)));",
    " float rim=smoothstep(.2,.5,dl)*(1.-smoothstep(.5,.5,dl))*.0;",
    " float sh=.75+.25*sin(ph*3.+t*6.)*n(p*4.+t);",
    " float I=(core+halo)*flow*sh+rim;",
    " vec3 c=mix(mix(uC0,uC1,smoothstep(.2,.8,fbm(p*.5+t))),uC2,smoothstep(.65,1.,sin(ph*.2+t)*.5+.5));",
    " float m=smoothstep(0.,.18,uv.y)*smoothstep(0.,.22,1.-uv.y);",
    " float a=clamp(I*m,0.,1.);",
    " gl_FragColor=vec4(c*a,a);",
    "}"
  ].join("\n");

  var inst = [], raf = 0, ptr = { x: -1e4, y: -1e4 }, ouvindo = false;

  function shader(gl, tipo, src) {
    var s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  function programa(gl) {
    var v = shader(gl, gl.VERTEX_SHADER, VS), f = shader(gl, gl.FRAGMENT_SHADER, FS);
    if (!v || !f) return null;
    var p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }

  function criar(el) {
    var tipo = el.getAttribute("data-flux"), pre = PRE[tipo]; if (!pre) return;
    var cv = document.createElement("canvas"); cv.className = "fx"; cv.setAttribute("aria-hidden", "true");
    var gl = null;
    try { gl = cv.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" }); } catch (e) {}
    if (!gl) return;
    var pg = programa(gl); if (!pg) return;
    gl.useProgram(pg);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pg, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ["uR", "uM", "uK", "uC0", "uC1", "uC2", "uT", "uTurb", "uMs"].forEach(function (k) { U[k] = gl.getUniformLocation(pg, k); });
    gl.uniform3fv(U.uC0, COR[0]); gl.uniform3fv(U.uC1, COR[1]); gl.uniform3fv(U.uC2, COR[2]); gl.uniform1f(U.uTurb, pre.t);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);
    el.insertBefore(cv, el.firstChild);
    cv.style.setProperty("--fo", pre.op);
    var i = { el: el, cv: cv, gl: gl, U: U, pre: pre, vis: true, dead: false, ms: 0, mx: 0.5, my: 0.5, click: null, off: Math.random() * 50, w: 0, h: 0 };
    cv.addEventListener("webglcontextlost", function (e) { e.preventDefault(); i.dead = true; });
    dimensionar(i);
    if ("ResizeObserver" in window) { i.ro = new ResizeObserver(function () { dimensionar(i); desenhar(i, performance.now()); }); i.ro.observe(el); }
    if ("IntersectionObserver" in window) { i.io = new IntersectionObserver(function (es) { i.vis = es[0].isIntersecting; if (i.vis) comecar(); }, { rootMargin: "80px" }); i.io.observe(el); }
    inst.push(i);
    desenhar(i, performance.now());
    requestAnimationFrame(function () { cv.classList.add("on"); });
    ouvir(); comecar();
  }

  function dimensionar(i) {
    var r = i.el.getBoundingClientRect(), q = Math.min(window.devicePixelRatio || 1, 1.5) * 0.55;
    var w = Math.max(2, Math.min(1400, Math.round(r.width * q))), h = Math.max(2, Math.min(1000, Math.round(r.height * q)));
    if (w !== i.w || h !== i.h) { i.w = i.cv.width = w; i.h = i.cv.height = h; i.gl.viewport(0, 0, w, h); }
  }

  function desenhar(i, agora) {
    if (i.dead) return;
    var gl = i.gl, U = i.U, r = i.el.getBoundingClientRect(), t;
    if (reduz) t = 4 + i.off; else t = (agora / 1000 + i.off) * i.pre.v;
    var dentro = !reduz && ptr.x >= r.left && ptr.x <= r.right && ptr.y >= r.top && ptr.y <= r.bottom;
    i.ms += ((dentro ? 1 : 0) - i.ms) * 0.08;
    if (dentro) { var tx = (ptr.x - r.left) / r.height, ty = (ptr.y - r.top) / r.height; i.mx += (tx - i.mx) * 0.2; i.my += (ty - i.my) * 0.2; }
    var age = -1;
    if (i.click) { age = (agora - i.click) / 1000; if (age > 2.4) { i.click = null; age = -1; } }
    gl.uniform2f(U.uR, i.w, i.h); gl.uniform2f(U.uM, i.mx, i.my); gl.uniform3f(U.uK, i.kx || 0, i.ky || 0, age);
    gl.uniform1f(U.uT, t); gl.uniform1f(U.uMs, i.ms);
    gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function quadro(agora) {
    raf = 0; var alguma = false;
    if (agora - (quadro.u || 0) >= 30) { // ~30 quadros por segundo: fluxo lento, menos gasto de bateria
      quadro.u = agora;
      for (var k = 0; k < inst.length; k++) if (inst[k].vis && !inst[k].dead) { desenhar(inst[k], agora); alguma = true; }
    } else alguma = true;
    if (alguma && !document.hidden) raf = requestAnimationFrame(quadro);
  }
  function comecar() { if (!reduz && !raf && !document.hidden) raf = requestAnimationFrame(quadro); }

  function ouvir() {
    if (ouvindo || reduz) return; ouvindo = true;
    addEventListener("pointermove", function (e) { ptr.x = e.clientX; ptr.y = e.clientY; }, { passive: true });
    addEventListener("pointerdown", function (e) {
      ptr.x = e.clientX; ptr.y = e.clientY;
      inst.forEach(function (i) { var r = i.el.getBoundingClientRect(); if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { i.click = performance.now(); i.kx = (e.clientX - r.left) / r.height; i.ky = (e.clientY - r.top) / r.height; } });
      comecar();
    }, { passive: true });
    document.addEventListener("visibilitychange", comecar);
  }

  function destruir(i) {
    i.dead = true; if (i.ro) i.ro.disconnect(); if (i.io) i.io.disconnect();
    try { var x = i.gl.getExtension("WEBGL_lose_context"); if (x) x.loseContext(); } catch (e) {}
    if (i.cv.parentNode) i.cv.parentNode.removeChild(i.cv);
  }

  // Chamada a cada troca de página: cria o efeito nos elementos novos e remove dos que saíram da tela.
  window.fluxSync = function () {
    if (!CFG.ativo) return;
    inst = inst.filter(function (i) { if (document.contains(i.el)) return true; destruir(i); return false; });
    var els = document.querySelectorAll("[data-flux]");
    for (var k = 0; k < els.length; k++) {
      var el = els[k]; if (!inst.some(function (i) { return i.el === el; })) criar(el);
    }
  };
})();

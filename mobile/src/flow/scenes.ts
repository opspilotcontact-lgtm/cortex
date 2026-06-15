// Escenas animadas HTML + GSAP (§8 "visuales con HTML/CSS/JS"). Cada escena es
// un documento autocontenido que se reproduce en bucle dentro de una cápsula
// `motion` — un "vídeo animado" sin vídeo. Se inyectan los colores del mundo de
// la materia para que cada animación herede su identidad visual.

import { Theme } from "../theme";

const GSAP_CDN = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";

function shell(theme: Theme, title: string, caption: string, stage: string, script: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html,body{height:100%;background:${theme.paper};overflow:hidden;
    font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:${theme.ink}}
  .wrap{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:22px;text-align:center}
  .title{font-size:21px;font-weight:700;letter-spacing:-.3px;line-height:1.25;max-width:92%}
  .cap{font-size:13.5px;color:${theme.inkSoft};margin-top:16px;max-width:92%;line-height:1.45}
  #stage{margin-top:22px}
  svg{overflow:visible}
  .lbl{font-size:11px;font-weight:600;fill:${theme.ink}}
</style></head><body><div class="wrap">
  <div class="title">${title}</div>
  <div id="stage">${stage}</div>
  <div class="cap">${caption}</div>
</div>
<script src="${GSAP_CDN}"></script>
<script>try{${script}}catch(e){}</script>
</body></html>`;
}

// El bucle del hábito: señal → anhelo → respuesta → recompensa, con un pulso que
// recorre el círculo sin parar y hace latir cada nodo al pasar.
function habitLoop(theme: Theme, title: string, caption: string): string {
  const node = (id: string, cx: number, cy: number, label: string) =>
    `<circle id="${id}" cx="${cx}" cy="${cy}" r="34" fill="${theme.surface}" stroke="${theme.accent}" stroke-width="2"/>
     <text x="${cx}" y="${cy + 4}" text-anchor="middle" class="lbl">${label}</text>`;
  const stage = `<svg width="300" height="300" viewBox="0 0 300 300">
    <circle cx="150" cy="150" r="100" fill="none" stroke="${theme.line}" stroke-width="2" stroke-dasharray="3 7" opacity="0.6"/>
    ${node("c0", 150, 50, "Señal")}
    ${node("c1", 250, 150, "Anhelo")}
    ${node("c2", 150, 250, "Respuesta")}
    ${node("c3", 50, 150, "Recompensa")}
    <circle id="dot" cx="150" cy="50" r="9" fill="${theme.accent2}"/>
  </svg>`;
  const script = `
    var P=[[150,50],[250,150],[150,250],[50,150]];
    var tl=gsap.timeline({repeat:-1, defaults:{ease:"power1.inOut"}});
    for(var i=0;i<4;i++){ var n=(i+1)%4;
      tl.to("#dot",{attr:{cx:P[n][0],cy:P[n][1]},duration:0.6});
      tl.to("#c"+n,{attr:{r:42},duration:0.16,yoyo:true,repeat:1},">-0.12");
    }`;
  return shell(theme, title, caption, stage, script);
}

// Crecimiento compuesto: barras que crecen exponencialmente (el 1% diario).
function compound(theme: Theme, title: string, caption: string): string {
  const N = 14, gap = 4, bw = 16, base = 230, maxH = 190;
  let bars = "";
  for (let i = 0; i < N; i++) {
    const x = 14 + i * (bw + gap);
    const h = Math.max(4, (Math.pow(1.32, i) / Math.pow(1.32, N - 1)) * maxH);
    bars += `<rect id="b${i}" x="${x}" y="${base}" width="${bw}" height="0" rx="3" fill="${i === N - 1 ? theme.accent2 : theme.accent}" data-h="${h.toFixed(1)}"/>`;
  }
  const stage = `<svg width="300" height="250" viewBox="0 0 300 250">
    <line x1="10" y1="${base}" x2="290" y2="${base}" stroke="${theme.line}" stroke-width="2"/>
    ${bars}
  </svg>`;
  const script = `
    var N=${N}, base=${base};
    var tl=gsap.timeline({repeat:-1, repeatDelay:0.6});
    for(var i=0;i<N;i++){ var el=document.getElementById("b"+i); var h=parseFloat(el.getAttribute("data-h"));
      tl.to(el,{attr:{height:h, y:base-h}, duration:0.42, ease:"power2.out"}, i*0.12);
    }
    tl.to("#b"+(N-1),{attr:{r:0}, duration:0.2});
    tl.to("svg rect",{attr:{height:0, y:base}, duration:0.5, ease:"power1.in"}, "+=0.8");`;
  return shell(theme, title, caption, stage, script);
}

export function buildScene(render: string, theme: Theme, title: string, caption: string): string {
  switch (render) {
    case "habit_loop": return habitLoop(theme, title, caption);
    case "compound": return compound(theme, title, caption);
    default: return habitLoop(theme, title, caption);
  }
}

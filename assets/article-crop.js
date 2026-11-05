(() => {
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast = m => alert(m);
  /* ===== recorte de imagem ===== */
  (() => { const st = document.createElement('style'); st.textContent = `
  .cr-bg{position:fixed;inset:0;background:#0c1a12d9;z-index:1000;display:grid;place-items:center;padding:12px}
  .cr{background:#fff;border-radius:24px;padding:18px;width:min(100%,440px);max-height:100%;overflow:auto;display:grid;gap:12px}
  .cr h3{margin:0;font-size:17px}.cr-ch{display:flex;gap:8px;flex-wrap:wrap}.cr-ch .btn{min-height:34px;padding:6px 14px}
  .cr-view{position:relative;overflow:hidden;background:#17221b;border-radius:14px;touch-action:none;cursor:grab;margin:0 auto;user-select:none;-webkit-user-select:none}
  .cr-view:active{cursor:grabbing}
  .cr-view img{position:absolute;left:0;top:0;transform-origin:0 0;max-width:none;pointer-events:none;user-select:none}
  .cr-view:after{content:'';position:absolute;inset:0;pointer-events:none;border-radius:14px;box-shadow:inset 0 0 0 2px #fffc;background:linear-gradient(90deg,transparent 33.2%,#fff5 33.3%,#fff5 33.5%,transparent 33.6%,transparent 66.4%,#fff5 66.5%,#fff5 66.7%,transparent 66.8%),linear-gradient(transparent 33.2%,#fff5 33.3%,#fff5 33.5%,transparent 33.6%,transparent 66.4%,#fff5 66.5%,#fff5 66.7%,transparent 66.8%)}
  .cr-hint{margin:0;font-size:12px;color:var(--dim);text-align:center}.cr input[type=range]{width:100%;accent-color:var(--acc)}
  .cr-act{display:flex;gap:10px}.cr-act .btn{flex:1}`; document.head.appendChild(st); })();
  function cropImage(file, o = {}){
    const { aspect = 1, choices = null, max = 1600, title = 'Recortar imagem' } = o;
    return new Promise(resolve => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onerror = () => { URL.revokeObjectURL(url); toast('Não foi possível abrir essa imagem'); resolve(null); };
      im.onload = () => {
        const iw = im.naturalWidth, ih = im.naturalHeight; let asp = aspect, W = 0, H = 0, s = 1, min = 1, x = 0, y = 0, orig = asp === 0;
        const bg = document.createElement('div'); bg.className = 'cr-bg';
        bg.innerHTML = `<div class="cr" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h3>${esc(title)}</h3><div class="cr-ch"></div><div class="cr-view"></div><p class="cr-hint">Arraste para posicionar. Use o controle abaixo para ampliar.</p><input type="range" class="cr-z" min="0" max="100" value="0" aria-label="Zoom"><div class="cr-act"><button type="button" class="btn o" data-x>Cancelar</button><button type="button" class="btn g" data-ok>Usar imagem</button></div></div>`;
        const view = bg.querySelector('.cr-view'), z = bg.querySelector('.cr-z'), hint = bg.querySelector('.cr-hint'), chBox = bg.querySelector('.cr-ch');
        im.draggable = false; view.appendChild(im);
        const clamp = () => { x = Math.min(0, Math.max(W - iw * s, x)); y = Math.min(0, Math.max(H - ih * s, y)); };
        const apply = () => { clamp(); im.style.transform = `translate(${x}px,${y}px) scale(${s})`; };
        const zoomTo = (ns, px, py) => { ns = Math.min(min * 4, Math.max(min, ns)); const cx = (px - x) / s, cy = (py - y) / s; s = ns; x = px - cx * s; y = py - cy * s; z.value = Math.round((s / min - 1) / 3 * 100); apply(); };
        const layout = () => {
          view.hidden = z.hidden = orig; hint.textContent = orig ? 'A imagem será enviada inteira, sem corte.' : 'Arraste para posicionar. Use o controle abaixo para ampliar.'; if (orig) return;
          W = Math.min(380, innerWidth - 64); H = W / asp; const mh = innerHeight * .46; if (H > mh){ H = mh; W = H * asp; }
          view.style.width = W + 'px'; view.style.height = H + 'px'; im.style.width = iw + 'px'; im.style.height = ih + 'px';
          min = Math.max(W / iw, H / ih); s = min; x = (W - iw * s) / 2; y = (H - ih * s) / 2; z.value = 0; apply();
        };
        if (choices){ choices.forEach(([lb, a]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn o s'; b.textContent = lb;
          const mark = () => b.setAttribute('aria-pressed', String(a === 0 ? orig : !orig && Math.abs(a - asp) < .001)); b.dataset.a = a;
          b.onclick = () => { orig = a === 0; if (!orig) asp = a; layout(); chBox.querySelectorAll('button').forEach(k => k.setAttribute('aria-pressed', String(+k.dataset.a === 0 ? orig : !orig && Math.abs(+k.dataset.a - asp) < .001))); }; mark(); chBox.appendChild(b); }); } else chBox.hidden = true;
        /* arrastar e pinçar */
        const ptr = new Map(); let d0 = 0;
        view.onpointerdown = e => { view.setPointerCapture(e.pointerId); ptr.set(e.pointerId, [e.clientX, e.clientY]); d0 = 0; };
        view.onpointermove = e => { if (!ptr.has(e.pointerId)) return; const p = ptr.get(e.pointerId), nx = [e.clientX, e.clientY];
          if (ptr.size === 1){ x += nx[0] - p[0]; y += nx[1] - p[1]; apply(); ptr.set(e.pointerId, nx); }
          else { ptr.set(e.pointerId, nx); const [a, b] = [...ptr.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d0) { const r = view.getBoundingClientRect(); zoomTo(s * d / d0, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); } d0 = d; } };
        view.onpointerup = view.onpointercancel = e => { ptr.delete(e.pointerId); d0 = 0; };
        view.onwheel = e => { e.preventDefault(); const r = view.getBoundingClientRect(); zoomTo(s * (e.deltaY < 0 ? 1.1 : .9), e.clientX - r.left, e.clientY - r.top); };
        z.oninput = () => zoomTo(min * (1 + z.value / 100 * 3), W / 2, H / 2);
        const done = v => { document.removeEventListener('keydown', key); bg.remove(); URL.revokeObjectURL(url); resolve(v); };
        const key = e => { if (e.key === 'Escape') done(null); };
        document.addEventListener('keydown', key);
        bg.querySelector('[data-x]').onclick = () => done(null);
        bg.querySelector('[data-ok]').onclick = async () => {
          if (orig){ try { return done(await compress(file, max)); } catch { toast('Não foi possível processar a imagem'); return done(null); } }
          const sx = -x / s, sy = -y / s, sw = W / s, sh = H / s; let ow, oh;
          if (asp >= 1){ ow = Math.min(max, Math.round(sw)); oh = Math.round(ow / asp); } else { oh = Math.min(max, Math.round(sh)); ow = Math.round(oh * asp); }
          const c = document.createElement('canvas'); c.width = Math.max(1, ow); c.height = Math.max(1, oh); const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
          g.drawImage(im, sx, sy, sw, sh, 0, 0, c.width, c.height); c.toBlob(b => { b ? done(b) : (toast('Não foi possível processar a imagem'), done(null)); }, 'image/jpeg', .88);
        };
        document.body.appendChild(bg); layout(); bg.querySelector('[data-ok]').focus();
      };
      im.src = url;
    });
  }
  function compress(f, max){ return new Promise((res, rej) => { const im = new Image(), u = URL.createObjectURL(f);
    im.onload = () => { const k = Math.min(1, (max || 1600) / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k;
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(b => b ? res(b) : rej(), 'image/jpeg', .85); };
    im.onerror = rej; im.src = u; }); }

window.FFCCrop = {cropImage};
})();

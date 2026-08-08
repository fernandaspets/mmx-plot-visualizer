// ===== Scene 0: Map — the whole pipeline at a glance (click any box to jump) =====
import { SVG_W, C } from '../constants.js';
import { svg, rect, txt, arrow } from '../svg-helpers.js';

export const scene = {
  name: 'Map',
  build() {
    const W = SVG_W, H = 330;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 26, 'The Life of a Proof — click any stage to jump to its scene', C.KEY, 15, 'bold', 'middle'));

    // boxes: [x, y, w, label, sublabel, color, targetScene]
    const boxes = [
      [40, 70, 130, '① Seed → plot_id', 'SHA256, 32 bytes', C.HDR, 1],
      [220, 70, 150, '② F1 — Table 1', 'mem-hard PoW, 537M evals', C.F1, 2],
      [420, 70, 150, '③ Match + Eval', 'Y_R = Y_L + 1 → fresh Y', C.META, 3],
      [620, 70, 150, '④ Tables 2–9', 'sort · bucket · match ×8', C.Y, 4],
      [620, 180, 150, '⑤ Phase 2 + Parks', 'remap → 1.01 GiB file', C.DISK, 7],
      [420, 180, 150, '⑥ Challenge', 'VDF → 16-wide Y range', C.QUALITY, 10],
      [220, 180, 150, '⑦ Proof lookup', 'walk back → 256 X values', C.X, 10],
      [40, 180, 130, '⑧ Verify', 'nodes replay the tree', C.KEY, 11],
    ];
    for (const [x, y, w, label, sub, col, target] of boxes) {
      const r = rect(x, y, w, 64, col, 0.12, col, 1.5, 8);
      r.style.cursor = 'pointer';
      r.addEventListener('click', () => { if (this.manager) { this.manager.show(target - 1); } });
      s.appendChild(r);
      const t1 = txt(x + w / 2, y + 28, label, col, 12, 'bold', 'middle');
      t1.style.cursor = 'pointer';
      t1.addEventListener('click', () => { if (this.manager) { this.manager.show(target - 1); } });
      s.appendChild(t1);
      s.appendChild(txt(x + w / 2, y + 46, sub, C.TEXT, 9.5, 'normal', 'middle'));
    }
    // flow arrows
    s.appendChild(arrow(170, 102, 220, 102, C.FLOW));
    s.appendChild(arrow(370, 102, 420, 102, C.FLOW));
    s.appendChild(arrow(570, 102, 620, 102, C.FLOW));
    s.appendChild(arrow(695, 134, 695, 180, C.FLOW));
    s.appendChild(arrow(620, 212, 570, 212, C.FLOW));
    s.appendChild(arrow(420, 212, 370, 212, C.FLOW));
    s.appendChild(arrow(220, 212, 170, 212, C.FLOW));

    // legend strip
    s.appendChild(txt(40, 285, 'Phases:', C.TEXT, 11, 'bold'));
    s.appendChild(txt(100, 285, '①–④ Phase 1 (build tables)   ⑤ Phase 2+3 (compress to disk)   ⑥–⑦ farming (per challenge)   ⑧ consensus (every node)', C.TEXT, 11));
    s.appendChild(txt(40, 308, 'Shortcuts:', C.TEXT, 11, 'bold'));
    s.appendChild(txt(110, 308, '← → navigate · space = autoplay · #N in the URL deep-links a scene · scene 16 = playground · scene 17 = verify a real mainnet block', C.TEXT, 11));

    return s;
  },
  info: {
    t: 'Map — the whole pipeline at a glance',
    d: 'From a 32-byte seed to a 2 KiB proof the whole network can check.',
    body: `<h3>The three-act structure</h3>
<div class="d"><b>Phase 1 (scenes 2–6):</b> build 9 tables of hashes — this is the one-time work a plotter does (and the only expensive step).</div>
<div class="d"><b>Phase 2+3 (scenes 7–8):</b> compress the tables into parks — 1.01 GiB on disk, ~1.6% of the raw tables.</div>
<div class="d"><b>Farming (scenes 9–11, 13–14):</b> per challenge, walk the tree back to 256 X values. Cheap: milliseconds.</div>
<div class="k">Everything clicks. Start anywhere, or let autoplay run the full tour — then try scene 15, where a real (toy-scale) plot is built in your browser.</div>`
  }
};

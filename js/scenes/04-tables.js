// ===== Scene 4: Tables 1-9 (Forest of Binary Trees) =====
import { SVG_W, C, entries } from '../constants.js';
import { svg, rect, txt, arrow } from '../svg-helpers.js';

export const scene = {
  name: 'Tables 1-9',
  build() {
    const W = SVG_W, H = 340;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'The 9 Tables: Forest of 536M Binary Trees', C.KEY, 15, 'bold', 'middle'));

    const tD = [
      { n: 'T1 (F1)', c: C.F1, sub: 'X→hash→Y,meta', e: entries[1] },
      { n: 'T2', c: C.X, sub: 'stores X2 values', e: entries[2] },
      { n: 'T3', c: C.PD, sub: 'Y,meta,PD', e: entries[3] },
      { n: 'T4', c: C.PD, sub: 'Y,meta,PD', e: entries[4] },
      { n: 'T5', c: C.PD, sub: 'Y,meta,PD', e: entries[5] },
      { n: 'T6', c: C.PD, sub: 'Y,meta,PD', e: entries[6] },
      { n: 'T7', c: C.PD, sub: 'Y,meta,PD', e: entries[7] },
      { n: 'T8', c: C.PD, sub: 'Y,meta,PD', e: entries[8] },
      { n: 'T9', c: C.Y, sub: 'Y-sorted,final', e: entries[9] }
    ];

    const bw = 68, bh = 28, sp = 12, x0 = 80, y0 = 50;
    tD.forEach((t, i) => {
      const x = x0 + i * (bw + sp), y = y0 + 60;
      const r = rect(x, y, bw, bh, t.c, 0.7, C.EDGE, 1, 3);
      r.setAttribute('class', 'pulse-ani');
      r.style.animationDelay = (i * 0.1) + 's';
      s.appendChild(r);
      s.appendChild(txt(x + bw / 2, y + 18, t.n, t.c, 10, 'bold', 'middle'));
      s.appendChild(txt(x + bw / 2, y + bh + 12, t.sub, C.TEXT, 8, 'normal', 'middle'));
      s.appendChild(txt(x + bw / 2, y + bh + 26, (t.e / 1e6).toFixed(1) + 'M', C.META, 9, 'bold', 'middle'));
      if (i < 8) s.appendChild(arrow(x + bw + 2, y + bh / 2, x + bw + sp - 2, y + bh / 2, C.FLOW));
    });

    // Key insight
    s.appendChild(rect(80, 195, 740, 50, C.KEY, 0.08, C.KEY, 1, 4));
    s.appendChild(txt(W / 2, 215, 'All tables ~536M entries — NOT a funnel', C.KEY, 13, 'bold', 'middle'));
    s.appendChild(txt(W / 2, 235, 'Each entry matches ~2 partners (left AND right) → table sizes barely change', C.TEXT, 11, 'normal', 'middle'));

    s.appendChild(txt(120, 280, 'T1: 536,870,912', C.F1, 10, 'normal'));
    s.appendChild(txt(300, 280, 'T9: 536,061,737', C.Y, 10, 'normal'));
    s.appendChild(txt(500, 280, 'Shrinkage: 0.15%', C.TEXT, 10, 'normal'));
    s.appendChild(txt(700, 280, 'T1=9.6s, T2-9=28.7s', C.META, 10, 'normal'));

    return s;
  },
  info: {
    t: 'Tables 1-9',
    d: 'All tables have ~536M entries. They do NOT shrink.',
    body: `<div class="k">All 9 tables ≈ same size. This is a FOREST of ~536M binary trees, not a funnel.</div>
<h3>Table Types</h3>
<div class="s">T1 (F1): X → memory-hard hash → (Y, C=14×meta). 536.9M entries.</div>
<div class="s">T2: match (Y,Y+1) → SHA512. Stores X2 = actual X value pairs. 536.9M.</div>
<div class="s">T3-T8: same match+eval. Store PD back-pointers. ~536.8M each.</div>
<div class="s">T9: final table. Y-sorted, C_out=12×meta (reduced from 14). 536.1M.</div>
<h3>Why same size?</h3>
<div class="d">536M entries in 2²⁹ Y-space. P(Y+1 neighbor) ≈ 63%. Each entry matches ~2 partners (as left AND right). Matches ≈ entries. No shrinkage.</div>
<div class="s">T1: 536,870,912 → T9: 536,061,737 (0.15% smaller)</div>
<div class="s">Compute: T1=9.6s (compute-bound), T2-T9=28.7s total (DMA-bound)</div>
<h3>src/dst Double Buffering</h3>
<div class="d">Phase 1 uses double-buffered arrays: Y_buckets[2], C_buckets[2], PD_buckets[2]</div>
<div class="s">Each iteration t: src=(t+1)%2, dst=t%2. Reads from src (prev table), writes to dst.</div>
<div class="s">After processing: delete_buckets(src), dst survives for next iteration or lookup.</div>`
  }
};

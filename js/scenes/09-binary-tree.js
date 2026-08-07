// ===== Scene 9: Binary Tree (Proof Structure) =====
import { SVG_W, C } from '../constants.js';
import { svg, txt, circle, line, rect } from '../svg-helpers.js';

export const scene = {
  name: 'Binary Tree',
  build() {
    const W = SVG_W, H = 400;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'Proof = Binary Tree Walk (depth 8)', C.KEY, 15, 'bold', 'middle'));

    const cx = 450, levels = 9;
    for (let k = 0; k < levels; k++) {
      const count = Math.min(1 << k, 64);
      const y = 50 + k * 38;
      const spread = Math.min(W - 100, 800 / Math.max(1, 1 << Math.min(k, 6)));

      for (let i = 0; i < count; i++) {
        const x = cx - count * spread / 2 + i * spread + spread / 2;
        const c = k === 0 ? C.Y : k === levels - 1 ? C.X : C.PD;
        const r = circle(x, y, Math.max(2.5, 6 - k * 0.5), c, 0.8, C.EDGE, 0.5);
        r.setAttribute('class', 'pulse-ani');
        r.style.animationDelay = (k * 0.15 + i * 0.02) + 's';
        s.appendChild(r);

        if (k < levels - 1) {
          const cc = Math.min(count * 2, 64);
          const cs = Math.min(W - 100, 800 / Math.max(1, 1 << Math.min(k + 1, 6)));
          const cy = 50 + (k + 1) * 38;
          for (let c2 = 2 * i; c2 < 2 * i + 2; c2++) {
            if (c2 < cc) {
              const cx2 = cx - cc * cs / 2 + c2 * cs + cs / 2;
              s.appendChild(line(x, y, cx2, cy, C.EDGE, 0.5, 0.2));
            }
          }
        }
      }

      s.appendChild(txt(50, y + 4, k === 0 ? 'T9 (1 root)' : k === levels - 1 ? 'T1 (256 X)' : 'T' + (9 - k), C.TEXT, 10, 'bold'));
      s.appendChild(txt(850, y + 4, String(Math.min(1 << k, 256)), C.META, 9, 'bold', 'middle'));
    }

    s.appendChild(rect(80, 408, 740, 28, C.KEY, 0.08, C.KEY, 1, 4));
    s.appendChild(txt(W / 2, 426, 'Each PD read gives 2 parent pointers. 7 doublings: 1→2→4→8→16→32→64→128→256', C.KEY, 11, 'bold', 'middle'));

    return s;
  },
  info: {
    t: 'Proof = Binary Tree',
    d: 'A proof is a binary tree walk: 1 root → 256 X value leaves.',
    body: `<div class="k">Every proof is a perfect binary tree of depth 8. One root, 256 leaves.</div>
<h3>The Walk (7 PD park reads)</h3>
<div class="s">Table 9 → 1 entry (root, the Y match)</div>
<div class="s">Table 8 → 2 entries (root's parents)</div>
<div class="s">Table 7 → 4 entries</div>
<div class="s">...doubling each level...</div>
<div class="s">Table 2 → 128 entries, each has 2 X values</div>
<div class="s">Table 1 → 256 X values (leaves)</div>
<div class="c">pointers = [root_index]      // 1 entry
for t in 9→2:               // 7 steps
  new = []
  for idx in pointers:         // doubles each step
    PD = read_park(t, idx)
    left  = PD >> 5            // parent 1 (compact index)
    right = left + (PD & 31) + 1  // parent 2
    new += [left, right]
  pointers = new               // 2x each step
// 128 pointers → read X park → 256 X values</div>
<div class="s">Proof = 256 uint32 X values ≈ 1 KB</div>
<div class="k">The plot stores back-pointers for ALL 536M trees. PD = 79% of file.</div>`
  }
};

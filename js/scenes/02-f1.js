// ===== Scene 2: F1 — Table 1 (Memory-Hard PoW) =====
import { SVG_W, C } from '../constants.js';
import { svg, rect, txt, line, arrow, grid } from '../svg-helpers.js';

export const scene = {
  name: 'F1: Table 1',
  build() {
    const W = SVG_W, H = 340;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'Table 1 (F1): Memory-Hard Proof of Work', C.KEY, 15, 'bold', 'middle'));

    // X input
    s.appendChild(rect(50, 130, 70, 40, C.X, 0.8, C.EDGE, 1, 4));
    s.appendChild(txt(85, 155, 'X', C.X, 14, 'bold', 'middle'));
    s.appendChild(txt(85, 185, '0..2²⁹-1', C.TEXT, 10, 'normal', 'middle'));
    s.appendChild(arrow(120, 150, 180, 150, C.FLOW));

    // Memory grid (4KB = 1024 uint32 = 32x32)
    const gx = 190, gy = 95, sz = 13;
    const memGrid = grid(gx, gy, 8, 8, sz, C.F1, (i, j) => 0.15 + Math.random() * 0.3);
    s.appendChild(memGrid);
    s.appendChild(txt(gx + 52, gy - 8, '4KB memory', C.F1, 11, 'bold', 'middle'));
    s.appendChild(txt(gx + 52, gy + 122, '1024 uint32', C.TEXT, 9, 'normal', 'middle'));
    s.appendChild(txt(gx + 52, gy + 137, '32 rounds', C.TEXT, 9, 'normal', 'middle'));

    // Random access lines
    for (let i = 0; i < 6; i++) {
      const x1 = gx + Math.random() * 104, y1 = gy + Math.random() * 104;
      const x2 = gx + Math.random() * 104, y2 = gy + Math.random() * 104;
      s.appendChild(line(x1, y1, x2, y2, '#ff6688', 1, 0.3, '2 2', 'flow-line'));
    }
    s.appendChild(txt(gx + 52, gy + 157, '256-iter random access', C.F1, 9, 'normal', 'middle'));
    s.appendChild(arrow(320, 150, 380, 150, C.FLOW));

    // SHA512
    s.appendChild(rect(380, 125, 80, 50, C.F1, 0.7, C.EDGE, 1, 4));
    s.appendChild(txt(420, 155, 'SHA512', C.F1, 13, 'bold', 'middle'));
    s.appendChild(txt(420, 190, 'key‖mem_hash', C.TEXT, 9, 'normal', 'middle'));
    s.appendChild(arrow(460, 150, 530, 150, C.FLOW));

    // Output: Y + C meta + X
    s.appendChild(rect(530, 95, 60, 30, C.Y, 0.8, C.EDGE, 1, 3));
    s.appendChild(txt(560, 115, 'Y', C.Y, 12, 'bold', 'middle'));
    s.appendChild(txt(560, 140, '29-bit', C.TEXT, 9, 'normal', 'middle'));

    s.appendChild(rect(530, 130, 60, 30, C.META, 0.7, C.EDGE, 1, 3));
    s.appendChild(txt(560, 150, 'C meta', C.META, 10, 'bold', 'middle'));
    s.appendChild(txt(560, 175, '14×29b', C.TEXT, 9, 'normal', 'middle'));

    s.appendChild(rect(530, 165, 60, 30, C.X, 0.8, C.EDGE, 1, 3));
    s.appendChild(txt(560, 185, 'X', C.X, 12, 'bold', 'middle'));
    s.appendChild(txt(560, 210, '29-bit', C.TEXT, 9, 'normal', 'middle'));

    // Kernel chain panel
    s.appendChild(rect(620, 75, 260, 135, C.PANEL, 0.6, C.EDGE, 1, 4));
    s.appendChild(txt(630, 93, 'GPU Kernels:', C.TEXT, 11, 'bold'));
    ['gen_mem_array', 'calc_mem_hash', 'scatter_t1'].forEach((k, i) => {
      s.appendChild(rect(630, 100 + i * 22, 240, 18, C.F1, 0.1, C.EDGE, 0.5, 2));
      s.appendChild(txt(750, 113 + i * 22, k, C.F1, 9, 'bold', 'middle'));
    });
    s.appendChild(txt(630, 178, 'Cost: 2²⁹×4KB = 2TB writes', C.META, 10, 'normal', 'start', true));
    s.appendChild(txt(630, 194, '~9.4s RTX 5090 (compute-bound)', C.X, 10, 'normal', 'start', true));

    return s;
  },
  info: {
    t: 'F1: Table 1',
    d: 'Memory-hard proof-of-work. The "work" that proves you spent time.',
    body: `<h3>Per X value (0 to 536,870,911):</h3>
<div class="d">1. key = SHA512(X ‖ plot_id) → 16 uint32</div>
<div class="d">2. gen_mem_array: 32 rounds of hashing → 1024 uint32 (4KB)</div>
<div class="d">3. calc_mem_hash: 256 iterations of random access into 4KB</div>
<div class="d">4. scatter_t1: SHA512(key ‖ mem_hash) → Y + C</div>
<div class="c">Y = XOR(SHA512(key ‖ mem_hash)[0..13]) &amp; KMASK
C[j*14+i] = hash[i] &amp; KMASK
X[j] = X  (kept for proof)</div>
<div class="s">Cost: 2^29 × 4KB = 2TB writes. ~9.4s on RTX 5090 (compute-bound).</div>
<div class="s">Verification: only 256 X values need F1 recompute = milliseconds.</div>
<div class="k">F1 is the PoW component. Memory-hard random access cannot be parallelized.</div>
<h3>C Metadata = 56 bytes (NOT 14)</h3>
<div class="d">N_META = 14 uint32 values × 4 bytes = 56 bytes per entry</div>
<div class="d">C dominates VRAM: 56B × 2M entries × 91 buckets = 10 GiB per table</div>`
  }
};

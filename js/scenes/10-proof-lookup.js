// ===== Scene 10: Proof Lookup (Farming) =====
import { SVG_W, C, KSIZE, LOGBUCKETS } from '../constants.js';
import { svg, rect, txt, arrow, line } from '../svg-helpers.js';

export const scene = {
  name: 'Proof Lookup',
  build() {
    const W = SVG_W, H = 370;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'Proof Lookup: Reading the File', C.KEY, 15, 'bold', 'middle'));

    // File layout bar
    const bY = 65, bH = 38, bW = 840, bX = 30;
    const secs = [
      { n: 'Y', sz: 0.008, c: C.Y },
      { n: 'PD0', sz: 0.113, c: C.PD }, { n: 'PD1', sz: 0.113, c: C.PD },
      { n: 'PD2', sz: 0.113, c: C.PD }, { n: 'PD3', sz: 0.113, c: C.PD },
      { n: 'PD4', sz: 0.113, c: C.PD }, { n: 'PD5', sz: 0.113, c: C.PD },
      { n: 'PD6', sz: 0.113, c: C.PD }, { n: 'X', sz: 0.203, c: C.X }
    ];
    let x = bX;
    const fb = [];
    secs.forEach((sec, i) => {
      const w = sec.sz * bW;
      if (w < 2) return;
      const r = rect(x, bY, w, bH, sec.c, 0.3, C.EDGE, 0.5, 2);
      s.appendChild(r);
      fb.push({ x: x + w / 2, w, sec, i });
      s.appendChild(txt(x + w / 2, bY - 6, sec.n, sec.c, 9, 'bold', 'middle'));
      x += w;
    });

    s.appendChild(txt(fb[0].x, bY + bH + 18, '1. Scan Y', C.Y, 11, 'bold', 'middle'));
    s.appendChild(txt(fb[4].x, bY + bH + 18, '2. Walk PD parks', C.PD, 11, 'bold', 'middle'));
    s.appendChild(txt(fb[8].x, bY + bH + 18, '3. Read X park', C.X, 11, 'bold', 'middle'));

    // Detail panel
    s.appendChild(rect(30, 145, 840, 200, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(40, 163, 'Step 1: Scan Y table for [Y_begin, Y_begin+16)', C.Y, 11, 'bold'));
    s.appendChild(txt(50, 180, 'Y_begin = SHA256("plot_challenge" ‖ plot_id ‖ challenge) & KMASK  (little-endian)', C.META, 10, 'normal', 'start', true));
    s.appendChild(txt(50, 196, 'Y is sorted → binary search. Each hit = 1 tree root at table 9.', C.TEXT, 10, 'normal'));
    s.appendChild(txt(50, 212, 'Window = 2^plot_filter = 16 values. ~16 Y matches expected per challenge.', C.TEXT, 10, 'normal'));

    s.appendChild(txt(40, 234, 'Step 2: Walk PD parks from T9 down to T2 (7 reads, doubling)', C.PD, 11, 'bold'));
    s.appendChild(txt(50, 251, 'PD[0]: T9→T8 (2 ptrs) → PD[1]: T8→T7 (4) → ... → PD[6]: T3→T2 (128 ptrs)', C.META, 10, 'normal', 'start', true));
    s.appendChild(txt(50, 267, 'Each PD: position = compact 29-bit index, delta = ANS-decoded offset', C.TEXT, 10, 'normal'));

    s.appendChild(txt(40, 289, 'Step 3: Read X park → 256 X values', C.X, 11, 'bold'));
    s.appendChild(txt(50, 306, '128 table-2 indices → read 57-bit line points → LinePointToSquare → (X1, X2)', C.META, 10, 'normal', 'start', true));
    s.appendChild(txt(50, 322, 'X2SIZE=64 bits per entry (2×29-bit X values packed)', C.META, 10, 'normal', 'start', true));

    // Asymmetry
    s.appendChild(rect(100, 325, 700, 24, C.KEY, 0.08, C.KEY, 1, 4));
    s.appendChild(txt(W / 2, 341, 'Lookup = milliseconds. Plotting = 42 seconds. This IS proof-of-space.', C.KEY, 11, 'bold', 'middle'));

    return s;
  },
  info: {
    t: 'Proof Lookup (Farming)',
    d: 'How the file is read to answer a challenge.',
    body: `<div class="k">Farming = reading the file to find proofs. Three steps, all fast.</div>
<h3>Step 1: Scan Y table</h3>
<div class="d">challenge → Y_begin = SHA256("plot_challenge" ‖ plot_id ‖ challenge) &amp; KMASK</div>
<div class="d">Y_begin is LITTLE-ENDIAN (first 4 bytes of challenge hash, LE byte order)</div>
<div class="d">Scan Y parks for entries in [Y_begin, Y_begin+16) (plot_filter=4, window=16)</div>
<div class="s">Y is sorted → binary search. Each hit = 1 tree root.</div>
<h3>Step 2: Walk PD parks (7 levels, doubling)</h3>
<div class="s">PD[0]: T9→T8 → 2 pointers (compact position + delta)</div>
<div class="s">PD[1]: T8→T7 → 4 pointers</div>
<div class="s">...7 parks, doubling each time...</div>
<div class="s">PD[6]: T3→T2 → 128 pointers</div>
<div class="c">PD decode (40 bits):
left  = PD >> 5               // position (30 bits)
right = left + (PD & 31) + 1  // position + delta (5 bits)</div>
<h3>Step 3: Read X park → 256 X values</h3>
<div class="d">128 table-2 indices → read X park → 57-bit line points → LinePointToSquare → (X1, X2)</div>
<div class="s">Each X park entry = 64 bits (X2SIZE), containing two 29-bit X values</div>
<h3>The asymmetry</h3>
<div class="k">Lookup = O(parks read) = milliseconds. Plotting = O(536M) = 42 seconds.</div>`
  }
};

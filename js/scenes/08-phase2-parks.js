// ===== Scene 8: Phase 2 — Park Encoding =====
import { SVG_W, C, PARK_SIZE_Y, PARK_SIZE_PD, PARK_SIZE_X } from '../constants.js';
import { svg, rect, txt, arrow } from '../svg-helpers.js';

export const scene = {
  name: 'Phase 2: Parks',
  build() {
    const W = SVG_W, H = 380;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'Phase 2 Pass 2: Park Encoding', C.KEY, 15, 'bold', 'middle'));

    // Flow
    const flow = [
      { x: 40, w: 120, label: 'Compact PD', sub: '(from pass 1)', c: C.PD },
      { x: 220, w: 100, label: 'Sort by Y', sub: 'within bucket', c: C.Y },
      { x: 380, w: 100, label: 'Delta-encode', sub: 'first + diffs', c: C.Y },
      { x: 540, w: 100, label: 'ANS-encode', sub: 'bit stream', c: C.Y },
      { x: 700, w: 160, label: 'Park File', sub: '14.6 GB', c: C.HDR }
    ];
    flow.forEach((f, i) => {
      s.appendChild(rect(f.x, 60, f.w, 45, f.c, 0.1, f.c, 1, 4));
      s.appendChild(txt(f.x + f.w / 2, 78, f.label, f.c, 10, 'bold', 'middle'));
      s.appendChild(txt(f.x + f.w / 2, 94, f.sub, C.TEXT, 8, 'normal', 'middle'));
      if (i < flow.length - 1) s.appendChild(arrow(f.x + f.w, 82, flow[i + 1].x, 82, C.FLOW));
    });

    // Park format detail
    s.appendChild(rect(40, 140, 820, 210, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(50, 158, 'Park Formats (3 types):', C.TEXT, 11, 'bold'));

    // Y park
    s.appendChild(rect(50, 170, 250, 50, C.Y, 0.12, C.Y, 0.5, 2));
    s.appendChild(txt(175, 185, 'Y park', C.Y, 10, 'bold', 'middle'));
    s.appendChild(txt(175, 200, `[${PARK_SIZE_Y} entries: first Y + ${(PARK_SIZE_Y - 1)} deltas @~2.25b]`, C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(txt(175, 215, '≈ 2308 bytes per park', C.META, 8, 'normal', 'middle'));

    // PD park
    s.appendChild(rect(310, 170, 250, 50, C.PD, 0.12, C.PD, 0.5, 2));
    s.appendChild(txt(435, 185, 'PD park', C.PD, 10, 'bold', 'middle'));
    s.appendChild(txt(435, 200, `[${PARK_SIZE_PD}×29b pos][delta @~2.65b]`, C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(txt(435, 215, '≈ 8103 bytes per park', C.META, 8, 'normal', 'middle'));

    // X park
    s.appendChild(rect(570, 170, 250, 50, C.X, 0.12, C.X, 0.5, 2));
    s.appendChild(txt(695, 185, 'X park', C.X, 10, 'bold', 'middle'));
    s.appendChild(txt(695, 200, `[${PARK_SIZE_X}×57b line points]`, C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(txt(695, 215, '≈ 14592 bytes per park', C.META, 8, 'normal', 'middle'));

    // Line point explanation
    s.appendChild(rect(40, 235, 820, 80, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(50, 253, 'X park stores line points (57 bits each):', C.TEXT, 10, 'bold'));
    s.appendChild(txt(50, 270, 'LinePointToSquare(line_point) → (X1, X2) — maps 1D line to 2D square', C.META, 9, 'normal', 'start', true));
    s.appendChild(txt(50, 286, 'Each table-2 entry has 2 X values packed as one 57-bit line point', C.TEXT, 9, 'normal'));
    s.appendChild(txt(50, 306, 'write_x2: X1,X2 = read_bits(X_in, P_i*X2SIZE, XBITS), write at output offset', C.META, 9, 'normal', 'start', true));

    // Key
    s.appendChild(rect(40, 325, 820, 30, C.KEY, 0.08, C.KEY, 1, 4));
    s.appendChild(txt(W / 2, 343, 'Phase 2: compact positions → sort → delta-encode → ANS → park file. Writes 14.6 GB.', C.KEY, 11, 'bold', 'middle'));

    return s;
  },
  info: {
    t: 'Phase 2 Pass 2: Park Encoding',
    d: 'Convert compact PD to compressed park format, write to disk.',
    body: `<div class="k">Phase 2 Pass 2 encodes the compact PD into park files on disk.</div>
<h3>Encoding Steps</h3>
<div class="d">1. Sort entries by Y within each main bucket</div>
<div class="d">2. Delta-encode: store first value, then differences between consecutive values</div>
<div class="d">3. ANS-encode deltas into compact bit stream (asymmetric numeral systems)</div>
<div class="d">4. Write park to file: [first value][delta bit stream]</div>
<h3>Park Types</h3>
<div class="s">Y park: [4B first Y][${PARK_SIZE_Y - 1} deltas @ ~2.25 bits] ≈ 2308 bytes</div>
<div class="s">PD park: [${PARK_SIZE_PD}×29-bit compact positions][delta @ ~2.65 bits] ≈ 8103 bytes</div>
<div class="s">X park: [${PARK_SIZE_X}×57-bit line points] ≈ 14592 bytes</div>
<h3>X Park: Line Points</h3>
<div class="d">Table 2 stores X values as line points: a 57-bit value encoding a pair (X1, X2) via LinePointToSquare — a mapping from 1D line to 2D square that ensures uniqueness.</div>
<div class="s">write_x2: X1 = read_bits(X_in, P_i*X2SIZE, XBITS), X2 = read_bits(X_in, P_i*X2SIZE+XBITS, XBITS)</div>
<div class="s">X2SIZE = 64 bits (2×29-bit X values, padded)</div>
<div class="k">Phase 2 time: ~5-7s. Writes 14.6 GB to disk.</div>`
  }
};

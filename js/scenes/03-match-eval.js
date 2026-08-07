// ===== Scene 3: Match + Eval (Core Operation) =====
import { SVG_W, C } from '../constants.js';
import { svg, rect, txt, line, arrow } from '../svg-helpers.js';

export const scene = {
  name: 'Match + Eval',
  build() {
    const W = SVG_W, H = 400;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'Match + Eval: The Core Operation', C.KEY, 15, 'bold', 'middle'));

    // Two parent entries
    s.appendChild(rect(50, 70, 110, 35, C.Y, 0.8, C.EDGE, 1, 4));
    s.appendChild(txt(105, 92, 'Y', C.Y, 14, 'bold', 'middle'));
    s.appendChild(rect(50, 110, 110, 35, C.Y, 0.8, C.EDGE, 1, 4));
    s.appendChild(txt(105, 132, 'Y+1', C.Y, 14, 'bold', 'middle'));
    s.appendChild(rect(50, 70, 25, 35, C.META, 0.6, C.EDGE, 1, 2));
    s.appendChild(rect(50, 110, 25, 35, C.META, 0.6, C.EDGE, 1, 2));
    s.appendChild(txt(105, 165, 'consecutive pair', C.FLOW, 10, 'bold', 'middle'));
    s.appendChild(arrow(160, 107, 280, 107, C.FLOW));
    s.appendChild(txt(220, 100, 'meta_L ‖ meta_R', C.META, 10, 'normal', 'middle'));

    // SHA512
    s.appendChild(rect(280, 82, 80, 50, C.F1, 0.7, C.EDGE, 1, 4));
    s.appendChild(txt(320, 112, 'SHA512', C.F1, 14, 'bold', 'middle'));
    s.appendChild(arrow(360, 107, 450, 107, C.FLOW));

    // Output: new Y + new meta + PD
    s.appendChild(rect(450, 70, 70, 30, C.Y, 0.8, C.EDGE, 1, 4));
    s.appendChild(txt(485, 90, 'new Y', C.Y, 11, 'bold', 'middle'));
    s.appendChild(rect(450, 105, 70, 30, C.META, 0.7, C.EDGE, 1, 4));
    s.appendChild(txt(485, 125, 'new meta', C.META, 10, 'bold', 'middle'));
    s.appendChild(rect(450, 140, 70, 30, C.PD, 0.8, C.EDGE, 1, 4));
    s.appendChild(txt(485, 160, 'PD', C.PD, 12, 'bold', 'middle'));
    s.appendChild(txt(485, 188, 'back-ptr', C.TEXT, 9, 'normal', 'middle'));

    // PD encoding detail
    s.appendChild(rect(560, 60, 320, 145, C.PANEL, 0.6, C.EDGE, 1, 4));
    s.appendChild(txt(570, 78, 'PD = 40 bits:', C.PD, 11, 'bold'));

    // Bit layout
    s.appendChild(rect(570, 88, 210, 22, C.PD, 0.15, C.PD, 0.5, 2));
    s.appendChild(rect(780, 88, 35, 22, C.META, 0.2, C.META, 0.5, 2));
    s.appendChild(txt(675, 103, 'position (30 bits)', C.PD, 9, 'bold', 'middle'));
    s.appendChild(txt(797, 103, 'δ (5b)', C.META, 8, 'bold', 'middle'));

    s.appendChild(txt(570, 128, 'position = y_in × max_bs1 + P_x_in', C.TEXT, 9, 'normal', 'start', true));
    s.appendChild(txt(570, 144, '  y_in = input main bucket (FIXED STRIDE)', C.TEXT, 9, 'normal', 'start', true));
    s.appendChild(txt(570, 160, '  P_x_in = pos in input sorted sub-bucket array', C.TEXT, 9, 'normal', 'start', true));
    s.appendChild(txt(570, 176, '  δ = right_parent - left_parent - 1', C.TEXT, 9, 'normal', 'start', true));
    s.appendChild(txt(570, 192, 'Decode: left = PD>>5, right = left + (PD&31)+1', C.KEY, 9, 'bold', 'start', true));

    // Back-pointer arrow
    s.appendChild(arrow(450, 160, 160, 145, C.PD));
    s.appendChild(txt(305, 138, '← points to parents', C.PD, 10, 'normal', 'middle'));

    // Bottom
    s.appendChild(rect(80, 240, 740, 55, C.KEY, 0.08, C.KEY, 1, 4));
    s.appendChild(txt(W / 2, 260, 'This operation repeats 8 times: tables 2 through 9', C.KEY, 12, 'bold', 'middle'));
    s.appendChild(txt(W / 2, 280, 'Each entry in table t has exactly 2 parents in table t-1 → binary tree structure', C.TEXT, 11, 'normal', 'middle'));
    s.appendChild(txt(W / 2, 300, 'P(Y+1 neighbor) ≈ 63% → tables stay ~same size (NOT a funnel)', C.TEXT, 11, 'normal', 'middle'));

    return s;
  },
  info: {
    t: 'Match + Eval',
    d: 'Combine two parents with consecutive Y into one child entry.',
    body: `<div class="k">Each entry in tables 2-9 is created by finding two entries with consecutive Y values.</div>
<h3>Step by step</h3>
<div class="d">1. Sort entries by Y within sub-buckets (hybrid_sort_y)</div>
<div class="d">2. match_p1: find (Y, Y+1) pairs. Store LR=(left_pos, right_pos), PD_tmp=(P_x&lt;&lt;5)|delta</div>
<div class="d">3. eval_p1_tx: SHA512(meta_L ‖ meta_R) → new Y + new meta</div>
<div class="d">4. Store PD = PD_0 + PD_in[x] at output position</div>
<div class="c">// match_p1 kernel:
P_x = bucket_offset[y] + x    // global pos in input
PD_tmp[i] = (P_x << 5) | (i - x - 1)

// eval_p1_tx kernel:
PD_0 = (y_input * max_bucket_size_1) << 5
j = y_output * max_bucket_size_1 + pos  // output position
PD_out[j] = PD_0 + PD_in[x]
         = ((y_in * max_bs1 + P_x_in) << 5) | delta</div>
<h3>PD Encoding (raw, phase 1)</h3>
<div class="s">PD = 40 bits: [position:30 bits][delta:5 bits]</div>
<div class="s">position = y_input × max_bucket_size_1 + P_x_input (FIXED STRIDE)</div>
<div class="s">delta = right_parent_pos - left_parent_pos - 1</div>
<div class="s">Phase 2 remaps positions to compact (dense) indices before park encoding</div>`
  }
};

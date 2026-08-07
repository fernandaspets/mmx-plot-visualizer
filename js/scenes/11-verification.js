// ===== Scene 11: Proof Verification =====
import { SVG_W, C } from '../constants.js';
import { svg, rect, txt, arrow } from '../svg-helpers.js';

export const scene = {
  name: 'Verification',
  build() {
    const W = SVG_W, H = 380;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'Proof Verification: Recompute the Tree', C.KEY, 15, 'bold', 'middle'));

    // Input: 256 X values
    s.appendChild(rect(50, 60, 100, 40, C.X, 0.8, C.EDGE, 1, 4));
    s.appendChild(txt(100, 78, '256 X values', C.X, 11, 'bold', 'middle'));
    s.appendChild(txt(100, 94, '(the proof)', C.TEXT, 9, 'normal', 'middle'));
    s.appendChild(arrow(150, 80, 210, 80, C.FLOW));

    // F1 recompute
    s.appendChild(rect(210, 55, 100, 50, C.F1, 0.7, C.EDGE, 1, 4));
    s.appendChild(txt(260, 75, 'F1', C.F1, 13, 'bold', 'middle'));
    s.appendChild(txt(260, 92, 'recompute', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(txt(260, 105, '256×4KB', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(arrow(310, 80, 370, 80, C.FLOW));

    // F2-F9
    s.appendChild(rect(370, 55, 100, 50, C.PD, 0.6, C.EDGE, 1, 4));
    s.appendChild(txt(420, 75, 'F2-F9', C.PD, 13, 'bold', 'middle'));
    s.appendChild(txt(420, 92, 'match+SHA512', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(txt(420, 105, '8 tables', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(arrow(470, 80, 530, 80, C.FLOW));

    // Final Y
    s.appendChild(rect(530, 60, 80, 40, C.Y, 0.8, C.EDGE, 1, 4));
    s.appendChild(txt(570, 78, 'Final Y', C.Y, 11, 'bold', 'middle'));
    s.appendChild(txt(570, 94, 'table 9', C.TEXT, 8, 'normal', 'middle'));

    // Checks
    s.appendChild(rect(640, 55, 230, 130, C.PANEL, 0.6, C.EDGE, 1, 4));
    s.appendChild(txt(650, 73, 'Verification checks:', C.TEXT, 11, 'bold'));
    s.appendChild(rect(650, 82, 210, 24, C.KEY, 0.08, C.KEY, 0.5, 2));
    s.appendChild(txt(755, 98, '1. Y in [Y_begin, Y_begin+16)', C.KEY, 9, 'bold', 'middle'));
    s.appendChild(rect(650, 112, 210, 24, C.Y, 0.08, C.Y, 0.5, 2));
    s.appendChild(txt(755, 128, '2. X_out == X_values (ordering)', C.Y, 9, 'bold', 'middle'));
    s.appendChild(rect(650, 142, 210, 24, C.META, 0.08, C.META, 0.5, 2));
    s.appendChild(txt(755, 158, '3. post_filter (top 10 bits)', C.META, 9, 'bold', 'middle'));

    // Compute detail
    s.appendChild(rect(50, 160, 530, 150, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(60, 178, 'compute_full() — the verification engine:', C.TEXT, 10, 'bold'));
    s.appendChild(txt(60, 196, '1. compute_f1: for each of 256 X values, recompute F1 → (Y, meta)', C.TEXT, 9, 'normal'));
    s.appendChild(txt(60, 212, '2. For each table t=2..9: sort by (Y, meta), find (Y, Y+1) pairs, SHA512 → new (Y, meta)', C.TEXT, 9, 'normal'));
    s.appendChild(txt(60, 228, '3. Track LR back-pointers at each level for X extraction', C.TEXT, 9, 'normal'));
    s.appendChild(txt(60, 244, '4. After T9: deduplicate by meta, extract X values', C.TEXT, 9, 'normal'));
    s.appendChild(txt(60, 264, '5. Compare extracted X_out with input X_values', C.TEXT, 9, 'normal'));
    s.appendChild(txt(60, 280, '6. If match → proof valid, compute proof_hash', C.TEXT, 9, 'normal'));

    // Key insight
    s.appendChild(rect(50, 310, 820, 40, C.KEY, 0.08, C.KEY, 1, 4));
    s.appendChild(txt(W / 2, 328, 'Verification recomputes the ENTIRE tree from 256 X values — no plot file needed.', C.KEY, 12, 'bold', 'middle'));
    s.appendChild(txt(W / 2, 345, 'O(256) work = milliseconds. This is the PoSpace asymmetry: plot=42s, verify=ms.', C.TEXT, 11, 'normal', 'middle'));

    return s;
  },
  info: {
    t: 'Proof Verification',
    d: 'How a proof is verified: recompute the tree from X values.',
    body: `<div class="k">Verification recomputes the entire F1→F9 tree from the 256 X values. No plot file needed.</div>
<h3>compute_full() algorithm</h3>
<div class="d">1. compute_f1: for each of 256 X values, recompute F1 → (Y, meta)</div>
<div class="d">2. For each table t=2..9: sort by (Y, meta), find (Y, Y+1) pairs, SHA512 → new (Y, meta)</div>
<div class="d">3. Track LR back-pointers at each level for X extraction</div>
<div class="d">4. After table 9: sort entries, deduplicate by meta, extract X values via LR chain</div>
<div class="d">5. Compare extracted X_out with input X_values</div>
<h3>Checks</h3>
<div class="s">1. Final Y must be in [Y_begin, Y_begin + 2^plot_filter) — challenge window</div>
<div class="s">2. X_out must equal X_values — proves the X values actually produce this tree</div>
<div class="s">3. post_filter: SHA256("post_filter" ‖ challenge ‖ meta) top 10 bits must be 0</div>
<div class="s">4. Exactly 1 proof (not more) — deduplication by meta</div>
<div class="c">// verify() function:
auto entries = compute(X_values, &amp;X_out, id, ksize, 0);
if(entries.size() != 1) throw "invalid";
auto Y = entries[0].first;
if(Y < Y_0 || Y >= Y_end) throw "invalid Y";
if(X_out != X_values) throw "invalid proof order";
// check post_filter, compute proof_hash</div>
<div class="k">Verification = O(256) = milliseconds. No plot file access needed.</div>
<h3>pos::verify parameters</h3>
<div class="s">verify(proof_xs, challenge, plot_id, plot_filter, post_filter, ksize, check_meta)</div>
<div class="s">post_filter=0: skip post_filter check (just verify tree validity)</div>
<div class="s">post_filter=10: full check (1/1024 lottery)</div>`
  }
};

// ===== Scene 13: Proof Anatomy (Quality vs Score) =====
import { SVG_W, C, KSIZE } from '../constants.js';
import { svg, rect, txt, arrow, line, panel } from '../svg-helpers.js';

export const scene = {
  name: 'Proof Anatomy',
  build() {
    const W = SVG_W, H = 420;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'Proof Anatomy: Quality vs Score', C.KEY, 15, 'bold', 'middle'));

    // Proof structure (top)
    s.appendChild(rect(50, 55, 820, 50, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(60, 73, 'ProofOfSpaceOG:', C.TEXT, 11, 'bold'));
    const fields = [
      { n: '256× X (1024B)', c: C.X }, { n: 'seed (32B)', c: C.F1 },
      { n: 'farmer_key (33B)', c: C.HDR }, { n: 'ksize (1B)', c: C.META },
      { n: 'plot_id (32B)', c: C.Y }, { n: 'challenge (32B)', c: C.PD },
      { n: 'difficulty (8B)', c: C.QUALITY }, { n: 'score (2B)', c: C.SCORE }
    ];
    let fx = 180;
    fields.forEach((f, i) => {
      const w = Math.max(60, f.n.length * 6 + 10);
      s.appendChild(rect(fx, 62, w, 36, f.c, 0.15, f.c, 0.5, 2));
      s.appendChild(txt(fx + w / 2, 84, f.n, f.c, 8, 'bold', 'middle'));
      fx += w + 4;
    });
    s.appendChild(txt(60, 96, 'Total: ~1.3 KB per proof (self-contained, no plot file needed)', C.TEXT, 9, 'normal'));

    // Two hash paths
    s.appendChild(txt(W / 2, 125, 'Two Hashes from Same 256 X Values', C.KEY, 13, 'bold', 'middle'));

    // Quality hash
    s.appendChild(rect(50, 140, 380, 120, C.QUALITY, 0.06, C.QUALITY, 1, 4));
    s.appendChild(txt(240, 158, 'quality = calc_proof_hash(plot_challenge, X)', C.QUALITY, 11, 'bold', 'middle'));
    s.appendChild(txt(240, 175, '= SHA256(plot_challenge ‖ proof_xs)', C.TEXT, 10, 'normal', 'middle', true));
    s.appendChild(rect(60, 190, 360, 24, C.QUALITY, 0.08, C.QUALITY, 0.5, 2));
    s.appendChild(txt(240, 206, '→ THRESHOLD GATE', C.QUALITY, 10, 'bold', 'middle'));
    s.appendChild(txt(60, 226, '(quality >> (ksize-1)) < 2^255 / (space_diff × 10^11) × (2×ksize+1)', C.META, 9, 'normal', 'start', true));
    s.appendChild(txt(60, 244, 'At diff=11189: top byte must be 0-1 (out of 256). P≈1/138', C.TEXT, 9, 'normal'));
    s.appendChild(txt(60, 260, 'plot_challenge = SHA256("plot_challenge" ‖ plot_id ‖ challenge)', C.PD, 9, 'normal', 'start', true));

    // Score hash
    s.appendChild(rect(490, 140, 380, 120, C.SCORE, 0.06, C.SCORE, 1, 4));
    s.appendChild(txt(680, 158, 'score = calc_proof_hash(block_challenge, X)', C.SCORE, 11, 'bold', 'middle'));
    s.appendChild(txt(680, 175, '= SHA256(block_challenge ‖ proof_xs)', C.TEXT, 10, 'normal', 'middle', true));
    s.appendChild(rect(500, 190, 360, 24, C.SCORE, 0.08, C.SCORE, 0.5, 2));
    s.appendChild(txt(680, 206, '→ BLOCK COMPETITION', C.SCORE, 10, 'bold', 'middle'));
    s.appendChild(txt(500, 226, 'get_proof_score(score) = score[0] (first byte)', C.META, 9, 'normal', 'start', true));
    s.appendChild(txt(500, 244, 'Lowest score wins among ~4 network proofs', C.TEXT, 9, 'normal'));
    s.appendChild(txt(500, 260, 'block_challenge = challenge (raw, not hashed with plot_id)', C.PD, 9, 'normal', 'start', true));

    // Gates visualization
    s.appendChild(txt(W / 2, 290, 'Three Gates to Winning a Block', C.KEY, 13, 'bold', 'middle'));

    const gates = [
      { n: 'post_filter', p: '1/1024', desc: 'SHA256("post_filter" ‖ challenge ‖ meta) top 10 bits = 0', c: C.META },
      { n: 'threshold', p: '~1/138', desc: 'quality top byte < limit (depends on space_diff)', c: C.QUALITY },
      { n: 'lowest score', p: '1/~4', desc: 'score[0] must be lowest among all network proofs', c: C.SCORE }
    ];
    gates.forEach((g, i) => {
      const x = 50 + i * 290;
      s.appendChild(rect(x, 305, 270, 60, g.c, 0.08, g.c, 1, 3));
      s.appendChild(txt(x + 135, 322, g.n, g.c, 11, 'bold', 'middle'));
      s.appendChild(txt(x + 135, 338, 'P = ' + g.p, C.KEY, 10, 'bold', 'middle'));
      s.appendChild(txt(x + 135, 354, g.desc, C.TEXT, 8, 'normal', 'middle'));
      if (i < 2) s.appendChild(arrow(x + 270, 335, x + 290, 335, C.FLOW));
    });

    // Combined probability
    s.appendChild(rect(50, 380, 820, 28, C.KEY, 0.08, C.KEY, 1, 4));
    s.appendChild(txt(W / 2, 398, 'P(win block) = 1/1024 × 1/138 × 1/4 ≈ 1/565,000 per proof per challenge', C.KEY, 11, 'bold', 'middle'));

    return s;
  },
  info: {
    t: 'Proof Anatomy: Quality vs Score',
    d: 'Two different hashes from the same 256 X values. Three gates to winning.',
    body: `<div class="k">A proof contains 256 X values + metadata. Two hashes determine its fate.</div>
<h3>Proof Structure (self-contained, ~1.3 KB)</h3>
<div class="s">256 × uint32 X values (1024 bytes) — the actual proof</div>
<div class="s">seed (32B), farmer_key (33B), ksize (1B), plot_id (32B)</div>
<div class="s">challenge (32B), difficulty (8B), score (2B)</div>
<div class="d">Verifier recomputes F1→F9 from X values. No plot file needed.</div>
<h3>Quality Hash (threshold gate)</h3>
<div class="s">quality = SHA256(plot_challenge ‖ proof_xs)</div>
<div class="s">plot_challenge = SHA256("plot_challenge" ‖ plot_id ‖ challenge)</div>
<div class="s">(quality >> (ksize-1)) < 2^255 / (space_diff × 10^11) × (2×ksize+1)</div>
<div class="d">At space_diff=11189: top byte must be 0-1. P(pass) ≈ 1/138</div>
<h3>Score Hash (block competition)</h3>
<div class="s">score = SHA256(block_challenge ‖ proof_xs)  [block_challenge = raw challenge]</div>
<div class="s">get_proof_score = score[0] (first byte, 0-255)</div>
<div class="d">Lowest score among ~4 network proofs wins the block</div>
<h3>Three Gates</h3>
<div class="d">1. post_filter (1/1024): SHA256("post_filter" ‖ challenge ‖ meta) top 10 bits = 0</div>
<div class="d">2. threshold (~1/138): quality top byte < limit (space_diff dependent)</div>
<div class="d">3. lowest score (~1/4): score[0] must be lowest among all proofs</div>
<div class="k">P(win) = 1/1024 × 1/138 × 1/4 ≈ 1/565,000 per proof per challenge</div>`
  }
};

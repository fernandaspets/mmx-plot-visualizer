// ===== Scene 14: Hash Chain (Challenge Derivation) =====
import { SVG_W, C } from '../constants.js';
import { svg, rect, txt, arrow, line, panel } from '../svg-helpers.js';

export const scene = {
  name: 'Hash Chain',
  build() {
    const W = SVG_W, H = 420;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'Hash Chain: From Seed to Challenge', C.KEY, 15, 'bold', 'middle'));

    // Plot ID derivation
    s.appendChild(rect(40, 50, 840, 80, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(50, 68, 'Plot ID Derivation:', C.TEXT, 11, 'bold'));

    const pidSteps = [
      { n: 'seed', c: C.F1, w: 70 },
      { n: 'ksize', c: C.META, w: 60 },
      { n: 'farmer_key', c: C.HDR, w: 90 },
      { n: 'contract?', c: C.PD, w: 70 }
    ];
    let px = 60;
    pidSteps.forEach((p, i) => {
      s.appendChild(rect(px, 78, p.w, 30, p.c, 0.15, p.c, 1, 2));
      s.appendChild(txt(px + p.w / 2, 97, p.n, p.c, 9, 'bold', 'middle'));
      if (i < pidSteps.length - 1) s.appendChild(txt(px + p.w + 8, 97, '‖', C.TEXT, 12, 'bold'));
      px += p.w + 20;
    });
    s.appendChild(arrow(px + 10, 93, px + 60, 93, C.FLOW));
    s.appendChild(rect(px + 60, 78, 100, 30, C.Y, 0.7, C.EDGE, 1, 3));
    s.appendChild(txt(px + 110, 93, 'plot_id', C.Y, 10, 'bold', 'middle'));
    s.appendChild(txt(px + 110, 120, 'SHA256(...)', C.TEXT, 8, 'normal', 'middle'));

    // Challenge derivation
    s.appendChild(rect(40, 150, 840, 90, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(50, 168, 'Challenge Derivation (Node):', C.TEXT, 11, 'bold'));

    // block challenge → plot challenge
    s.appendChild(rect(60, 180, 100, 30, C.PD, 0.15, C.PD, 1, 3));
    s.appendChild(txt(110, 200, 'challenge', C.PD, 9, 'bold', 'middle'));
    s.appendChild(txt(110, 215, '(from VDF)', C.TEXT, 8, 'normal', 'middle'));

    s.appendChild(arrow(160, 195, 220, 195, C.FLOW));

    s.appendChild(rect(220, 180, 200, 30, C.Y, 0.12, C.Y, 1, 3));
    s.appendChild(txt(320, 200, 'plot_challenge', C.Y, 10, 'bold', 'middle'));

    s.appendChild(arrow(420, 195, 480, 195, C.FLOW));

    s.appendChild(rect(480, 180, 120, 30, C.QUALITY, 0.12, C.QUALITY, 1, 3));
    s.appendChild(txt(540, 200, 'Y_begin', C.QUALITY, 10, 'bold', 'middle'));

    s.appendChild(txt(320, 225, '= SHA256("plot_challenge" ‖ plot_id ‖ challenge)', C.META, 10, 'normal', 'start', true));
    s.appendChild(txt(540, 240, '& KMASK (LE 4 bytes)', C.META, 9, 'normal', 'start', true));

    // plot_filter grinding
    s.appendChild(rect(40, 260, 400, 130, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(50, 278, 'plot_filter Grinding:', C.KEY, 11, 'bold'));
    s.appendChild(rect(50, 290, 380, 28, C.KEY, 0.06, C.KEY, 0.5, 2));
    s.appendChild(txt(240, 308, 'SHA256("plot_filter" ‖ plot_id ‖ challenge)', C.KEY, 10, 'bold', 'middle'));
    s.appendChild(txt(240, 325, 'top 4 bits must be 0 (P = 1/16)', C.TEXT, 10, 'normal', 'middle'));
    s.appendChild(txt(50, 345, 'Grind: try random seeds → compute plot_id → check filter', C.F1, 10, 'normal'));
    s.appendChild(txt(50, 362, '~16 tries expected. Microseconds on GPU.', C.F1, 10, 'bold'));
    s.appendChild(txt(50, 380, 'JIT: grind seed so plot_id passes filter EVERY TIME', C.KEY, 10, 'bold'));

    // post_filter
    s.appendChild(rect(480, 260, 400, 130, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(490, 278, 'post_filter (NOT grindable):', C.META, 11, 'bold'));
    s.appendChild(rect(490, 290, 380, 28, C.META, 0.06, C.META, 0.5, 2));
    s.appendChild(txt(680, 308, 'SHA256("post_filter" ‖ challenge ‖ meta)', C.META, 10, 'bold', 'middle'));
    s.appendChild(txt(680, 325, 'top 10 bits must be 0 (P = 1/1024)', C.TEXT, 10, 'normal', 'middle'));
    s.appendChild(txt(490, 345, 'meta = plot content (fixed after plotting)', C.TEXT, 10, 'normal'));
    s.appendChild(txt(490, 362, 'Cannot grind — depends on plot data', C.TEXT, 10, 'normal'));
    s.appendChild(txt(490, 380, 'This is the real anti-JIT gate (1/1024 per proof)', C.KEY, 10, 'bold'));

    return s;
  },
  info: {
    t: 'Hash Chain: Seed → Challenge',
    d: 'How plot_id, plot_challenge, and Y_begin are derived. plot_filter vs post_filter.',
    body: `<div class="k">The challenge system uses multiple SHA256 hashes at different stages.</div>
<h3>Plot ID</h3>
<div class="s">plot_id = SHA256("MMX/PLOTID/OG" ‖ ksize ‖ seed ‖ farmer_key ‖ contract?)</div>
<div class="d">seed is freely chosen. farmer_key is secp256k1 public key.</div>
<h3>Challenge Timing</h3>
<div class="d">Node publishes Challenge{vdf_height, challenge, difficulty} every block (10s)</div>
<div class="d">challenge = VDF output (verifiable delay function)</div>
<div class="d">challenge_delay = 6 blocks. Farmer has 60s budget (6 × 10s).</div>
<h3>Plot Challenge → Y_begin</h3>
<div class="s">plot_challenge = SHA256("plot_challenge" ‖ plot_id ‖ challenge)</div>
<div class="s">Y_begin = plot_challenge[0:4] as little-endian uint32 & KMASK</div>
<div class="s">Y_end = Y_begin + 2^plot_filter = Y_begin + 16</div>
<h3>plot_filter (grindable — 1/16)</h3>
<div class="s">SHA256("plot_filter" ‖ plot_id ‖ challenge), top 4 bits = 0</div>
<div class="d">Seed is free → grind ~16 seeds to pass. JIT advantage: pass every time.</div>
<h3>post_filter (NOT grindable — 1/1024)</h3>
<div class="s">SHA256("post_filter" ‖ challenge ‖ meta), top 10 bits = 0</div>
<div class="d">meta = plot content (fixed after plotting). Cannot grind.</div>
<div class="k">post_filter is the real anti-JIT defense: each proof only has 1/1024 chance.</div>`
  }
};

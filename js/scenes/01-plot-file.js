// ===== Scene 1: Plot File Structure =====
import { SVG_W, C, entries, PARK_SIZE_Y, PARK_SIZE_PD, PARK_SIZE_X } from '../constants.js';
import { svg, rect, txt, line, arrow } from '../svg-helpers.js';

export const scene = {
  name: 'Plot File',
  build() {
    const W = SVG_W, H = 320;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 28, '14.6 GB Plot File (k=29, SSD)', C.KEY, 16, 'bold', 'middle'));

    // File layout bar
    const bY = 75, bH = 48, bW = 840, bX = 30;
    const secs = [
      { n: 'Y', sz: 0.008, c: C.Y, l: '144 MB' },
      { n: 'PD0', sz: 0.113, c: C.PD, l: '2.0 GB' },
      { n: 'PD1', sz: 0.113, c: C.PD, l: '2.0 GB' },
      { n: 'PD2', sz: 0.113, c: C.PD, l: '2.0 GB' },
      { n: 'PD3', sz: 0.113, c: C.PD, l: '2.0 GB' },
      { n: 'PD4', sz: 0.113, c: C.PD, l: '2.0 GB' },
      { n: 'PD5', sz: 0.113, c: C.PD, l: '2.0 GB' },
      { n: 'PD6', sz: 0.113, c: C.PD, l: '2.0 GB' },
      { n: 'X', sz: 0.203, c: C.X, l: '3.6 GB' }
    ];

    let x = bX;
    secs.forEach((sec, i) => {
      const w = sec.sz * bW;
      if (w < 2) return;
      const r = rect(x, bY, w, bH, sec.c, 0.85, C.EDGE, 1, 3);
      r.setAttribute('class', 'pulse-ani');
      r.style.animationDelay = (i * 0.12) + 's';
      s.appendChild(r);
      if (w > 20) {
        s.appendChild(txt(x + w / 2, bY - 6, sec.n, sec.c, 10, 'bold', 'middle'));
        s.appendChild(txt(x + w / 2, bY + bH + 14, sec.l, C.TEXT, 9, 'normal', 'middle'));
      }
      x += w;
    });

    // Header indicator
    s.appendChild(rect(28, bY, 4, bH, C.HDR, 0.8));
    s.appendChild(txt(30, bY - 6, 'Hdr', C.HDR, 9, 'bold', 'middle'));
    s.appendChild(rect(bX - 2, bY - 2, bW + 4, bH + 4, 'none', 1, C.HDR, 2, 4));

    // Header detail panel
    s.appendChild(rect(30, 155, 840, 70, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(40, 173, 'Header (VNX-serialized, 4KB-aligned sections):', C.TEXT, 11, 'bold'));
    s.appendChild(txt(40, 191, 'version, ksize, xbits, has_meta, seed, plot_id, farmer_key, contract', C.META, 10, 'normal', 'start', true));
    s.appendChild(txt(40, 207, 'park_size_{x,y,pd,meta}, park_bytes_{x,y,pd,meta}, entry_bits_x', C.META, 10, 'normal', 'start', true));
    s.appendChild(txt(40, 223, 'num_entries_y, table_offset_{x,y,meta}, table_offset_pd[7]', C.META, 10, 'normal', 'start', true));

    // Key insight
    s.appendChild(txt(W / 2, 250, 'Y=sorted T9 values · PD[0-6]=back-pointers T9→T2 · X=T2 X values as line points', C.TEXT, 11, 'normal', 'middle'));
    s.appendChild(rect(100, 268, 700, 28, C.KEY, 0.08, C.KEY, 1, 4));
    s.appendChild(txt(W / 2, 285, 'PD parks = 79% of file: back-pointers for ALL 536M binary trees', C.KEY, 12, 'bold', 'middle'));

    return s;
  },
  info: {
    t: 'The Plot File',
    d: 'A binary file that proves you spent compute time. 14.6 GB for k=29 SSD.',
    body: `<h3>Sections (file order)</h3>
<div class="s">Header — 4 KB: ksize=29, seed, plot_id, farmer_key, park sizes, all offsets</div>
<div class="s">Y table — 144 MB (1%): sorted Y values of table 9, delta-encoded parks</div>
<div class="s">PD[0-6] — 7 × 2.0 GB (79%): back-pointers for tables 9→8, 8→7, ..., 3→2</div>
<div class="s">X table — 3.6 GB (20%): X values of table 2, packed as 57-bit line points</div>
<div class="k">PD parks are 79% of the file — they store back-pointers for ALL 536M trees.</div>
<h3>Park Parameters</h3>
<div class="s">park_size_y=${PARK_SIZE_Y}, park_size_pd=${PARK_SIZE_PD}, park_size_x=${PARK_SIZE_X}</div>
<div class="s">Park bytes: Y≈2308B, PD≈8103B, X≈14592B</div>
<div class="s">entry_bits_x=57 (line point encoding of X pairs)</div>
<h3>Plot Header Fields</h3>
<div class="s">plot_id = SHA256("MMX/PLOTID/OG" + ksize + seed + farmer_key)</div>
<div class="s">farmer_key = secp256k1 compressed public key (33 bytes)</div>
<div class="s">contract = optional (NFT plots), else null</div>`
  }
};

// ===== Scene 7: Phase 2 — Position Compaction (Remap) =====
import { SVG_W, C } from '../constants.js';
import { svg, rect, txt, arrow } from '../svg-helpers.js';

export const scene = {
  name: 'Phase 2: Remap',
  build() {
    const W = SVG_W, H = 380;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'Phase 2 Pass 1: Position Compaction', C.KEY, 15, 'bold', 'middle'));

    // Step 1: mark_used
    s.appendChild(rect(40, 55, 130, 40, C.PD, 0.1, C.PD, 1, 4));
    s.appendChild(txt(105, 72, 'mark_used', C.PD, 11, 'bold', 'middle'));
    s.appendChild(txt(105, 88, 'bitfield of referenced positions', C.TEXT, 8, 'normal', 'middle'));

    // Bitfield viz
    s.appendChild(rect(40, 110, 130, 25, C.PD, 0.2, C.EDGE, 1, 2));
    for (let i = 0; i < 24; i++) {
      const on = Math.random() > 0.5;
      s.appendChild(rect(45 + i * 5, 115, 4, 15, on ? C.PD : '#1a2030', on ? 0.7 : 0.3, C.EDGE, 0.3, 1));
    }
    s.appendChild(txt(105, 150, 'bitfield (1=used)', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(arrow(170, 130, 230, 130, C.FLOW));

    // Step 2: count_used
    s.appendChild(rect(230, 55, 130, 40, C.PD, 0.1, C.PD, 1, 4));
    s.appendChild(txt(295, 72, 'count_used', C.PD, 11, 'bold', 'middle'));
    s.appendChild(txt(295, 88, '__popc per uint32 word', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(rect(230, 110, 130, 25, C.PD, 0.2, C.EDGE, 1, 2));
    s.appendChild(txt(295, 128, 'popcount per group', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(arrow(360, 130, 420, 130, C.FLOW));

    // Step 3: remap_pos
    s.appendChild(rect(420, 55, 130, 40, C.PD, 0.1, C.PD, 1, 4));
    s.appendChild(txt(485, 72, 'remap_pos', C.PD, 11, 'bold', 'middle'));
    s.appendChild(txt(485, 88, 'compact dense index', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(rect(420, 110, 130, 25, C.PD, 0.2, C.EDGE, 1, 2));
    s.appendChild(txt(485, 128, 'offset[pos/32] + popc(below)', C.TEXT, 7, 'normal', 'middle'));
    s.appendChild(arrow(550, 130, 610, 130, C.FLOW));

    // Result
    s.appendChild(rect(610, 55, 180, 40, C.KEY, 0.08, C.KEY, 1, 4));
    s.appendChild(txt(700, 72, 'Compact PD', C.KEY, 11, 'bold', 'middle'));
    s.appendChild(txt(700, 88, '29-bit dense, no gaps', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(rect(610, 110, 180, 25, C.KEY, 0.15, C.KEY, 0.5, 2));
    s.appendChild(txt(700, 128, 'sequential indices', C.TEXT, 8, 'normal', 'middle'));

    // Detail panel
    s.appendChild(rect(40, 175, 820, 170, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(50, 193, 'How remap_pos works:', C.TEXT, 11, 'bold'));
    s.appendChild(txt(50, 212, 'Given a sparse position pos in the raw PD:', C.TEXT, 10, 'normal'));
    s.appendChild(txt(50, 230, '  word = pos / 32, bit = pos % 32', C.META, 10, 'normal', 'start', true));
    s.appendChild(txt(50, 246, '  compact_index = offset[word] + popcount(bitfield[word] & mask_below(bit))', C.META, 10, 'normal', 'start', true));
    s.appendChild(txt(50, 266, '  where offset[word] = prefix sum of popcounts of all words before it', C.META, 10, 'normal', 'start', true));
    s.appendChild(txt(50, 292, 'Effect: dead entries (not referenced by any child) are removed.', C.TEXT, 10, 'normal'));
    s.appendChild(txt(50, 308, '  Raw 30-bit positions with gaps → compact 29-bit sequential indices.', C.TEXT, 10, 'normal'));
    s.appendChild(txt(50, 326, '  This is why park positions are 29 bits (= ksize), not 30 bits.', C.KEY, 10, 'bold'));

    return s;
  },
  info: {
    t: 'Phase 2 Pass 1: Remap',
    d: 'Compact sparse positions to dense sequential indices.',
    body: `<div class="k">Phase 2 Pass 1 removes dead entries and remaps positions to compact indices.</div>
<h3>mark_used</h3>
<div class="d">For each entry in table t, read its PD, extract P_1 and P_2 (parent positions). Set bits in a bitfield at P_1 and P_2. This marks which positions in table t-1 are actually referenced.</div>
<h3>count_used</h3>
<div class="d">Count set bits per uint32 word: count_out[x] = __popc(bitfield[x]). Then calc_offset_sum computes prefix sums.</div>
<h3>remap_pos</h3>
<div class="d">For a sparse position pos: compact = offset[pos/32] + popcount(bitfield[pos/32] &amp; mask_below(pos%32)). This gives the dense sequential index.</div>
<div class="c">// remap_pos kernel:
uint32_t remap_pos(B, offset, pos) {
    return offset[pos / 32]
         + __popc(B[pos / 32] &amp; ((1 << (pos % 32)) - 1));
}</div>
<div class="s">Raw PD: 30-bit positions with gaps (dead entries)</div>
<div class="s">Compact PD: 29-bit sequential indices (no gaps)</div>
<div class="k">Park positions are 29 bits (= ksize) because compaction removes all gaps.</div>`
  }
};

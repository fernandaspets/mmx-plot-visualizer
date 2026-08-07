// ===== Scene 5: Two-Level Bucketing =====
import { SVG_W, C, LOGBUCKETS, LOGBUCKETS2, NUM_BUCKETS, NUM_SUBBUCKETS, KSIZE } from '../constants.js';
import { svg, rect, txt, arrow } from '../svg-helpers.js';

export const scene = {
  name: 'Bucketing',
  build() {
    const W = SVG_W, H = 370;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'Two-Level Bucket Structure', C.KEY, 15, 'bold', 'middle'));

    // Main buckets
    s.appendChild(txt(200, 55, 'Main Buckets (64)', C.PD, 12, 'bold', 'middle'));
    s.appendChild(txt(200, 72, 'indexed by Y >> (KSIZE - LOGBUCKETS)', C.TEXT, 9, 'normal', 'middle'));
    s.appendChild(txt(200, 88, '= top 6 bits of Y', C.TEXT, 9, 'normal', 'middle'));

    for (let i = 0; i < 8; i++) {
      const x = 80 + i * 30;
      s.appendChild(rect(x, 100, 28, 35, C.PD, 0.3, C.EDGE, 1, 2));
      s.appendChild(txt(x + 14, 121, i, C.PD, 8, 'bold', 'middle'));
    }
    s.appendChild(txt(200, 148, '... 64 total ...', C.TEXT, 9, 'normal', 'middle'));
    s.appendChild(arrow(200, 160, 200, 180, C.FLOW));

    // Sub-buckets
    s.appendChild(txt(200, 200, 'Sub-Buckets (16384 per main bucket)', C.SUB, 12, 'bold', 'middle'));
    s.appendChild(txt(200, 217, 'indexed by lower bits of Y within main bucket', C.TEXT, 9, 'normal', 'middle'));
    s.appendChild(txt(200, 233, 'LOGBUCKETS2 = KSIZE - LOGBUCKETS - 9 = 14', C.TEXT, 9, 'normal', 'middle'));

    // Sub-bucket grid
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 8; j++) {
        const x = 80 + i * 22 + 80, y = 250 + j * 12;
        s.appendChild(rect(x, y, 20, 10, C.SUB, 0.15 + Math.random() * 0.2, C.EDGE, 0.3, 1));
      }
    }
    s.appendChild(txt(200, 355, 'Each sub-bucket: max ~1365 entries (max_bucket_size_2)', C.TEXT, 9, 'normal', 'middle'));

    // Kernel flow
    s.appendChild(rect(500, 90, 360, 200, C.PANEL, 0.6, C.EDGE, 1, 4));
    s.appendChild(txt(510, 108, 'GPU Kernel Chain (per table t):', C.TEXT, 11, 'bold'));
    const kernels = [
      { n: 'scatter_2', d: 'assign to sub-bucket, PY=(Y<<35)|local_x' },
      { n: 'calc_offset_sum', d: 'prefix sums of sub-bucket sizes' },
      { n: 'hybrid_sort_y', d: 'sort by PY within sub-buckets' },
      { n: 'match_p1', d: 'find (Y,Y+1) pairs → LR + PD_tmp' },
      { n: 'eval_p1_tx', d: 'SHA512 → new Y/meta, write PD_out' },
      { n: 'write_pd / write_x2', d: 'reorder to output main buckets' }
    ];
    kernels.forEach((k, i) => {
      s.appendChild(rect(510, 118 + i * 24, 340, 20, C.F1, 0.08, C.EDGE, 0.5, 2));
      s.appendChild(txt(520, 131 + i * 24, k.n, C.F1, 9, 'bold'));
      s.appendChild(txt(620, 131 + i * 24, k.d, C.TEXT, 8, 'normal'));
    });

    return s;
  },
  info: {
    t: 'Two-Level Bucketing',
    d: 'Entries are organized into main buckets and sub-buckets for parallel processing.',
    body: `<div class="k">Each table's entries are divided into ${NUM_BUCKETS} main buckets, each with ${NUM_SUBBUCKETS} sub-buckets.</div>
<h3>Main Buckets (level 1)</h3>
<div class="s">num_buckets_1 = 2^LOGBUCKETS = ${NUM_BUCKETS} (LOGBUCKETS=${LOGBUCKETS})</div>
<div class="s">Main bucket = Y >> (KSIZE - LOGBUCKETS) = top ${LOGBUCKETS} bits of Y</div>
<div class="s">max_bucket_size_1 = (2^29 / 64) × 17/16 ≈ 2,228,224</div>
<h3>Sub-Buckets (level 2)</h3>
<div class="s">num_buckets_2 = 2^LOGBUCKETS2 = ${NUM_SUBBUCKETS} (LOGBUCKETS2=${LOGBUCKETS2})</div>
<div class="s">Sub-bucket = lower bits of Y within main bucket</div>
<div class="s">max_bucket_size_2 ≈ 1365 entries per sub-bucket</div>
<h3>Why two levels?</h3>
<div class="d">Parallelism: each main bucket processed independently by a CUDA stream. Sub-buckets enable efficient parallel sorting (hybrid_sort_y sorts within sub-bucket, small enough for shared memory).</div>
<div class="c">// scatter_2 kernel:
PY = (Y << 35) | local_x  // pack Y and position
sub_bucket = Y & (num_buckets_2 - 1)  // lower 14 bits
// hybrid_sort_y sorts by PY within each sub-bucket</div>
<h3>Match within sub-buckets</h3>
<div class="d">match_p1 scans consecutive entries within a sub-bucket looking for (Y, Y+1) pairs. Can cross sub-bucket boundary (checks next sub-bucket too).</div>`
  }
};

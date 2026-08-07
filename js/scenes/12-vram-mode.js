// ===== Scene 12: VRAM Mode (All-GPU Plotting) =====
import { SVG_W, C, META_BYTES } from '../constants.js';
import { svg, rect, txt, arrow, line, panel } from '../svg-helpers.js';

export const scene = {
  name: 'VRAM Mode',
  build() {
    const W = SVG_W, H = 460;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'VRAM Mode: All-GPU Plotting (Zero DMA, Zero Disk)', C.KEY, 15, 'bold', 'middle'));

    // GPU box
    s.appendChild(rect(40, 50, 840, 130, C.VRAM, 0.04, C.VRAM, 2, 8));
    s.appendChild(txt(60, 70, 'GPU VRAM — everything stays here', C.VRAM, 13, 'bold'));

    // VRAM bucket layout
    const buckets = [
      { n: 'Y_buckets[2]', sz: '2.1 GiB', c: C.Y, desc: 'sorted Y (uint32)' },
      { n: 'C_buckets[src]', sz: '30 GiB', c: C.META, desc: `${META_BYTES}B/entry × 8.9M × 64` },
      { n: 'PD_buckets[2]', sz: '6 GiB', c: C.PD, desc: '5B PD back-pointers' },
      { n: 'PD1_buckets[10]', sz: '26 GiB', c: C.X, desc: 'proof walk-back data' }
    ];
    buckets.forEach((b, i) => {
      const x = 60 + (i % 2) * 210;
      const y = 85 + Math.floor(i / 2) * 45;
      s.appendChild(rect(x, y, 195, 38, b.c, 0.12, b.c, 1, 3));
      s.appendChild(txt(x + 97, y + 14, b.n, b.c, 10, 'bold', 'middle'));
      s.appendChild(txt(x + 97, y + 27, b.sz, C.TEXT, 9, 'normal', 'middle'));
      s.appendChild(txt(x + 97, y + 37, b.desc, C.TEXT, 7, 'normal', 'middle'));
    });

    // D2D flow
    s.appendChild(txt(520, 120, 'D2D copies on stream k', C.VRAM, 10, 'bold', 'middle'));
    s.appendChild(arrow(520, 135, 820, 135, C.VRAM));
    s.appendChild(txt(520, 155, 'NO PCIe! NO disk!', C.KEY, 11, 'bold', 'middle'));

    // Working buffers
    s.appendChild(rect(520, 70, 170, 35, C.F1, 0.08, C.F1, 1, 3));
    s.appendChild(txt(605, 82, 'Working buffers', C.F1, 9, 'bold', 'middle'));
    s.appendChild(txt(605, 96, 'Y_out, C_out, PD_out', C.TEXT, 8, 'normal', 'middle'));

    // Measured results table
    s.appendChild(rect(40, 195, 840, 155, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(50, 213, 'Measured Results (RTX PRO 6000, 400W):', C.KEY, 12, 'bold'));

    // Table header
    const cols = [50, 140, 260, 390, 520, 650, 780];
    const headers = ['Config', 'GPUs', 'Phase 1', 'vs DMA', 'VRAM/GPU', 'Disk I/O', 'Proof'];
    headers.forEach((h, i) => {
      s.appendChild(txt(cols[i], 232, h, C.TEXT, 10, 'bold'));
    });
    s.appendChild(line(50, 238, 870, 238, C.EDGE, 1));

    const results = [
      { cfg: 'k29 VRAM', gpus: '1× PRO 6000', time: '21.1s', vs: '2.1× faster', vram: '70 GiB', disk: '0 GB', proof: '✓' },
      { cfg: 'k30 VRAM', gpus: '2× PRO 6000', time: '60.4s', vs: 'new', vram: '68 GiB', disk: '0 GB', proof: '✓ 256 X found' },
      { cfg: 'k31 VRAM', gpus: '4× PRO 6000', time: '168.4s', vs: 'new', vram: '64 GiB', disk: '0 GB', proof: '✓' },
      { cfg: 'k29 DMA', gpus: '1× 5090', time: '45s', vs: 'baseline', vram: '—', disk: '~488 GB PCIe', proof: '✓' },
    ];
    results.forEach((r, i) => {
      const y = 258 + i * 24;
      const isVram = r.cfg.includes('VRAM');
      const rowC = isVram ? C.VRAM : C.DMA;
      s.appendChild(rect(45, y - 14, 830, 22, rowC, 0.04, rowC, 0.3, 2));
      s.appendChild(txt(cols[0], y, r.cfg, rowC, 10, 'bold'));
      s.appendChild(txt(cols[1], y, r.gpus, C.TEXT, 10));
      s.appendChild(txt(cols[2], y, r.time, C.KEY, 10, 'bold'));
      s.appendChild(txt(cols[3], y, r.vs, isVram ? C.KEY : C.TEXT, 10));
      s.appendChild(txt(cols[4], y, r.vram, C.META, 10, 'normal', 'start', true));
      s.appendChild(txt(cols[5], y, r.disk, isVram ? C.KEY : C.DMA, 10, 'bold'));
      s.appendChild(txt(cols[6], y, r.proof, C.X, 10, 'bold'));
    });

    // VRAM fit table
    s.appendChild(rect(40, 365, 410, 85, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(50, 383, 'VRAM Fit:', C.TEXT, 11, 'bold'));
    const fits = [
      { k: 'k29', total: '70 GiB', fit: '1× PRO 6000 ✓' },
      { k: 'k30', total: '137 GiB', fit: '2× PRO 6000 ✓ (68 GiB each)' },
      { k: 'k31', total: '257 GiB', fit: '4× PRO 6000 ✓ (64 GiB each)' },
    ];
    fits.forEach((f, i) => {
      const y = 400 + i * 18;
      s.appendChild(txt(55, y, f.k, C.VRAM, 10, 'bold'));
      s.appendChild(txt(100, y, f.total, C.META, 10, 'normal', 'start', true));
      s.appendChild(txt(180, y, f.fit, C.KEY, 10, 'bold'));
    });

    // Key insights
    s.appendChild(rect(470, 365, 410, 85, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(480, 383, 'Key Optimizations:', C.TEXT, 11, 'bold'));
    s.appendChild(txt(480, 400, '• C_buckets[dst] skipped at t≥N_TABLE (saves 30 GiB)', C.KEY, 9, 'normal'));
    s.appendChild(txt(480, 415, '• D2D in main loop on stream k (avoids race)', C.KEY, 9, 'normal'));
    s.appendChild(txt(480, 430, '• Pre-allocate chunks (cudaMalloc syncs streams!)', C.KEY, 9, 'normal'));
    s.appendChild(txt(480, 445, '• Multi-GPU: per-bucket cudaSetDevice (no P2P needed)', C.KEY, 9, 'normal'));

    return s;
  },
  info: {
    t: 'VRAM Mode (All-GPU)',
    d: 'All data stays on GPU. Zero PCIe DMA. Zero disk I/O. Multi-GPU for k30/k31.',
    body: `<div class="k">VRAM mode eliminates both the PCIe and disk bottlenecks. Everything stays on GPU.</div>
<h3>Measured Results</h3>
<div class="s">k29 on 1× PRO 6000: 21.1s phase1 (2.1× faster than 45s DMA)</div>
<div class="s">k30 on 2× PRO 6000: 60.4s phase1 (impossible on 1 GPU — needs 137 GiB)</div>
<div class="s">k31 on 4× PRO 6000: 168.4s phase1 (impossible on 1-2 GPUs — needs 257 GiB)</div>
<div class="s">All: zero disk I/O, zero PCIe DMA, proof lookup works</div>
<h3>How it works</h3>
<div class="d">VRAMBucket: chunks stored as Buffer&lt;uint8_t&gt; with MEM_TYPE_DEVICE (GPU memory)</div>
<div class="d">D2D copies on stream k before next compute overwrites working buffers</div>
<div class="d">Pre-allocate all chunks (cudaMalloc mid-async-copy syncs all streams)</div>
<div class="d">Multi-GPU: bucket y assigned to GPU (device + y % NSTREAMS % num_devices)</div>
<h3>Key Fixes</h3>
<div class="d">1. C_buckets[dst] skipped at t≥N_TABLE — table 9 C output never used (saves 30 GiB)</div>
<div class="d">2. D2D in main loop, not download_thread (avoids race with next bucket compute)</div>
<div class="d">3. thread_local g_vram_copy_stream for correct stream ordering</div>
<div class="d">4. download_thread = no-op for VRAM (avoids double-counting bucket_size)</div>
<h3>Multi-GPU (no P2P needed)</h3>
<div class="d">Each GPU stores only its own buckets. Bucket y always on same GPU.</div>
<div class="d">cudaSetDevice in alloc_buckets, pre_alloc, delete_buckets, proof_lookup.</div>
<div class="d">Works on 5090s (no P2P) — each GPU is self-contained.</div>
<div class="k">C metadata = ${META_BYTES} bytes/entry (N_META=14 × 4B). Dominates VRAM.</div>`
  }
};

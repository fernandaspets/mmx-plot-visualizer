// ===== Scene 12: VRAM Mode (All-GPU Plotting) =====
import { SVG_W, C, META_BYTES } from '../constants.js';
import { svg, rect, txt, arrow, line, panel } from '../svg-helpers.js';

export const scene = {
  name: 'VRAM Mode',
  build() {
    const W = SVG_W, H = 420;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'VRAM Mode: All-GPU Plotting (Zero DMA)', C.KEY, 15, 'bold', 'middle'));

    // GPU box (large, containing everything)
    s.appendChild(rect(40, 55, 840, 200, C.VRAM, 0.04, C.VRAM, 2, 8));
    s.appendChild(txt(60, 75, 'GPU (RTX PRO 6000, 96 GB VRAM)', C.VRAM, 13, 'bold'));

    // VRAM bucket layout inside GPU
    const buckets = [
      { n: 'Y_buckets[2]', sz: '2.1 GiB', c: C.Y, desc: 'sorted Y (uint32)' },
      { n: 'C_buckets[2]', sz: '60 GiB', c: C.META, desc: `${META_BYTES}B/entry × 2M × 91` },
      { n: 'PD_buckets[2]', sz: '1.3 GiB', c: C.PD, desc: '5B PD back-pointers' },
      { n: 'PD1_buckets[10]', sz: '6 GiB', c: C.X, desc: 'proof walk-back data' }
    ];
    buckets.forEach((b, i) => {
      const x = 60 + (i % 2) * 200;
      const y = 90 + Math.floor(i / 2) * 55;
      s.appendChild(rect(x, y, 180, 45, b.c, 0.12, b.c, 1, 3));
      s.appendChild(txt(x + 90, y + 15, b.n, b.c, 10, 'bold', 'middle'));
      s.appendChild(txt(x + 90, y + 30, b.sz, C.TEXT, 9, 'normal', 'middle'));
      s.appendChild(txt(x + 90, y + 42, b.desc, C.TEXT, 7, 'normal', 'middle'));
    });

    // D2D flow (internal)
    s.appendChild(txt(460, 210, 'D2D copies on stream k (before next compute)', C.VRAM, 10, 'bold', 'middle'));
    s.appendChild(arrow(200, 220, 700, 220, C.VRAM));

    // Working buffers
    s.appendChild(rect(440, 90, 180, 45, C.F1, 0.08, C.F1, 1, 3));
    s.appendChild(txt(530, 105, 'Working buffers', C.F1, 9, 'bold', 'middle'));
    s.appendChild(txt(530, 120, 'Y_out, C_out, PD_out', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(txt(530, 132, 'reused per bucket', C.TEXT, 7, 'normal', 'middle'));

    // Kernel pipeline
    s.appendChild(rect(440, 145, 180, 50, C.PANEL, 0.6, C.EDGE, 1, 3));
    s.appendChild(txt(530, 160, 'Kernel chain (per bucket)', C.TEXT, 9, 'bold', 'middle'));
    s.appendChild(txt(530, 174, 'scatter→sort→match→eval', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(txt(530, 188, '→D2D copy to VRAMBucket', C.VRAM, 8, 'bold', 'middle'));

    // VRAM requirements table
    s.appendChild(rect(40, 270, 400, 130, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(50, 288, 'VRAM Requirements:', C.TEXT, 11, 'bold'));
    const reqs = [
      { k: 'k27', vram: '~25 GiB', gpu: 'RTX 5090 (32GB) ✓', fits: true },
      { k: 'k28', vram: '~48 GiB', gpu: 'RTX 5090 (32GB) ✗', fits: false },
      { k: 'k29', vram: '~92 GiB', gpu: 'PRO 6000 (96GB) ✓', fits: true }
    ];
    reqs.forEach((r, i) => {
      const c = r.fits ? C.KEY : '#ff4444';
      s.appendChild(rect(50, 298 + i * 28, 380, 24, c, 0.06, c, 0.5, 2));
      s.appendChild(txt(60, 313 + i * 28, r.k, c, 10, 'bold'));
      s.appendChild(txt(120, 313 + i * 28, r.vram, C.META, 10, 'normal', 'start', true));
      s.appendChild(txt(250, 313 + i * 28, r.gpu, c, 10, 'normal', 'start', true));
    });

    // Performance comparison
    s.appendChild(rect(460, 270, 420, 130, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(470, 288, 'Performance (k27 on 5090):', C.TEXT, 11, 'bold'));
    s.appendChild(rect(470, 298, 400, 24, C.DMA, 0.06, C.DMA, 0.5, 2));
    s.appendChild(txt(480, 313, 'DMA: 11.5s phase1, 488 GB PCIe', C.DMA, 10, 'normal', 'start', true));
    s.appendChild(rect(470, 328, 400, 24, C.VRAM, 0.06, C.VRAM, 0.5, 2));
    s.appendChild(txt(480, 343, 'VRAM: 6.0s phase1, ~0 GB PCIe', C.VRAM, 10, 'bold', 'start', true));
    s.appendChild(rect(470, 358, 400, 24, C.KEY, 0.06, C.KEY, 0.5, 2));
    s.appendChild(txt(480, 373, '2× faster. Zero PCIe bottleneck.', C.KEY, 10, 'bold', 'start', true));

    return s;
  },
  info: {
    t: 'VRAM Mode (All-GPU)',
    d: 'All data stays on GPU. Zero PCIe DMA. D2D copies replace D2H/H2D.',
    body: `<div class="k">VRAM mode eliminates the PCIe bottleneck entirely. Everything stays on GPU.</div>
<h3>Architecture</h3>
<div class="d">VRAMBucket class: chunks stored as Buffer&lt;uint8_t&gt; with MEM_TYPE_DEVICE (GPU memory)</div>
<div class="d">upload() = D2D copy from VRAMBucket to GPU working buffer</div>
<div class="d">copy() = D2D copy from GPU working buffer to VRAMBucket (async, stream k)</div>
<div class="d">read() = D2H cudaMemcpy (synchronous, for proof lookup only)</div>
<div class="d">free() = cudaFree all chunks</div>
<h3>Key Fixes (race conditions)</h3>
<div class="d">1. D2D copies queued in MAIN LOOP on stream k, before next compute overwrites C_out</div>
<div class="d">2. Pre-allocate ALL chunks before D2D (cudaMalloc syncs all streams mid-copy!)</div>
<div class="d">3. thread_local g_vram_copy_stream for correct stream ordering</div>
<div class="d">4. download_thread = no-op for VRAM (avoids double-counting bucket_size)</div>
<h3>VRAM Requirements</h3>
<div class="s">C metadata = ${META_BYTES} bytes/entry (N_META=14 × 4B, NOT 14 bytes!)</div>
<div class="s">k29: ~92 GiB. C dominates: 56B × 2M × 91 × 2(src/dst) = 60 GiB</div>
<div class="s">k27: ~25 GiB. k28: ~48 GiB.</div>
<div class="k">2× faster than DMA (6s vs 12s for k27). Zero PCIe traffic.</div>
<h3>Y9 Sort (critical fix)</h3>
<div class="d">At t=N_TABLE+1 (Y9 sort), D2D copy must be in the else branch (t > N_TABLE)</div>
<div class="d">dst = (N_TABLE+1)%2 = 0. Y_buckets[0] holds sorted Y for proof lookup.</div>`
  }
};

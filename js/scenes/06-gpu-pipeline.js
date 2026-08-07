// ===== Scene 6: GPU Pipeline (DMA vs VRAM) =====
import { SVG_W, C } from '../constants.js';
import { svg, rect, txt, arrow, line } from '../svg-helpers.js';

export const scene = {
  name: 'GPU Pipeline',
  build() {
    const W = SVG_W, H = 420;
    const s = svg(W, H);
    s.appendChild(txt(W / 2, 25, 'GPU Pipeline: DMA vs VRAM Mode', C.KEY, 15, 'bold', 'middle'));

    // === DMA Mode (left half) ===
    s.appendChild(txt(230, 55, 'DMA Mode (current)', C.DMA, 13, 'bold', 'middle'));
    s.appendChild(rect(40, 80, 130, 100, C.HDR, 0.12, C.EDGE, 1, 5));
    s.appendChild(txt(105, 100, 'CPU RAM', C.HDR, 12, 'bold', 'middle'));
    s.appendChild(txt(105, 118, 'host buckets', C.TEXT, 9, 'normal', 'middle'));
    s.appendChild(txt(105, 135, '~30 GB total', C.META, 9, 'normal', 'middle'));

    s.appendChild(rect(320, 80, 130, 100, C.STREAM, 0.08, C.EDGE, 1, 5));
    s.appendChild(txt(385, 100, 'GPU', C.STREAM, 12, 'bold', 'middle'));
    s.appendChild(txt(385, 118, 'device buffers', C.TEXT, 9, 'normal', 'middle'));
    s.appendChild(txt(385, 135, 'reused/bucket', C.META, 9, 'normal', 'middle'));

    for (let i = 0; i < 4; i++) {
      const y = 105 + i * 20;
      s.appendChild(txt(50, y + 5, 'S' + i, C.STREAM, 9, 'bold'));
      s.appendChild(arrow(170, y + 5, 320, y + 5, C.STREAM));
      s.appendChild(arrow(320, y + 12, 170, y + 12, C.PD));
    }
    s.appendChild(txt(245, 75, 'PCIe DMA ↑↓', C.DMA, 10, 'bold', 'middle'));
    s.appendChild(txt(245, 195, '~488 GB @ 32 GB/s = 15.3s', C.META, 9, 'normal', 'middle'));

    // Compute box
    s.appendChild(rect(180, 215, 120, 50, C.F1, 0.06, C.EDGE, 1, 4));
    s.appendChild(txt(240, 235, 'GPU Compute', C.F1, 10, 'bold', 'middle'));
    s.appendChild(txt(240, 252, 'scatter→sort→match→eval', C.TEXT, 8, 'normal', 'middle'));
    s.appendChild(rect(80, 280, 320, 28, C.KEY, 0.06, C.KEY, 1, 4));
    s.appendChild(txt(240, 298, 'Phase 1: ~42s (DMA bottleneck)', C.KEY, 11, 'bold', 'middle'));

    // === VRAM Mode (right half) ===
    s.appendChild(txt(690, 55, 'VRAM Mode (--vram)', C.VRAM, 13, 'bold', 'middle'));
    s.appendChild(rect(530, 80, 360, 180, C.VRAM, 0.06, C.EDGE, 1, 5));
    s.appendChild(txt(710, 100, 'GPU VRAM (all data stays here)', C.VRAM, 12, 'bold', 'middle'));

    // VRAM bucket layout
    s.appendChild(rect(550, 115, 70, 30, C.Y, 0.7, C.EDGE, 1, 3));
    s.appendChild(txt(585, 135, 'Y buckets', C.Y, 9, 'bold', 'middle'));
    s.appendChild(rect(630, 115, 70, 30, C.META, 0.6, C.EDGE, 1, 3));
    s.appendChild(txt(665, 135, 'C buckets', C.META, 9, 'bold', 'middle'));
    s.appendChild(rect(710, 115, 70, 30, C.PD, 0.6, C.EDGE, 1, 3));
    s.appendChild(txt(745, 135, 'PD buckets', C.PD, 9, 'bold', 'middle'));
    s.appendChild(rect(790, 115, 80, 30, C.X, 0.7, C.EDGE, 1, 3));
    s.appendChild(txt(830, 135, 'PD1 buckets', C.X, 8, 'bold', 'middle'));

    // D2D arrow (internal to GPU)
    s.appendChild(txt(710, 165, 'D2D copies (stream k → VRAMBucket)', C.VRAM, 9, 'bold', 'middle'));
    s.appendChild(arrow(600, 175, 820, 175, C.VRAM));
    s.appendChild(txt(710, 195, 'NO PCIe! Zero DMA traffic', C.KEY, 10, 'bold', 'middle'));
    s.appendChild(txt(710, 215, 'k29 needs ~70 GiB VRAM', C.META, 9, 'normal', 'middle'));
    s.appendChild(txt(710, 235, 'PRO 6000 (96GB) fits k29', C.TEXT, 9, 'normal', 'middle'));

    s.appendChild(rect(530, 280, 360, 28, C.KEY, 0.06, C.KEY, 1, 4));
    s.appendChild(txt(710, 298, 'Phase 1: ~21s k29 (2.1× faster, zero DMA)', C.KEY, 11, 'bold', 'middle'));

    // Comparison
    s.appendChild(rect(40, 330, 840, 65, C.PANEL, 0.5, C.EDGE, 1, 4));
    s.appendChild(txt(50, 348, 'Measured (PRO 6000, full power):', C.TEXT, 11, 'bold'));
    s.appendChild(txt(50, 366, 'k29 DMA: ~45s phase1, 488 GB PCIe', C.DMA, 10, 'normal', 'start', true));
    s.appendChild(txt(50, 382, 'k29 VRAM: 21.1s phase1, 0 GB PCIe (2.1× faster)', C.VRAM, 10, 'normal', 'start', true));
    s.appendChild(txt(470, 366, 'k30 VRAM: 60.4s on 2× PRO 6000 (proof found!)', C.VRAM, 10, 'normal', 'start', true));
    s.appendChild(txt(470, 382, 'k31 VRAM: 168.4s on 4× PRO 6000 (2.1B entries)', C.VRAM, 10, 'normal', 'start', true));

    return s;
  },
  info: {
    t: 'GPU Pipeline (Phase 1)',
    d: 'DMA mode: RAM↔GPU via PCIe. VRAM mode: everything on GPU, zero DMA.',
    body: `<div class="k">4 CUDA streams run in parallel. Each stream processes every 4th main bucket.</div>
<h3>DMA Mode (original)</h3>
<div class="d">1. Upload: RAM bucket → GPU device buffer (PCIe DMA, upload thread)</div>
<div class="d">2. Compute: GPU kernels (scatter, sort, match, eval, write)</div>
<div class="d">3. Download: GPU device buffer → RAM bucket (PCIe DMA, download thread)</div>
<div class="s">NSTREAMS=4 (sweet spot). DMA: ~488 GB @ PCIe4 32GB/s = 15.3s floor.</div>
<div class="s">Measured: 28.7s for tables 2-9 (89% pipeline efficiency)</div>
<h3>VRAM Mode (--vram)</h3>
<div class="d">All data stays on GPU as VRAMBucket objects (MEM_TYPE_DEVICE).</div>
<div class="d">D2D copies replace D2H/H2D DMA. Zero PCIe traffic.</div>
<div class="d">VRAMBucket::upload() = D2D to GPU buffer, copy() = D2D from GPU buffer, read() = D2H (proof lookup only).</div>
<div class="k">VRAM: 2× faster (6s vs 12s for k27). Zero DMA = no PCIe bottleneck.</div>
<h3>VRAM Race Condition (solved)</h3>
<div class="d">D2D copies must be queued on the SAME stream as compute, BEFORE next bucket's compute overwrites C_out.</div>
<div class="d">Fix: D2D in main loop (not download_thread) + pre-allocate chunks (cudaMalloc syncs all streams).</div>
<div class="s">VRAM needs: k27=25 GiB, k28=48 GiB, k29=70 GiB, k30=137 GiB, k31=257 GiB.</div>`
  }
};

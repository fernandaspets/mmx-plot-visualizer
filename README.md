# MMX Plot Visualizer

Interactive SVG visualization of the MMX Proof-of-Space plotting process. Built for deep technical understanding through visual exploration.

## Run

```bash
cd ~/mmx-plot-visualizer
python3 serve.py [port]    # default port 8765
```

Then open `http://localhost:port` in your browser.

## Architecture (Modular)

```
mmx-plot-visualizer/
├── index.html              # Entry point (loads ES modules)
├── css/
│   └── style.css           # Dark theme, animations, responsive
├── js/
│   ├── constants.js        # k=29 params, colors, entry counts
│   ├── svg-helpers.js      # SVG creation utilities (el, rect, txt, line, arrow, circle, grid)
│   ├── scene-manager.js     # Navigation, auto-play, rendering
│   └── scenes/
│       ├── 01-plot-file.js     # Plot file structure (14.6 GB layout)
│       ├── 02-f1.js            # F1: memory-hard PoW (Table 1)
│       ├── 03-match-eval.js     # Match + Eval: core operation (Y,Y+1 → SHA512)
│       ├── 04-tables.js        # Tables 1-9: forest of 536M binary trees
│       ├── 05-bucketing.js     # Two-level bucket structure (64 × 16384)
│       ├── 06-gpu-pipeline.js  # GPU pipeline: DMA vs VRAM mode
│       ├── 07-phase2-remap.js  # Phase 2: position compaction (mark_used → remap)
│       ├── 08-phase2-parks.js  # Phase 2: park encoding (Y/PD/X parks, ANS)
│       ├── 09-binary-tree.js   # Binary tree proof structure (depth 8)
│       ├── 10-proof-lookup.js # Proof lookup: Y scan → PD walk → X park
│       ├── 11-verification.js  # Proof verification: recompute tree from X
│       ├── 12-vram-mode.js     # VRAM mode: all-GPU plotting (zero DMA)
│       ├── 13-proof-anatomy.js # Proof anatomy: quality vs score, three gates
│       └── 14-hash-chain.js    # Hash chain: seed → plot_id → challenge
├── serve.py                 # Simple HTTP server
└── .github/workflows/deploy.yml  # GitHub Pages deployment
```

### Adding/Editing Scenes

Each scene is a standalone ES module exporting a `scene` object:

```js
export const scene = {
  name: 'Scene Title',
  build() {
    // Returns an SVG element
    const s = svg(W, H);
    // ... build SVG ...
    return s;
  },
  info: {
    t: 'Info Title',
    d: 'Short description',
    body: `<h3>Section</h3><div class="d">Details</div>`
  }
};
```

To add a new scene: create `js/scenes/NN-name.js`, import it in `index.html`, add to `scenes` array.

## 14 Scenes

| # | Scene | Key Concepts |
|---|-------|-------------|
| 1 | Plot File | 14.6 GB layout: Y(1%) + PD[0-6](79%) + X(20%) |
| 2 | F1: Table 1 | Memory-hard PoW: 4KB memory, 256-iter random access, SHA512 |
| 3 | Match + Eval | (Y, Y+1) → SHA512 → new entry + PD back-pointer (40-bit) |
| 4 | Tables 1-9 | Forest of 536M binary trees. NOT a funnel. src/dst double-buffering |
| 5 | Bucketing | Two-level: 64 main × 16384 sub-buckets. Parallel sorting |
| 6 | GPU Pipeline | DMA mode (PCIe bottleneck) vs VRAM mode (zero DMA, 2× faster) |
| 7 | Phase 2: Remap | mark_used bitfield → popcount → compact 29-bit indices |
| 8 | Phase 2: Parks | Delta-encode → ANS-encode → park file. Y/PD/X park formats |
| 9 | Binary Tree | Depth-8 perfect tree: 1 root → 256 X leaves. 7 PD doublings |
| 10 | Proof Lookup | Y scan (binary search) → PD walk (7 levels) → X park read |
| 11 | Verification | Recompute F1→F9 from 256 X values. O(256) = milliseconds |
| 12 | VRAM Mode | All-GPU plotting. VRAMBucket, D2D copies, race conditions |
| 13 | Proof Anatomy | Quality hash (threshold) vs score hash (block competition). Three gates |
| 14 | Hash Chain | plot_id derivation, plot_challenge, plot_filter vs post_filter |

## Color Legend

| Color | Data Type |
|-------|-----------|
| 🔴 Red | F1 / PoW / seed |
| 🔵 Cyan | Y values (sorted) |
| 🟠 Orange | C / Meta (56 bytes = N_META×4) |
| 🟣 Purple | PD back-pointers (40-bit: position[30] + delta[5]) |
| 🟢 Green | X values (proof output) |
| 🟡 Yellow | CUDA streams / data flow |
| 🟠 Orange-red | VRAM / GPU memory |
| 🔵 Blue | DMA / PCIe |
| 💗 Pink | Quality hash (threshold gate) |
| 🔷 Light blue | Score hash (block competition) |
| 🟢 Teal | Key insights |

## Technical

- ES modules (no build step, works on GitHub Pages)
- Pure SVG visualization (no canvas, no WebGL)
- CSS animations (pulse, flow, fade-in, glow)
- All data from MMX CUDA plotter source analysis

## Data Sources

All bit layouts, kernel descriptions, and performance data derived from actual MMX CUDA plotter source code analysis.

# MMX Plot Visualizer

Interactive 3D visualization of the MMX Proof-of-Space plotting process, inspired by [bbycroft.net/llm](https://bbycroft.net/llm).

## Run

```bash
cd ~/mmx-plot-visualizer
python3 serve.py [port]    # default port 8765
```

Then open `http://localhost:8765` in your browser.

## What it shows

A 3D scene with 9 tables stacked vertically, representing the MMX PoSpace plot pipeline:

- **Table 1 (F1)**: Memory-hard PoW — `gen_mem_array` (32 rounds), `calc_mem_hash` (256-iter random access), `scatter_t1`
- **Tables 2-9**: `match_p1` (find Y, Y+1 pairs) → `eval_p1_tx` (SHA512 hash, scatter to next table)
- **Phase 2**: Park encoding (Y delta parks, PD bit-packed parks, X parks) → plot file
- **Proof Lookup**: Challenge → Y scan (16-wide window) → PD walk (9→2) → 256 X values

## Controls

- **Drag**: Rotate camera
- **Scroll**: Zoom
- **Click**: Click on table spheres to inspect data structures and bit layouts
- **▶ Walkthrough**: Auto-play 13-step walkthrough with camera animation
- **Phase 1 / Phase 2 / Proof Lookup**: Jump to specific sections
- **⏸ Pause**: Pause particle animations

## Color Legend

| Color | Data Type |
|-------|-----------|
| 🔴 Red | F1 / Challenge |
| 🔵 Cyan | Y values (sorted) |
| 🟠 Orange | C / Meta (hash output) |
| 🟣 Purple | PD back-pointers (30-bit pos + 5-bit delta) |
| 🟢 Green | X values (proof output) |
| ⚪ Gray | Match pairs (Y, Y+1) |

## Technical

- Single HTML file, no build step
- Three.js r160 loaded from CDN (ES modules)
- InstancedMesh for bucket grids (256 buckets as 16×16 grid)
- Particle system for animated data flow between tables
- Raycasting for click-to-inspect
- All bit format documentation from kernel source analysis (`Node_phase1.cu`)

## Data Sources

All bit layouts and kernel descriptions are derived from the actual MMX CUDA plotter source code analysis, logged in `~/mmx-research/research.db` (plot_format table, entries 9-14).

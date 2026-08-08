// ===== Scene 15: Interactive Playground — a real miniature plot in your browser =====
// Faithful to the reference spec: sort by Y, match ALL pairs with Y_R = Y_L + 1, fresh Y per
// pair hashed from 64-bit metadata (the entropy carrier, like the real 56-byte C meta), 8
// pairing levels, plot_filter gate (1/16), tree walk-back to 2^8 = 256 X values (tree order —
// real proofs are NOT X-sorted), forward re-verification. Only the hash is simplified
// (labeled on screen): real F1 is a 4KB memory-hard loop — minutes in a browser.
//
// Honest toy-scale caveat, taught in the info panel: at k=10 the plot is a CRITICAL branching
// process — table size follows n' = n²/1024, so any downward fluctuation compounds and the
// plot usually fizzles before T9. Real k=29 survives because fluctuations are ~1/√2²⁹.
// The seed picker therefore offers pre-screened survivors (and free entry is allowed —
// a fizzled or runaway seed is reported honestly, with a cap for safety).
import { SVG_W, C } from '../constants.js';

const K = 10;                    // toy k: 1024 X values
const KMASK = (1 << K) - 1;
const LEVELS = 8;                // pairing levels → T9-equivalent, 256-leaf proofs
const RANGE = 16;                // challenge range = 2^plot_filter, same as mainnet
const TABLE_CAP = 2500;          // runaway guard for critical branching explosions

// --- deterministic toy hash (splitmix64 finalizer) ---
function mix(a) {
  a = BigInt.asUintN(64, a);
  a = BigInt.asUintN(64, (a ^ (a >> 30n)) * 0xBF58476D1CE4E5B9n);
  a = BigInt.asUintN(64, (a ^ (a >> 27n)) * 0x94D049BB133111EBn);
  return a ^ (a >> 31n);
}
// entries carry a 64-bit meta — the entropy carrier, like the real 56-byte C metadata
const leaf = (s, x) => { const m = mix((s << 32n) | BigInt(x)); return { m, y: Number(m & BigInt(KMASK)), x }; };
const pair = (t, ml, mr) => { const m = mix(ml ^ mr ^ BigInt(t) * 0x9E3779B97F4A7C15n); return { m, y: Number(m & BigInt(KMASK)) }; };
// plot_filter: 1/16 gate on (plot_id, challenge) — the real first lottery
const toyPlotFilter = (s, c) => Number(mix(s ^ BigInt(c) ^ 0x9E3779B97F4A7C15n) & 15n) === 0;

// pre-screened seeds whose toy plots survive all 8 levels (critical-branching survivors)
const GOOD_SEEDS = [9, 10, 12, 18, 23, 28, 41, 51, 55, 60, 62, 65, 72, 84, 90, 104, 105, 112, 119, 131];

export const scene = {
  name: 'Interactive Playground',
  interactive: true,
  build() {
    const root = document.createElement('div');
    root.style.cssText = 'max-width:920px;margin:0 auto;color:#c8d4e8;font:13px/1.5 monospace';

    // ---------- controls ----------
    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;gap:10px;align-items:center;padding:10px;background:#0c1018;border:1px solid #2a3858;border-radius:6px;flex-wrap:wrap';
    bar.innerHTML =
      `<span style="color:#ff4466;font-weight:bold">seed:</span>` +
      `<input id="pg-seed" value="12" style="width:90px;background:#141a28;border:1px solid #2a3858;color:#44ff88;padding:4px 8px;border-radius:4px;font:13px monospace">` +
      `<button id="pg-lucky" title="random pre-screened survivor seed" style="background:#8844cc;border:0;color:#fff;padding:5px 10px;border-radius:4px;cursor:pointer">🍀 survivor seed</button>` +
      `<button id="pg-build" style="background:#20b898;border:0;color:#fff;padding:5px 14px;border-radius:4px;cursor:pointer;font-weight:bold">⚒ Build plot</button>` +
      `<button id="pg-chal" disabled style="background:#4488ff;border:0;color:#fff;padding:5px 14px;border-radius:4px;cursor:pointer;font-weight:bold;opacity:0.4">🎲 Grind challenges</button>` +
      `<span id="pg-status" style="color:#687888;margin-left:auto">build a plot to begin</span>`;
    root.appendChild(bar);

    // ---------- tables row (T1 leaves + 8 pairing levels) ----------
    const trow = document.createElement('div');
    trow.style.cssText = 'display:flex;gap:5px;margin-top:10px';
    const tEls = [];
    for (let t = 1; t <= LEVELS + 1; t++) {
      const d = document.createElement('div');
      d.style.cssText = 'flex:1;background:#0c1018;border:1px solid #2a3858;border-radius:5px;padding:6px 2px;text-align:center;transition:border-color .2s';
      d.innerHTML = `<div style="color:#44ddff;font-weight:bold;font-size:12px">T${t}</div><div class="cnt" style="color:#687888;font-size:10px">—</div>`;
      trow.appendChild(d);
      tEls.push(d);
    }
    root.appendChild(trow);

    // ---------- log ----------
    const log = document.createElement('div');
    log.style.cssText = 'margin-top:10px;background:#0c1018;border:1px solid #2a3858;border-radius:6px;padding:10px;height:140px;overflow-y:auto;font-size:12px';
    log.innerHTML = '<div style="color:#687888">// plot build log will appear here</div>';
    root.appendChild(log);

    // ---------- tree + verify stage ----------
    const stage = document.createElement('div');
    stage.style.cssText = 'margin-top:10px;display:flex;gap:10px';
    const treeBox = document.createElement('div');
    treeBox.style.cssText = 'flex:1.4;background:#0c1018;border:1px solid #2a3858;border-radius:6px;padding:8px;min-height:215px';
    treeBox.innerHTML = '<div style="color:#687888">proof tree (walk-back) will be drawn here</div>';
    const verBox = document.createElement('div');
    verBox.style.cssText = 'flex:1;background:#0c1018;border:1px solid #2a3858;border-radius:6px;padding:8px;min-height:215px';
    verBox.innerHTML = '<div style="color:#687888">verification checklist will appear here</div>';
    stage.appendChild(treeBox);
    stage.appendChild(verBox);
    root.appendChild(stage);

    // ---------- state ----------
    let tables = null;   // tables[0]=leaves {m,y,x}; tables[t]={m,y,l,r}
    let seed = 0n;
    let grinding = false;

    const say = (html, col) => {
      const d = document.createElement('div');
      d.innerHTML = html;
      if (col) d.style.color = col;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
    };
    const status = (s) => { bar.querySelector('#pg-status').textContent = s; };
    const chalBtn = () => bar.querySelector('#pg-chal');

    function buildPlot() {
      seed = BigInt(parseInt(bar.querySelector('#pg-seed').value || '0') >>> 0);
      grinding = false;
      tables = [[]];
      for (let x = 0; x < (1 << K); x++) tables[0].push(leaf(seed, x));
      tEls[0].querySelector('.cnt').textContent = (1 << K) + ' entries';
      tEls[0].style.borderColor = '#44ddff';
      let dead = -1, exploded = false;
      for (let t = 1; t <= LEVELS; t++) {
        const prev = tables[t - 1].slice().sort((a, b) => a.y - b.y);
        tables[t - 1] = prev;
        const next = [];
        let ops = 0;
        for (let i = 0; i < prev.length; i++) {
          for (let j = i + 1; j < prev.length && prev[j].y <= prev[i].y + 1; j++) {
            if (prev[j].y === prev[i].y + 1) {
              const p = pair(t, prev[i].m, prev[j].m);
              p.l = i; p.r = j;
              next.push(p);
            }
            if (++ops > 200000) { exploded = true; break; }
          }
          if (exploded) break;
        }
        if (exploded || next.length === 0 || next.length > TABLE_CAP) { dead = t; break; }
        tables.push(next);
        tEls[t].querySelector('.cnt').textContent = next.length + ' entries';
        tEls[t].style.borderColor = '#44ddff';
      }
      if (dead > 0) {
        const why = exploded || (tables[dead - 1] && tables[dead - 1].length > TABLE_CAP) ? 'ran away (density &gt; 1 explosion)' : 'fizzled out';
        say(`✖ plot ${why} at T${dead + 1} — toy-scale critical branching (see info below). Try a 🍀 survivor seed.`, '#ff4466');
        status(`plot died at T${dead + 1} — pick a survivor seed`);
        return;
      }
      const sizes = tables.map(t => t.length);
      say(`⚒ plot built: [${sizes.join(' → ')}]`, '#20b898');
      say(`&nbsp;&nbsp;note the decay — at k=10 tables follow n′=n²/1024 (critical branching). Real k=29 holds ≈2²⁹ constant: fluctuations are ~1/√2²⁹`, '#687888');
      const t9 = tables[LEVELS].length;
      status(`plot ready — T9 has ${t9} entries in a ${1 << K}-wide Y space`);
      chalBtn().disabled = false;
      chalBtn().style.opacity = 1;
    }

    function grind() {
      if (grinding) return;
      grinding = true;
      let tries = 0;
      const t9 = tables[LEVELS];
      const step = () => {
        if (!grinding) return;
        tries++;
        if (!toyPlotFilter(seed, tries)) {
          if (tries % 3 === 0 || tries === 1)
            say(`🎲 challenge #${tries}: plot_filter ✗ <span style="color:#687888">(1/16 gate on plot_id — the first lottery)</span>`, '#687888');
          setTimeout(step, 80);
          return;
        }
        const yBegin = Math.floor(Math.random() * ((1 << K) - RANGE));
        const hits = t9.filter(e => e.y >= yBegin && e.y < yBegin + RANGE);
        if (hits.length === 0) {
          say(`🎯 challenge #${tries}: plot_filter ✓ but range [${yBegin}..${yBegin + RANGE - 1}] holds <b>0</b> T9 entries — keep grinding`, '#ffaa44');
          setTimeout(step, 150);
          return;
        }
        say(`🎯 challenge #${tries}: <b>plot_filter ✓</b> after ${tries} challenges`, '#ffee44');
        say(`&nbsp;&nbsp;range [${yBegin}..${yBegin + RANGE - 1}] holds <b>${hits.length}</b> T9 match(es) → that many proof candidates`, '#20b898');
        say(`&nbsp;&nbsp;on mainnet each candidate still faces the 1/1024 post_filter + threshold (scenes 13–14). Walking back the first one:`, '#687888');
        status(`proof candidate · ${hits.length} matches · ${tries} challenges`);
        grinding = false;
        walkBack(hits[0], yBegin);
      };
      step();
    }

    // walk the match tree back to the 256 leaves (tree order — real proofs are NOT X-sorted)
    function walkBack(hit, yBegin) {
      const xs = [];
      (function rec(t, e) {
        if (t === 0) { xs.push(e.x); return; }
        rec(t - 1, tables[t - 1][e.l]);
        rec(t - 1, tables[t - 1][e.r]);
      })(LEVELS, hit);

      // --- draw the binary tree ---
      const W = 470, H = 195;
      let svg = `<svg width="${W}" height="${H}" style="display:block">`;
      const counts = [];
      for (let t = 0; t <= LEVELS; t++) counts.push(1 << (LEVELS - t));
      const pos = (t, idx, n) => [20 + idx * (W - 40) / Math.max(n - 1, 1), 12 + t * (H - 30) / LEVELS];
      for (let t = LEVELS; t >= 1; t--) {
        for (let i = 0; i < counts[t - 1]; i++) {
          const [cx, cy] = pos(t - 1, i, counts[t - 1]);
          const [px, py] = pos(t, Math.floor(i / 2), counts[t]);
          svg += `<line x1="${px}" y1="${py}" x2="${cx}" y2="${cy}" stroke="#2a3858" stroke-width="0.6"/>`;
        }
      }
      for (let t = 0; t <= LEVELS; t++) {
        const n = counts[t];
        const col = t === 0 ? '#44ff88' : (t === LEVELS ? '#ffee44' : '#44ddff');
        for (let i = 0; i < n; i++) {
          const [x, y] = pos(t, i, n);
          const r = t === 0 ? 1.5 : (t === LEVELS ? 5 : Math.max(4 - t * 0.35, 2));
          svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
        }
      }
      svg += `<text x="${W / 2}" y="${H - 2}" fill="#687888" font-size="10" text-anchor="middle">256 X leaves (green) → 8 pairing levels → 1 root (yellow, Y=${hit.y})</text></svg>`;
      treeBox.innerHTML = `<div style="color:#20b898;font-weight:bold;margin-bottom:4px">walk-back: matched pair → its 2⁸ = 256 leaf X values</div>` + svg +
        `<div style="color:#687888;font-size:11px">first 8 X values (tree order — real proofs are not X-sorted):<br><span style="color:#44ff88">${xs.slice(0, 8).join(', ')} …</span></div>`;

      // --- forward verification (what every node replays) ---
      verBox.innerHTML = `<div style="color:#20b898;font-weight:bold;margin-bottom:4px">verify — what every node replays</div><div id="pg-vlist"></div>`;
      const vl = verBox.querySelector('#pg-vlist');
      const checks = [];
      let level = xs.map(x => leaf(seed, x));
      checks.push(`256 × F1(X) recomputed`);
      let ok = true;
      for (let t = 1; t <= LEVELS && ok; t++) {
        const next = [];
        for (let i = 0; i + 1 < level.length; i += 2) {
          if (level[i + 1].y !== level[i].y + 1) { ok = false; break; }
          next.push(pair(t, level[i].m, level[i + 1].m));
        }
        if (ok) checks.push(`level ${t}: ${level.length / 2} pair checks Y<sub>R</sub>=Y<sub>L</sub>+1 ✓`);
        level = next;
      }
      const inRange = ok && level.length === 1 && level[0].y === hit.y && hit.y >= yBegin && hit.y < yBegin + RANGE;
      checks.push(`root Y=${level.length ? level[0].y : '—'} ∈ [${yBegin}..${yBegin + RANGE - 1}] ${inRange ? '✓' : '✗'}`);
      checks.push(inRange
        ? `<b style="color:#44ff88">PROOF VALID</b> — on mainnet this is 2 KiB on the wire`
        : `<b style="color:#ff4466">PROOF INVALID</b>`);
      let i = 0;
      const showNext = () => {
        if (i >= checks.length) return;
        const d = document.createElement('div');
        d.style.cssText = 'padding:2px 0;color:#c8d4e8;font-size:12px';
        d.innerHTML = (i === checks.length - 1 ? '' : '✓ ') + checks[i];
        vl.appendChild(d);
        i++;
        setTimeout(showNext, 300);
      };
      showNext();
    }

    bar.querySelector('#pg-build').onclick = () => {
      log.innerHTML = '';
      treeBox.innerHTML = '<div style="color:#687888">proof tree (walk-back) will be drawn here</div>';
      verBox.innerHTML = '<div style="color:#687888">verification checklist will appear here</div>';
      tEls.forEach(d => { d.querySelector('.cnt').textContent = '—'; d.style.borderColor = '#2a3858'; });
      chalBtn().disabled = true;
      chalBtn().style.opacity = 0.4;
      buildPlot();
    };
    bar.querySelector('#pg-chal').onclick = grind;
    bar.querySelector('#pg-lucky').onclick = () => {
      bar.querySelector('#pg-seed').value = GOOD_SEEDS[Math.floor(Math.random() * GOOD_SEEDS.length)];
    };

    return root;
  },
  info: {
    t: 'Interactive Playground — a real plot, built live',
    d: 'Everything from scenes 1–14, running for real at toy scale (k=10 instead of 29).',
    body: `<h3>What is exact, what is simplified</h3>
<div class="d"><b>Exact:</b> sort by Y · match every Y<sub>R</sub>=Y<sub>L</sub>+1 pair · fresh Y per pair hashed from lineage metadata · 8 pairing levels · plot_filter 1/16 gate · walk-back to 2⁸=256 X values · forward re-verification of every pairing.</div>
<div class="d"><b>Simplified:</b> the hash. Real F1 is a memory-hard 4KB random-access loop (~minutes in a browser even at k=10); a fast 64-bit mixer stands in. Bucketing is a global sort (equivalent at this scale).</div>
<h3>The honest toy-scale caveat (a lesson in itself)</h3>
<div class="d">At k=10 the plot is a <b>critical branching process</b>: each table's size follows n′ ≈ n²/1024, so any downward fluctuation compounds — most random seeds fizzle before T9, a few run away. The 🍀 button picks pre-screened survivor seeds.</div>
<div class="d">Real k=29 doesn't fizzle: the same rule is n′ ≈ n²/2²⁹ with n = 2²⁹ — relative fluctuations are ~1/√2²⁹ ≈ 0.003%, so every table holds ≈ 537M entries (scene 4's measured counts).</div>
<h3>Try this</h3>
<div class="d">1. Build seed 12 → grind challenges. Count the plot_filter ✗ misses before a ✓ — ~16 tries, the first lottery of farming.</div>
<div class="d">2. Rebuild the same seed — identical tables. Plots are deterministic: the seed <i>is</i> the plot.</div>
<div class="d">3. Type a random seed — it will probably fizzle. Now you know why k=29 is the minimum.</div>
<div class="k">A proof is 256 X values (2 KiB). The verifier never sees the plot — it replays the tree from the X values and checks every pairing. Only a tree that passes these checks counts, however it was produced.</div>`
  }
};

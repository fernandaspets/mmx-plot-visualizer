// ===== Scene 16: Verify a Real Mainnet Block — the actual consensus code, in JS =====
// Uses js/posreal.js: a 1:1 port of mmx-node's mem_hash.cpp / verify.cpp / verify_full.cpp /
// utils.h. The two embedded proofs won real mainnet blocks (fetched from a synced node).
// Every check you see is the exact computation every MMX node ran when the block was published.
import { C } from '../constants.js';
import { verifyRealProof, f1, computeFull } from '../posreal.js';
import MAINNET_PROOFS from '../mainnet-proofs.js';

export const scene = {
  name: 'Verify a Real Block',
  interactive: true,
  build() {
    const root = document.createElement('div');
    root.style.cssText = 'max-width:920px;margin:0 auto;color:#c8d4e8;font:13px/1.5 monospace';

    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;gap:10px;align-items:center;padding:10px;background:#0c1018;border:1px solid #2a3858;border-radius:6px;flex-wrap:wrap';
    bar.innerHTML =
      `<span style="color:#20b898;font-weight:bold">mainnet block:</span>` +
      MAINNET_PROOFS.map((v, i) =>
        `<button class="pgblk" data-i="${i}" style="background:#141a28;border:1px solid #4488ff;color:#c8d4e8;padding:5px 12px;border-radius:4px;cursor:pointer">#${v.height} (k${v.ksize})</button>`
      ).join('') +
      `<button id="rv-run" style="background:#20b898;border:0;color:#fff;padding:5px 16px;border-radius:4px;cursor:pointer;font-weight:bold">▶ Verify</button>` +
      `<span id="rv-status" style="color:#687888;margin-left:auto">pick a block, press verify</span>`;
    root.appendChild(bar);

    const meta = document.createElement('div');
    meta.style.cssText = 'margin-top:10px;background:#0c1018;border:1px solid #2a3858;border-radius:6px;padding:10px;font-size:12px;color:#687888';
    root.appendChild(meta);

    const list = document.createElement('div');
    list.style.cssText = 'margin-top:10px;background:#0c1018;border:1px solid #2a3858;border-radius:6px;padding:12px;min-height:230px';
    list.innerHTML = '<div style="color:#687888">// verification steps will appear here</div>';
    root.appendChild(list);

    const verdict = document.createElement('div');
    verdict.style.cssText = 'margin-top:10px;padding:14px;border-radius:6px;text-align:center;font-size:16px;font-weight:bold;display:none';
    root.appendChild(verdict);

    let sel = 0;
    const showMeta = (v) => {
      meta.innerHTML =
        `<span style="color:#44ddff">block #${v.height}</span> · ksize ${v.ksize} · space_diff ${v.space_diff} · ` +
        `plot_id <span style="color:#44ff88">${v.plot_id.slice(0, 16)}…</span> · ` +
        `proof = ${v.xs.length} X values (${v.xs.length * 4} bytes)`;
    };
    const setSel = (i) => {
      sel = i;
      bar.querySelectorAll('.pgblk').forEach(b => {
        b.style.background = (+b.dataset.i === i) ? '#4488ff' : '#141a28';
        b.style.color = (+b.dataset.i === i) ? '#fff' : '#c8d4e8';
      });
      showMeta(MAINNET_PROOFS[i]);
    };
    bar.querySelectorAll('.pgblk').forEach(b => b.onclick = () => setSel(+b.dataset.i));
    setSel(0);

    bar.querySelector('#rv-run').onclick = () => {
      const v = MAINNET_PROOFS[sel];
      list.innerHTML = '';
      verdict.style.display = 'none';
      const status = bar.querySelector('#rv-status');
      status.textContent = 'running…';
      const t0 = performance.now();
      // let the UI paint before the ~150ms synchronous compute
      setTimeout(() => {
        let allOk = true;
        verifyRealProof(v, s => {
          const d = document.createElement('div');
          d.style.cssText = 'padding:4px 2px;border-bottom:1px solid #141a28';
          d.innerHTML = `<span style="color:${s.ok ? '#44ff88' : '#ff4466'};font-weight:bold">${s.ok ? '✓' : '✗'}</span> ` +
            `<span style="color:#c8d4e8">${s.name}</span> <span style="color:#687888">— ${s.detail}</span>`;
          list.appendChild(d);
          if (!s.ok) allOk = false;
        });
        const dt = ((performance.now() - t0) / 1000).toFixed(2);
        status.textContent = `done in ${dt}s — pure JS, zero trust`;
        verdict.style.display = 'block';
        if (allOk) {
          verdict.style.background = '#0d2b1a';
          verdict.style.border = '1px solid #44ff88';
          verdict.style.color = '#44ff88';
          verdict.innerHTML = `✓ PROOF VALID — this exact math ran on every MMX node when block #${v.height} was published`;
        } else {
          verdict.style.background = '#2b0d0d';
          verdict.style.border = '1px solid #ff4466';
          verdict.style.color = '#ff4466';
          verdict.textContent = '✗ PROOF INVALID';
        }
      }, 30);
    };

    return root;
  },
  info: {
    t: 'Verify a Real Mainnet Block',
    d: 'The actual MMX consensus verification, ported line-by-line to JavaScript, running on real winning proofs.',
    body: `<h3>What just happened</h3>
<div class="d">Your browser recomputed <b>256 × F1</b> (the memory-hard hash from scene 2), rebuilt the 8-level pairing tree with the real sort/match/eval rules, and ran every consensus check — in ~0.1s, with no server involved.</div>
<h3>The checks (mmx-node source)</h3>
<div class="d"><b>plot_filter</b> — utils.h <span class="c">check_plot_filter</span>: 1/16 gate on (plot_id, challenge).</div>
<div class="d"><b>plot_challenge</b> — utils.h <span class="c">get_plot_challenge</span>: binds the proof to this challenge.</div>
<div class="d"><b>tree + Y range</b> — verify_full.cpp <span class="c">compute_full</span> + verify.cpp: 8 pairing levels, final Y must land in the 16-wide challenge range.</div>
<div class="d"><b>canonical X order</b> — verify.cpp: the proof must be in the one true walk-back order (no malleability).</div>
<div class="d"><b>post_filter</b> — verify.cpp <span class="c">check_post_filter</span>: 1/1024 quality gate on the final metadata.</div>
<div class="d"><b>threshold</b> — utils.h <span class="c">check_proof_threshold</span>: the difficulty-scaled lottery. Watch the ratio — 0.94× means that block's winner nearly failed!</div>
<h3>Why this matters</h3>
<div class="k">A proof is 256 numbers. Everything else — the 39 GiB plot, the GPU pipeline, the bucketing — exists only to <i>find</i> those numbers. Verification is deliberately asymmetric: ~hours to make (or seconds on a big GPU), ~0.1s to check, on hardware as humble as a browser tab.</div>
<div class="s">Source: js/posreal.js — 1:1 port of mem_hash.cpp, verify.cpp, verify_full.cpp, utils.h. Validated against live mainnet headers.</div>`
  }
};

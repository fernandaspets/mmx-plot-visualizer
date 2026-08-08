// ===== posreal.js — REAL MMX PoSpace proof verification, pure JS =====
// 1:1 port of mmx-node: src/pos/mem_hash.cpp, src/pos/verify.cpp, src/pos/verify_full.cpp,
// include/mmx/utils.h. No simplifications — this is the exact computation every node runs.
// Tested against real mainnet blocks (see scene 16).

// ---------- SHA-256 (pure JS) ----------
const S256K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);

export function sha256(data) {
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const len = data.length;
  const padLen = ((len + 9 + 63) >> 6) << 6;
  const msg = new Uint8Array(padLen);
  msg.set(data);
  msg[len] = 0x80;
  const dv = new DataView(msg.buffer);
  dv.setUint32(padLen - 4, len * 8, false);
  const w = new Uint32Array(64);
  const rotr = (v, b) => ((v >>> b) | (v << (32 - b))) >>> 0;
  for (let off = 0; off < padLen; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + S256K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) odv.setUint32(i * 4, H[i], false);
  return out;
}

// ---------- SHA-512 (BigInt) ----------
const M64 = 0xFFFFFFFFFFFFFFFFn;
const S512K = [
  0x428a2f98d728ae22n, 0x7137449123ef65cdn, 0xb5c0fbcfec4d3b2fn, 0xe9b5dba58189dbbcn,
  0x3956c25bf348b538n, 0x59f111f1b605d019n, 0x923f82a4af194f9bn, 0xab1c5ed5da6d8118n,
  0xd807aa98a3030242n, 0x12835b0145706fben, 0x243185be4ee4b28cn, 0x550c7dc3d5ffb4e2n,
  0x72be5d74f27b896fn, 0x80deb1fe3b1696b1n, 0x9bdc06a725c71235n, 0xc19bf174cf692694n,
  0xe49b69c19ef14ad2n, 0xefbe4786384f25e3n, 0x0fc19dc68b8cd5b5n, 0x240ca1cc77ac9c65n,
  0x2de92c6f592b0275n, 0x4a7484aa6ea6e483n, 0x5cb0a9dcbd41fbd4n, 0x76f988da831153b5n,
  0x983e5152ee66dfabn, 0xa831c66d2db43210n, 0xb00327c898fb213fn, 0xbf597fc7beef0ee4n,
  0xc6e00bf33da88fc2n, 0xd5a79147930aa725n, 0x06ca6351e003826fn, 0x142929670a0e6e70n,
  0x27b70a8546d22ffcn, 0x2e1b21385c26c926n, 0x4d2c6dfc5ac42aedn, 0x53380d139d95b3dfn,
  0x650a73548baf63den, 0x766a0abb3c77b2a8n, 0x81c2c92e47edaee6n, 0x92722c851482353bn,
  0xa2bfe8a14cf10364n, 0xa81a664bbc423001n, 0xc24b8b70d0f89791n, 0xc76c51a30654be30n,
  0xd192e819d6ef5218n, 0xd69906245565a910n, 0xf40e35855771202an, 0x106aa07032bbd1b8n,
  0x19a4c116b8d2d0c8n, 0x1e376c085141ab53n, 0x2748774cdf8eeb99n, 0x34b0bcb5e19b48a8n,
  0x391c0cb3c5c95a63n, 0x4ed8aa4ae3418acbn, 0x5b9cca4f7763e373n, 0x682e6ff3d6b2b8a3n,
  0x748f82ee5defb2fcn, 0x78a5636f43172f60n, 0x84c87814a1f0ab72n, 0x8cc702081a6439ecn,
  0x90befffa23631e28n, 0xa4506cebde82bde9n, 0xbef9a3f7b2c67915n, 0xc67178f2e372532bn,
  0xca273eceea26619cn, 0xd186b8c721c0c207n, 0xeada7dd6cde0eb1en, 0xf57d4f7fee6ed178n,
  0x06f067aa72176fban, 0x0a637dc5a2c898a6n, 0x113f9804bef90daen, 0x1b710b35131c471bn,
  0x28db77f523047d84n, 0x32caab7b40c72493n, 0x3c9ebe0a15c9bebcn, 0x431d67c49c100d4cn,
  0x4cc5d4becb3e42b6n, 0x597f299cfc657e2an, 0x5fcb6fab3ad6faecn, 0x6c44198c4a475817n];

export function sha512(data) {
  const H = [0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn, 0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,
             0x510e527fade682d1n, 0x9b05688c2b3e6c1fn, 0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n];
  const len = data.length;
  const padLen = (((len + 17 + 127) >> 7) << 7);
  const msg = new Uint8Array(padLen);
  msg.set(data);
  msg[len] = 0x80;
  const dv = new DataView(msg.buffer);
  dv.setBigUint64(padLen - 8, BigInt(len) * 8n, false);
  const w = new Array(80);
  const rotr = (v, b) => ((v >> b) | (v << (64n - b))) & M64;
  for (let off = 0; off < padLen; off += 128) {
    for (let i = 0; i < 16; i++) w[i] = dv.getBigUint64(off + i * 8, false);
    for (let i = 16; i < 80; i++) {
      const s0 = rotr(w[i - 15], 1n) ^ rotr(w[i - 15], 8n) ^ (w[i - 15] >> 7n);
      const s1 = rotr(w[i - 2], 19n) ^ rotr(w[i - 2], 61n) ^ (w[i - 2] >> 6n);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) & M64;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 80; i++) {
      const S1 = rotr(e, 14n) ^ rotr(e, 18n) ^ rotr(e, 41n);
      const ch = (e & f) ^ (~e & M64 & g);
      const t1 = (h + S1 + ch + S512K[i] + w[i]) & M64;
      const S0 = rotr(a, 28n) ^ rotr(a, 34n) ^ rotr(a, 39n);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) & M64;
      h = g; g = f; f = e; e = (d + t1) & M64; d = c; c = b; b = a; a = (t1 + t2) & M64;
    }
    H[0] = (H[0] + a) & M64; H[1] = (H[1] + b) & M64; H[2] = (H[2] + c) & M64; H[3] = (H[3] + d) & M64;
    H[4] = (H[4] + e) & M64; H[5] = (H[5] + f) & M64; H[6] = (H[6] + g) & M64; H[7] = (H[7] + h) & M64;
  }
  const out = new Uint8Array(64);
  const odv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) odv.setBigUint64(i * 8, H[i], false);
  return out;
}

// ---------- helpers ----------
export function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
export function bytesToHex(b) {
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
}
function writeU32LE(arr, off, v) {
  arr[off] = v & 0xff; arr[off + 1] = (v >>> 8) & 0xff; arr[off + 2] = (v >>> 16) & 0xff; arr[off + 3] = (v >>> 24) & 0xff;
}
function readU32LE(arr, off) {
  return (arr[off] | (arr[off + 1] << 8) | (arr[off + 2] << 16) | (arr[off + 3] << 24)) >>> 0;
}
function uint256LE(bytes) {   // bytes_t::to_uint256 semantics: bytes[0] least significant
  let v = 0n;
  for (let i = bytes.length - 1; i >= 0; i--) v = (v << 8n) | BigInt(bytes[i]);
  return v;
}

// ---------- F1 (mem_hash.cpp) ----------
const N_META = 14, MEM_SIZE = 1024, MEM_HASH_ITER = 256, N_TABLE = 9;
const MEM_HASH_INIT = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174]);

const rotl32 = (v, b) => ((v << b) | (v >>> (32 - b))) >>> 0;

function genMemArray(key) {   // key: Uint8Array(64) → Uint32Array(1024)
  const state = new Uint32Array(32);
  for (let i = 0; i < 16; i++) state[i] = readU32LE(key, i * 4);
  state.set(MEM_HASH_INIT, 16);
  let b = 0, c = 0;
  const mem = new Uint32Array(MEM_SIZE);
  for (let i = 0; i < MEM_SIZE; i += 32) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 16; k++) {
        // MMXPOS_HASHROUND(state[k], b, c, state[16+k])
        let a = state[k], d = state[16 + k];
        a = (a + b) >>> 0; d = rotl32(d ^ a, 16);
        c = (c + d) >>> 0; b = rotl32(b ^ c, 12);
        a = (a + b) >>> 0; d = rotl32(d ^ a, 8);
        c = (c + d) >>> 0; b = rotl32(b ^ c, 7);
        state[k] = a; state[16 + k] = d;
      }
    }
    mem.set(state, i);
  }
  return mem;
}

function calcMemHash(mem, numIter) {   // mem modified in place; returns Uint32Array(32)
  const state = new Uint32Array(32);
  state.set(mem.subarray(31 * 32, 32 * 32));
  for (let iter = 0; iter < numIter; iter++) {
    let sum = 0;
    for (let i = 0; i < 32; i++) sum = (sum + rotl32(state[i], i)) >>> 0;
    const dir = (sum + (sum << 11) + (sum << 22)) >>> 0;
    const bits = (dir >>> 22) % 32;
    const offset = dir >>> 27;
    for (let i = 0; i < 32; i++) {
      state[i] = (state[i] + (rotl32(mem[offset * 32 + (iter + i) % 32], bits) ^ sum)) >>> 0;
    }
    for (let i = 0; i < 32; i++) {
      mem[offset * 32 + i] = (mem[offset * 32 + i] ^ state[i]) >>> 0;
    }
  }
  return state;
}

export function f1(x, plotId, ksize) {   // → {y, meta[14]}
  const msg = new Uint8Array(36);
  writeU32LE(msg, 0, x);
  msg.set(plotId, 4);
  const key = sha512(msg);
  const mem = genMemArray(key);
  const mh = calcMemHash(mem, MEM_HASH_ITER);
  const buf = new Uint8Array(192);
  buf.set(key, 0);
  for (let i = 0; i < 32; i++) writeU32LE(buf, 64 + i * 4, mh[i]);
  const h = sha512(buf);
  const kmask = (2 ** ksize) - 1;
  let y = 0;
  const meta = new Uint32Array(N_META);
  for (let i = 0; i < N_META; i++) {
    const hv = readU32LE(h, i * 4);
    y = (y ^ hv) >>> 0;
    meta[i] = (hv & kmask) >>> 0;
  }
  y = (y & kmask) >>> 0;
  return { y, meta };
}

// ---------- eval: hash of L_meta ‖ R_meta (verify_full.cpp) ----------
function evalMeta(L, R, kmask) {   // L,R: Uint32Array(14) → {y, meta}
  const msg = new Uint8Array(N_META * 2 * 4);
  for (let i = 0; i < N_META; i++) {
    writeU32LE(msg, i * 4, L[i]);
    writeU32LE(msg, (N_META + i) * 4, R[i]);
  }
  const h = sha512(msg);
  let y = 0;
  const meta = new Uint32Array(N_META);
  for (let i = 0; i < N_META; i++) {
    const hv = readU32LE(h, i * 4);
    y = (y ^ hv) >>> 0;
    meta[i] = (hv & kmask) >>> 0;
  }
  y = (y & kmask) >>> 0;
  return { y, meta };
}

// ---------- compute_full: the matching tree ----------
export function computeFull(xs, plotId, ksize) {
  const kmask = (2 ** ksize) - 1;
  const f1out = xs.map(x => f1(x, plotId, ksize));
  let Mtmp = f1out.map(m => m.meta);
  let entries = f1out.map((m, i) => [m.y, i]);
  const LR = {};
  const metaCmp = (a, b) => {
    for (let i = 0; i < N_META; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    return 0;
  };
  let sortFunc = (A, B) => (A[0] !== B[0] ? A[0] - B[0] : metaCmp(Mtmp[A[1]], Mtmp[B[1]]));

  for (let t = 2; t <= N_TABLE; t++) {
    entries.sort(sortFunc);
    const Mnext = [];
    const matches = [];
    LR[t] = [];
    for (let x = 0; x < entries.length; x++) {
      const YL = entries[x][0];
      for (let y = x + 1; y < entries.length; y++) {
        const YR = entries[y][0];
        if (YR === YL + 1) {
          const PL = entries[x][1], PR = entries[y][1];
          const r = evalMeta(Mtmp[PL], Mtmp[PR], kmask);
          matches.push([r.y, Mnext.length]);
          LR[t].push([PL, PR]);
          Mnext.push(r.meta);
        } else if (YR > YL) break;
      }
    }
    if (!matches.length) throw new Error('zero matches at table ' + t);
    Mtmp = Mnext;
    entries = matches;
    sortFunc = (A, B) => (A[0] !== B[0] ? A[0] - B[0] : metaCmp(Mtmp[A[1]], Mtmp[B[1]]));
  }
  entries.sort(sortFunc);
  const seen = new Set();
  const out = [];
  for (const [y, idx] of entries) {
    const key = Mtmp[idx].join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ y, meta: Mtmp[idx].slice(0, 12), idx });
  }
  // canonical X_out for the first entry (walk-back through LR)
  let xOut = null;
  if (out.length) {
    let Itmp = [out[0].idx];
    for (let t = N_TABLE; t >= 2; t--) {
      const Inext = [];
      for (const i of Itmp) { Inext.push(LR[t][i][0], LR[t][i][1]); }
      Itmp = Inext;
    }
    xOut = Itmp.map(i => xs[i]);
  }
  return { entries: out, xOut };
}

// ---------- full consensus verification (verify.cpp + utils.h) ----------
export function verifyRealProof(v, onStep) {
  // v: {height, challenge(block), plot_challenge(proof's challenge field), plot_id, ksize, space_diff, xs}
  const step = (name, ok, detail) => onStep && onStep({ name, ok, detail });
  const challenge = hexToBytes(v.plot_challenge);   // the challenge the proof responds to (proof->challenge)
  const plotId = hexToBytes(v.plot_id);
  const ksize = v.ksize;
  const kmask = (2 ** ksize) - 1;

  // 0. plot_filter: SHA256("plot_filter" ‖ plot_id ‖ challenge) top 4 bits == 0
  const pf0In = new Uint8Array(11 + 64);
  pf0In.set(new TextEncoder().encode('plot_filter'), 0);
  pf0In.set(plotId, 11);
  pf0In.set(challenge, 43);
  const pf0Ok = (uint256LE(sha256(pf0In)) >> 252n) === 0n;
  step('plot_filter (1/16 gate)', pf0Ok, 'top 4 bits of SHA256("plot_filter"‖plot_id‖challenge) == 0');

  // 1. plot_challenge = SHA256("plot_challenge" ‖ plot_id ‖ challenge)
  const pcIn = new Uint8Array(14 + 32 + 32);
  pcIn.set(new TextEncoder().encode('plot_challenge'), 0);
  pcIn.set(plotId, 14);
  pcIn.set(challenge, 46);
  const plotChallenge = sha256(pcIn);
  step('plot_challenge = SHA256("plot_challenge" ‖ plot_id ‖ challenge)', true,
    bytesToHex(plotChallenge).slice(0, 16).toUpperCase() + '…');

  // 2. challenge range
  const Y0 = (readU32LE(plotChallenge, 0) & kmask) >>> 0;
  const Yend = Y0 + 16;   // 2^plot_filter
  step('challenge range', true, `[${Y0} .. ${Yend - 1}]  (16 Y values, plot_filter=4)`);

  // 3. compute tree
  const { entries, xOut } = computeFull(v.xs, plotId, ksize);
  if (entries.length !== 1) {
    step('tree compute', false, entries.length + ' final entries (need exactly 1)');
    return false;
  }
  const Y = entries[0].y;

  // 4. Y in range
  const yOk = Y >= Y0 && Y < Yend;
  step('final Y in challenge range', yOk, `Y=${Y} ∈ [${Y0}..${Yend - 1}]`);

  // 5. canonical X order
  const xOk = xOut && xOut.length === v.xs.length && xOut.every((x, i) => x === v.xs[i]);
  step('canonical X order (X_out == proof_xs)', xOk, xOk ? 'proof is in the one true order' : 'order mismatch');

  // 6. post_filter: SHA256("post_filter" ‖ plot_challenge ‖ meta48) top 10 bits == 0
  const meta = entries[0].meta;
  const pfIn = new Uint8Array(11 + 32 + 48);
  pfIn.set(new TextEncoder().encode('post_filter'), 0);
  pfIn.set(plotChallenge, 11);
  for (let i = 0; i < 12; i++) writeU32LE(pfIn, 43 + i * 4, meta[i]);
  const pfHash = sha256(pfIn);
  const pfOk = (uint256LE(pfHash) >> 246n) === 0n;
  step('post_filter (1/1024)', pfOk, 'top 10 bits of hash == 0');

  // 7. proof_hash + threshold
  const xsBytes = new Uint8Array(v.xs.length * 4);
  for (let i = 0; i < v.xs.length; i++) writeU32LE(xsBytes, i * 4, v.xs[i]);
  const inner = sha256(xsBytes);
  const phIn = new Uint8Array(64);
  phIn.set(plotChallenge, 0);
  phIn.set(inner, 32);
  const proofHash = sha256(phIn);
  const threshold = ((1n << 255n) / (BigInt(v.space_diff) * 100000000000n)) * BigInt(2 * ksize + 1);
  const value = uint256LE(proofHash) >> 10n >> BigInt(ksize - 1);
  const thOk = value < threshold;
  const ratio = Number(value * 10000n / threshold) / 10000;
  step('threshold (space_diff=' + v.space_diff + ')', thOk,
    `value is ${ratio.toFixed(4)}× the limit (must be < 1.0)`);

  return pf0Ok && yOk && xOk && pfOk && thOk;
}

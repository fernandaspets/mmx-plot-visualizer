// ===== MMX Plot Constants (k=29 SSD) =====
export const KSIZE = 29;
export const LOGBUCKETS = 6;
export const LOGBUCKETS2 = 14;
export const NUM_BUCKETS = 1 << LOGBUCKETS;       // 64 main buckets
export const NUM_SUBBUCKETS = 1 << LOGBUCKETS2;   // 16384 sub-buckets per main bucket
export const N_TABLE = 9;
export const N_META = 14;       // uint32 values per C entry (NOT bytes! 14*4=56 bytes)
export const N_META_OUT = 12;
export const META_BYTES = N_META * 4;  // 56 bytes per C entry
export const MAX_BS1 = Math.floor((1 << KSIZE) / NUM_BUCKETS * 17 / 16);
export const MAX_BS2 = Math.floor((4 << KSIZE) / NUM_BUCKETS / NUM_SUBBUCKETS / 3);
export const PDSIZE = 40;
export const DSIZE = 5;
export const DMASK = 31;
export const PDBYTES = 5;
export const XBITS = 29;
export const X2BYTES = 8;
export const X2SIZE = 64;
export const ENTRY_BITS_X = 57;

// Park parameters
export const PARK_SIZE_Y = 8192;
export const PARK_SIZE_PD = 2048;
export const PARK_SIZE_X = 2048;

// Entry counts (actual measured from plotter)
export const entries = {
  1: 536870912, 2: 536872741, 3: 536850867, 4: 536853641,
  5: 536829092, 6: 536768040, 7: 536659701, 8: 536458310, 9: 536061737
};

// ===== Color Palette =====
export const C = {
  Y:      '#44ddff',  // sorted Y values (cyan)
  META:   '#ffaa44',  // C metadata (orange)
  PD:     '#aa44ff',  // back-pointers (purple)
  X:      '#44ff88',  // X values / proof (green)
  F1:     '#ff4466',  // F1 / PoW (red)
  HDR:    '#888899',  // header / disk (gray)
  DISK:   '#666688',
  STREAM: '#ffee44',  // CUDA streams (yellow)
  EDGE:   '#2a3858',  // borders
  FLOW:   '#ffdd44',  // data flow arrows
  PANEL:  '#0c1018',
  TEXT:   '#687888',
  KEY:    '#20b898',  // key insights (teal)
  SUB:    '#8844cc',  // sub-buckets (dark purple)
  VRAM:   '#ff8844',  // VRAM / GPU memory (orange-red)
  DMA:    '#4488ff',  // DMA / PCIe (blue)
  QUALITY: '#dd44aa',  // quality hash (pink)
  SCORE:  '#44aaff',   // score hash (light blue)
};

// ===== SVG Dimensions =====
export const SVG_W = 920;

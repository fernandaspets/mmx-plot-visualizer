// ===== SVG Helper Utilities =====
const SVGNS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined) e.setAttribute(k, v);
  }
  return e;
}

export function svg(width, height) {
  return el('svg', { viewBox: `0 0 ${width} ${height}`, width, height });
}

export function rect(x, y, w, h, fill, op = 1, stroke = null, sw = 1, rx = 0) {
  return el('rect', {
    x, y, width: w, height: h, fill,
    opacity: op < 1 ? op : null,
    stroke: stroke || 'none',
    'stroke-width': sw, rx: rx || 0
  });
}

export function txt(x, y, str, fill = '#687888', size = 11, weight = 'normal', anchor = 'start', mono = false) {
  const t = el('text', {
    x, y, fill,
    'font-size': size,
    'font-weight': weight,
    'text-anchor': anchor,
    'font-family': mono ? "'SF Mono','Fira Code',monospace" : "'Segoe UI',system-ui,sans-serif"
  });
  t.textContent = str;
  return t;
}

export function line(x1, y1, x2, y2, stroke = '#2a3858', sw = 1, op = 1, dash = null, cls = null) {
  const l = el('line', {
    x1, y1, x2, y2, stroke,
    'stroke-width': sw,
    opacity: op < 1 ? op : null
  });
  if (dash) l.setAttribute('stroke-dasharray', dash);
  if (cls) l.setAttribute('class', cls);
  return l;
}

export function arrow(x1, y1, x2, y2, stroke = '#ffdd44', sw = 1.5) {
  const g = el('g');
  g.appendChild(line(x1, y1, x2, y2, stroke, sw, null, null, 'flow-line'));
  const a = Math.atan2(y2 - y1, x2 - x1);
  const ax = x2 - Math.cos(a) * 8;
  const ay = y2 - Math.sin(a) * 8;
  g.appendChild(line(x2, y2, ax + Math.cos(a + Math.PI / 2) * 4, ay + Math.sin(a + Math.PI / 2) * 4, stroke, sw));
  g.appendChild(line(x2, y2, ax - Math.cos(a + Math.PI / 2) * 4, ay - Math.sin(a + Math.PI / 2) * 4, stroke, sw));
  return g;
}

export function circle(cx, cy, r, fill = '#44ddff', op = 1, stroke = null, sw = 1) {
  return el('circle', {
    cx, cy, r, fill,
    opacity: op < 1 ? op : null,
    stroke: stroke || 'none',
    'stroke-width': sw
  });
}

export function panel(x, y, w, h, title) {
  const g = el('g');
  g.appendChild(rect(x, y, w, h, '#0c1018', 0.6, '#2a3858', 1, 4));
  if (title) g.appendChild(txt(x + 10, y + 18, title, '#687888', 11, 'bold'));
  return g;
}

// Animated particle flowing along a path
export function particle(cx, cy, r, color, delay = 0) {
  const c = circle(cx, cy, r, color, 0.9);
  c.setAttribute('class', 'pulse-ani');
  c.style.animationDelay = delay + 's';
  return c;
}

// Grid of small cells (for memory/bucket visualization)
export function grid(x, y, cols, rows, cellSize, color, opacityFn, gap = 1) {
  const g = el('g');
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const c = rect(x + i * cellSize, y + j * cellSize, cellSize - gap, cellSize - gap, color, opacityFn(i, j), '#2a3858', 0.3, 1);
      c.setAttribute('class', 'pulse-ani');
      c.style.animationDelay = ((i + j) * 0.04) + 's';
      g.appendChild(c);
    }
  }
  return g;
}

// Labeled box with title and subtitle
export function labeledBox(x, y, w, h, title, subtitle, color, titleSize = 11) {
  const g = el('g');
  g.appendChild(rect(x, y, w, h, color, 0.8, '#2a3858', 1, 4));
  if (title) g.appendChild(txt(x + w / 2, y + h / 2 - 4, title, color, titleSize, 'bold', 'middle'));
  if (subtitle) g.appendChild(txt(x + w / 2, y + h / 2 + 12, subtitle, '#687888', 9, 'normal', 'middle'));
  return g;
}

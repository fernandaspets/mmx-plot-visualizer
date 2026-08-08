// ===== Scene Manager: Navigation, Auto-play, Rendering =====
import { SVG_W } from './constants.js';

export class SceneManager {
  constructor(scenes, viewEl, infoEl, navEl) {
    this.scenes = scenes;
    this.view = viewEl;
    this.infoEl = infoEl;
    this.navEl = navEl;
    this.cur = 0;
    this.playing = true;
    this.stTimer = 0;
    this.stDur = 12; // seconds per scene

    this.buildNav();
    this.bindControls();
    this.tick = this.tick.bind(this);
    setInterval(this.tick, 500);

    // Deep-link: #N opens scene N (1-based)
    const h = parseInt((location.hash || '').replace('#', ''), 10);
    const start = (h >= 1 && h <= scenes.length) ? h - 1 : 0;
    this.show(start);
    if (h >= 1) this.pause();
    window.addEventListener('hashchange', () => {
      const n = parseInt((location.hash || '').replace('#', ''), 10);
      if (n >= 1 && n <= scenes.length && n - 1 !== this.cur) {
        this.show(n - 1);
        this.pause();
      }
    });
  }

  buildNav() {
    this.scenes.forEach((s, i) => {
      const d = document.createElement('div');
      d.className = 'dot';
      d.dataset.name = (i + 1) + '. ' + s.name;
      d.onclick = () => { this.show(i); this.pause(); };
      this.navEl.appendChild(d);
    });
  }

  bindControls() {
    document.getElementById('bp').onclick = () => {
      this.show((this.cur - 1 + this.scenes.length) % this.scenes.length);
    };
    document.getElementById('bn').onclick = () => {
      this.show((this.cur + 1) % this.scenes.length);
    };
    document.getElementById('bpl').onclick = () => {
      this.playing = !this.playing;
      this.updatePlayBtn();
    };
    document.getElementById('br').onclick = () => {
      this.show(0);
      this.pause();
    };
    // Keyboard: arrows navigate, space toggles autoplay
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowLeft') {
        this.show((this.cur - 1 + this.scenes.length) % this.scenes.length);
        this.pause();
      } else if (e.key === 'ArrowRight') {
        this.show((this.cur + 1) % this.scenes.length);
        this.pause();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.playing = !this.playing;
        this.updatePlayBtn();
      }
    });
  }

  pause() {
    this.playing = false;
    this.updatePlayBtn();
  }

  updatePlayBtn() {
    const btn = document.getElementById('bpl');
    btn.textContent = this.playing ? '❚❚ Pause' : '▶ Auto';
    btn.classList.toggle('on', this.playing);
  }

  show(i) {
    this.cur = i;
    const sc = this.scenes[i];
    sc.manager = this;   // scenes can jump: sc.manager.show(n)

    // Update header: scene name + progress
    const tEl = document.querySelector('.bar .t');
    if (tEl) tEl.textContent = `MMX PoSpace Plot — Reference Spec (k=29)  ·  ${i + 1}/${this.scenes.length}: ${sc.name}`;
    const pb = document.getElementById('progress');
    if (pb) pb.style.width = ((i + 1) / this.scenes.length * 100) + '%';

    // Deep-link hash (no history spam)
    history.replaceState(null, '', '#' + (i + 1));

    // Build content — appendChild (NOT innerHTML round-trip) so event listeners survive
    const el = sc.build();
    const wrap = document.createElement('div');
    wrap.className = 'ani';
    wrap.appendChild(el);
    this.view.innerHTML = '';
    this.view.appendChild(wrap);

    // Build info
    this.infoEl.innerHTML =
      '<div class="ani"><h2>' + sc.info.t + '</h2>' +
      '<div class="d">' + sc.info.d + '</div>' +
      sc.info.body + '</div>';

    // Update nav dots
    const dots = this.navEl.children;
    for (let j = 0; j < dots.length; j++) {
      dots[j].className = j === i ? 'on' : (j < i ? 'done' : '');
    }
    this.stTimer = 0;

    // Interactive scenes pause autoplay so the user isn't yanked away
    if (sc.interactive) this.pause();
  }

  tick() {
    if (this.playing) {
      this.stTimer += 0.5;
      if (this.stTimer >= this.stDur) {
        this.show((this.cur + 1) % this.scenes.length);
      }
    }
  }
}

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
    this.show(0);
  }

  buildNav() {
    this.scenes.forEach((s, i) => {
      const d = document.createElement('div');
      d.className = 'dot';
      d.dataset.name = s.name;
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

    // Build SVG
    const svgEl = sc.build();
    const tmp = document.createElement('div');
    tmp.appendChild(svgEl);
    this.view.innerHTML = '<div class="ani">' + tmp.innerHTML + '</div>';

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

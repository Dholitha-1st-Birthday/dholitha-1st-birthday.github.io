/* =====================================================================
   Butterfly Family flight — Papa, Amma & Little Dholitha
   ---------------------------------------------------------------------
   Self-contained decorative layer. It never intercepts taps
   (pointer-events: none), touches no other element on the page, and
   switches itself off for visitors who prefer reduced motion.
   ===================================================================== */
(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var css =
    '#bf-family-layer{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:105}' +
    '.bf-member{position:absolute;left:0;top:0;will-change:transform;opacity:0;transition:opacity .6s ease}' +
    '.bf-member.is-flying{opacity:1}' +
    '.bf-member svg{display:block;overflow:visible;filter:drop-shadow(0 4px 6px rgba(74,35,90,.22))}' +
    '.bf-wing{transform-box:fill-box;animation:bf-flap var(--flap,.34s) ease-in-out infinite alternate}' +
    '.bf-wing-l{transform-origin:100% 50%}' +
    '.bf-wing-r{transform-origin:0% 50%}' +
    '@keyframes bf-flap{0%{transform:scaleX(1)}100%{transform:scaleX(.22)}}' +
    '.bf-spark{position:absolute;left:0;top:0;width:6px;height:6px;border-radius:50%;' +
    'background:radial-gradient(circle,#fffdf7 0%,#f6e05e 45%,rgba(246,224,94,0) 72%);' +
    'animation:bf-spark 1.3s ease-out forwards}' +
    '@keyframes bf-spark{0%{opacity:.95;transform:translate(var(--x),var(--y)) scale(1)}' +
    '100%{opacity:0;transform:translate(var(--x),calc(var(--y) + 26px)) scale(.3)}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* One butterfly drawn facing "up"; the flight code rotates it along its path. */
  function butterflySvg(size, upper, lower, edge, body, withCrown) {
    var crown = withCrown
      ? '<path d="M41 18 L44 10 L48 15 L50 7 L52 15 L56 10 L59 18 Z" fill="#e2b13c" stroke="#c9972c" stroke-width="1.2" stroke-linejoin="round"/>'
      : '';
    return (
      '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<g class="bf-wing bf-wing-l">' +
      '<path d="M48 46 C34 12, 6 10, 8 38 C10 56, 30 58, 48 54 Z" fill="' + upper + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<path d="M48 56 C30 60, 16 80, 28 90 C40 96, 46 76, 49 62 Z" fill="' + lower + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<circle cx="24" cy="34" r="5" fill="#fffdf7" opacity=".7"/>' +
      '</g>' +
      '<g class="bf-wing bf-wing-r">' +
      '<path d="M52 46 C66 12, 94 10, 92 38 C90 56, 70 58, 52 54 Z" fill="' + upper + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<path d="M52 56 C70 60, 84 80, 72 90 C60 96, 54 76, 51 62 Z" fill="' + lower + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<circle cx="76" cy="34" r="5" fill="#fffdf7" opacity=".7"/>' +
      '</g>' +
      '<ellipse cx="50" cy="56" rx="3.4" ry="17" fill="' + body + '"/>' +
      '<circle cx="50" cy="37" r="4.2" fill="' + body + '"/>' +
      '<path d="M49 34 C46 26, 42 22, 38 20 M51 34 C54 26, 58 22, 62 20" stroke="' + body + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      crown +
      '</svg>'
    );
  }

  /* dx/dy = formation offset from the family's centre (px, in flight direction / sideways). */
  var family = [
    { name: 'papa', size: 58, upper: '#b794f4', lower: '#d6bcfa', edge: '#c9972c', body: '#4a235a', flap: '.36s', dx: 38, dy: -36, bob: 7, phase: 0 },
    { name: 'amma', size: 54, upper: '#fbb6ce', lower: '#e9d8fd', edge: '#c9972c', body: '#6b467a', flap: '.33s', dx: 34, dy: 36, bob: 7, phase: 1.7 },
    { name: 'baby', size: 36, upper: '#fed7e2', lower: '#f6e05e', edge: '#c9972c', body: '#4a235a', flap: '.2s', dx: -6, dy: 0, bob: 11, phase: 3.1, crown: true }
  ];

  var layer = document.createElement('div');
  layer.id = 'bf-family-layer';
  layer.setAttribute('aria-hidden', 'true');

  var members = family.map(function (m) {
    var el = document.createElement('div');
    el.className = 'bf-member bf-' + m.name;
    el.style.setProperty('--flap', m.flap);
    el.innerHTML = butterflySvg(m.size, m.upper, m.lower, m.edge, m.body, m.crown);
    layer.appendChild(el);
    return { cfg: m, el: el };
  });

  var flying = false;
  var leftToRight = true;

  function sparkle(x, y) {
    var s = document.createElement('span');
    s.className = 'bf-spark';
    s.style.setProperty('--x', x.toFixed(0) + 'px');
    s.style.setProperty('--y', y.toFixed(0) + 'px');
    layer.appendChild(s);
    setTimeout(function () {
      if (s.parentNode) s.parentNode.removeChild(s);
    }, 1350);
  }

  function fly() {
    if (flying || document.hidden) return schedule(4000);
    flying = true;

    var W = window.innerWidth;
    var H = window.innerHeight;
    var margin = 90;
    var dir = leftToRight ? 1 : -1;
    leftToRight = !leftToRight;

    var startX = dir > 0 ? -margin : W + margin;
    var endX = dir > 0 ? W + margin : -margin;
    var baseY = H * (0.22 + Math.random() * 0.45);
    var rise = (Math.random() - 0.5) * H * 0.25;
    var waveAmp = Math.min(60, H * 0.06);
    var waves = 1.5 + Math.random();
    var duration = Math.max(7500, Math.min(12000, W * 18));
    var t0 = performance.now();
    var lastSpark = 0;

    function pathAt(p) {
      return {
        x: startX + (endX - startX) * p,
        y: baseY + rise * p + Math.sin(p * Math.PI * 2 * waves) * waveAmp
      };
    }

    members.forEach(function (m) {
      m.el.classList.add('is-flying');
    });

    function frame(now) {
      var p = (now - t0) / duration;
      if (p >= 1) {
        members.forEach(function (m) {
          m.el.classList.remove('is-flying');
        });
        flying = false;
        return schedule(9000 + Math.random() * 7000);
      }

      var a = pathAt(p);
      var b = pathAt(Math.min(1, p + 0.004));
      var heading = Math.atan2(b.y - a.y, b.x - a.x);
      var nx = -Math.sin(heading);
      var ny = Math.cos(heading);
      var secs = now / 1000;

      members.forEach(function (m) {
        var c = m.cfg;
        var bob = Math.sin(secs * 3.2 + c.phase) * c.bob;
        var x = a.x + Math.cos(heading) * c.dx + nx * (c.dy * dir + bob);
        var y = a.y + Math.sin(heading) * c.dx + ny * (c.dy * dir + bob);
        var deg = (heading * 180) / Math.PI + 90 + Math.sin(secs * 2 + c.phase) * 8;
        m.el.style.transform =
          'translate3d(' + (x - c.size / 2).toFixed(1) + 'px,' + (y - c.size / 2).toFixed(1) + 'px,0) rotate(' + deg.toFixed(1) + 'deg)';
        if (c.name === 'baby' && now - lastSpark > 140) {
          lastSpark = now;
          sparkle(x - Math.cos(heading) * 14, y - Math.sin(heading) * 14);
        }
      });

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  var timer = null;
  function schedule(ms) {
    clearTimeout(timer);
    timer = setTimeout(fly, ms);
  }

  function start() {
    document.body.appendChild(layer);
    schedule(1600);
    /* Let the family greet guests right after they open the invitation. */
    var openBtn = document.getElementById('open-invite-btn');
    if (openBtn) {
      openBtn.addEventListener('click', function () {
        if (!flying) schedule(1300);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

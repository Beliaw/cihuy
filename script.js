(function(){
  'use strict';

  /* ---------- 8-Bit Web Audio Synthesizer ---------- */
  var sfxEnabled = true;
  var audioCtx = null;

  function playTone(freqs, dur, type){
    if (!sfxEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      freqs.forEach(function(f, idx){
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(f, now + idx * dur);
        gain.gain.setValueAtTime(0.06, now + idx * dur);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx + 1) * dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * dur);
        osc.stop(now + (idx + 1) * dur);
      });
    } catch (e) {}
  }

  var SFX = {
    coin: function(){ playTone([987.77, 1318.51], 0.07, 'square'); },
    jump: function(){ playTone([320, 480, 640], 0.05, 'square'); },
    click: function(){ playTone([660], 0.04, 'triangle'); },
    powerup: function(){ playTone([523.25, 659.25, 783.99, 1046.5], 0.08, 'square'); }
  };

  /* ---------- Toast & Floating XP ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2600);
  }

  function spawnXP(x, y, text){
    var el = document.createElement('span');
    el.className = 'float-xp';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(function(){ el.remove(); }, 760);
  }

  /* ---------- HUD Toggles (CRT & SFX) & XP Bar ---------- */

  var sfxBtn = document.getElementById('toggle-sfx');



  sfxBtn.addEventListener('click', function(){
    sfxEnabled = !sfxEnabled;
    sfxBtn.classList.toggle('active', sfxEnabled);
    sfxBtn.setAttribute('aria-pressed', String(sfxEnabled));
    if (sfxEnabled) SFX.click();
  });

  var xpBar = document.getElementById('xp-bar');
  window.addEventListener('scroll', function(){
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var pct = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
    xpBar.style.width = pct.toFixed(1) + '%';
  }, { passive: true });

  /* ---------- Cyber-Decrypt Text Effect ---------- */
  (function(){
    var roleEl = document.getElementById('role-text');
    if (!roleEl) return;
    var target = roleEl.dataset.text || roleEl.textContent;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*';
    var frame = 0;
    var timer = setInterval(function(){
      frame++;
      roleEl.textContent = target.split('').map(function(ch, idx){
        if (ch === ' ' || ch === '&') return ch;
        if (idx < frame / 2) return target[idx];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (frame >= target.length * 2){
        roleEl.textContent = target;
        clearInterval(timer);
      }
    }, 32);
  })();

  /* ---------- Sprite Renderer ---------- */
  function sprite(cv, rows, pal){
    var w = Math.max.apply(null, rows.map(function(r){ return r.length; }));
    cv.width = w; cv.height = rows.length;
    var c = cv.getContext('2d');
    rows.forEach(function(row, y){
      for (var x = 0; x < row.length; x++){
        var col = pal[row[x]];
        if (col){ c.fillStyle = col; c.fillRect(x, y, 1, 1); }
      }
    });
  }

  var SPR = {
    coin: {
      pal: {k:'#1a0f3d',y:'#ffd23f',w:'#ffffff',o:'#ff8a3d'},
      rows: [
        "..kkkk..",
        ".kyyyyk.",
        "kyywyyok",
        "kyywyyok",
        "kyyyyyok",
        "kyyyyyok",
        ".kyyyok.",
        "..kkkk.."
      ]
    },
    heart: {
      pal: {k:'#1a0f3d',r:'#ff4f6d',w:'#ffffff'},
      rows: [
        ".kkk.kkk.",
        "krrrkrrrk",
        "krwrrrrrk",
        "krrrrrrrk",
        ".krrrrrk.",
        "..krrrk..",
        "...krk...",
        "....k...."
      ]
    },
    cloud: {
      pal: {w:'#ffffff',c:'#d9c8ff'},
      rows: [
        "........wwwww...........",
        "......wwwwwwwwww........",
        "....wwwwwwwwwwwwwwwwww..",
        "..wwwwwwwwwwwwwwwwwwwwww",
        "wwwwwwwwwwwwwwwwwwwwwwww",
        ".cccccccccccccccccccccc."
      ]
    }
  };

  document.querySelectorAll('canvas[data-sprite]').forEach(function(cv){
    var s = SPR[cv.dataset.sprite];
    if (s) sprite(cv, s.rows, s.pal);
  });

  /* ---------- Matahari Retro ---------- */
  (function(){
    var cv = document.getElementById('sun');
    cv.width = 32; cv.height = 32;
    var c = cv.getContext('2d');
    var gaps = {20:1,23:1,25:1,27:1,29:1};
    for (var y = 0; y < 32; y++){
      if (gaps[y]) continue;
      c.fillStyle = y < 12 ? '#ffe45e' : y < 20 ? '#ffb23e' : y < 26 ? '#ff7a6b' : '#ff4fa3';
      for (var x = 0; x < 32; x++){
        var dx = x - 15.5, dy = y - 15.5;
        if (dx*dx + dy*dy <= 15.5*15.5) c.fillRect(x, y, 1, 1);
      }
    }
  })();

  /* ---------- Bintang di Langit Hero ---------- */
  function rng(seed){
    var s = seed >>> 0;
    return function(){ s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  (function(){
    var hero = document.querySelector('.hero');
    var r = rng(7);
    for (var i = 0; i < 32; i++){
      var el = document.createElement('span');
      el.className = 'star';
      el.style.left = (r() * 100).toFixed(1) + '%';
      el.style.top = (r() * 32).toFixed(1) + '%';
      el.style.animationDelay = (r() * 2).toFixed(1) + 's';
      if (i % 5 === 0){ el.style.width = '8px'; el.style.height = '8px'; }
      hero.insertBefore(el, hero.firstChild);
    }
  })();

  /* ---------- Bar Skill + Scroll Reveal ---------- */
  document.querySelectorAll('.bar').forEach(function(bar){
    for (var i = 0; i < 10; i++){
      bar.appendChild(document.createElement('i'));
    }
  });

  function fillSkillBars(container){
    container.querySelectorAll('.bar').forEach(function(bar){
      if (bar.dataset.filled) return;
      bar.dataset.filled = '1';
      var lv = parseInt(bar.dataset.level, 10) || 0;
      var segs = bar.querySelectorAll('i');
      segs.forEach(function(seg, idx){
        if (idx < lv){
          setTimeout(function(){ seg.classList.add('on'); }, idx * 65);
        }
      });
    });
  }

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          fillSkillBars(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); fillSkillBars(el); });
  }

  /* ---------- Thumbnail Karya (64x40 Piksel) ---------- */
  function R(c,x,y,w,h,col){ c.fillStyle = col; c.fillRect(Math.floor(x), Math.floor(y), w, h); }
  function disc(c,cx,cy,rad,col){
    c.fillStyle = col;
    for (var y = -rad; y <= rad; y++)
      for (var x = -rad; x <= rad; x++)
        if (x*x + y*y <= rad*rad + rad*0.6) c.fillRect(cx + x, cy + y, 1, 1);
  }
  function bands(c,cols,y0,y1){
    var h = (y1 - y0) / cols.length;
    cols.forEach(function(col,i){ R(c, 0, Math.round(y0 + i*h), 64, Math.ceil(h) + 1, col); });
  }

  var SCENES = {
    skyline: function(c,r){
      bands(c,['#1a0f3d','#2b1b6e','#4b2b9a','#8a38b5','#e0409a'],0,40);
      for (var i = 0; i < 16; i++) R(c, r()*64, r()*20, 1, 1, '#fff');
      disc(c, 50, 8, 5, '#fff2b0');
      var x = 0, k = 0;
      while (x < 64){
        var w = 5 + Math.floor(r()*4), h = 10 + Math.floor(r()*18);
        R(c, x, 40 - h, w, h, (k++ % 2) ? '#140a30' : '#1f1250');
        for (var wy = 40 - h + 2; wy < 38; wy += 3)
          for (var wx = x + 1; wx < x + w - 1; wx += 2)
            if (r() > 0.55) R(c, wx, wy, 1, 1, r() > 0.5 ? '#ffd23f' : '#35d6ff');
        x += w;
      }
    },
    mountain: function(c,r){
      bands(c,['#35d6ff','#7fe3ff','#c4f3ff','#ffe9b0'],0,34);
      disc(c, 48, 11, 6, '#ffd23f');
      function tri(x,cx,h,w){ return Math.max(0, h - Math.abs(x - cx) * h / w); }
      for (var x = 0; x < 64; x++){
        var a = Math.round(Math.max(tri(x,16,24,20), tri(x,46,18,16)));
        R(c, x, 34 - a, 1, a, '#8a5cff');
        if (a > 16) R(c, x, 34 - a, 1, Math.min(4, a - 16), '#fff');
        var b = Math.round(Math.max(tri(x,30,12,18), tri(x,60,14,12), tri(x,2,10,10)));
        R(c, x, 34 - b, 1, b, '#4b2b9a');
      }
      R(c, 0, 32, 64, 8, '#4cf08a');
      R(c, 0, 36, 64, 4, '#2fbf6a');
      for (var i = 0; i < 9; i++){
        var px = Math.floor(r()*58) + 3, g = '#0d6b3a';
        R(c, px, 27, 1, 1, g); R(c, px-1, 28, 3, 1, g); R(c, px-2, 29, 5, 1, g); R(c, px-3, 30, 7, 1, g);
        R(c, px, 31, 1, 2, '#6e3a1b');
      }
    },
    space: function(c,r){
      R(c, 0, 0, 64, 40, '#0d0630');
      var sc = ['#fff','#35d6ff','#ff4fa3','#ffd23f'];
      for (var i = 0; i < 44; i++) R(c, r()*64, r()*40, 1, 1, sc[i % 4]);
      disc(c, 24, 22, 11, '#ff8a3d');
      for (var y = -11; y <= 11; y++)
        for (var x = -11; x <= 11; x++)
          if (x*x + y*y <= 127 && (y + 11) % 6 < 2) R(c, 24 + x, 22 + y, 1, 1, '#ffb25c');
      for (var rx = -19; rx <= 19; rx++){
        var e = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow(rx/19, 2))) * 4);
        var tilt = Math.round(rx * 0.15);
        R(c, 24 + rx, 22 + e + tilt, 1, 1, '#ffd23f');
        if (Math.abs(rx) > 11) R(c, 24 + rx, 22 - e + tilt, 1, 1, '#ffd23f');
      }
      R(c, 49, 10, 7, 3, '#35d6ff'); R(c, 51, 8, 3, 2, '#fff');
      R(c, 47, 11, 2, 1, '#ff4fa3'); R(c, 56, 11, 2, 1, '#ffd23f');
    },
    ocean: function(c,r){
      bands(c,['#35d6ff','#1fb0f0','#1a8ae0','#2a5cc4','#2b3a9a'],0,40);
      for (var x = 0; x < 64; x += 8) R(c, x + (x % 16 ? 2 : 0), 2, 4, 1, '#fff');
      for (var x2 = 0; x2 < 64; x2 += 10) R(c, x2 + 3, 5, 3, 1, '#c4f3ff');
      function fish(x,y,col){ R(c,x,y,5,3,col); R(c,x+5,y-1,2,5,col); R(c,x+1,y+1,1,1,'#1a0f3d'); }
      fish(10,16,'#ff8a3d'); fish(38,24,'#ff4fa3'); fish(26,10,'#ffd23f');
      for (var i = 0; i < 8; i++) R(c, r()*64, 6 + r()*28, 1, 1, '#fff');
      R(c, 0, 36, 64, 4, '#ffd98a');
      [6,20,44,58].forEach(function(x){ R(c,x,28,1,8,'#4cf08a'); R(c,x+1,30,1,3,'#4cf08a'); R(c,x-1,32,1,3,'#4cf08a'); });
    },
    garden: function(c,r){
      bands(c,['#9be8ff','#b9f0ff','#d7f7ff'],0,30);
      disc(c, 10, 8, 5, '#ffd23f');
      R(c, 36, 6, 12, 3, '#fff'); R(c, 39, 4, 6, 2, '#fff');
      for (var x = 0; x < 64; x++) R(c, x, Math.round(26 + Math.sin(x/8) * 3), 1, 14, '#4cf08a');
      for (var x2 = 0; x2 < 64; x2++) R(c, x2, Math.round(32 + Math.sin(x2/6 + 2) * 2), 1, 10, '#2fbf6a');
      var fc = ['#ff4fa3','#fff','#ff8a3d','#8a5cff'];
      for (var i = 0; i < 14; i++){
        var fx = 1 + Math.floor(r()*62), fy = 31 + Math.floor(r()*6), col = fc[i % 4];
        R(c, fx, fy + 1, 1, 2, '#0d6b3a');
        R(c, fx - 1, fy, 3, 1, col); R(c, fx, fy - 1, 1, 3, col); R(c, fx, fy, 1, 1, '#ffd23f');
      }
    },
    rainbow: function(c,r){
      R(c, 0, 0, 64, 40, '#ffd0ec');
      var cols = ['#ff4f6d','#ff8a3d','#ffd23f','#4cf08a','#35d6ff','#8a5cff'];
      for (var y = 0; y < 40; y++)
        for (var x = 0; x < 64; x++){
          var d = Math.sqrt((x-32)*(x-32) + (y-38)*(y-38));
          var i = Math.floor((30 - d) / 3);
          if (i >= 0 && i < 6) R(c, x, y, 1, 1, cols[i]);
        }
      disc(c, 4, 38, 7, '#fff'); disc(c, 12, 39, 6, '#fff');
      disc(c, 60, 38, 7, '#fff'); disc(c, 52, 39, 6, '#fff');
      for (var j = 0; j < 20; j++) R(c, r()*64, r()*20, 1, 1, cols[j % 6]);
    }
  };

  document.querySelectorAll('canvas[data-scene]').forEach(function(cv){
    var name = cv.dataset.scene, f = SCENES[name];
    cv.width = 64; cv.height = 40;
    if (f) f(cv.getContext('2d'), rng(name.length * 977 + 13));
  });

  /* ---------- Koin & Karakter ---------- */
  var char = document.getElementById('char');
  function jump(e){
    char.classList.remove('jump');
    void char.offsetWidth;
    char.classList.add('jump');
    SFX.jump();
    if (e && e.clientX){
      spawnXP(e.clientX - 20, e.clientY - 30, 'HALO!');
    }
    setTimeout(function(){ char.classList.remove('jump'); }, 520);
  }
  char.addEventListener('click', jump);
  char.addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); jump(); }
  });

  var coins = document.querySelectorAll('.coin');
  var out = document.getElementById('coin-count');
  var scoreBox = out.closest('.coin-score');
  var hint = document.getElementById('hint');
  var playerBadge = document.getElementById('player-badge');
  var got = 0;

  coins.forEach(function(b){
    b.addEventListener('click', function(e){
      if (b.classList.contains('got')) return;
      b.classList.add('got');
      SFX.coin();
      spawnXP(e.clientX - 24, e.clientY - 20, '+100 XP');
      setTimeout(function(){ b.classList.add('gone'); }, 320);
      got++;
      out.textContent = got + '/' + coins.length;
      if (got === coins.length){
        document.body.classList.add('overclock');
        scoreBox.classList.add('maxed');
        playerBadge.textContent = 'PLAYER 1 ★ MAX';
        hint.textContent = '[UNLOCKED] OVERCLOCK MODE AKTIF! Semua koin terkumpul.';
        SFX.powerup();
        showToast('[★] OVERCLOCK MODE TERBUKA!');
      }
      char.classList.remove('jump');
      void char.offsetWidth;
      char.classList.add('jump');
      setTimeout(function(){ char.classList.remove('jump'); }, 520);
    });
  });

  /* ---------- Filter Karya & Modal Inspector ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var workCards = document.querySelectorAll('.work');

  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      SFX.click();
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.dataset.filter;
      workCards.forEach(function(card){
        var show = (cat === 'all' || card.dataset.cat === cat);
        card.classList.toggle('hidden', !show);
      });
    });
  });

  var modal = document.getElementById('project-modal');
  var mTitle = document.getElementById('modal-title');
  var mDesc = document.getElementById('modal-desc');
  var mStack = document.getElementById('modal-stack');
  var mLink = document.getElementById('modal-link');
  var mClose = document.getElementById('modal-close');

  document.querySelectorAll('.inspect-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var card = btn.closest('.work');
      if (!card) return;
      SFX.click();
      mTitle.textContent = card.dataset.title || '';
      mDesc.textContent = card.dataset.desc || '';
      mLink.href = card.dataset.url || '#';
      mStack.innerHTML = '';
      (card.dataset.stack || '').split(',').forEach(function(item){
        if (!item.trim()) return;
        var li = document.createElement('li');
        li.textContent = item.trim();
        mStack.appendChild(li);
      });
      modal.hidden = false;
      mClose.focus();
    });
  });

  function closeModal(){
    if (modal.hidden) return;
    modal.hidden = true;
    SFX.click();
  }
  mClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e){
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* ---------- Salin Email ---------- */
  var copyBtn = document.getElementById('copy');
  var emailEl = document.getElementById('email');
  copyBtn.addEventListener('click', function(){
    var text = emailEl.textContent.trim();
    SFX.coin();
    function done(msg){
      copyBtn.textContent = msg;
      showToast('[✓] EMAIL DISALIN KE CLIPBOARD');
      setTimeout(function(){ copyBtn.textContent = 'SALIN EMAIL'; }, 1800);
    }
    function fallback(){
      var range = document.createRange();
      range.selectNodeContents(emailEl);
      var sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(range);
      done('TEKAN SALIN');
    }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ done('TERSALIN!'); }, fallback);
    } else { fallback(); }
  });

  /* ---------- Interaksi Nyawa di Footer ---------- */
  document.querySelectorAll('.heart-btn').forEach(function(hb){
    hb.addEventListener('click', function(e){
      SFX.powerup();
      spawnXP(e.clientX - 18, e.clientY - 24, '1-UP!');
    });
  });
})();
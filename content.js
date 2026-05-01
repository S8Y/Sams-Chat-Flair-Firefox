(function() {
  'use strict';

  var RARITY_GLOW = {
    uncommon:   { shadow: '0 0 6px #4ade80' },
    rare:       { shadow: '0 0 6px #60a5fa' },
    epic:       { shadow: '0 0 8px #c084fc' },
    legendary:  { shadow: '0 0 10px #fbbf24' },
    relic:      { shadow: '0 0 10px #f87171' },
    contraband: { shadow: '0 0 12px #f472b6' },
  };

  var RANK_FLAIR = {
    1: { emoji: '👑', shadow: '0 0 8px rgba(255,215,0,0.6)' },
    2: { emoji: '🥈', shadow: '0 0 8px rgba(192,192,192,0.5)' },
    3: { emoji: '🥉', shadow: '0 0 8px rgba(205,127,50,0.5)' },
  };

  var flairData = {};

  function applyFlair(btn) {
    if (btn.dataset.samFlair) return;
    btn.dataset.samFlair = '1';
    var username = btn.textContent.trim();
    if (!username) return;
    var flair = flairData[username];
    if (!flair) return;

    // Rank flair (top 3)
    if (flair.rank && RANK_FLAIR[flair.rank]) {
      var ri = RANK_FLAIR[flair.rank];
      var rs = document.createElement('span');
      rs.textContent = ri.emoji + ' ';
      rs.style.textShadow = ri.shadow;
      rs.style.marginRight = '2px';
      rs.className = 'sam-flair-rank';
      btn.parentElement.insertBefore(rs, btn);
      btn.style.textShadow = ri.shadow;
    }

    // Emoji
    if (flair.emoji) {
      var es = document.createElement('span');
      es.textContent = flair.emoji + ' ';
      var glow = RARITY_GLOW[flair.rarity] || RARITY_GLOW.uncommon;
      es.style.textShadow = glow.shadow;
      es.style.marginRight = '2px';
      es.className = 'sam-flair-emoji';
      btn.parentElement.insertBefore(es, btn);
    }

    // Name color
    if (flair.name_color) {
      applyNameColor(btn, flair.name_color);
    }
  }

  function applyNameColor(el, cd) {
    if (cd.type === 'multicolor' && cd.colors) {
      var text = el.textContent || '';
      el.textContent = '';
      for (var i = 0; i < text.length; i++) {
        var sp = document.createElement('span');
        sp.textContent = text[i];
        sp.style.color = cd.colors[i % cd.colors.length];
        el.appendChild(sp);
      }
      return;
    }
    if (cd.type === 'gradient' && cd.color2) {
      el.style.background = 'linear-gradient(90deg, ' + cd.color1 + ', ' + cd.color2 + ')';
      el.style.webkitBackgroundClip = 'text';
      el.style.webkitTextFillColor = 'transparent';
      el.style.backgroundClip = 'text';
      return;
    }
    el.style.color = cd.color1;
    if (cd.rarity === 'relic') {
      el.style.textShadow = '0 0 6px ' + cd.color1 + ', 0 0 12px ' + cd.color1;
    }
  }

  function processChat() {
    var btns = document.querySelectorAll('button.inline.font-bold');
    btns.forEach(applyFlair);
  }

  function resetFlair() {
    document.querySelectorAll('[data-sam-flair]').forEach(function(el) {
      delete el.dataset.samFlair;
      var p = el.parentElement;
      if (p) {
        p.querySelectorAll('.sam-flair-emoji, .sam-flair-rank').forEach(function(s) { s.remove(); });
      }
    });
  }

  function observeChat() {
    processChat();
    var target = document.getElementById('chatroom') || document.body;
    var observer = new MutationObserver(processChat);
    observer.observe(target, { childList: true, subtree: true });
  }

  // Get initial data from background
  browser.runtime.sendMessage({ type: 'GET_FLAIR' }, function(response) {
    if (response && response.data) flairData = response.data;
    setTimeout(observeChat, 2000);
    setInterval(processChat, 3000);
  });

  // Listen for instant updates from background
  browser.runtime.onMessage.addListener(function(msg) {
    if (msg.type === 'FLAIR_UPDATE' && msg.data) {
      flairData = msg.data;
      resetFlair();
      processChat();
    }
  });

  // Handle SPA navigation
  var lastUrl = location.href;
  setInterval(function() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      resetFlair();
      setTimeout(observeChat, 2000);
    }
  }, 1000);
})();
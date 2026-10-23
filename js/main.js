// Ein Formular mit Weichen: Felder je Anliegen zeigen und den Aufkleber live ausfüllen
(function () {
  var form = document.getElementById('formular');
  if (!form) return;

  var namen = { wartung: 'Wartung', waermepumpe: 'Wärmepumpe', heizung: 'Neue Heizung', bad: 'Bad und Sanitär', frage: 'Frage', bewerbung: 'Bewerbung' };
  var knopf = { wartung: 'Wartung anfragen', waermepumpe: 'Wärmepumpe anfragen', heizung: 'Neue Heizung anfragen', bad: 'Bad anfragen', frage: 'Frage senden', bewerbung: 'Bewerbung senden' };
  var danke = {
    wartung: 'Danke! In der fertigen Seite käme Ihre Wartungsanfrage jetzt als Mail bei Jörg Ehling an.',
    waermepumpe: 'Danke! In der fertigen Seite käme Ihre Anfrage zur Wärmepumpe jetzt als Mail bei Jörg Ehling an.',
    heizung: 'Danke! In der fertigen Seite käme Ihre Anfrage zur neuen Heizung jetzt als Mail bei Jörg Ehling an.',
    bad: 'Danke! In der fertigen Seite käme Ihre Anfrage zum Bad jetzt als Mail bei Jörg Ehling an.',
    frage: 'Danke! In der fertigen Seite käme Ihre Frage jetzt als Mail bei Jörg Ehling an.',
    bewerbung: 'Danke! In der fertigen Seite käme Ihre Bewerbung jetzt als Mail bei Jörg Ehling an, mit Lebenslauf im Anhang.'
  };
  var nachrichtLabel = { frage: 'Ihre Frage', bewerbung: 'Ein paar Sätze zu Ihnen' };
  var nachrichtHilfe = { frage: 'Was möchten Sie wissen?', bewerbung: 'Was reizt Sie am Handwerk?' };
  var zeilen = {
    wart: ['wartung'], geraet: ['wartung', 'heizung', 'waermepumpe'], letzte: ['wartung'],
    wunsch: ['heizung'], flaeche: ['heizung', 'waermepumpe'], baujahr: ['heizung', 'waermepumpe'],
    flaechen: ['waermepumpe'], selbst: ['waermepumpe'],
    teile: ['bad'], badm2: ['bad'], wann: ['wartung', 'waermepumpe', 'heizung', 'bad'],
    stelle: ['bewerbung'], nachricht: ['frage']
  };
  var bewegt = {};
  var zuletzt = null;

  function wert(name) {
    var els = form.querySelectorAll('[name="' + name + '"]');
    if (!els.length) return '';
    if (els[0].type === 'radio') {
      for (var i = 0; i < els.length; i++) if (els[i].checked) return els[i].value;
      return '';
    }
    if (els[0].type === 'checkbox') {
      var v = [];
      els.forEach(function (e) { if (e.checked) v.push(e.value); });
      return v.join(', ');
    }
    return (els[0].value || '').trim();
  }

  function setze(feld, text) {
    var ziel = document.querySelector('[data-live="' + feld + '"]');
    if (!ziel || ziel.textContent === text) return;
    ziel.classList.add('neu');
    setTimeout(function () { ziel.textContent = text; ziel.classList.remove('neu'); }, 160);
  }

  function kurz(t, n) { return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + ' …' : t; }

  function aktualisieren() {
    var a = wert('anliegen') || 'wartung';
    if (zuletzt && zuletzt !== a) document.getElementById('danke').hidden = true;
    zuletzt = a;
    form.querySelectorAll('[data-zeige]').forEach(function (el) {
      el.hidden = el.getAttribute('data-zeige').split(' ').indexOf(a) < 0;
    });
    Object.keys(zeilen).forEach(function (k) {
      var z = document.querySelector('[data-zeile="' + k + '"]');
      if (z) z.hidden = zeilen[k].indexOf(a) < 0;
    });
    document.getElementById('senden').textContent = knopf[a];
    document.getElementById('nachricht-label').innerHTML = (nachrichtLabel[a] || 'Nachricht') + ' <small>freiwillig</small>';
    document.getElementById('nachricht').placeholder = nachrichtHilfe[a] || 'Was sollte Jörg Ehling vorher wissen?';
    document.getElementById('live-klein').textContent = a === 'bewerbung' ? 'Bewerbung bei' : 'Ihr Kundendienst';
    document.getElementById('live-wer').textContent = a === 'bewerbung' ? 'Name' : 'Kunde';

    ['flaeche', 'badm2'].forEach(function (r) {
      var v = form.elements[r].value + ' m²';
      document.getElementById(r + '-out').textContent = v;
      setze(r, bewegt[r] ? 'ca. ' + v : '');
    });
    setze('anliegen', namen[a]);
    ['wart', 'geraet', 'letzte', 'wunsch', 'baujahr', 'flaechen', 'selbst', 'wann', 'stelle'].forEach(function (k) { setze(k, wert(k)); });
    setze('teile', kurz(wert('teile'), 30));
    setze('nachricht', kurz(wert('nachricht'), 30));
    var n = wert('name'), o = wert('ort'), k = wert('kontakt');
    var wer = n || k;
    if (n && o && a !== 'bewerbung' && a !== 'frage') wer = n + ', ' + o.split(',')[0];
    setze('wer', wer);
  }

  function erreichbar(t) {
    return /\S+@\S+\.\S+/.test(t) || t.replace(/\D/g, '').length >= 6;
  }

  form.addEventListener('input', function (e) {
    if (e.target.type === 'range') bewegt[e.target.name] = true;
    if (e.target.id === 'kontakt') document.getElementById('kontakt-fehler').hidden = true;
    aktualisieren();
  });
  form.addEventListener('change', aktualisieren);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var feld = document.getElementById('kontakt');
    var d = document.getElementById('danke');
    if (!erreichbar(feld.value.trim())) {
      document.getElementById('kontakt-fehler').hidden = false;
      d.hidden = true;
      feld.focus();
      return;
    }
    d.textContent = danke[wert('anliegen') || 'wartung'] + ' Im Entwurf wird nichts versendet.';
    d.hidden = false;
  });

  // Links auf der Seite wählen die passende Weiche vor
  document.querySelectorAll('[data-weiche]').forEach(function (l) {
    l.addEventListener('click', function () {
      var r = form.querySelector('input[name="anliegen"][value="' + l.getAttribute('data-weiche') + '"]');
      if (r) { r.checked = true; aktualisieren(); }
    });
  });

  aktualisieren();
})();

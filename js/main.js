// Anfrage: Felder je nach Anliegen zeigen und den Aufkleber live ausfüllen
(function () {
  var form = document.getElementById('formular');
  if (!form) return;
  var namen = { wartung: 'Wartung', heizung: 'Neue Heizung', bad: 'Bad', sanitaer: 'Sanitär', frage: 'Allgemeine Frage' };
  var knopf = { wartung: 'Wartung anfragen', heizung: 'Anfrage senden', bad: 'Anfrage senden', sanitaer: 'Anfrage senden', frage: 'Nachricht senden' };
  var zeilen = { geraet: ['wartung', 'heizung'], letzte: ['wartung'], bad: ['bad'], wann: ['wartung', 'heizung', 'bad', 'sanitaer'], nachricht: ['frage'] };

  function wert(name) {
    var el = form.elements[name];
    if (!el) return '';
    if (el instanceof RadioNodeList || (el.length && el[0] && el[0].type === 'radio')) {
      for (var i = 0; i < el.length; i++) if (el[i].checked) return el[i].value;
      return '';
    }
    return (el.value || '').trim();
  }

  function setze(feld, text) {
    var ziel = document.querySelector('[data-live="' + feld + '"]');
    if (!ziel || ziel.textContent === text) return;
    ziel.classList.add('neu');
    setTimeout(function () { ziel.textContent = text; ziel.classList.remove('neu'); }, 160);
  }

  function aktualisieren() {
    var anliegen = wert('anliegen') || 'wartung';
    form.querySelectorAll('[data-zeige]').forEach(function (el) {
      el.hidden = el.getAttribute('data-zeige').split(' ').indexOf(anliegen) < 0;
    });
    Object.keys(zeilen).forEach(function (k) {
      var z = document.querySelector('[data-zeile="' + k + '"]');
      if (z) z.hidden = zeilen[k].indexOf(anliegen) < 0;
    });
    document.getElementById('senden').textContent = knopf[anliegen];
    setze('anliegen', namen[anliegen]);
    setze('geraet', wert('geraet'));
    setze('letzte', wert('letzte'));
    setze('bad', wert('bad'));
    setze('wann', wert('wann'));
    var m = wert('nachricht');
    setze('nachricht', m.length > 30 ? m.slice(0, 30).replace(/\s+\S*$/, '') + ' …' : m);
    var n = wert('name'), o = wert('ort');
    setze('name', n && o ? n + ', ' + o.split(',')[0] : n);
  }

  form.addEventListener('input', aktualisieren);
  form.addEventListener('change', aktualisieren);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('danke').hidden = false;
  });

  // Links aus den Leistungen wählen das passende Anliegen vor
  document.querySelectorAll('[data-anliegen]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = form.querySelector('input[name="anliegen"][value="' + a.getAttribute('data-anliegen') + '"]');
      if (r) { r.checked = true; aktualisieren(); }
    });
  });

  aktualisieren();
})();

// Bewerbung: im Entwurf nur bestätigen
(function () {
  var f = document.getElementById('bewerbung');
  if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('bew-danke').hidden = false;
  });
})();

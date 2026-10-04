(function () {
  "use strict";
  var root = document.documentElement;
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) {} }
  };
  var NO = __NO__;

  var S = {
    en: {
      pending: "Original pending",
      sampleBanner: "Sample record. Not a verified archive original.",
      photographer: "Photographer", date: "Capture date", location: "Location", camera: "Camera and lens",
      raw: "RAW original", checksum: "Checksum", c2pa: "Content credentials (C2PA)", rights: "Rights",
      ai: "AI-training reservation", series: "Series", provenance: "Provenance",
      holder: "Rights holder", releases: "Model and property releases",
      subject: "Subject", sub_land: "Landscape", sub_city: "City", sub_portrait: "Portrait",
      ppPrev: "Previous plate", ppNext: "Next plate", mailGates: "Gates met",
      notSupplied: "Not supplied", notArchived: "Not archived", none: "None", notStated: "Not stated",
      unassigned: "Unassigned", pendingV: "Pending",
      ppFoot: "Verified only when all three gates have evidence. Logged, dated and revocable.",
      ppHow: "How this plate becomes verified",
      gate: "Gate", gateNotMet: "Not met", gatesMet: "Gates met",
      gSource: "Source", gSourceD: "The original file is archived with a checksum. Capture data comes from the file.",
      gIdentity: "Identity", gIdentityD: "The photographer is identified. The verifier is never the maker.",
      gRights: "Rights", gRightsD: "Rights holder, written licence, releases and an AI-training reservation.",
      ppOther: "Catalogue",
      lkType: "Record type", lkSample: "Sample record", lkPublic: "Public verification", lkNA: "Not available",
      lkExplain: "An ID finds a record. It does not prove it.",
      lkOpen: "Open passport",
      lkMissing: "No record with ID “{q}”. In this demo, IDs run from BA-001 to BA-012.",
      lkEmpty: "Type an ID such as BA-003.",
      simLic: "Licence", simDel: "Delivery",
      licIssue: "A licence can be issued in writing.",
      licRestricted: "Use is restricted. Nothing beyond the stated limits is licensed.",
      licNone: "No licence exists.",
      delAccepted: "Client acceptance is recorded.",
      delReady: "The file is ready. Acceptance is not recorded.",
      delNone: "Nothing has been delivered.",
      warnPaid: "Paid, but not licensed. Payment does not transfer rights.",
      warnDel: "Delivery waits until rights are approved.",
      warnQuote: "Rights approved, quote not. The licence waits.",
      calm: "Each state stands on its own.",
      upNone: "No files selected yet.",
      upHash: "Computing SHA-256 fingerprint on this device…",
      upSkip: "Skipped: larger than 100 MB",
      upFail: "Fingerprint not available in this browser",
      upDone: "SHA-256, computed on this device",
      copied: "Copied.",
      copyFail: "Copying was blocked. The text is selected; press Ctrl+C or ⌘C.",
      mfHead: "BETA ART · review manifest", mfRecord: "Record", mfType: "Type", mfRights: "Rights", mfStatus: "Status",
      mfStatusV: "review only, not a verified record", mfPhoto: "Photo (sample)", mfBiz: "Business (example)", mfEvent: "Event (example)",
      mfPending: "pending", mfInternal: "internal", mfUnconfirmed: "unconfirmed", mfPick: "Select “View manifest” on a row above.",
      enqHead: "BETA ART · Enquiry", enqRoute: "Route", enqMaterial: "Material", enqDecision: "Decision it supports",
      enqEvidence: "Evidence that exists", enqPrepared: "Prepared", enqBlank: "—",
      enqHint: "Fill in all three fields.",
      brHead: "BETA ART · Retrieval brief", brProject: "Project", brQuestions: "Questions",
      brSource: "Source: where is the file that answers it today?",
      brAccess: "Access: who may lawfully open it in five years?",
      brFormat: "Format: will it open without today's software?",
      brNot: "Not included: personal data or confidential files. They come only after scope, access and data processing are agreed.",
      brCount: "{n} of 5 written. A pilot needs 3.",
      brReady: "{n} written. Ready to copy or add to the enquiry.",
      brFull: "All five questions are written. Clear one to add an example.",
      brAdded: "Added to the enquiry. Check the text before you send it anywhere.",
      brEx: ["Which drawing was approved for the facade?", "Who signed off the fire safety changes, and when?", "Where are the roof maintenance documents?"],
      gcHead: "BETA ART · Gallery checklist", gcWork: "Work", gcReady: "Ready",
      gcMissing: "Missing before you submit:", gcNone: "Nothing is missing.",
      gcNot: "Not included: names, files or personal data. Evidence is asked for only after submissions open.",
      gcCount: "{n} of {t} ready.",
      gcSome: "{n} of {t} ready. The list shows what is still missing.",
      gcAll: "Everything on the list is ready for the first submission.",
      gcAdded: "Added to the enquiry. Check the text before you send it anywhere.",
      routes: { archive: "Explore / licensing", rights: "Rights claim", business: "Business project", privat: "Privat / Creator Marketplace", gallery: "Gallery & Events", assignment: "Assignment: Request a Shoot", collab: "Collaboration" },
      hints: {
        archive: ["Plate number, e.g. BA-003", "Intended use, territory and duration", "Any earlier licence or correspondence"],
        rights: ["Plate number, e.g. BA-003", "What you claim, and what you ask Beta Art to do", "Contracts, registrations or files that show it"],
        business: ["The completed project, its size and period", "3–5 questions someone must answer later", "Where the files live today and who has lawful access"],
        privat: ["Your work and its medium", "Display, enquiry, sale or licence", "Source files, rights or releases you hold"],
        gallery: ["Proposed venue, dates and programme", "Exhibit, host or partner", "Partners and image credits already confirmed"],
        assignment: ["Subject and location", "Where the images will be used", "Consents or permits already in place"],
        collab: ["Institution, research or editorial context", "What the collaboration should produce", "Earlier work or references"]
      },
      themeName: "Dark theme"
    },
    no: {
      pending: "Original venter",
      sampleBanner: "Eksempelpost. Ikke en verifisert arkivoriginal.",
      photographer: "Fotograf", date: "Opptaksdato", location: "Sted", camera: "Kamera og objektiv",
      raw: "RAW-original", checksum: "Sjekksum", c2pa: "Innholdslegitimasjon (C2PA)", rights: "Rettigheter",
      ai: "Forbehold mot KI-trening", series: "Serie", provenance: "Proveniens",
      holder: "Rettighetshaver", releases: "Modell- og eiendomssamtykke",
      subject: "Motiv", sub_land: "Landskap", sub_city: "By", sub_portrait: "Portrett",
      ppPrev: "Forrige plate", ppNext: "Neste plate", mailGates: "Oppfylte kontroller",
      notSupplied: "Ikke oppgitt", notArchived: "Ikke arkivert", none: "Ingen", notStated: "Ikke angitt",
      unassigned: "Ikke tildelt", pendingV: "Venter",
      ppFoot: "Verifisert først når alle tre kontrollene har bevis. Loggføres, dateres og kan trekkes tilbake.",
      ppHow: "Slik blir denne platen verifisert",
      gate: "Kontroll", gateNotMet: "Ikke oppfylt", gatesMet: "Oppfylte kontroller",
      gSource: "Kilde", gSourceD: "Originalfilen er arkivert med sjekksum. Opptaksdata hentes fra filen.",
      gIdentity: "Identitet", gIdentityD: "Fotografen er identifisert. Den som verifiserer, har aldri laget verket.",
      gRights: "Rettigheter", gRightsD: "Rettighetshaver, skriftlig lisens, samtykker og et forbehold mot KI-trening.",
      ppOther: "Katalog",
      lkType: "Posttype", lkSample: "Eksempelpost", lkPublic: "Offentlig verifisering", lkNA: "Ikke tilgjengelig",
      lkExplain: "En ID finner en post. Den beviser den ikke.",
      lkOpen: "Åpne passet",
      lkMissing: "Ingen post med ID «{q}». I denne demoen går ID-ene fra BA-001 til BA-012.",
      lkEmpty: "Skriv en ID, for eksempel BA-003.",
      simLic: "Lisens", simDel: "Levering",
      licIssue: "En lisens kan utstedes skriftlig.",
      licRestricted: "Bruken er begrenset. Ingenting utover de angitte grensene er lisensiert.",
      licNone: "Det finnes ingen lisens.",
      delAccepted: "Kundens aksept er registrert.",
      delReady: "Filen er klar. Aksept er ikke registrert.",
      delNone: "Ingenting er levert.",
      warnPaid: "Betalt, men ikke lisensiert. Betaling overfører ikke rettigheter.",
      warnDel: "Levering venter til rettighetene er godkjent.",
      warnQuote: "Rettighetene er godkjent, tilbudet ikke. Lisensen venter.",
      calm: "Hver tilstand står for seg.",
      upNone: "Ingen filer valgt ennå.",
      upHash: "Beregner SHA-256-fingeravtrykk på denne enheten…",
      upSkip: "Hoppet over: større enn 100 MB",
      upFail: "Fingeravtrykk er ikke tilgjengelig i denne nettleseren",
      upDone: "SHA-256, beregnet på denne enheten",
      copied: "Kopiert.",
      copyFail: "Kopiering ble blokkert. Teksten er markert; trykk Ctrl+C eller ⌘C.",
      mfHead: "BETA ART · gjennomgangsmanifest", mfRecord: "Post", mfType: "Type", mfRights: "Rettigheter", mfStatus: "Status",
      mfStatusV: "kun gjennomgang, ikke en verifisert post", mfPhoto: "Foto (eksempel)", mfBiz: "Business (eksempel)", mfEvent: "Arrangement (eksempel)",
      mfPending: "venter", mfInternal: "intern", mfUnconfirmed: "ubekreftet", mfPick: "Velg «Vis manifest» på en rad over.",
      enqHead: "BETA ART · Henvendelse", enqRoute: "Type", enqMaterial: "Materiale", enqDecision: "Beslutning den støtter",
      enqEvidence: "Bevis som finnes", enqPrepared: "Utarbeidet", enqBlank: "—",
      enqHint: "Fyll ut alle tre feltene.",
      brHead: "BETA ART · Gjenfinningsnotat", brProject: "Prosjekt", brQuestions: "Spørsmål",
      brSource: "Kilde: hvor ligger filen som svarer på det i dag?",
      brAccess: "Tilgang: hvem kan lovlig åpne den om fem år?",
      brFormat: "Format: kan den åpnes uten dagens programvare?",
      brNot: "Ikke med: personopplysninger eller fortrolige filer. De kommer først når omfang, tilgang og databehandling er avtalt.",
      brCount: "{n} av 5 skrevet. En pilot trenger 3.",
      brReady: "{n} skrevet. Klart til å kopiere eller legge til i henvendelsen.",
      brFull: "Alle fem spørsmålene er skrevet. Tøm ett felt for å legge til et eksempel.",
      brAdded: "Lagt til i henvendelsen. Les gjennom teksten før du sender den noe sted.",
      brEx: ["Hvilken tegning ble godkjent for fasaden?", "Hvem godkjente endringene i brannsikringen, og når?", "Hvor ligger FDV-dokumentasjonen for taket?"],
      gcHead: "BETA ART · Sjekkliste for galleri", gcWork: "Verk", gcReady: "Klart",
      gcMissing: "Mangler før du sender inn:", gcNone: "Ingenting mangler.",
      gcNot: "Ikke med: navn, filer eller personopplysninger. Bevis etterspørres først når innsending åpner.",
      gcCount: "{n} av {t} klart.",
      gcSome: "{n} av {t} klart. Listen viser hva som fortsatt mangler.",
      gcAll: "Alt på listen er klart for første innsending.",
      gcAdded: "Lagt til i henvendelsen. Les gjennom teksten før du sender den noe sted.",
      routes: { archive: "Utforsk / lisensiering", rights: "Rettighetskrav", business: "Business-prosjekt", privat: "Privat / Creator Marketplace", gallery: "Galleri & arrangementer", assignment: "Oppdrag: Bestill et fotooppdrag", collab: "Samarbeid" },
      hints: {
        archive: ["Platenummer, f.eks. BA-003", "Tiltenkt bruk, territorium og varighet", "Tidligere lisens eller korrespondanse"],
        rights: ["Platenummer, f.eks. BA-003", "Hva du krever, og hva du ber Beta Art gjøre", "Avtaler, registreringer eller filer som viser det"],
        business: ["Det avsluttede prosjektet, størrelse og periode", "3–5 spørsmål noen må kunne svare på senere", "Hvor filene ligger i dag, og hvem som har lovlig tilgang"],
        privat: ["Arbeidet ditt og mediet", "Visning, forespørsel, salg eller lisens", "Kildefiler, rettigheter eller samtykker du har"],
        gallery: ["Foreslått lokale, datoer og program", "Stille ut, være vert eller partner", "Partnere og bildekreditering som allerede er bekreftet"],
        assignment: ["Motiv og sted", "Hvor bildene skal brukes", "Samtykker eller tillatelser som allerede finnes"],
        collab: ["Institusjon, forskning eller redaksjonell kontekst", "Hva samarbeidet skal gi", "Tidligere arbeid eller referanser"]
      },
      themeName: "Mørkt tema"
    }
  };

  /* third field: subject, Betul's own grouping on beta-art.com (29.09.2026) */
  var PLATES = [
    ["BA-001", "First Light", "land"], ["BA-002", "Into the Pines", "land"], ["BA-003", "Sea of Fog", "land"], ["BA-004", "Still Water", "land"],
    ["BA-005", "PALM", "city"], ["BA-006", "Blue Hour Grid", "city"], ["BA-007", "Night Crossing", "city"], ["BA-008", "Golden Hour", "land"],
    ["BA-009", "Portrait in Amber", "portrait"], ["BA-010", "The Maker", "portrait"], ["BA-011", "Slow Morning", "land"], ["BA-012", "Low Tide", "land"]
  ];
  /* Every sample plate has the same empty evidence. A gate is met only when all of its fields hold evidence. */
  var GATES = [
    { key: "gSource", fields: [["raw", "notArchived"], ["checksum", "none"], ["date", "notSupplied"], ["camera", "notSupplied"], ["location", "notSupplied"], ["c2pa", "none"]] },
    { key: "gIdentity", fields: [["photographer", "notSupplied"]] },
    { key: "gRights", fields: [["holder", "notSupplied"], ["rights", "notStated"], ["releases", "notSupplied"], ["ai", "notStated"]] }
  ];
  var OTHER = [["series", "unassigned"], ["provenance", "pendingV"]];
  function gatesMet() { return 0; }

  var lang = "en";
  function t(k) { var d = S[lang] || S.en; return d[k] != null ? d[k] : S.en[k]; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- i18n ---------- */
  var i18nEls = $$("[data-i18n]"), enHTML = new Map();
  i18nEls.forEach(function (el) { enHTML.set(el, el.innerHTML); });
  var phEls = $$("[data-i18n-ph]"), enPh = new Map();
  phEls.forEach(function (el) { enPh.set(el, el.getAttribute("placeholder")); });
  var arEls = $$("[data-i18n-aria]"), enAr = new Map();
  arEls.forEach(function (el) { enAr.set(el, el.getAttribute("aria-label")); });

  function applyLang(l, save) {
    lang = l === "no" ? "no" : "en";
    root.lang = lang === "no" ? "nb" : "en";
    i18nEls.forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      el.innerHTML = lang === "no" && NO[k] != null ? NO[k] : enHTML.get(el);
    });
    phEls.forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph");
      el.setAttribute("placeholder", lang === "no" && NO[k] != null ? NO[k] : enPh.get(el));
    });
    arEls.forEach(function (el) {
      var k = el.getAttribute("data-i18n-aria");
      el.setAttribute("aria-label", lang === "no" && NO[k] != null ? NO[k] : enAr.get(el));
    });
    $$("[data-lang-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang-btn") === lang)); });
    if (save) store.set("ba-lang", lang);
    renderAll();
  }
  $$("[data-lang-btn]").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang-btn"), true); });
  });

  /* ---------- theme ---------- */
  var themeBtn = $("#themeBtn");
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  /* two states (modern-web-guidance: dark-mode): follow the system, or pin the opposite of it */
  var metaCS = document.querySelector('meta[name="color-scheme"]');
  function pinned() { var th = root.getAttribute("data-theme"); return th === "dark" || th === "light" ? th : null; }
  function systemDark() { return !!(mq && mq.matches); }
  function isDark() { var p = pinned(); return p ? p === "dark" : systemDark(); }
  function syncThemeBtn() { themeBtn.setAttribute("aria-pressed", String(isDark())); themeBtn.title = t("themeName"); }
  function setTheme(p) {
    if (p) { root.setAttribute("data-theme", p); store.set("ba-theme", p); }
    else { root.removeAttribute("data-theme"); store.del("ba-theme"); }
    if (metaCS) metaCS.content = p || "light dark";
    syncThemeBtn();
  }
  var savedTheme = store.get("ba-theme");
  if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  themeBtn.addEventListener("click", function () {
    var wantDark = !isDark();
    setTheme(wantDark === systemDark() ? null : (wantDark ? "dark" : "light"));
  });
  if (mq) { try { mq.addEventListener("change", syncThemeBtn); } catch (e) { if (mq.addListener) mq.addListener(syncThemeBtn); } }

  /* ---------- plates + passport ---------- */
  var platesEl = $("#plates"), dlg = $("#passport"), openId = null, filter = "all", navigated = false;
  function shown(p) { return filter === "all" || p[2] === filter; }
  function renderPlates() {
    platesEl.innerHTML = PLATES.map(function (p, i) {
      var n = p[0].slice(3);
      /* the visible caption is the button's name (label in name); the empty frame is decoration */
      return '<button type="button" class="pl" data-id="' + p[0] + '" data-sub="' + p[2] + '" aria-haspopup="dialog" style="--ang:' + (28 + i * 23) + 'deg"' + (shown(p) ? '' : ' hidden') + '>' +
        '<span class="pl-frame" aria-hidden="true"><span class="pl-crop"></span><span class="pl-no">' + n + '</span></span>' +
        '<span class="pl-cap"><span class="pl-id">' + p[0] + '</span><span class="pl-title" lang="en">' + esc(p[1]) + '</span></span></button>';
    }).join("");
  }
  platesEl.addEventListener("click", function (e) {
    var b = e.target.closest(".pl");
    if (b) openPassport(b.getAttribute("data-id"));
  });
  /* subject filter: toggle buttons with aria-pressed; the count sits in each button's visible name */
  var fBtns = $$("[data-filter]");
  fBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.getAttribute("data-filter");
      fBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      $$(".pl", platesEl).forEach(function (el) { el.hidden = !shown(plateBy(el.getAttribute("data-id"))); });
    });
  });
  function plateBy(id) { for (var i = 0; i < PLATES.length; i++) if (PLATES[i][0] === id) return PLATES[i]; return null; }
  /* prev/next walk the plates the filter shows; a plate opened from BETA-ID outside the filter walks all twelve */
  function navList() {
    var list = PLATES.filter(shown);
    return list.some(function (p) { return p[0] === openId; }) ? list : PLATES;
  }
  function neighbour(step) {
    var list = navList(), i = 0;
    for (var k = 0; k < list.length; k++) if (list[k][0] === openId) i = k;
    return list[(i + step + list.length) % list.length];
  }
  function navLabel(el, key, p, before) {
    var arrow = '<span aria-hidden="true">' + (before ? "←" : "→") + '</span>';
    var text = '<span class="vh">' + esc(t(key)) + ': </span>' + p[0] + ' <span class="pp-nav-t" lang="en">' + esc(p[1]) + '</span>';
    el.innerHTML = before ? arrow + ' ' + text : text + ' ' + arrow;
    el.setAttribute("data-go", p[0]);
  }
  function fillPassport() {
    var p = plateBy(openId); if (!p) return;
    $("#ppTitle").textContent = p[0] + " · " + p[1];
    $("#ppBanner").textContent = t("sampleBanner");
    function rows(list) {
      return list.map(function (f) { return '<div><dt>' + esc(t(f[0])) + '</dt><dd' + (f[2] ? '' : ' class="pend"') + '>' + esc(t(f[1])) + '</dd></div>'; }).join("");
    }
    var other = [["subject", "sub_" + p[2], true]].concat(OTHER);
    $("#ppRows").innerHTML =
      '<h3 class="pp-how">' + esc(t("ppHow")) + '<span class="pp-count">' + esc(t("gatesMet")) + ': ' + gatesMet() + ' / 3</span></h3>' +
      '<ol class="gates">' + GATES.map(function (g, i) {
        return '<li class="gate"><div class="gate-head"><span class="label acc">' + esc(t("gate")) + ' ' + (i + 1) + ': ' + esc(t(g.key)) + '</span>' +
          '<span class="chip stop">' + esc(t("gateNotMet")) + '</span></div>' +
          '<p class="gate-d">' + esc(t(g.key + "D")) + '</p><dl class="kv">' + rows(g.fields) + '</dl></li>';
      }).join("") + '</ol>' +
      '<p class="label pp-other">' + esc(t("ppOther")) + '</p><dl class="kv">' + rows(other) + '</dl>';
    $("#ppFoot").textContent = t("ppFoot");
    /* forward by email: opens the reader's own mail app, no address is published and nothing is sent by the page */
    var subj = "BETA ART · " + p[0] + " · " + p[1];
    var body = [p[0] + " · " + p[1], t("sampleBanner"), t("mailGates") + ": " + gatesMet() + " / 3"].join("\n");
    $("#ppMail").href = "mailto:?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body);
    var many = navList().length > 1;
    [$("#ppPrev"), $("#ppNext")].forEach(function (b) { b.hidden = !many; });
    if (many) { navLabel($("#ppPrev"), "ppPrev", neighbour(-1), true); navLabel($("#ppNext"), "ppNext", neighbour(1), false); }
  }
  /* copy a link that reopens this plate's passport (#BA-003); nothing is shared with any service */
  function plateLink(id) { return location.href.split("#")[0] + "#" + id; }
  $("#ppLink").addEventListener("click", function () {
    var url = $("#ppUrl"); url.textContent = plateLink(openId); url.hidden = false;
    copyText(url.textContent, url, $("#ppLive"));
  });
  function go(id) {
    if (!id || id === openId) return;
    openId = id; navigated = true; $("#ppUrl").hidden = true; fillPassport();
    var p = plateBy(id);
    /* the live region sits inside the dialog: outside it the page is inert while the dialog is open */
    var live = $("#ppLive"); live.textContent = ""; setTimeout(function () { live.textContent = p[0] + " · " + p[1]; }, 60);
  }
  $("#ppPrev").addEventListener("click", function () { go(this.getAttribute("data-go")); });
  $("#ppNext").addEventListener("click", function () { go(this.getAttribute("data-go")); });
  dlg.addEventListener("keydown", function (e) {
    if (!dlg.open || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      var n = neighbour(e.key === "ArrowLeft" ? -1 : 1); if (n) { e.preventDefault(); go(n[0]); }
    }
  });
  /* a rights claim goes to the enquiry builder with the plate already named */
  var claimNext = false;
  $("#ppClaim").addEventListener("click", function (e) {
    e.preventDefault();
    var p = plateBy(openId);
    enqRoute.value = "rights";
    if (p && !enqM.value.trim()) enqM.value = p[0] + " · " + p[1];
    renderEnquiry();
    claimNext = true; closePassport();
  });
  var lastFocus = null;
  function openPassport(id) {
    lastFocus = document.activeElement;
    openId = id; navigated = false; $("#ppUrl").hidden = true; fillPassport();
    if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); }
    else dlg.setAttribute("open", "");
  }
  function closePassport() { if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open"); }
  /* the close button sits in <form method="dialog">; closedby="any" gives light dismiss where supported */
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    dlg.addEventListener("click", function (e) {
      if (e.target !== dlg) return;
      var r = dlg.getBoundingClientRect();
      var inside = r.top <= e.clientY && e.clientY <= r.top + r.height && r.left <= e.clientX && e.clientX <= r.left + r.width;
      if (!inside) closePassport();
    });
  }
  dlg.addEventListener("close", function () {
    var id = openId; openId = null; $("#ppLive").textContent = "";
    if (claimNext) {
      claimNext = false; lastFocus = null;
      $("#join").scrollIntoView(); enqM.focus({ preventScroll: true });
      return;
    }
    /* give focus back to what opened the passport; after prev/next or a language switch, to the plate now shown */
    var back = !navigated && lastFocus && lastFocus.isConnected ? lastFocus : null;
    if (!back && id) back = platesEl.querySelector('.pl[data-id="' + id + '"]:not([hidden])');
    if (!back && lastFocus && lastFocus.isConnected) back = lastFocus;
    if (back && typeof back.focus === "function") back.focus();
    lastFocus = null;
  });

  /* ---------- licence use filter ---------- */
  var uBtns = $$("[data-use]").filter(function (b) { return b.tagName === "BUTTON"; });
  uBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var u = b.getAttribute("data-use");
      uBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      $$("#tiers .tier").forEach(function (el) { el.hidden = u !== "all" && el.getAttribute("data-use") !== u; });
    });
  });

  /* ---------- lookup ---------- */
  var lkInput = $("#lookupInput"), lkOut = $("#lookupOut");
  function normalizeId(q) {
    var s = String(q || "").toUpperCase().replace(/\s+/g, "");
    var m = s.match(/^(?:BA-?)?0*(\d{1,3})$/);
    if (m) { var n = parseInt(m[1], 10); return "BA-" + ("00" + n).slice(-3); }
    return s;
  }
  function renderLookup() {
    var raw = lkInput.value.trim();
    if (!raw) { lkOut.innerHTML = '<div class="lk-out"><p class="lk-miss">' + esc(t("lkEmpty")) + '</p></div>'; return; }
    var id = normalizeId(raw), p = plateBy(id);
    if (!p) {
      lkOut.innerHTML = '<div class="lk-out"><p class="lk-miss">' + esc(t("lkMissing").replace("{q}", raw)) + '</p></div>';
      return;
    }
    lkOut.innerHTML = '<div class="lk-out"><div class="lk-top"><span class="lk-t" lang="en">' + esc(p[1]) + '</span><span class="lk-id">' + p[0] + '</span></div>' +
      '<dl class="kv">' +
      '<div><dt>' + esc(t("lkType")) + '</dt><dd>' + esc(t("lkSample")) + '</dd></div>' +
      '<div><dt>' + esc(t("provenance")) + '</dt><dd class="pend">' + esc(t("pendingV")) + '</dd></div>' +
      '<div><dt>' + esc(t("rights")) + '</dt><dd class="pend">' + esc(t("notStated")) + '</dd></div>' +
      '<div><dt>' + esc(t("gatesMet")) + '</dt><dd class="pend">' + gatesMet() + ' / 3</dd></div>' +
      '<div><dt>' + esc(t("lkPublic")) + '</dt><dd class="pend">' + esc(t("lkNA")) + '</dd></div>' +
      '</dl><div class="lk-foot"><p>' + esc(t("lkExplain")) + '</p>' +
      '<button type="button" class="mini" data-open="' + p[0] + '" aria-haspopup="dialog">' + esc(t("lkOpen")) + '</button></div></div>';
  }
  $("#lookupForm").addEventListener("submit", function (e) { e.preventDefault(); renderLookup(); });
  lkOut.addEventListener("click", function (e) {
    var b = e.target.closest("[data-open]"); if (b) openPassport(b.getAttribute("data-open"));
  });

  /* ---------- transparency simulator ---------- */
  var simRows = $("#simRows");
  function val(name) { var el = simRows.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; }
  function renderSim() {
    var quote = val("quote"), pay = val("payment"), rights = val("rights"), del = val("delivery");
    var licensed = rights === "approved" && quote === "approved";
    var lic = licensed ? t("licIssue") : rights === "restricted" ? t("licRestricted") : t("licNone");
    var d = del === "accepted" ? t("delAccepted") : del === "ready" ? t("delReady") : t("delNone");
    $("#simLicL").textContent = t("simLic"); $("#simLic").textContent = lic;
    $("#simDelL").textContent = t("simDel"); $("#simDel").textContent = d;
    var warns = [];
    if (pay === "paid" && !licensed) warns.push(t("warnPaid"));
    if ((del === "ready" || del === "accepted") && rights !== "approved") warns.push(t("warnDel"));
    if (rights === "approved" && quote !== "approved") warns.push(t("warnQuote"));
    $("#simWarn").innerHTML = warns.length
      ? warns.map(function (w) { return '<p class="sim-warn">' + esc(w) + '</p>'; }).join("")
      : '<p class="sim-warn calm">' + esc(t("calm")) + '</p>';
  }
  simRows.addEventListener("change", renderSim);

  /* ---------- studio tabs ---------- */
  var tabs = $$(".tab");
  /* hidden panels stay findable with Find in page where hidden="until-found" is supported */
  var untilFound = "onbeforematch" in HTMLElement.prototype;
  function hidePanel(panel, hide) {
    if (!panel) return;
    if (!hide) { panel.hidden = false; return; }
    if (untilFound) panel.setAttribute("hidden", "until-found"); else panel.hidden = true;
  }
  function selectTab(tab, focus) {
    tabs.forEach(function (b) {
      var on = b === tab;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      hidePanel($("#" + b.getAttribute("aria-controls")), !on);
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (b, i) {
    b.addEventListener("click", function () { selectTab(b); });
    b.addEventListener("keydown", function (e) {
      var n = -1;
      if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n > -1) { e.preventDefault(); selectTab(tabs[n], true); }
    });
  });

  tabs.forEach(function (b) {
    var panel = $("#" + b.getAttribute("aria-controls"));
    if (b.getAttribute("aria-selected") !== "true") hidePanel(panel, true);
    if (panel) panel.addEventListener("beforematch", function () { selectTab(b); });
  });

  /* ---------- manifest ---------- */
  var mfId = "BA-001";
  var MF = {
    "BA-001": ["BA-001 · First Light", "mfPhoto", "mfPending"],
    "BP-001": ["BP-001", "mfBiz", "mfInternal"],
    "GE-001": ["GE-001", "mfEvent", "mfUnconfirmed"]
  };
  function renderManifest() {
    var m = MF[mfId], out = $("#manifestOut");
    if (!m) { out.textContent = t("mfPick"); return; }
    out.textContent = [t("mfHead"), t("mfRecord") + ": " + m[0], t("mfType") + ": " + t(m[1]),
      t("mfRights") + ": " + t(m[2]), t("mfStatus") + ": " + t("mfStatusV")].join("\n");
  }
  $$("[data-manifest]").forEach(function (b) {
    b.addEventListener("click", function () { mfId = b.getAttribute("data-manifest"); renderManifest(); });
  });

  function status(el, text) { if (!el) return; clearTimeout(el._baT); el._baT = setTimeout(function () { el.textContent = text; }, 450); }

  /* ---------- copy helper ---------- */
  function copyText(text, node, msgEl) {
    function fallback() {
      try {
        var r = document.createRange(); r.selectNodeContents(node);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      } catch (e) {}
      if (msgEl) msgEl.textContent = t("copyFail");
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { if (msgEl) msgEl.textContent = t("copied"); }, fallback);
      } else fallback();
    } catch (e) { fallback(); }
  }
  $("#copyManifest").addEventListener("click", function () {
    var out = $("#manifestOut"), msg = $("#mfMsg"); copyText(out.textContent, out, msg);
    setTimeout(function () { msg.textContent = ""; }, 2400);
  });

  /* ---------- source intake with local SHA-256 ---------- */
  var files = [], drop = $("#drop"), fileInput = $("#fileInput"), fileList = $("#fileList");
  var LIMIT = 100 * 1024 * 1024;
  function fmtSize(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB"; }
  function renderFiles() {
    if (!files.length) { fileList.innerHTML = '<li><small>' + esc(t("upNone")) + '</small></li>'; return; }
    fileList.innerHTML = files.map(function (f) {
      var line = f.state === "hashing" ? t("upHash") : f.state === "skip" ? t("upSkip") : f.state === "fail" ? t("upFail") : t("upDone") + ": " + f.hash;
      return '<li><strong>' + esc(f.name) + '</strong><span class="sz">' + fmtSize(f.size) + '</span><small>' + esc(line) + '</small></li>';
    }).join("");
  }
  function hashFile(entry, file) {
    if (file.size > LIMIT) { entry.state = "skip"; renderFiles(); return; }
    if (!(window.crypto && crypto.subtle && file.arrayBuffer)) { entry.state = "fail"; renderFiles(); return; }
    file.arrayBuffer().then(function (buf) { return crypto.subtle.digest("SHA-256", buf); }).then(function (h) {
      entry.hash = Array.prototype.map.call(new Uint8Array(h), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
      entry.state = "done"; renderFiles();
    }, function () { entry.state = "fail"; renderFiles(); });
  }
  function addFiles(list) {
    Array.prototype.forEach.call(list || [], function (file) {
      var entry = { name: file.name, size: file.size, state: "hashing", hash: "" };
      files.unshift(entry); hashFile(entry, file);
    });
    renderFiles();
  }
  $("#pickFiles").addEventListener("click", function () { fileInput.click(); });
  fileInput.addEventListener("change", function (e) { addFiles(e.target.files); fileInput.value = ""; });
  ["dragenter", "dragover"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); });
  });
  drop.addEventListener("drop", function (e) { addFiles(e.dataTransfer && e.dataTransfer.files); });

  /* ---------- enquiry builder ---------- */
  var enqRoute = $("#enqRoute"), enqM = $("#enqMaterial"), enqD = $("#enqDecision"), enqE = $("#enqEvidence");
  function today() { var d = new Date(); return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear(); }
  function renderEnquiry() {
    var r = enqRoute.value, h = t("hints")[r] || ["", "", ""];
    enqM.placeholder = h[0]; enqD.placeholder = h[1]; enqE.placeholder = h[2];
    function v(el) { return el.value.trim() || t("enqBlank"); }
    $("#enqOut").textContent = [t("enqHead"), "", t("enqRoute") + ": " + t("routes")[r],
      t("enqMaterial") + ": " + v(enqM), t("enqDecision") + ": " + v(enqD), t("enqEvidence") + ": " + v(enqE),
      t("enqPrepared") + ": " + today()].join("\n");
    var filled = enqM.value.trim() && enqD.value.trim() && enqE.value.trim();
    status($("#enqMsg"), filled ? "" : t("enqHint"));
  }
  [enqRoute, enqM, enqD, enqE].forEach(function (el) { el.addEventListener("input", renderEnquiry); el.addEventListener("change", renderEnquiry); });
  $("#enqForm").addEventListener("submit", function (e) { e.preventDefault(); });
  $("#copyEnq").addEventListener("click", function () {
    var out = $("#enqOut"); copyText(out.textContent, out, $("#enqMsg"));
  });
  $$("[data-route]").forEach(function (a) {
    a.addEventListener("click", function () { enqRoute.value = a.getAttribute("data-route"); renderEnquiry(); });
  });

  /* ---------- retrieval brief (Business) ---------- */
  var brProject = $("#brProject"), brQs = [1, 2, 3, 4, 5].map(function (i) { return $("#brQ" + i); });
  function brFilled() { return brQs.map(function (el) { return el.value.trim(); }).filter(Boolean); }
  function renderBrief() {
    var qs = brFilled(), lines = [t("brHead"), t("brProject") + ": " + (brProject.value.trim() || t("enqBlank")), ""];
    if (!qs.length) lines.push(t("brQuestions") + ": " + t("enqBlank"), "");
    qs.forEach(function (q, i) {
      lines.push("Q" + (i + 1) + "  " + q, "    [ ] " + t("brSource"), "    [ ] " + t("brAccess"), "    [ ] " + t("brFormat"), "");
    });
    lines.push(t("brNot"), t("enqPrepared") + ": " + today());
    $("#briefOut").textContent = lines.join("\n");
    status($("#briefMsg"), (qs.length >= 3 ? t("brReady") : t("brCount")).replace("{n}", qs.length));
  }
  [brProject].concat(brQs).forEach(function (el) { el.addEventListener("input", renderBrief); });
  $("#briefForm").addEventListener("submit", function (e) { e.preventDefault(); });
  $$(".ex").forEach(function (b) {
    b.addEventListener("click", function () {
      var text = t("brEx")[+b.getAttribute("data-ex")], empty = null;
      for (var i = 0; i < brQs.length; i++) { if (brQs[i].value.trim() === text) return; if (!empty && !brQs[i].value.trim()) empty = brQs[i]; }
      if (!empty) { $("#briefMsg").textContent = t("brFull"); return; }
      empty.value = text; renderBrief();
    });
  });
  $("#copyBrief").addEventListener("click", function () { var out = $("#briefOut"); copyText(out.textContent, out, $("#briefMsg")); });
  $("#briefToEnq").addEventListener("click", function () {
    var qs = brFilled();
    enqRoute.value = "business";
    if (brProject.value.trim()) enqM.value = brProject.value.trim();
    if (qs.length) enqD.value = qs.map(function (q, i) { return (i + 1) + ". " + q; }).join("\n");
    renderEnquiry();
    $("#briefMsg").textContent = t("brAdded");
    enqD.focus();
  });

  /* ---------- gallery checklist ---------- */
  var gcWork = $("#gcWork"), gcBoxes = $$("[data-gc]");
  function txt(el) { return el ? el.textContent.replace(/\u00ad/g, "").replace(/\s+/g, " ").trim() : ""; }
  function renderGc() {
    var held = gcBoxes.filter(function (c) { return c.checked; }).length, total = gcBoxes.length, missing = [];
    var lines = [t("gcHead"), t("gcWork") + ": " + (gcWork.value.trim() || t("enqBlank")), t("gcReady") + ": " + held + " / " + total, ""];
    $$("#gcForm .gc-g").forEach(function (fs) {
      lines.push(txt(fs.querySelector("legend")));
      $$("[data-gc]", fs).forEach(function (c) {
        var label = txt(c.parentNode);
        lines.push("  [" + (c.checked ? "x" : " ") + "] " + label);
        if (!c.checked) missing.push(label);
      });
      lines.push("");
    });
    lines.push(t("gcMissing"));
    if (missing.length) missing.forEach(function (m) { lines.push("  - " + m); }); else lines.push("  " + t("gcNone"));
    lines.push("", t("gcNot"), t("enqPrepared") + ": " + today());
    $("#gcOut").textContent = lines.join("\n");
    var key = held === total ? "gcAll" : held ? "gcSome" : "gcCount";
    status($("#gcMsg"), t(key).replace("{n}", held).replace("{t}", total));
  }
  gcBoxes.forEach(function (c) { c.addEventListener("change", renderGc); });
  gcWork.addEventListener("input", renderGc);
  $("#gcForm").addEventListener("submit", function (e) { e.preventDefault(); });
  $("#copyGc").addEventListener("click", function () { var out = $("#gcOut"); copyText(out.textContent, out, $("#gcMsg")); });
  $("#gcToEnq").addEventListener("click", function () {
    var held = gcBoxes.filter(function (c) { return c.checked; }).map(function (c) { return txt(c.parentNode); });
    enqRoute.value = "gallery";
    if (gcWork.value.trim()) enqM.value = gcWork.value.trim();
    if (held.length) enqE.value = held.map(function (h) { return "- " + h; }).join("\n");
    renderEnquiry();
    $("#gcMsg").textContent = t("gcAdded");
    enqE.focus();
  });

  /* ---------- mobile menu: show that it scrolls sideways ---------- */
  var mnav = $(".mnav");
  /* the first and last links report whether they are fully visible, so no layout is read on scroll */
  if (mnav && "IntersectionObserver" in window) {
    var mItems = $$("a", mnav), first = mItems[0], last = mItems[mItems.length - 1];
    var edgeIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var hidden = en.intersectionRatio < 0.98;
        if (en.target === first) mnav.classList.toggle("more-l", hidden);
        if (en.target === last) mnav.classList.toggle("more-r", hidden);
      });
    }, { root: mnav, threshold: [0, 0.98, 1] });
    if (first) edgeIO.observe(first);
    if (last && last !== first) edgeIO.observe(last);
  }
  function keepCurrentInView() {
    if (!mnav) return;
    var a = mnav.querySelector('[aria-current="location"]'); if (!a || !mnav.clientWidth) return;
    var left = a.offsetLeft - mnav.offsetLeft, right = left + a.offsetWidth, pad = 40;
    if (left < mnav.scrollLeft + pad || right > mnav.scrollLeft + mnav.clientWidth - pad) {
      var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      try { mnav.scrollTo({ left: Math.max(0, left - pad), behavior: reduce ? "auto" : "smooth" }); } catch (e) { mnav.scrollLeft = Math.max(0, left - pad); }
    }
  }

  /* ---------- nav: current section ---------- */
  var links = $$(".nav a, .mnav a");
  var ids = ["explore", "business", "privat", "gallery-events", "record", "join"];
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        links.forEach(function (a) { if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current"); });
        keepCurrentInView();
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ids.forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------- back to top ----------
     The progress line and the turning aperture are CSS scroll-driven animations (decorative, progressive
     enhancement, no script fallback). Only the back-to-top button needs script: it appears once the hero has left. */
  var toTop = $("#toTop"), hero = $("#top");
  if (toTop && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { toTop.classList.toggle("show", !en.isIntersecting && en.boundingClientRect.top < 0); });
    }).observe(hero);
  }

  function renderAll() {
    renderPlates(); renderLookup(); renderSim(); renderManifest(); renderFiles(); renderEnquiry(); renderBrief(); renderGc(); syncThemeBtn(); keepCurrentInView();
    if (openId) fillPassport();
  }

  /* a copied plate link (#BA-003) opens that plate's passport */
  function openFromHash() { var m = /^#(BA-\d{3})$/.exec(location.hash); if (m && plateBy(m[1])) openPassport(m[1]); }
  window.addEventListener("hashchange", openFromHash);
  var savedLang = store.get("ba-lang");
  applyLang(savedLang === "no" ? "no" : "en", false);
  openFromHash();
})();

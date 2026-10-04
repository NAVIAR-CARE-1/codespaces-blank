#!/usr/bin/env python3
"""Builds the combined BETA ART page (EN markup + NO dictionary) from one source.

Outputs:
  dist/artifact.html  – fragment for the Claude artifact (no doctype/html/head/body)
  dist/index.html     – standalone document for the local folder / a later Vercel release
"""
import json, pathlib

HERE = pathlib.Path(__file__).parent
DIST = HERE.parent / "dist"
DIST.mkdir(exist_ok=True)

NO = {}
_n = [0]

def _key():
    _n[0] += 1
    return f"k{_n[0]}"

def T(en, no, tag="span", cls="", attrs=""):
    """Translatable element. EN is the markup; NO is stored in the dictionary."""
    k = _key(); NO[k] = no
    c = f' class="{cls}"' if cls else ""
    a = f" {attrs}" if attrs else ""
    return f'<{tag}{c} data-i18n="{k}"{a}>{en}</{tag}>'

def PH(en, no):
    k = _key(); NO[k] = no
    return f'placeholder="{en}" data-i18n-ph="{k}"'

def AR(en, no):
    k = _key(); NO[k] = no
    return f'aria-label="{en}" data-i18n-aria="{k}"'

MARK = ('<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.8" '
        'stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="50" r="46"/><g class="spin"><g class="blades">'
        '<path d="M50 30 75.81 11.92M67.32 40 84.99 47.86M67.32 60 76.66 84.02M50 70 24.19 88.08M32.68 60 15.01 52.14M32.68 40 23.34 15.98"/>'
        '<path d="M50 30 32.68 40 32.68 60 50 70 67.32 60 67.32 40Z"/></g></g></g>'
        '<circle class="dot" cx="50" cy="50" r="5.4" fill="var(--accent)"/></svg>')
MARK_S = ('<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.4" '
          'stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="50" r="46"/><g class="spin"><g class="blades">'
          '<path d="M50 30 75.81 11.92M67.32 40 84.99 47.86M67.32 60 76.66 84.02M50 70 24.19 88.08M32.68 60 15.01 52.14M32.68 40 23.34 15.98"/>'
          '<path d="M50 30 32.68 40 32.68 60 50 70 67.32 60 67.32 40Z"/></g></g></g>'
          '<circle class="dot" cx="50" cy="50" r="6" fill="var(--accent)"/></svg>')

# main areas from BETA ART MAIN (Betul, 02.10.2026): Explore, Business, Privat, Gallery & Events, The Record, Join
NAV = [
    ("#explore", "Explore", "Utforsk"),
    ("#business", "Business", "Business"),
    ("#privat", "Privat", "Privat"),
    ("#gallery-events", "Gallery &amp; Events", "Galleri &amp; arrangementer"),
    ("#record", "The Record", "The Record"),
    ("#join", "Join", "Bli med"),
]

def nav_links():
    return "".join(f'<a href="{h}">{T(en, no)}</a>' for h, en, no in NAV)


# subject = Betul's own grouping on beta-art.com (29.09.2026): landscape / city / portrait
PLATE_LIST = [("BA-001", "First Light", "land"), ("BA-002", "Into the Pines", "land"), ("BA-003", "Sea of Fog", "land"),
    ("BA-004", "Still Water", "land"), ("BA-005", "PALM", "city"), ("BA-006", "Blue Hour Grid", "city"),
    ("BA-007", "Night Crossing", "city"), ("BA-008", "Golden Hour", "land"), ("BA-009", "Portrait in Amber", "portrait"),
    ("BA-010", "The Maker", "portrait"), ("BA-011", "Slow Morning", "land"), ("BA-012", "Low Tide", "land")]
SUBJECTS = [("all", "All", "Alle"), ("land", "Landscape", "Landskap"), ("city", "City", "By"), ("portrait", "Portrait", "Portrett")]
def sub_count(k):
    return len(PLATE_LIST) if k == "all" else sum(1 for p in PLATE_LIST if p[2] == k)
PRE_PLATES = "".join(
    f'<button type="button" class="pl" data-id="{pid}" data-sub="{sub}" aria-haspopup="dialog" style="--ang:{28 + i * 23}deg">'
    f'<span class="pl-frame" aria-hidden="true"><span class="pl-crop"></span><span class="pl-no">{pid[3:]}</span></span>'
    f'<span class="pl-cap"><span class="pl-id">{pid}</span><span class="pl-title" lang="en">{title}</span></span></button>'
    for i, (pid, title, sub) in enumerate(PLATE_LIST))
PRE_LOOKUP = ('<div class="lk-out"><div class="lk-top"><span class="lk-t" lang="en">Sea of Fog</span><span class="lk-id">BA-003</span></div><dl class="kv">'
    '<div><dt>Record type</dt><dd>Sample record</dd></div><div><dt>Provenance</dt><dd class="pend">Pending</dd></div>'
    '<div><dt>Rights</dt><dd class="pend">Not stated</dd></div><div><dt>Gates met</dt><dd class="pend">0 / 3</dd></div><div><dt>Public verification</dt><dd class="pend">Not available</dd></div></dl>'
    '<div class="lk-foot"><p>An ID finds a record. It does not prove it.</p>'
    '<button type="button" class="mini" data-open="BA-003" aria-haspopup="dialog">Open passport</button></div></div>')

H = []
add = H.append

# ---------------------------------------------------------------- head part
THEME_BOOT = '(function(){try{var t=localStorage.getItem("ba-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);var m=document.querySelector(\'meta[name="color-scheme"]\');if(m)m.content=t;}}catch(e){}})();'  # pinned theme applied before first paint (modern-web-guidance: dark-mode)
HEAD = """<title>BETA ART MAIN</title>
<meta name="description" content="BETA ART MAIN development master: photography, creators and cultural discovery in one shared record. Explore, Business, Privat, Gallery &amp; Events, The Record and Join.">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fbfaf7">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#171513">
<script>__THEME_BOOT__</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"BETA ART","inLanguage":["en","nb"],"publisher":{"@type":"Organization","name":"Beta Art ENK"}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..400;1,9..144,300&amp;family=IBM+Plex+Mono:wght@400;500&amp;family=Inter+Tight:wght@400;500&amp;display=swap">
<style>
__CSS__
</style>
"""

# ---------------------------------------------------------------- body
add(f'<a class="skip" href="#main">{T("Skip to content", "Hopp til innhold")}</a>')

add(f'<aside class="statusbar" {AR("Page status", "Sidestatus")}><div class="wrap">'
    f'<span>{T("<strong>Development master</strong>, not published", "<strong>Utviklingsversjon</strong>, ikke publisert")}</span>'
    '</div></aside>')

add('<header class="hdr"><div class="wrap hdr-row">'
    f'<a class="brand" href="#top" {AR("BETA ART, back to top", "BETA ART, til toppen")}>{MARK_S}<span>BETA ART</span></a>'
    f'<nav class="nav" {AR("Primary", "Hovedmeny")}>{nav_links()}</nav>'
    '<div class="controls">'
    f'<div class="seg" role="group" {AR("Language", "Språk")}>'
    '<button type="button" data-lang-btn="en" aria-pressed="true" lang="en">EN</button>'
    '<button type="button" data-lang-btn="no" aria-pressed="false" lang="nb">NB</button></div>'
    f'<button type="button" class="iconbtn" id="themeBtn" aria-pressed="false" {AR("Dark theme", "Mørkt tema")}>'
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17" /><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg></button>'
    '</div></div>'
    f'<nav class="mnav" {AR("Sections", "Seksjoner")}>{nav_links()}</nav>'
    '<span class="progress" id="progress" aria-hidden="true"></span>'
    '</header>')

add('<main id="main" tabindex="-1">')

# HERO ---------------------------------------------------------------
add('<section id="top" class="hero"><div class="wrap hero-grid"><div class="hero-copy">'
    f'{T("See the work. <em>Understand the record. Know what comes next.</em>", "Se verket. <em>Forstå registreringen. Vit hva som skjer videre.</em>", "h1", "display h1")}'
    + T("Photography, creators and cultural discovery — with clearer context, status and paths to action.",
        "Fotografi, skapere og kulturell oppdagelse – med tydeligere kontekst, status og veier til handling.", "p", "lede")
    + '<div class="actions">'
    f'<a class="btn solid" href="#routes">{T("Explore BETA ART", "Utforsk BETA ART")}</a>'
    f'<a class="btn" href="#record">{T("Open The Record", "Åpne The Record")}</a>'
    '</div></div>'
    f'<aside class="rec" {AR("BETA ART master record", "BETA ART-masterpost")}>'
    '<div class="rec-head"><span>BA / MAIN / MASTER</span><span>2026</span></div>'
    f'<span class="rec-mark">{MARK}</span>'
    '<dl>'
    f'<div><dt>{T("State", "Status")}</dt><dd>{T("Development master", "Utviklingsversjon")}</dd></div>'
    f'<div><dt>{T("Main areas", "Hovedområder")}</dt><dd>06</dd></div>'
    f'<div><dt>{T("Publication", "Publisering")}</dt><dd>{T("Not authorized", "Ikke godkjent")}</dd></div>'
    f'<div><dt>{T("Edition", "Utgave")}</dt><dd>Master, 04.10.2026</dd></div>'
    '</dl>'
    '</aside>'
    '<div class="hero-foot">'
    f'<nav {AR("Jump to an area", "Gå til et område")}>'
    + "".join(f'<a href="{h}"><span>{i:02d}</span> {T(en, no)}</a>' for i, (h, en, no) in enumerate(NAV, 1))
    + '</nav></div>'
    '</div></section>')

# ROUTES -------------------------------------------------------------
# intents from BETA ART MAIN (02.10.2026), in page order; Business keeps its own route so organisations have a way in
ROUTES = [
    ("#explore", "01 Explore", "01 Utforsk",
     "Discover photography, artworks and creator records.", "Oppdag fotografi, kunstverk og skaperposter."),
    ("#business", "02 Document a project", "02 Dokumenter et prosjekt",
     "Keep project documentation findable for years.", "Hold prosjekt&shy;dokumentasjon gjenfinnbar i mange år."),
    ("#privat", "03 Share your work", "03 Del arbeidet ditt",
     "Show your work for sale or licensing.", "Vis arbeidet for salg eller lisensiering."),
    ("#gallery-events", "04 Find culture", "04 Finn kultur",
     "Discover galleries, museums, exhibitions and events.", "Oppdag gallerier, museer, utstillinger og arrangementer."),
    ("#record", "05 Use or license", "05 Bruk eller lisensier",
     "Check availability, rights and the request path.", "Sjekk tilgjengelighet, rettigheter og forespørsels&shy;veien."),
]
add('<section id="routes" class="routes-sec"><div class="wrap">'
    '<div class="routes-head"><div>'
    f'{T("What are you here to do?", "Hva er du her for å gjøre?", "h2", "display")}'
    '</div>'
    f'</div><nav class="routes" {AR("Five starting routes", "Fem startveier")}>')
for href, en, no, wen, wno in ROUTES:
    add(f'<a class="route" href="{href}">{T(en, no, "span", "rn")}'
        f'{T(wen, wno, "span", "rw")}<span class="ra" aria-hidden="true">↘</span></a>')
add('</nav>'
    '<div class="legend">'
    f'{T("Status", "Status", "span", "label")}'
    f'{T("Pending or not yet evidenced", "Venter eller mangler bevis", "span", "chip")}'
    f'{T("Decided or designed", "Besluttet eller utformet", "span", "chip ok")}'
    f'{T("Not built or blocked", "Ikke bygget eller stoppet", "span", "chip stop")}'
    '</div></div></section>')

# PROTECT ------------------------------------------------------------
# See, understand, status, act: the record model from BETA ART MAIN, set in sentence case like every other heading
PR = [
    ("See", "Se", "Find the work and its maker.", "Finn verket og skaperen."),
    ("Understand", "Forstå", "Read origin, context and rights.", "Les opphav, kontekst og rettigheter."),
    ("Status", "Status", "Recorded, pending, restricted or available.", "Registrert, venter, begrenset eller tilgjengelig."),
    ("Act", "Handle", "License, enquire or join.", "Lisensier, spør eller bli med."),
]
add('<section id="protect" class="sec"><div class="wrap">'
    '<div class="intro"><div>'
    f'{T("See. Understand. <em>Status. Act.</em>", "Se. Forstå. <em>Status. Handle.</em>", "h2", "display h2")}'
    '</div>'
    '</div><div class="cells c4 mt-l">')
for i, (en, no, pen, pno) in enumerate(PR, 1):
    # the principles are ordered (they set the ledger order), so the label is their number, not a copy of the heading
    add(f'<article class="principle"><p class="label">{i:02d}</p>{T(en, no, "h3", "cell-t")}{T(pen, pno, "p", "cell-p")}</article>')
add('</div></div></section>')

# LEDGER -------------------------------------------------------------
LED = [
    ("Source / original", "Kilde / original", "Preserve the source before making a presentation copy.", "Bevar kilden før det lages en visningskopi."),
    ("Metadata", "Metadata", "Keep the context needed to identify and understand the record.", "Behold konteksten som trengs for å identifisere og forstå posten."),
    ("Verification or exception", "Verifisering eller avvik", "Record what is known, what is not, and where evidence is incomplete.", "Registrer hva som er kjent, hva som ikke er det, og hvor bevisene er ufullstendige."),
    ("Rights", "Rettigheter", "Keep licence, privacy and AI-use permissions explicit and separate.", "Hold lisens, personvern og KI-tillatelser tydelige og adskilt."),
    ("Retrieval", "Gjenfinning", "Test whether the correct record can actually be found later.", "Test om riktig post faktisk kan finnes igjen senere."),
    ("Retention", "Oppbevaring", "State how long records and evidence should remain available.", "Angi hvor lenge poster og bevis skal være tilgjengelige."),
    ("Export / exit", "Eksport / avslutning", "Design continuity so the record can leave the system without losing meaning.", "Planlegg kontinuiteten slik at posten kan forlate systemet uten å miste sammenhengen."),
]
add('<section id="ledger" class="sec inv"><div class="wrap">'
    '<div class="intro"><div>'
    f'{T("The record has a <em>chain of custody.</em>", "Posten har en <em>ubrutt beviskjede.</em>", "h2", "display h2")}'
    '</div></div>'
    f'<ol class="ledger mt-l" {AR("Evidence ledger, seven steps", "Bevisprotokoll, sju trinn")}>')
for i, (en, no, pen, pno) in enumerate(LED, 1):
    add(f'<li><span>{i:02d}</span>{T(en, no, "h3")}</li>')  # the step names carry it; the long lines are in README
add('</ol></div></section>')

# ARCHIVE ------------------------------------------------------------
def pillar_head(no_, title_en, title_no, chip_en, chip_no, chip_cls, lead_en, lead_no, quote_en, quote_no, extra=""):
    # less text (Betul, 29.09.2026): title, status, one headline and one line; the details live in the blocks below
    return ('<div class="pillar">'
            f'<div class="pcard" data-no="{no_}">'
            f'{T(title_en, title_no, "h2", "display")}'
            f'{T(chip_en, chip_no, "span", "chip " + chip_cls)}'
            '</div>'
            '<div class="pbody">'
            f'{T(lead_en, lead_no, "h3", "display h3")}'
            f'{T(quote_en, quote_no, "p", "quote")}'
            f'{extra}'
            '</div></div>')

add('<section id="explore" class="sec"><div class="wrap">')
add(pillar_head("01", "Explore.", "Utforsk.",
    "Public discovery open, licensing not yet", "Offentlig oppdagelse åpen, lisensiering ikke ennå", "",
    "Made by a human. <em>Verified at the source.</em>", "Laget av et menneske. <em>Verifisert ved kilden.</em>",
    "Photography and creator records, with origin and rights in view.", "Fotografi og skaperposter, med opphav og rettigheter synlig."))

add('<div class="callout mt-l">'
    f'{T("Discovery before transaction.", "Oppdagelse før transaksjon.", "h3", "display h3")}'
    f'{T("Visible is not available, licensed or verified. Each state stays separate.", "Synlig er ikke tilgjengelig, lisensiert eller verifisert. Hver tilstand står for seg.", "p", "body")}'
    '</div>')

add('<div id="catalogue" class="mt-l"><div class="cat-head"><div>'
    f'{T("The frames are empty <em>on purpose.</em>", "Rammene er tomme <em>med vilje.</em>", "h3", "display h3")}'
    '</div>'
    f'{T("Select a plate to read its record.", "Velg en plate for å lese posten.", "p", "small")}'
    f'</div><div class="seg pfilter mt-m" role="group" {AR("Filter by subject", "Filtrer etter motiv")}>'
    + "".join(f'<button type="button" data-filter="{k}" aria-pressed="{str(k == "all").lower()}">{T(en, no)} <span class="n">{sub_count(k)}</span></button>' for k, en, no in SUBJECTS)
    + '</div><div class="plates mt-m" id="plates">' + PRE_PLATES + '</div></div>')

SERIES = [
    ("I", "Work", "People, consent and the unposed moment.", "Mennesker, samtykke og det uregisserte øyeblikket."),
    ("II", "Craft", "Hands, materials and the process of making.", "Hender, materialer og prosessen bak det som lages."),
    ("III", "Land and Light", "Known locations with specific provenance.", "Kjente steder med konkret proveniens."),
    ("IV", "The Table", "Food, process and real people together.", "Mat, prosess og ekte mennesker samlet."),
    ("V", "Rooms", "Architecture and interiors beyond the standard angle.", "Arkitektur og interiør utover standardvinkelen."),
    ("VI", "The Unseen", "Discovery and contrast.", "Oppdagelse og kontrast."),
    ("VII", "Weather", "Documented conditions.", "Dokumenterte forhold."),
]
add('<div class="intro mt-l"><div>'
    f'{T("Seven ways to <em>read a place.</em>", "Sju måter å <em>lese et sted på.</em>", "h3", "display h3")}'
    f'{T("No plate is assigned to a series yet.", "Ingen plate er tildelt en serie ennå.", "p", "small mt-m")}'
    '</div><ol class="series">')
for rn, name, en, no in SERIES:
    add(f'<li><span class="rn">{rn}</span><strong lang="en">{name}</strong></li>')
add('</ol></div>')

LIC = [
    ("Select the plate", "Velg platen", "Choose the catalogue plate you want to license.", "Velg katalogplaten du vil lisensiere."),
    ("Describe the use", "Beskriv bruken", "Tell Beta Art where, how and for how long the photograph will be used.", "Fortell Beta Art hvor, hvordan og hvor lenge fotografiet skal brukes."),
    ("Receive the agreement", "Motta avtalen", "The final licence, invoice and delivery terms are confirmed before the full-resolution file is supplied.", "Endelig lisens, faktura og leveringsvilkår bekreftes før filen i full oppløsning leveres."),
]
# covers / excludes: Betul's licence terms on beta-art.com (29.09.2026), shortened
TIERS = [
    ("personal", "Personal", "Personlig", "Private projects, gifts, personal sites.", "Privat bruk, gaver, eget nettsted.",
     "Any use for a business.", "All bruk for en bedrift.", "From kr 190, indicative", "Fra kr 190, veiledende"),
    ("business", "Commercial", "Kommersiell", "Company web, social media, marketing, editorial.", "Bedriftens nett, sosiale medier, markedsføring, redaksjonelt.",
     "Resale products and sublicensing.", "Produkter for videresalg og underlisens.", "Quoted per use", "Pris etter bruk"),
    ("business", "Extended", "Utvidet", "Unlimited print, resale, one named client.", "Ubegrenset opplag, produkter for salg, én navngitt kunde.",
     "Several clients or stock libraries.", "Flere kunder eller bildebyråer.", "Quoted per use", "Pris etter bruk"),
    ("business", "Custom &amp; Exclusive", "Tilpasset og eksklusiv", "Exclusivity, custom terms, commissioned work.", "Eksklusivitet, egne vilkår, bestilte oppdrag.",
     "Anything outside the written agreement.", "Alt utenfor den skriftlige avtalen.", "By agreement", "Etter avtale"),
]
USES = [("all", "All", "Alle"), ("personal", "Personal use", "Privat bruk"), ("business", "Business use", "Bedriftsbruk")]
FAQ = [
    ("Can I crop or edit the photograph?", "Kan jeg beskjære eller redigere fotografiet?",
     "Yes, for layout and colour, without changing the work.", "Ja, for layout og farge, uten å endre verket."),
    ("Can it be used to train AI?", "Kan det brukes til å trene KI?",
     "No. Every licence excludes AI training, logos and trademarks, and removing metadata.", "Nei. Alle lisenser utelukker KI-trening, logoer og varemerker, og fjerning av metadata."),
    ("Is a licence exclusive?", "Er en lisens eksklusiv?",
     "No, unless exclusivity is agreed in writing.", "Nei, med mindre eksklusivitet er avtalt skriftlig."),
    ("Can I pass the licence to a client?", "Kan jeg overføre lisensen til en kunde?",
     "Only with Extended, to one named client.", "Bare med Utvidet, til én navngitt kunde."),
    ("Can I withdraw from a purchase?", "Kan jeg angre et kjøp?",
     "Consumers have 14 days, unless they choose immediate delivery and waive it.", "Forbrukere har 14 dagers angrerett, om de ikke velger levering straks."),
]
add('<div id="licensing" class="mt-l">'
    f'{T("How a licence <em>is made.</em>", "Slik blir en lisens <em>til.</em>", "h3", "display h3")}'
    '<div class="cells c3 mt-m">')
for i, (en, no, pen, pno) in enumerate(LIC, 1):
    add(f'<article><span class="num">{i:02d}</span>{T(en, no, "h4", "cell-t")}</article>')
add(f'</div><div class="seg pfilter mt-m" role="group" {AR("Filter by use", "Filtrer etter bruk")}>'
    + "".join(f'<button type="button" data-use="{k}" aria-pressed="{str(k == "all").lower()}">{T(en, no)}</button>' for k, en, no in USES)
    + '</div><div class="cells c4 mt-m" id="tiers">')
for use, en, no, cov_en, cov_no, exc_en, exc_no, pr_en, pr_no in TIERS:
    add(f'<article class="tier" data-use="{use}">{T(en, no, "h4", "cell-t")}'
        f'<details class="tier-d"><summary>{T("Scope", "Omfang")}</summary>'
        f'<p>{T("Covers", "Dekker", "span", "tl")}{T(cov_en, cov_no)}</p>'
        f'<p>{T("Excludes", "Dekker ikke", "span", "tl")}{T(exc_en, exc_no)}</p></details>'
        f'{T(pr_en, pr_no, "span", "price")}</article>')
add('</div>'
    f'{T("No plate can be licensed yet.", "Ingen plater kan lisensieres ennå.", "p", "note mt-m")}'
    '<div class="faq mt-l">'
    f'{T("Licence questions", "Spørsmål om lisens", "h4", "cell-t")}')
for q_en, q_no, a_en, a_no in FAQ:
    add(f'<details><summary>{T(q_en, q_no)}</summary>{T(a_en, a_no, "p")}</details>')
add('</div></div>')

add('<div id="assignments" class="mt-l">'
    f'{T("If it is missing, <em>request a shoot.</em>", "Mangler det, <em>bestill et fotooppdrag.</em>", "h3", "display h3")}'
    '<div class="flow mt-m">'
    f'{T("Search", "Søk")}{T("Verify", "Verifiser")}{T("License", "Lisensier")}{T("If missing", "Mangler det?")}{T("Request a Shoot", "Bestill et fotooppdrag")}'
    '</div>'
    '</div>')
add('</div></section>')

# BUSINESS -----------------------------------------------------------
EXCH = [
    ("Customer gives", "Kunden gir", "One project, access, 3–5 questions.", "Ett prosjekt, tilgang, 3–5 spørsmål."),
    ("Beta Art does", "Beta Art gjør", "Intake, metadata, exceptions, retrieval tests.", "Mottak, metadata, avvik, gjenfinningstester."),
    ("Customer receives", "Kunden får", "Archive, manifest, export, exit package.", "Arkiv, manifest, eksport, avslutningspakke."),
    ("Boundary", "Grense", "Does not replace FDV or project systems.", "Erstatter ikke FDV- eller prosjektsystemer."),
]
RHY = [
    ("Frame", "Avgrens", "Scope, owners, access.", "Omfang, eiere, tilgang."),
    ("Map", "Kartlegg", "Files, phases, known gaps.", "Filer, faser, kjente mangler."),
    ("Test", "Test", "Ask the questions, log exceptions.", "Still spørsmålene, logg avvik."),
    ("Exit", "Avslutt", "A handover with no lock-in.", "En overlevering uten innlåsing."),
]
AREAS = [
    ("Construction", "Bygg og anlegg", "Closeout and FDV photo records.", "Sluttdokumentasjon og FDV-bilder.", True),
    ("Maritime / offshore", "Maritim / offshore", "Hull, pipeline and ROV inspection.", "Skrog-, rør- og ROV-inspeksjon.", False),
    ("Energy", "Energi", "Installation, operation, maintenance.", "Installasjon, drift, vedlikehold.", False),
    ("Aquaculture", "Havbruk", "Nets, fish health, environment.", "Nøter, fiskehelse, miljø.", False),
    ("Health", "Helse", "Equipment and quality records.", "Utstyr og kvalitetssikring.", False),
    ("Tourism", "Reiseliv", "Real, dated images, not AI or stock.", "Ekte, daterte bilder, ikke KI eller bildebyrå.", False),
]
PRICES = [
    ("Establishment", "Etablering", "15 000 kr", "excl. VAT, incl. 5 years of storage", "eks. mva, inkl. 5 års lagring"),
    ("Yearly, years 6–10", "Årlig, år 6–10", "2 500 kr", "excl. VAT", "eks. mva"),
    ("Assignment day", "Formidlet oppdragsdag", "11 000 kr", "excl. VAT", "eks. mva"),
]
add('<section id="business" class="sec inv"><div class="wrap">')
add(pillar_head("02", "Business.", "Business.",
    "Pilot phase: Norway first, construction first", "Pilotfase: Norge først, bygg og anlegg først", "",
    "The project ends. <em>The documentation shouldn't.</em>", "Prosjektet avsluttes. <em>Dokumentasjonen skal ikke.</em>",
    "Retrieval, not storage: a tested handover.", "Gjenfinning, ikke lagring: en testet overlevering.",
    extra=f'<div class="actions"><a class="btn solid" href="#join" data-route="business">{T("Qualify a pilot", "Be om en pilotvurdering")}</a>'
          f'<a class="btn" href="#business-price">{T("See the price hypothesis", "Se prishypotesen")}</a></div>'))

add('<div class="mt-l">'
    f'{T("The exchange", "Utvekslingen", "p", "label acc")}'
    '<div class="cells c4 mt-m">')
for en, no, pen, pno in EXCH:
    add(f'<article>{T(en, no, "h4", "cell-t")}{T(pen, pno, "p", "cell-p")}</article>')
add('</div></div>')

add('<div class="mt-l">'
    f'{T("Pilot rhythm", "Pilotrytme", "p", "label acc")}'
    '<div class="cells c4 mt-m">')
for i, (en, no, pen, pno) in enumerate(RHY, 1):
    add(f'<article><span class="num">{i:02d}</span>{T(en, no, "h4", "cell-t")}</article>')
add('</div></div>')

# Retrieval brief: the first step of a pilot, written on the device, never sent
BR_EX = [
    ("Which drawing was approved for the facade?", "Hvilken tegning ble godkjent for fasaden?"),
    ("Who signed off the fire safety changes, and when?", "Hvem godkjente endringene i brannsikringen, og når?"),
    ("Where are the roof maintenance documents?", "Hvor ligger FDV-dokumentasjonen for taket?"),
]
add('<div id="business-brief" class="mt-l">'
    '<div class="intro"><div>'
    f'{T("Write the questions <em>before the files.</em>", "Skriv spørsmålene <em>før filene.</em>", "h3", "display h3")}'
    '</div>'
    f'{T("Write 3–5 questions someone must answer years from now. Nothing is sent.", "Skriv 3–5 spørsmål noen må kunne svare på om flere år. Ingenting sendes.", "p", "body")}'
    '</div><div class="brief mt-m">'
    '<form class="form" id="briefForm" novalidate>'
    f'<label for="brProject">{T("Project and period", "Prosjekt og periode")}'
    f'<input type="text" id="brProject" name="project" {PH("e.g. finished school extension, 2021–2024", "f.eks. ferdig skoleutvidelse, 2021–2024")}></label>'
    f'<fieldset class="brq"><legend>{T("Questions someone must answer later", "Spørsmål noen må kunne svare på senere")}</legend>')
for i in range(1, 6):
    add(f'<label for="brQ{i}"><span class="brn">Q{i}</span><input type="text" id="brQ{i}" name="q{i}" maxlength="200"></label>')
add('</fieldset><div class="br-ex">'
    f'{T("Examples", "Eksempler", "p", "small")}')
for i, (en, no) in enumerate(BR_EX):
    add(f'<button type="button" class="ex" data-ex="{i}">{T(en, no)}</button>')
add('</div></form><div class="br-out">'
    '<pre class="out" id="briefOut">BETA ART · Retrieval brief\nProject: —\n\nQuestions: —\n\nNot included: personal data or confidential files. They come only after scope, access and data processing are agreed.</pre>'
    '<p class="small" id="briefMsg" aria-live="polite">0 of 5 written. A pilot needs 3.</p>'
    '<div class="br-actions">'
    f'<button type="button" class="mini" id="copyBrief">{T("Copy brief", "Kopier notatet")}</button>'
    f'<button type="button" class="btn solid" id="briefToEnq">{T("Add to enquiry", "Legg til i henvendelsen")}</button>'
    '</div></div></div></div>')

add('<div class="intro mt-l"><div>'
    f'{T("Where visual evidence <em>has to hold up.</em>", "Der visuelt bevis <em>må tåle ettersyn.</em>", "h3", "display h3")}'
    '</div>'
    f'{T("Phase 1 is construction. The rest are use areas, not customers.", "Fase 1 er bygg og anlegg. Resten er bruksområder, ikke kunder.", "p", "body")}'
    '</div><div class="cells c3 mt-m">')
for en, no, pen, pno, first in AREAS:
    chip = T("Phase 1", "Fase 1", "span", "chip ok") if first else ""  # the intro already says the rest are use areas
    add(f'<article class="area{" first" if first else ""}">{chip}{T(en, no, "h4", "cell-t")}{T(pen, pno, "p", "cell-p")}</article>')
add('</div>')

add('<div id="business-price" class="mt-l">'
    f'{T("A hypothesis, <em>not a price list.</em>", "En hypotese, <em>ikke en prisliste.</em>", "h3", "display h3")}'
    '<div class="cells c3 price-grid mt-m">')
for en, no, val, men, mno in PRICES:
    add(f'<article>{T(en, no, "span", "pm")}<strong class="pv">{val}</strong>{T(men, mno, "span", "pm")}</article>')
add('</div>'
    f'{T("Tested in paid pilots. Data terms are agreed before any intake.", "Testes i betalte piloter. Databehandling avtales før noe mottas.", "p", "note mt-m")}'
    '</div>')
add('</div></section>')

# PRIVAT -------------------------------------------------------------
# Privat is the creator marketplace (BETA ART MAIN, 02.10.2026); paid-is-not-licensed lives in Transparency, so it is not repeated here
ACC = [
    ("Availability", "Tilgjengelighet", "Display, enquiry, sale or licence.", "Visning, forespørsel, salg eller lisens."),
    ("Rights", "Rettigheter", "Available is not licensed.", "Tilgjengelig er ikke lisensiert."),
    ("Source", "Kilde", "Public profile, protected evidence.", "Offentlig profil, beskyttet bevis."),
]
add('<section id="privat" class="sec tint"><div class="wrap">')
add(pillar_head("03", "Privat.", "Privat.",
    "Creator marketplace prototype, backend not built", "Prototype for skapermarked, backend ikke bygget", "stop",
    "Put the work in view. <em>Keep the terms clear.</em>", "Vis arbeidet. <em>Hold vilkårene tydelige.</em>",
    "For photographers, artists and independent makers.", "For fotografer, kunstnere og uavhengige skapere."))
add('<div class="cells c3 mt-l">')
for en, no, pen, pno in ACC:
    add(f'<article>{T(en, no, "p", "label acc")}{T(pen, pno, "h4", "cell-t", "")}</article>')
add('</div>'
    '</div></section>')

# GALLERY ------------------------------------------------------------
# one event record, from information to an outside link (BETA ART MAIN, 02.10.2026); the step names carry it
CYC = [
    ("Event information", "Arrangements&shy;informasjon"),
    ("Venue and dates", "Lokale og datoer"),
    ("Artists and context", "Kunstnere og kontekst"),
    ("Images and rights", "Bilder og rettigheter"),
    ("External link, when real", "Ekstern lenke, når den finnes"),
]
add('<section id="gallery-events" class="sec"><div class="wrap">')
add(pillar_head("04", "Gallery &amp; Events.", "Galleri &amp; arrange&shy;menter.",
    "Discovery prototype, live event data not connected", "Oppdagelses&shy;prototype, live arrangementsdata ikke koblet til", "",
    "Find what is happening around you. <em>The record remains.</em>", "Finn ut hva som skjer rundt deg. <em>Registreringen består.</em>",
    "Museums, galleries and events across Scandinavia. Venues and tickets appear only from approved records.",
    "Museer, gallerier og arrangementer i Skandinavia. Lokaler og billetter vises bare fra godkjente poster."))
add('<div class="mt-l">'
    f'{T("For organisers: one event record, five parts", "For arrangører: én arrangementspost, fem deler", "p", "label acc")}'
    '<div class="cells c5 mt-m">')
for i, (en, no) in enumerate(CYC, 1):
    add(f'<article><span class="num">{i:02d}</span>{T(en, no, "h4", "cell-t")}</article>')
add('</div><div class="cells c2 mt-m">'
    f'<article>{T("Independence rule", "Uavhengighetsregel", "p", "label acc")}{T("The verifier is never the maker.", "Den som verifiserer, har aldri laget verket.", "h4", "cell-t")}</article>'
    f'<article>{T("Standing review", "Løpende gjennomgang", "p", "label acc")}{T("Logged, dated and revocable.", "Loggføres, dateres og kan trekkes tilbake.", "h4", "cell-t")}</article>'
    '</div></div>')
# Gallery checklist: prepares an artist before submissions open, built on the device, never sent
GC = [
    ("Source", "Kilde", [
        ("The original file or work can be shown.", "Originalfilen eller verket kan vises."),
        ("Process material exists.", "Prosessmateriale finnes."),
    ]),
    ("Identity", "Identitet", [
        ("I made the work and can confirm who I am.", "Jeg har laget verket og kan bekrefte hvem jeg er."),
        ("Helpers can be named, with consent.", "Medhjelpere kan navngis, med samtykke."),
    ]),
    ("Rights", "Rettigheter", [
        ("I hold display and catalogue rights.", "Jeg har rett til å vise verket og gjengi det i katalogen."),
        ("Written releases exist, or none are needed.", "Skriftlige samtykker finnes, eller trengs ikke."),
        ("My AI-training choice is in writing.", "Jeg har skriftlig tatt stilling til KI-trening."),
    ]),
    ("Edition", "Opplag", [
        ("Edition size and numbers are known.", "Opplagsstørrelse og numre er kjent."),
    ]),
]
add('<div id="gallery-check" class="mt-l">'
    '<div class="intro"><div>'
    f'{T("Check your evidence <em>before you submit.</em>", "Sjekk bevisene <em>før du sender inn.</em>", "h3", "display h3")}'
    '</div>'
    f'{T("Submissions are not open yet. Tick what you hold. Nothing is sent.", "Innsending er ikke åpen ennå. Kryss av for det du har. Ingenting sendes.", "p", "body")}'
    '</div><div class="brief mt-m">'
    '<form class="form" id="gcForm" novalidate>'
    f'<label for="gcWork">{T("Working title (optional)", "Arbeidstittel (valgfritt)")}'
    f'<input type="text" id="gcWork" name="work" maxlength="120" {PH("e.g. Untitled, winter series", "f.eks. Uten tittel, vinterserie")}></label>')
n = 0
for gen, gno, items in GC:
    add(f'<fieldset class="gc-g"><legend>{T(gen, gno)}</legend>')
    for en, no in items:
        n += 1
        add(f'<label class="ck" for="gc{n}"><input type="checkbox" id="gc{n}" data-gc>{T(en, no, "span", "ck-t")}</label>')
    add('</fieldset>')
add('</form><div class="br-out">'
    '<pre class="out" id="gcOut">BETA ART · Gallery checklist\nWork: —\nReady: 0 / 8</pre>'
    '<p class="small" id="gcMsg" aria-live="polite">0 of 8 ready.</p>'
    '<div class="br-actions">'
    f'<button type="button" class="mini" id="copyGc">{T("Copy checklist", "Kopier listen")}</button>'
    f'<button type="button" class="btn solid" id="gcToEnq">{T("Add to enquiry", "Legg til i henvendelsen")}</button>'
    '</div></div></div></div>')

add('<div id="field-notes" class="callout mt-l"><div>'
    f'{T("Field Notes", "Field Notes", "p", "label acc")}'
    f'{T("What the work <em>actually looks like.</em>", "Slik arbeidet <em>faktisk ser ut.</em>", "h3", "display h3 mt-m")}'
    '</div>'
    f'{T("Provenance and process writing. First entries after the first approved event.", "Proveniens og prosesstekster. Første innlegg etter første godkjente arrangement.", "p", "body")}'
    '</div>')
add('</div></section>')

# VERIFY -------------------------------------------------------------
LK_HINT = 'id="lkHint"'  # the lookup field points to its hint with aria-describedby
PROOF = [
    ("BETA-ID / VERIFY", "Record lookup and status explanation", "Oppslag og statusforklaring",
     "An identifier helps find a record and explain its state.", "En identifikator hjelper deg å finne en post og forklarer statusen.",
     "An ID, QR code or C2PA record alone proves nothing.",
     "En ID, QR-kode eller C2PA-post beviser ingenting alene."),
    ("PASSPORT", "A readable record summary", "Et lesbart postsammendrag",
     "Provenance, rights and status in one view.", "Proveniens, rettigheter og status i én visning.",
     "A Passport summarises supported facts. It does not replace evidence or the agreement.",
     "Et Passport oppsummerer dokumenterte fakta. Det erstatter ikke bevis eller avtalen."),
    ("VAULT", "Protected source evidence", "Beskyttet kildebevis",
     "Original files and confidential evidence stay in the protected layer.", "Originalfiler og konfidensielle bevis blir i det beskyttede laget.",
     "Private evidence is never published just because a public record exists.",
     "Privat bevis publiseres aldri bare fordi det finnes en offentlig post."),
    ("RIGHTS", "Usage scope stays explicit", "Bruksomfanget holdes tydelig",
     "The written licence controls use; machine-readable signals support it.", "Den skriftlige lisensen styrer bruken; maskinlesbare signaler støtter den.",
     "AI training, usage and contract scope are separate states.",
     "KI-trening, bruk og avtaleomfang er separate tilstander."),
]
add('<section id="record" class="sec"><div class="wrap"><div class="verify">'
    '<div class="vpanel inv">'
    f'{T("BETA-ID", "BETA-ID", "p", "label acc")}'
    f'{T("A work is more than an image. <em>Read the record.</em>", "Et verk er mer enn et bilde. <em>Les registreringen.</em>", "h2", "display h2")}'
    f'{T("Verify the record, not the slogan.", "Verifiser posten, ikke slagordet.", "p", "tagline")}'
    '</div><div class="vmain">'
    '<search><form class="lookup" id="lookupForm" novalidate>'
    f'<label class="label acc" for="lookupInput">{T("Look up a record", "Slå opp en post")}</label>'
    '<div class="lk-row">'
    f'<input class="field" id="lookupInput" name="lookup" spellcheck="false" aria-describedby="lkHint" value="BA-003" {PH("BA-003", "BA-003")}>'
    f'<button class="btn solid" type="submit">{T("Look up", "Slå opp")}</button></div>'
    f'{T("Demo: 12 sample records, none verified.", "Demo: 12 eksempelposter, ingen verifiserte.", "p", "small", LK_HINT)}'
    '<div id="lookupOut" aria-live="polite" aria-atomic="true">' + PRE_LOOKUP + '</div>'
    '</form></search><div class="proof">')
for lab, ten, tno, sen, sno, ben, bno in PROOF:
    add(f'<details><summary><span class="pf-l">{lab}</span>{T(ten, tno, "span", "pf-t")}</summary>'
        f'<div class="pf-b">{T(sen, sno, "p")}{T(ben, bno, "p")}</div></details>')
add('</div></div></div></div></section>')

# TRANSPARENCY -------------------------------------------------------
SIM = [
    ("request", "Request", "Forespørsel", [("received", "Received", "Mottatt"), ("qualified", "Qualified", "Kvalifisert"), ("closed", "Closed", "Avsluttet")], "qualified"),
    ("quote", "Quote", "Tilbud", [("draft", "Draft", "Utkast"), ("prepared", "Prepared", "Klargjort"), ("approved", "Approved", "Godkjent")], "approved"),
    ("payment", "Payment", "Betaling", [("pending", "Pending", "Venter"), ("paid", "Paid", "Betalt"), ("refunded", "Refunded", "Refundert")], "paid"),
    ("rights", "Rights", "Rettigheter", [("pending", "Pending", "Venter"), ("approved", "Approved", "Godkjent"), ("restricted", "Restricted", "Begrenset")], "pending"),
    ("delivery", "Delivery", "Levering", [("preparing", "Preparing", "Forberedes"), ("ready", "Ready", "Klar"), ("accepted", "Accepted", "Akseptert")], "preparing"),
]
add('<section id="transparency" class="sec tint"><div class="wrap">'
    '<div class="intro"><div>'
    f'{T("Paid is not licensed. <em>Identified is not verified.</em>", "Betalt er ikke lisensiert. <em>Identifisert er ikke verifisert.</em>", "h2", "display h2")}'
    '</div>'
    f'{T("Try it: this example is paid, yet has no licence.", "Prøv: eksempelet er betalt, men har ingen lisens.", "p", "body")}'
    '</div><div class="sim mt-l"><div class="sim-rows" id="simRows">')
for key, en, no, opts, default in SIM:
    add(f'<fieldset><legend>{T(en, no)}</legend><div class="opts">')
    for val, oen, ono in opts:
        chk = " checked" if val == default else ""
        add(f'<label><input type="radio" name="{key}" id="sim-{key}-{val}" value="{val}"{chk}>{T(oen, ono)}</label>')
    add('</div></fieldset>')
add('</div><div class="sim-out" aria-live="polite">'
    f'{T("What the record can say now", "Hva posten kan si nå", "h3")}'
    '<div class="sim-line"><b id="simLicL">Licence</b><span id="simLic">No licence exists.</span></div>'
    '<div class="sim-line"><b id="simDelL">Delivery</b><span id="simDel">Nothing has been delivered.</span></div>'
    '<div id="simWarn"><p class="sim-warn">Paid, but not licensed. Payment does not transfer rights.</p></div>'
    '</div></div></div></section>')

# STUDIO -------------------------------------------------------------
add('<section id="studio" class="sec"><div class="wrap">'
    '<div class="intro"><div>'
    f'{T("Studio", "Studio", "p", "label acc")}'
    f'{T("One place <em>for the record.</em>", "Ett sted <em>for posten.</em>", "h2", "display h2")}'
    '</div><div class="stack">'
    f'{T("Local prototype, nothing connected", "Lokal prototype, ingenting er koblet til", "span", "chip stop")}'
    '</div></div>'
    f'<div class="tabs mt-l" role="tablist" {AR("Studio sections", "Studio-seksjoner")}>'
    f'<button class="tab" role="tab" id="tab-overview" aria-controls="p-overview" aria-selected="true">{T("Overview", "Oversikt")}</button>'
    f'<button class="tab" role="tab" id="tab-records" aria-controls="p-records" aria-selected="false" tabindex="-1">{T("Records", "Poster")}</button>'
    f'<button class="tab" role="tab" id="tab-upload" aria-controls="p-upload" aria-selected="false" tabindex="-1">{T("Source intake", "Kildemottak")}</button>'
    f'<button class="tab" role="tab" id="tab-billing" aria-controls="p-billing" aria-selected="false" tabindex="-1">{T("Billing", "Betaling")}</button>'
    '</div>')
add('<div class="panel" role="tabpanel" id="p-overview" aria-labelledby="tab-overview"><div class="pcards">'
    f'<article class="pc">{T("Designed", "Utformet", "span", "chip ok")}{T("Personal access", "Personlig tilgang", "h3")}{T("Originals, credits, permissions.", "Originaler, kreditering, tillatelser.", "p")}</article>'
    f'<article class="pc">{T("Verification needed", "Krever verifisering", "span", "chip")}{T("Business access", "Business-tilgang", "h3")}{T("Handovers, roles, retrieval questions.", "Overleveringer, roller, gjenfinningsspørsmål.", "p")}</article>'
    f'<article class="pc">{T("Backend missing", "Backend mangler", "span", "chip stop")}{T("Secure sign-in", "Sikker innlogging", "h3")}{T("Needs an identity provider and audit log.", "Krever identitetsleverandør og revisjonslogg.", "p")}</article>'
    '</div></div>')
add('<div class="panel" role="tabpanel" id="p-records" aria-labelledby="tab-records" hidden>'
    '<div class="tbl-wrap"><table>'
    f'{T("Example rows, not real records", "Eksempelrader, ikke reelle poster", "caption")}'
    f'<thead><tr><th scope="col">{T("Record", "Post")}</th><th scope="col">{T("Type", "Type")}</th><th scope="col">{T("Rights", "Rettigheter")}</th><th scope="col">{T("Status", "Status")}</th><th scope="col"><span class="sr">{T("Action", "Handling")}</span></th></tr></thead><tbody>'
    f'<tr><td>First Light</td><td>{T("Photo · BA-001", "Foto · BA-001")}</td><td>{T("Pending", "Venter")}</td><td>{T("Pending", "Venter", "span", "chip")}</td><td><button type="button" class="mini" data-manifest="BA-001">{T("View manifest", "Vis manifest")}</button></td></tr>'
    f'<tr><td>{T("Project closeout", "Prosjektavslutning")}</td><td>{T("Business · BP-001", "Business · BP-001")}</td><td>{T("Internal", "Intern")}</td><td>{T("Draft", "Utkast", "span", "chip")}</td><td><button type="button" class="mini" data-manifest="BP-001">{T("View manifest", "Vis manifest")}</button></td></tr>'
    f'<tr><td>{T("Open studio", "Åpent studio")}</td><td>{T("Event · GE-001", "Arrangement · GE-001")}</td><td>{T("Unconfirmed", "Ubekreftet")}</td><td>{T("Draft", "Utkast", "span", "chip")}</td><td><button type="button" class="mini" data-manifest="GE-001">{T("View manifest", "Vis manifest")}</button></td></tr>'
    '</tbody></table></div>'
    '<div class="outbox mt-m"><div class="row">'
    f'{T("Review manifest", "Gjennomgangsmanifest", "span", "label acc")}'
    f'<span class="row"><span class="small" id="mfMsg" aria-live="polite"></span><button type="button" class="mini" id="copyManifest">{T("Copy", "Kopier")}</button></span></div>'
    '<pre class="out" id="manifestOut">BETA ART · review manifest\nRecord: BA-001 · First Light\nType: Photo (sample)\nRights: pending\nStatus: review only, not a verified record</pre></div>'
    '</div>')
add('<div class="panel" role="tabpanel" id="p-upload" aria-labelledby="tab-upload" hidden>'
    '<div class="drop" id="drop">'
    f'{T("Bring the original into the record.", "Legg originalen inn i posten.", "strong")}'
    f'{T("SHA-256 is computed on this device. Nothing is uploaded.", "SHA-256 beregnes på denne enheten. Ingenting lastes opp.", "p")}'
    f'<button type="button" class="btn" id="pickFiles">{T("Choose files", "Velg filer")}</button>'
    '<input id="fileInput" type="file" accept="image/*,.pdf,.csv,.zip,.dng,.cr3,.nef,.arw,.raf" multiple hidden>'
    '</div><ul class="files" id="fileList" aria-live="polite"><li><small>No files selected yet.</small></li></ul></div>')
add('<div class="panel" role="tabpanel" id="p-billing" aria-labelledby="tab-billing" hidden><div class="pcards">'
    f'<article class="pc">{T("Price pending", "Pris ikke satt", "span", "chip")}{T("Archive licence", "Arkivlisens", "h3")}</article>'
    f'<article class="pc">{T("Price under test", "Pris under utprøving", "span", "chip")}{T("Business pilot", "Business-pilot", "h3")}<a class="mini" style="display:inline-flex;align-items:center;width:fit-content;text-decoration:none" href="#business-price">{T("See hypothesis", "Se hypotesen")}</a></article>'
    f'<article class="pc">{T("Price pending", "Pris ikke satt", "span", "chip")}{T("Event programme", "Arrangements&shy;program", "h3")}</article>'
    '</div>'
    '</div>')
add('</div></section>')

# CONTACT ------------------------------------------------------------
R6 = [
    ("archive", "Explore / licensing", "Utforsk / lisensiering", "Catalogue, rights or record enquiry", "Spørsmål om katalog, rettigheter eller poster"),
    ("rights", "Rights claim", "Rettighetskrav", "Ownership, consent or rights dispute", "Eierskap, samtykke eller rettighetstvist"),
    ("business", "Business project", "Business-prosjekt", "Completed Project Rescue or closeout qualification", "Completed Project Rescue eller vurdering av sluttdokumentasjon"),
    ("privat", "Privat / Creator Marketplace", "Privat / Creator Marketplace", "Creator profile, sale or licensing", "Skaperprofil, salg eller lisensiering"),
    ("gallery", "Gallery &amp; Events", "Galleri &amp; arrangementer", "Curatorial, venue or collaboration enquiry", "Kuratoriske spørsmål, lokaler eller samarbeid"),
    ("assignment", "Assignment", "Oppdrag", "Request a Shoot when the archive lacks the work", "Bestill et fotooppdrag når arkivet mangler verket"),
    ("collab", "Collaboration", "Samarbeid", "Institutional, research or long-form editorial work", "Institusjonelt, forskning eller lengre redaksjonelt arbeid"),
]
add('<section id="join" class="sec tint"><div class="wrap">'
    '<div class="intro"><div>'
    f'{T("Join BETA ART. <em>Start with the right route.</em>", "Bli med i BETA ART. <em>Start med riktig vei.</em>", "h2", "display h2")}'
    '</div><div class="stack">'
    f'{T("Build an enquiry here and copy it. No mailbox is published yet.", "Lag en henvendelse her og kopier den. Ingen e-postadresse er publisert ennå.", "p", "body")}'
    '</div></div>'
    )
add('<div class="contact mt-l">'
    '<form class="form" id="enqForm" novalidate>'
    f'<label for="enqRoute">{T("Route", "Type henvendelse")}<select id="enqRoute" name="route">')
for k, en, no, _s, _t in R6:
    add(f'<option value="{k}" data-i18n="{_key()}">{en}</option>')
    NO[f"k{_n[0]}"] = no
add('</select></label>'
    f'<label for="enqMaterial">{T("What material is this about?", "Hvilket materiale gjelder det?")}<textarea id="enqMaterial" name="material" rows="2"></textarea></label>'
    f'<label for="enqDecision">{T("Which decision should it support?", "Hvilken beslutning skal den støtte?")}<textarea id="enqDecision" name="decision" rows="2"></textarea></label>'
    f'<label for="enqEvidence">{T("What evidence already exists?", "Hvilke bevis finnes allerede?")}<textarea id="enqEvidence" name="evidence" rows="2"></textarea></label>'
    '</form>'
    '<div class="outbox"><div class="row">'
    f'{T("Your enquiry", "Din henvendelse", "span", "label acc")}'
    f'<button type="button" class="btn solid" id="copyEnq">{T("Copy enquiry", "Kopier henvendelsen")}</button></div>'
    '<pre class="out" id="enqOut">BETA ART · Enquiry\n\nRoute: Explore / licensing\nMaterial: —\nDecision it supports: —\nEvidence that exists: —</pre><p class="small" id="enqMsg" aria-live="polite"></p></div>'
    '</div></div></section>')

# ABOUT --------------------------------------------------------------
add('<section id="about" class="sec"><div class="wrap intro"><div>'
    f'{T("One brand. <em>Clear routes to action.</em>", "Ett merke. <em>Tydelige veier til handling.</em>", "h2", "display h2")}'
    '</div><div class="stack">'
    f'{T("Unverified claims are never shown as facts.", "Uverifiserte påstander vises aldri som fakta.", "p", "body")}'
    f'{T("BETA ART Creative is a separate family.", "BETA ART Creative er en egen familie.", "p", "note")}'
    '</div></div></section>')

add('</main>')

# FOOTER -------------------------------------------------------------
def fl(h, en, no):
    return f'<a class="fl" href="{h}">{T(en, no)}</a>'
add('<footer class="foot"><div class="wrap"><div class="foot-grid"><div>'
    f'<a class="brand" href="#top">{MARK_S}<span>BETA ART</span></a>'
    '</div><div>'
    f'{T("Main areas", "Hovedområder", "h2")}'
    + fl("#explore", "Explore", "Utforsk") + fl("#business", "Business", "Business") + fl("#privat", "Privat", "Privat") + fl("#gallery-events", "Gallery &amp; Events", "Galleri &amp; arrangementer")
    + '</div><div>'
    f'{T("The Record", "The Record", "h2")}'
    + fl("#ledger", "Evidence ledger", "Bevisprotokoll") + fl("#record", "BETA-ID lookup", "BETA-ID-oppslag") + fl("#transparency", "Transparency", "Åpenhet") + fl("#studio", "Studio", "Studio")
    + '</div><div>'
    f'{T("More", "Mer", "h2")}'
    + fl("#field-notes", "Field Notes", "Field Notes") + fl("#assignments", "Assignments", "Oppdrag") + fl("#about", "About", "Om") + fl("#join", "Join", "Bli med")
    + '</div></div><div class="foot-bottom"><span>© 2026 Beta Art ENK, master design</span>'
    f'{T("Not published, no confirmed contact channel, noindex", "Ikke publisert, ingen bekreftet kontaktkanal, noindex")}'
    '</div></div></footer>')

add(f'<a class="totop" id="toTop" href="#top" {AR("Back to top", "Til toppen")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></a>')

add('<dialog class="pp" id="passport" closedby="any" aria-labelledby="ppTitle"><div class="pp-head"><div>'
    f'{T("BETA PASSPORT", "BETA PASSPORT", "p", "label acc")}<h2 id="ppTitle"></h2></div>'
    f'<form method="dialog"><button class="iconbtn" id="ppClose" {AR("Close passport", "Lukk passet")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></form></div>'
    '<p class="pp-banner" id="ppBanner"></p><div id="ppRows"></div><p class="pp-foot" id="ppFoot"></p>'
    '<div class="pp-act">'
    f'<a class="mini" id="ppMail" href="mailto:">{T("Email this record", "Send posten på e-post")}</a>'
    f'<a class="mini" id="ppClaim" href="#join">{T("Report a rights issue", "Meld fra om rettigheter")}</a>'
    f'<button type="button" class="mini" id="ppLink">{T("Copy link", "Kopier lenke")}</button></div>'
    '<p class="pp-url" id="ppUrl" hidden></p>'
    '<div class="pp-nav"><button type="button" class="mini" id="ppPrev"></button><button type="button" class="mini" id="ppNext"></button></div>'
    '<p class="vh" id="ppLive" aria-live="polite"></p></dialog>')

BODY = "\n".join(H)

css = (HERE / "styles.css").read_text(encoding="utf-8")
css += "\n.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n"
js = (HERE / "app.js").read_text(encoding="utf-8").replace("__NO__", json.dumps(NO, ensure_ascii=False))
head = HEAD.replace("__CSS__", css).replace("__THEME_BOOT__", THEME_BOOT)
script = f"<script>\n{js}\n</script>"

artifact = head + "\n" + BODY + "\n" + script + "\n"
(DIST / "artifact.html").write_text(artifact, encoding="utf-8")

standalone = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
              '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
              + head + '</head>\n<body>\n' + BODY + "\n" + script + "\n</body>\n</html>\n")
(DIST / "index.html").write_text(standalone, encoding="utf-8")
print("keys:", len(NO), "artifact bytes:", len(artifact.encode()), "standalone bytes:", len(standalone.encode()))

# ---------------------------------------------------------------- release package (built locally, NEVER deployed)
# Betul's rule: nothing goes to Vercel until she says "yayınla". This only writes dist/vercel/.
import base64, hashlib, shutil, subprocess, sys
SITE = ""  # canonical origin once Betul picks a domain, e.g. "https://beta-art.no". Empty = relative URLs.
REL = DIST / "vercel"
MEDIA = HERE.parent / "media"
GF = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n')
assert GF in HEAD
GF_LINE = [l for l in HEAD.splitlines() if "fonts.googleapis.com/css2" in l][0] + "\n"
FACES = (
    '@font-face{font-family:"Fraunces";font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/fraunces-latin-opsz-normal.woff2) format("woff2")}\n'
    '@font-face{font-family:"Fraunces";font-style:italic;font-weight:100 900;font-display:swap;src:url(fonts/fraunces-latin-opsz-italic.woff2) format("woff2")}\n'
    '@font-face{font-family:"Inter Tight";font-style:normal;font-weight:400;font-display:swap;src:url(fonts/inter-tight-latin-400-normal.woff2) format("woff2")}\n'
    '@font-face{font-family:"Inter Tight";font-style:normal;font-weight:500;font-display:swap;src:url(fonts/inter-tight-latin-500-normal.woff2) format("woff2")}\n'
    '@font-face{font-family:"IBM Plex Mono";font-style:normal;font-weight:400;font-display:swap;src:url(fonts/ibm-plex-mono-latin-400-normal.woff2) format("woff2")}\n'
    '@font-face{font-family:"IBM Plex Mono";font-style:normal;font-weight:500;font-display:swap;src:url(fonts/ibm-plex-mono-latin-500-normal.woff2) format("woff2")}\n')
OG_DESC = "Photography, creators and cultural discovery, with clear context, status and routes to action."
def u(path): return (SITE.rstrip("/") + "/" + path) if SITE else path
REL_META = (
    '<link rel="preload" href="fonts/fraunces-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>\n'
    '<link rel="preload" href="fonts/inter-tight-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>\n'
    '<link rel="icon" href="favicon.svg" type="image/svg+xml">\n'
    '<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">\n'
    '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n'
    + (f'<link rel="canonical" href="{SITE.rstrip("/")}/">\n' if SITE else "")
    + '<meta property="og:type" content="website">\n<meta property="og:site_name" content="BETA ART">\n'
    '<meta property="og:title" content="BETA ART">\n'
    f'<meta property="og:description" content="{OG_DESC}">\n'
    f'<meta property="og:image" content="{u("og.png")}">\n'
    '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
    '<meta property="og:image:alt" content="The BETA ART wordmark beside the aperture mark, with the line Source. Context. Rights. Retrievability.">\n'
    '<meta name="twitter:card" content="summary_large_image">\n')
rel_head = HEAD.replace(GF, "").replace(GF_LINE, REL_META).replace("__CSS__", FACES + css).replace("__THEME_BOOT__", THEME_BOOT)
assert "fonts.googleapis" not in rel_head and "fonts.gstatic" not in rel_head
script_body = f"\n{js}\n"
sha = base64.b64encode(hashlib.sha256(script_body.encode("utf-8")).digest()).decode()
sha_boot = base64.b64encode(hashlib.sha256(THEME_BOOT.encode("utf-8")).digest()).decode()
CSP = ("default-src 'none'; "
       f"script-src 'sha256-{sha}' 'sha256-{sha_boot}'; "
       "style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; "
       "connect-src 'none'; manifest-src 'self'; base-uri 'none'; form-action 'none'; "
       "frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests")
release_html = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
                '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
                + rel_head + '</head>\n<body>\n' + BODY + "\n<script>" + script_body + "</script>\n</body>\n</html>\n")
REL.mkdir(exist_ok=True)
(REL / "fonts").mkdir(exist_ok=True)
for f in sorted((MEDIA / "fonts").glob("*")):
    shutil.copy2(f, REL / "fonts" / f.name)
(REL / "index.html").write_text(release_html, encoding="utf-8")
NOT_FOUND = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Not found · BETA ART</title>\n'
    '<meta name="robots" content="noindex">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<style>\n'
    + FACES.replace("url(fonts/", "url(/fonts/") +
    ':root{--paper:#fbfaf7;--ink:#0f0f0f;--muted:#6f6b65;--rule:#e4e0d8;--accent:#8b1a1a}\n'
    '@media (prefers-color-scheme:dark){:root{--paper:#171513;--ink:#f1ede6;--muted:#a9a399;--rule:#35312c;--accent:#e39a91}}\n'
    'html,body{margin:0;background:var(--paper);color:var(--ink)}\n'
    'main{box-sizing:border-box;min-height:100vh;max-width:44rem;margin:0 auto;padding:clamp(40px,10vw,120px) 16px;display:grid;align-content:center;gap:1.2rem}\n'
    'p{margin:0}.l{font:400 .75rem/1.5 "IBM Plex Mono",monospace;color:var(--accent)}\n'
    'h1{margin:0;font:300 clamp(2.6rem,9vw,5rem)/.95 "Fraunces",Georgia,serif;letter-spacing:-.03em}\n'
    '.b{font:400 1.05rem/1.6 "Inter Tight",system-ui,sans-serif;color:var(--muted);max-width:52ch}\n'
    'a{color:var(--ink);font:400 .8rem/1 "IBM Plex Mono",monospace;display:inline-flex;align-items:center;min-height:44px;width:fit-content;border-bottom:1px solid var(--accent);text-decoration:none}\n'
    'a:focus-visible{outline:2px solid var(--accent);outline-offset:4px}\n</style>\n</head>\n<body>\n<main>\n'
    '<p class="l">404 · BETA ART</p>\n<h1>No record at this address.</h1>\n'
    '<p class="b">The page may have moved, or the link is incomplete. <span lang="nb">Ingen post på denne adressen. Siden kan være flyttet, eller lenken er ufullstendig.</span></p>\n'
    '<a href="/">Back to BETA ART / <span lang="nb">Til forsiden</span></a>\n</main>\n</body>\n</html>\n')
(REL / "404.html").write_text(NOT_FOUND, encoding="utf-8")
(REL / "robots.txt").write_text("# Closed until Betul approves publication. Change to Allow: / only when she says \"yayınla\".\nUser-agent: *\nDisallow: /\n", encoding="utf-8")
VERCEL = {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "git": {"deploymentEnabled": False},
    "cleanUrls": True,
    "trailingSlash": False,
    "headers": [
        {"source": "/(.*)", "headers": [
            {"key": "Content-Security-Policy", "value": CSP},
            {"key": "X-Content-Type-Options", "value": "nosniff"},
            {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
            {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()"},
            {"key": "X-Frame-Options", "value": "DENY"},
            {"key": "Cross-Origin-Opener-Policy", "value": "same-origin"},
            {"key": "Strict-Transport-Security", "value": "max-age=63072000"},
            {"key": "X-Robots-Tag", "value": "noindex, nofollow, noarchive"}]},
        {"source": "/fonts/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]},
    ],
}
(REL / "vercel.json").write_text(json.dumps(VERCEL, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
if "--no-media" in sys.argv:
    pass
elif not (MEDIA / "render.py").exists():
    # after a container reset only src/* may be restored; the page still builds, the release package waits for media/*
    print("note: media/ not found, share image and icons were not rendered (restore media/* from the artifact)")
else:
    subprocess.run([sys.executable, str(MEDIA / "render.py"), str(REL)], check=True, stdout=subprocess.DEVNULL)
if not list((MEDIA / "fonts").glob("*.woff2")):
    print("note: media/fonts is empty, the release package has no fonts (see README: restore)")
sums = {p.relative_to(REL).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in sorted(REL.rglob("*")) if p.is_file() and p.name != "checksums.json"}
(REL / "checksums.json").write_text(json.dumps(sums, indent=2) + "\n", encoding="utf-8")
print("release package:", REL, "files:", len(sums), "index bytes:", len(release_html.encode()), "csp script hash:", sha[:12] + "…")

---
name: beta-art-tasarim-sistemi
description: "Use this skill for any design work on BETA ART, Betul's photography, archive and art brand: a page, section, component, colour, font, layout, motion or copy change on BETA ART MASTER. It applies the tokens, type scale, grid, motion and accessibility rules, the no-fabrication limits and the EN/NO copy rules, and it runs the check script. Only for BETA ART. NAVIAR, COBBAN and other projects are out of scope."
---

# BETA ART tasarım sistemi

Kapsam **yalnızca BETA ART**: Archive, Business, Privat, Gallery & Events ve ortak güven
katmanı. Başka bir proje bu skill'e girmez ve bu skill başka bir projeye taşınmaz.

Bu bir stil rehberi değil, **kabul ölçütüdür**. `scripts/design_check.py` geçmiyorsa
ve aşağıdaki bitirme sırası tamamlanmadıysa iş bitmemiştir.

## Tek kaynak: BETA ART MASTER

29.09.2026 tarihli karar (Betul): Bütün iyileştirmeler **BETA ART MASTER** sayfasında
yapılır. Bu sayfa artifact `UuC6xyummGdNsmtrbKQ5YA` olarak yayınlanıyor. Lovable master, yerel çok sayfalı paket,
eski artifact'ler ve Vercel varyantları yalnızca kaynak ve arşivdir. Onlara iş eklenmez.

- HTML'i `src/build.py` üretir. Davranış `src/app.js`'te, stil tek dosya olarak `src/styles.css`'te durur.
- `dist/` **elle düzenlenmez**; build yeniden yazar.
- Metin build.py'de `T(en, no)` ile yazılır. İki dil aynı anda girer, biri eksik girmez.
- Container sıfırlanırsa kaynaklar artifact'in ek dosyalarından (`src/*.txt`) geri alınır.

## Token'lar: icat etme, buradan al

Hepsi `styles.css` içindeki `:root` bloklarında durur. Yeni renk veya ölçü eklenmez, var olan seçilir.
Bir token yetmiyorsa bu bir tasarım kararıdır. Önce README'deki "Kayıtlı kararlar"
bölümüne yazılır.

**Açık tema:** kâğıt `--paper:#fbfaf7`, kart `--card:#fffdf9`, ton `--tint:#f3f0e9`,
mürekkep `--ink:#0f0f0f`, ikincil metin `--muted:#6f6b65`, çizgi `--rule:#e4e0d8`,
arşiv kırmızısı `--accent:#8b1a1a` (üstündeki metin `--on-accent`).
**Ters bant** (kanıt defteri, Business, Verify, alt bilgi): `--inv-bg:#0f0f0f`,
`--inv-fg`, `--inv-muted`, `--inv-dim`, `--inv-rule`, `--inv-accent:#e2a9a3`.
**Durum:** `--ok:#35573c`, `--warn:#8a5a12`.
**Koyu tema** `:root:not([data-theme="light"])` (medya sorgusu) ve
`:root[data-theme="dark"]` içinde aynı değerlerle iki kez tanımlanır:
kâğıt `#171513`, mürekkep `#f1ede6`, kırmızı `#e39a91`.

**Kırmızı bir sinyaldir, süs değildir.** Başlıktaki tek italik ifade, durum etiketi,
mührün noktası ve odak halkası kırmızı olur. Arka plan dolgusu, gradyan ya da ikinci
bir vurgu rengi kullanılmaz.

## Tipografi: üç yüz, üç iş

- `--f-display` **Fraunces** (opsz ekseni): başlıklar, plaka ve ayak numaraları.
  Başlıkta **en fazla bir** italik ifade olur (`<em>`). Bu, Lovable master'dan gelen marka imzasıdır.
- `--f-body` **Inter Tight** 400 (ve yalnız dosya listesinde 500): okunan metin.
- `--f-mono` **IBM Plex Mono** 400/500: kayıt kodları (BA-003, P-004), durum etiketleri,
  tablo başlıkları ve göz etiketleri.
- Dördüncü bir yazı tipi yok. Kullanılmayan kalınlık yüklenmez.

**Taban 11 px.** `--t-micro:.6875rem` sayfadaki en küçük boyuttur. `--t-mono:.75rem`
göz etiketinin (`.label`) boyutudur. 11 px'in altında hiçbir metin olmaz.
Başlıklar `clamp()` ile akıcıdır. Sabit `px` başlık yazılmaz.

**Göz etiketleri (`.label`) cümle düzeninde yazılır**, büyük harfe çevrilmez. Büyük harf
yalnızca kayıt kodu, durum damgası (`.chip`) ve tablo başlığında kalır. Her başlığın
üstüne etiket konmaz. Etiket gerçek bir bilgi taşımıyorsa silinir.

**Okuma genişliği:** gövde metni en fazla 68 karakter olur (`.note`, `.small`, `.body`).

**Orta nokta ( · ) yalnızca kayıt gösteriminde kullanılır:** kimlik ve başlık (`BA-003 · Sea of Fog`), kayıt türü ve kodu (`Photo · BA-001`) ya da belge başlığı (`BETA ART · Enquiry`). Etiketleri ve çipleri birbirine bağlamak için kullanılmaz; orada virgül, iki nokta ya da "ve" yazılır. Aralıklı uzun çizgi ( — ) etiket içinde kullanılmaz. Ok işareti yalnızca gerçek bir sırayı gösterir (kanıt defteri, ayak akışı). Script bunu denetler.

**Etiket başlığı tekrar etmez.** Etiket, başlığın büyük harfli bir kopyası olamaz. Sıralı içerikte etiket sıra numarasıdır (ilkeler 01–04). Tıklanmayan kartlarda üzerine gelme efekti olmaz, çünkü tıklanabilir gibi görünür.

## Izgara ve yüzey

- `--max:92rem`, `--gutter:clamp(16px,4vw,40px)`. Kırılma noktaları 1240 / 1100 / 860 / 600.
- Yapı ince çizgili hücrelerle kurulur. Gölge, cam bulanıklığı (`backdrop-filter`),
  `conic-gradient` ve hap şeklinde süs kutusu yok. Üst menü opaktır.
- Bir bölüm tek iş yapar. Sayfa zaten uzun (masaüstünde yaklaşık 17 900 px). Yeni bölüm
  varsayılan değildir, gerekçe ister.
- **Kayıt plakasındaki tescil haçı** yalnızca mührün çevresinde durur, hiçbir metnin
  üstünden geçmez (`.rec-mark::before/::after`).
- Plaka görselleri kanıt gelene kadar **boş çerçevedir**
  (tarama + köşe işaretleri). Görsel ekleme kuralları `beta-art-medya` skill'indedir.

## Web platformu: yerel kalıplar önce (modern-web-guidance, 29.09.2026)

Yeni bir bileşene başlamadan önce `modern-web-guidance` skill'inde kalıp aranır (`npx -y modern-web-guidance@latest search "<ne yapılacak>"`). Bulunan kalıp uygulanır. Kalıp Baseline "widely available" değilse rehberdeki geri dönüş yolu da yazılır. Sayfada kullanılan kalıplar şunlar:

- **Pasaport penceresi:** `<dialog closedby="any">` `showModal()` ile açılır. Kapatma düğmesi `<form method="dialog">` içindedir. `closedby` desteklenmiyorsa rehberdeki koordinat kontrolüyle dışarı tıklayınca kapanır. Pencereye odak tuzağı yazılmaz; tarayıcı dışarıyı zaten etkisiz yapar.
- **Tema:** `<meta name="color-scheme" content="light dark">` ve `:root{color-scheme:light dark}` kullanılır. İki durum var: sistemi izle ya da sistemin tersini sabitle. Sabitlenen seçim `ba-theme` anahtarıyla saklanır ve `<head>` içindeki küçük bir betikle ilk boyamadan önce uygulanır. CSP bu betiğin SHA-256 özetini de içerir. Düğme `aria-pressed` ile durumunu bildirir.
- **Marka rengi:** `accent-color` `:root` üzerinde tanımlıdır. Desteklemeyen tarayıcıda onay kutusu `@supports not` ile aynı renge boyanır.
- **Kaydırmaya bağlı efektler** (ilerleme çizgisi, dönen diyafram) CSS scroll-driven animation ile yapılır ve `prefers-reduced-motion: no-preference` ile `@supports` içindedir. Süs oldukları için betikle geri dönüş yazılmaz. Başa dön düğmesi IntersectionObserver ile çalışır; kaydırma dinleyicisi yok.
- **Sekmeler:** gizli paneller desteklenen tarayıcılarda `hidden="until-found"` olur, böylece sayfada arama (Ctrl+F) onları bulur. `beforematch` olayı doğru sekmeyi seçer. Panelin kendisine dolgu ya da `display` verilmez.
- **Arama:** BETA-ID formu `<search>` içindedir. İpucu `aria-describedby` ile alana bağlıdır.
- **Durum mesajları:** yazarken değişen mesajlar (`status()`) 450 ms geciktirilir, ekran okuyucu her tuşta konuşmasın.
- **Atlama bağlantısı:** hedefi `<main id="main" tabindex="-1">`.
- **Yüksek kontrast:** `prefers-contrast: more` ikincil metni ve çizgileri koyulaştırır. `forced-colors: active` iken seçili sekme, dil ve tema düğmeleri dış çizgiyle belirtilir, arka plana güvenilmez.
- **Yazım:** başlıklar `text-wrap: balance` kullanır. `text-wrap: pretty` yalnızca hero cümlesinde kullanılır. Ölçüm: bütün paragraflara uygulandığında mobilde 120 ms engelleme süresi ekliyordu.
- `autocomplete="off"` yazılmaz. Alıntı olmayan metin `<blockquote>` olmaz.
- **Bilerek uygulanmayanlar** (ölçüm gerekçesiyle): `content-visibility: auto` uygulanmadı, çünkü tek sayfalık menüde bölüm bağlantılarının kaymadan doğru yere inmesi daha önemli ve sayfa zaten hızlı. `font-size-adjust` de uygulanmadı: fontlar yayın paketinde önceden yükleniyor ve CLS 0.

## Performans: ölçülüyor

Yayın paketi yerelde, Vercel'in sıkıştırması taklit edilerek Lighthouse 12 ile ölçülür. Son değerler (29.09.2026): mobil performans 99, masaüstü 100, erişilebilirlik 100, en iyi uygulamalar 100, CLS 0, TBT 0, mobil FCP 1,5 s ve LCP 2,1 s. SEO puanının 54 olması bilinçlidir (`noindex` ve `robots.txt` kapalı). Başlangıçta düzen okuyan kod `requestAnimationFrame` içine alınır, kaydırmada `IntersectionObserver` kullanılır. Bu sayıları düşüren bir değişiklik geri alınır.

## Hareket: tek bir an

- Sayfa açılırken diyafram açılır. Kaydırma sırasında üç logo (hero, üst menü, alt bilgi)
  birlikte döner. Üstüne gelince 18° döner ve kırmızıya geçer. Bunun dışında hareket yok.
  Bölümlere kayarak ya da solarak giriş animasyonu eklenmez.
- `prefers-reduced-motion: reduce` açıkken hareket yoktur.
- Kullanıcı bir şey yaptığında verilen tepki serbesttir (sekme, pencere, kopyalandı mesajı), yeter ki neyin değiştiğini göstersin.

## Erişilebilirlik: WCAG 2.2 AA, ölçülüyor

axe-core; açık/EN, koyu/NO ve mobil/NO görünümlerinde, pasaport penceresi de açıkken
**0 ihlal** verir. Bu sayıyı bozan değişiklik geri alınır.

- Tek `h1`, başlık seviyeleri atlanmaz, tek `<main>`. Durum çubuğu `aside` içindedir ve etiketlidir.
- 390 px genişlikte yatay taşma olmaz. Uzun Norveççe bileşik kelimelere `&shy;` ve
  `hyphens:auto` uygulanır.
- Dokunma hedefi en az 24 px olur. Mobil menü, hızlı ayak bağlantıları, sekmeler ve alanlar 44 px olur.
- Odak halkası her durakta görünür. `outline:none` yazılmaz.
- Pasaport penceresi kapanınca odak açan öğeye döner. Dil değiştiyse aynı plakanın yeni düğmesine döner.
- Plaka düğmesinin adı görünen yazısından gelir (WCAG 2.5.3, etiket adın içinde): "BA-004 Still Water". Boş çerçeve `aria-hidden`'dır. Düğmenin pencere açtığını `aria-haspopup="dialog"` söyler. Görünen yazıyla çelişen bir `aria-label` yazılmaz.
- Sekmeler ok tuşları, Home ve End ile dolaşılır. Menüdeki bölüm işareti
  `aria-current="location"`'dır.
- Sonuç bölgeleri `aria-live="polite"`'tır. BETA-ID sonucu `aria-atomic="true"`'dur.
- Dil değişince `html lang` `en` ile `nb` arasında güncellenir. `aria-label` metinleri
  `data-i18n-aria` ile çevrilir.

## Metin: az yazı (Betul, 29.09.2026: "bu sayfa az tekst kullan")

Sayfa yazıyla değil, başlık, kart ve araçla anlatır. 29.09.2026'da görünen metin 2 661 kelimeden 1 147 kelimeye (EN) indirildi. Bu seviye korunur.

- **Bölüm başına:** bir başlık ve en fazla bir kısa cümle. Açıklama paragrafı yazılmaz.
- **Paragraf:** en fazla 20 kelime, hedef 15. EN ve NO ayrı ayrı sayılır.
- **Kart:** başlık artı en fazla 6 kelimelik bir satır. Başlık tek başına yetiyorsa satır da yazılmaz (kanıt defteri, pilot ritmi, lisans adımları).
- **Sayfa bütçesi:** sayfadaki bütün çevrilebilir metin, dil başına en fazla 1 250 kelime. Yeni bir bölüm ya da araç eklenecekse önce başka bir yerden aynı kadar metin çıkarılır.
- **Tekrar yok:** Aynı bilgi iki kez yazılmaz. Çip durumu söylüyorsa altındaki not tekrarlamaz. Başlık konuyu söylüyorsa üstüne etiket konmaz. Seçim kutusundaki seçenekler kart olarak ayrıca listelenmez.
- **İç bilgi sayfaya girmez:** Proje kodları (P-003 / BA-PUB-001), karar notları ("yalnızca bu sayfada", logo kararı) ve üretim yapılacaklar listesi README'de durur, ziyaretçiye gösterilmez.
- **Ayrıntı istenince açılır:** Uzun açıklama gerekiyorsa `<details>` ya da pasaport penceresi kullanılır. Oradaki metin de 15 kelimeyi geçmez.
- Kullanıcının dili kullanılır: "BETA-ID'ye bak", "Pasaportu aç". Sistem dili kullanılmaz.
  Düğme ne yapacağını söyler.
- Norveççe bokmål kullanılır. Sanat baskısı için "opplag" (utgave değil), chain of custody için "ubrutt
  beviskjede", Request a Shoot için "Bestill et fotooppdrag", çıkış için "avslutning" yazılır.
  Özel ad ile kurulan bileşik kelimede tire olur: "BETA ART-masterpost".
- Boş durum ve hata bir sonraki adımı söyler, özür dilemez.

## Sert sınırlar: tasarım bunları delemez

- **Uydurma yok.** Fotoğrafçı adı, kamera, tarih, konum, müşteri logosu, "doğrulandı"
  işareti, referans ya da sayaç yazılmaz. Kanıtı olmayan alan "Not supplied / Ikke oppgitt"
  olarak kalır. Bilerek dışarıda bırakılanlar (84.000 kare, 24 saatte teslim, %70–80,
  Jotunheimen/Kongsberg konumları, ✓ işaretleri, doğrulanmamış e-postalar) geri gelmez.
  Script bunları arar.
- **Fiyat hipotezdir.** Business 15 000 / 2 500 / 11 000 kr eks. mva ve Personal
  "kr 190'dan" etiketleri, Betul karar verene kadar "test ediliyor / veiledende"
  olarak kalır.
- **E-posta ve iletişim kanalı yayımlanmaz.** Kanal doğrulanana kadar başvuru metni
  sayfada hazırlanır ve kopyalanır.
- **Yayın dondurması.** `noindex` kalır. Vercel, Netlify, GitHub, Lovable ya da önizleme
  bağlantısı, Betul "yayınla" diyene kadar kullanılmaz. `dist/vercel/` yalnız hazırlıktır
  ve `git.deploymentEnabled:false` ile gelir.
- **Başka proje karışmaz.** NAVIAR'ın rengi, metni ya da bileşeni BETA ART'a girmez.

## Bitirme sırası: atlanmaz

```
python3 src/build.py                                           # dist/artifact.html, dist/index.html, dist/vercel/
python3 skills/beta-art-tasarim-sistemi/scripts/design_check.py # token, tip tabanı, h1, 45 kelime, uydurma, noindex
python3 skills/beta-art-medya/scripts/media_check.py            # görsel, ikon, paylaşım görseli
```

Ardından tarayıcı testleri yapılır: axe (üç görünüm ve pencere), konsol hatası 0, 390 px'te yatay taşma 0.
Sonra aynı dosya yoluyla (`dist/artifact.html`, `src/*` ek dosya olarak) yeniden
yayınlanır ve README'deki "Tur günlüğü" bölümüne tarihli bir satır yazılır.

## Betul'un açık kararları

Tasarımla kapatılmaz, yalnız etkisi raporlanır: Business faz 1 (önce inşaat mı, beş
sektör mü), Personal "kr 190'dan" kalsın mı, alan adı (beta-art.com / beta-art.no /
betaart.no, build.py'de tek `SITE` sabiti), her ayak için doğrulanmış iletişim kanalı,
hangi Vercel projesi, son logo seçimi.

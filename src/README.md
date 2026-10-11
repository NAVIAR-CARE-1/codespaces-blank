# BETA ART MAIN — Birleşik master (04.10.2026)

`index.html` tek dosyalık, bağımsız bir sayfadır. Çift tıklayınca tarayıcıda açılır. İnternet varsa Google Fonts'tan Fraunces, Inter Tight ve IBM Plex Mono yüklenir. İnternet yoksa sistem fontlarıyla açılır.

- **Durum:** Geliştirme sürümü, yayında değil, `noindex`.
- **Yayın:** Yayında değil. 04.10.2026'dan beri kaynak kod ve build çıktısı GitHub deposunda (`naviar-care-1/codespaces-blank`), Betul'ün isteğiyle. Bu bir yayın değildir: Vercel, Netlify, Lovable ya da GitHub Pages bağlı değil, `noindex` duruyor. Yayın ancak Betul "yayınla" deyip hangi projeye gideceğini söylediğinde yapılacak.
- **Dil ve tema:** EN/NO geçişi var (seçim tarayıcıda hatırlanır). Açık ve koyu tema var. Mobil uyumlu.

## Kayıtlı kararlar

- **04.10.2026, Betul:** "Buradan aktaracaklarını aktar", "web sayfasını GitHub'da güncelle", "iyileştir". Yüklenen dört dosya incelendi (aşağıda Tur 13). Kaynak ve build çıktısı GitHub'a gönderildi; yayın kuralı değişmedi.
- **02.10.2026, Betul (`BETA_ART_MAIN_FINAL_2026-10-02.html`):** Sayfanın adı BETA ART MAIN. Altı ana alan: Explore, Business, Privat, Gallery &amp; Events, The Record, Join. Archive → Explore, Verify → The Record, Contact → Join. Privat artık yaratıcı pazaryeri (Creator Marketplace). Gallery &amp; Events artık Skandinavya'daki kültür etkinliklerini bulma ve organizatör kaydı. Hero cümlesi V08 taslağından: "See the work. Understand the record. Know what comes next."
- **29.09.2026 akşam, Betul (en yeni karar, öncekini geçersiz kılar):** "Bu senin üzerinde çalışacağın main Beta Art sayfası." Soruya verdiği cevap: **ana sayfa artık beta-art.com (GoDaddy Airo AI Builder, site `68v0scym3h`).** BETA ART MASTER (bu artifact) bundan sonra kaynak olur; buradaki iyi fikirler Airo sitesine taşınır. Airo'da değişiklikler taslak olarak kaydedilir; Betul "yayınla" diyene kadar Airo'da Publish'e basılmaz. Airo'ya giriş Betul'ün kendi GoDaddy oturumuyla yapılır; Claude şifre girmez, hesap açmaz.
- **29.09.2026, Betul:** Beta Art'taki bütün iyileştirmeler bu sayfada, yani BETA ART MASTER'da (artifact `UuC6xyummGdNsmtrbKQ5YA`) yapılır. Diğer sürümler yalnızca kaynak ve arşiv olarak kalır: Lovable master, yerel çok sayfalı paket, eski artifact'ler ve Vercel varyantları. Onlara yeni iş eklenmez. Sayfadaki kayıt plakasında da "Forbedringer / Improvements: yalnızca bu sayfada" satırı var.
- **29.09.2026, Betul:** Medya ve tasarım skill'leri bulunup bu sayfada kullanılacak. Eksik olan Beta Art'a özel skill'ler de yazılacak (bkz. "Skill'ler").
- **29.09.2026, Betul:** "Bu sayfa az tekst kullan." Sayfa yazıyla değil, başlık, kart ve araçla anlatılır. Kural ve kelime bütçesi `beta-art-tasarim-sistemi` skill'inde duruyor, `design_check` bunu denetliyor.

## Hangi sürümden ne alındı

| Bölüm | Kaynak |
| --- | --- |
| Tasarım sistemi (kâğıt / mürekkep / arşiv kırmızısı, Fraunces + Inter Tight + IBM Plex Mono), diyafram mührü, kayıt plakası, dört ayak, kanıt defteri (7 adım), BETA-ID / Passport / Vault / Rights, "Ödendi ≠ lisanslı", Hakkında | Lovable "Beta Art Archive", commit 0febfb9 (27.09) |
| Business: "Customer gives / Beta Art does / Customer receives / Boundary", pilot ritmi, Archive seri çerçevesi (7 seri), Studio (Genel bakış / Kayıtlar / Kaynak alımı / Ödeme), iletişim hazırlığı | Yerel çok sayfalı paket ve GitHub transfer ZIP'i (29.09) |
| Business kullanım alanları (denizcilik/offshore, enerji, su ürünleri, sağlık, turizm) ve fiyat hipotezi (15 000 / 2 500 / 11 000 kr, eks. mva) | Betul'un 21.09'da kanonik seçtiği beta-art-business-three.vercel.app |
| Galeri: Oslo sezonluk salon, çağrı → jüri → doğrulama → katalog → salon döngüsü, bağımsızlık kuralı, sürekli gözden geçirme | "Beta Art Galleri" artifact'i (21.09) |
| Lisans adımları (plakayı seç / kullanımı anlat / sözleşmeyi al), "Not stock photography", Personal "kr 190'dan" | Eski "Beta Art Archive" artifact'i ve Lovable'daki ilk proje özeti |
| 12 örnek kayıt (BA-001 … BA-012) | Lovable `archive-web/data.js` |
| BETA ART MAIN yapısı: altı alan, "What are you here to do?" rotaları, See / Understand / Status / Act, Explore, Privat (Creator Marketplace), Galeri keşfi ve organizatör kaydı, The Record, Join | `BETA_ART_MAIN_FINAL_2026-10-02.html` (Betul, 02.10); hero cümlesi ve rota soruları V08 taslağından |

## Yeni eklenen etkileşimler

Hepsi yalnızca tarayıcıda çalışır. Hiçbiri sunucuya veri göndermez.

- **Plaka Pasaportu:** Katalogdaki bir plakaya tıklayınca tüm kanıt alanları gösterilir. Hepsi "Not supplied / Ikke oppgitt" olarak dürüstçe boş.
- **BETA-ID sorgusu:** `BA-003`, `3` veya `ba 7` gibi girişleri tanır. Bulunamayan kimlik için açıklama verir.
- **Şeffaflık simülatörü:** Ödeme "Paid" yapılsa bile lisansın oluşmadığını canlı gösterir.
- **Kaynak alımı:** Seçilen dosyanın SHA-256 parmak izi cihazda hesaplanır. Dosya hiçbir yere yüklenmez.
- **İletişim hazırlığı:** Başvuru metni rotaya göre ipuçlarıyla oluşturulur ve kopyalanabilir. E-posta adresi yayımlanmadı.
- **Geri bulma notu (Business):** Proje ve 3–5 soru girilir. Her soru için kaynak, erişim ve biçim kontrolü içeren bir not oluşur. Not kopyalanabilir ya da başvuru metnine eklenebilir.
- **Galeri kontrol listesi:** Sanatçı elindeki kanıtları sekiz madde üzerinden işaretler. Eksikler listelenir. Liste kopyalanabilir ya da başvurunun "kanıt" alanına eklenebilir.
- **Baskı:** Sayfa, pasaport ve üretilen notlar kâğıda temiz basılır.

## Bilerek alınmayanlar (uydurma veya doğrulanmamış)

- 25.09 artifact'i: "Golden Hour · Jotunheimen", "Portrait in Amber · Oslo", "Blue Hour Grid · Kongsberg" konumları, "Available" durumları, "✓ RAW Archived / Metadata Reviewed / License Signed" işaretleri, "fotoğrafçılar gelirin %70–80'ini alır" iddiası, 35 kategori sayacı.
- Eski arşiv artifact'i: "2012'den beri 84.000+ kare" ve "24 saat içinde teslim" gibi birinci tekil şahıs iddiaları.
- Galleri ve Business sayfaları: `galleri@betaart.no` ve `post@betaart.no`. İkisinin kaynağında da "canlıdan önce doğrula" notu vardı.
- Lovable'daki plaka ve galeri fotoğrafları: kaynağı ve hakkı belgelenmiş değil. Bu yüzden katalogda boş çerçeveler var; başlık bunun bilinçli olduğunu söylüyor.
- Galeri ve satıcı programındaki %30 / %70 komisyon: onaylı bir karar olarak görmedim.
- beta-art.com (GoDaddy Airo, 29.09 taraması): "12 plaka · 2 şu an satışta · 1 doğrulanmış fotoğrafçı" sayaçları, "Portrait in Amber / The Maker: Available, release on file", konumlar (Ventura CA 2019, Chicago, Singapore, Jotunheimen, Studio Oslo), Sea of Fog için "Sony A7R V · 70–200mm f/4 · ISO 100", "2012'den beri 84 000 kare", "24 saatte teslim", "48 saatte yanıt", tarihli sergiler (Autumn 2026 Oslo, Winter 2026, Spring 2027), fotoğrafçı programı fiyatları (kr 0 / 290 / 590 ay), Commercial kr 890 ve Extended kr 2 900, sosyal medya bağlantıları, `hello@` ve `hallo@beta-art.com`, 2026.0142–0153 kayıt numaraları. Hepsi kanıt ya da Betul'un kararı olmadan sayfaya girmez.
- `BETA_ART_MAIN_V04_2026-10-01.html` (beta-art.com'un kopyası, 4,6 MB): gömülü 18 WebP görsel (hepsi "evidence review pending" ya da "user-supplied"; kaynak, kimlik ve hak belgelenmemiş), Inter ve JetBrains Mono fontları (tasarım sisteminin dışında), plaka konum ve tarihleri (Ventura CA Temmuz 2019, Jotunheimen, Ekim 2025), 2026.0142–0153 numaraları, `hallo@beta-art.com`, "Capture metadata reviewed" adımı. Energy Landscape plakası için yazılan kamera verisi (Nikon D5200, 20.07.2017, 100 mm f/7.1 ISO 400) da alınmadı: çekim verisi elle yazılmaz, kasadaki orijinalden okunur. Sayfa "orijinal NEF dosyada" diyor; NEF gelirse bu ilk gerçek plaka adayıdır (`make_derivatives.py`, kaynak kapısı).
- `BETA_ART_MAIN_FINAL_2026-10-02.html` içinden olduğu gibi alınmayanlar: "Display · inquiry · sale · licensing" (orta nokta yalnızca kayıt gösteriminde), büyük harfli "SEE. UNDERSTAND. STATUS. ACT." başlığı (cümle düzenine geçti), Explore'da hero cümlesinin tekrarı ("See the work. Understand the record."), Privat'ta "Paid ≠ rights transferred" (Şeffaflık bölümü bunu zaten söylüyor). Metin bütçesi FINAL'de EN 1 330 kelimeydi; sınır 1 250.

## Değerlendirme zinciri

1. **Gözlenen ihtiyaç:** Beta Art'ın 10'dan fazla dağınık sürümü var (Lovable, yerel paket, 4 Claude artifact'i, bet-art ve beta-art-master Vercel ekipleri). Bunlar birbiriyle çelişen iddialar içeriyor.
2. **Kullanıcı problemi:** Ziyaretçi 5–15 saniye içinde hangi ayağın kendisine göre olduğunu ve neyin gerçek, neyin beklemede olduğunu anlayamıyor.
2. **Hizmet/ürün bileşeni:** Tek kanonik sayfa. İçinde "Hangi kayda ihtiyacınız var?" rotaları, dört ayak, ortak güven katmanı ve açık durum etiketleri var.
3. **Beklenen insan sonucu:** Ziyaretçi ilk ekranda doğru rotayı seçer. Hiçbir şey abartılmadığı için markaya güvenir.
4. **Teslim modeli:** Tek statik HTML dosyası. Backend yok. Onaydan sonra Vercel'e statik site olarak konabilir.
5. **Güvenlik/gizlilik/hukuki sınırlar:** Uydurma veri yok. Kişisel veri toplanmıyor. Analitik yok. Formlar hiçbir yere gönderim yapmıyor. `noindex`.
6. **Ölçüm (yayından sonra):** İlk tıklamaya kadar geçen süre, rota kartı tıklama oranı, ayak bölümlerine iniş ve iletişim metni kopyalama sayısı. Bunun için önce analitik ve çerez onayı kararı gerekiyor.
8. **Sürekli iyileştirme:** Kanıt geldikçe boş alanlar doldurulur. Her gerçek plaka, pilot veya etkinlik önce kayıt olarak girer, sonra sayfada görünür.

## Tur günlüğü

- **Tur 1 (29.09):** Tüm sürümler birleştirildi. EN/NO dil desteği, açık/koyu tema ve mobil düzen eklendi.
- **Tur 2 (29.09):**
  - Erişilebilirlik denetimi (axe-core) yapıldı; açık/EN, koyu/NO ve mobil/NO görünümlerinde 0 ihlal kaldı. Düzeltilenler: filigran rakamlarının kontrastı, başlık sırası ve durum çubuğunun landmark içine alınması.
  - İlk ekrana dört ayağa giden hızlı bağlantılar eklendi.
  - Üst çubuğa kaydırma ilerleme çizgisi ve "başa dön" düğmesi eklendi.
  - Durum etiketlerinin renk açıklaması (lejant) eklendi.
  - Plakalar, BETA-ID sonucu, simülatör, manifest ve başvuru metni artık JavaScript olmadan da görünüyor.
  - Alan adı eklemeden asgari JSON-LD eklendi.
  - HawkScan güvenlik taraması çalıştırılamadı: bu ortamda hawk CLI ve HAWK_API_KEY yok. Onun yerine elle kontrol yapıldı: sayfa dışarıya veri göndermiyor, kullanıcı girdisi her yerde kaçışlanıyor ve yalnızca Google Fonts'a istek gidiyor.
- **Tur 3 (29.09, otomatik):** Norveççe metinler (429 metin + betik mesajları) bokmål açısından elden geçirildi.
  - Terimler düzeltildi: "utgave" yerine sanat baskısı için doğru terim "opplag", "chain of custody" için "ubrutt beviskjede", "Request a Shoot" için "Bestill et fotooppdrag", "exit" için "avslutning".
  - İngilizceden birebir çeviri kokan ifadeler düzeltildi: "miste mening", "gå for", "suksesspørsmål", "kundecaser", "viser gjestene gjennom".
  - Özel ad ile kurulan bileşik kelimeye kısa çizgi eklendi ("BETA ART-masterpost"). Gereksiz virgüller kaldırıldı.
  - Uzun bileşik kelimelere yumuşak heceleme eklendi (Gjenfinn-barhet, Arrangements-program).
  - Rota başlığı "Hvilket arkiv trenger du?" oldu, çünkü "post" Norveççede posta anlamına da geliyor.
  - axe 0 ihlal, konsol hatası 0, yatay taşma 0.
- **Tur 3b (29.09, Betul'un isteği):** Üst menü ve alt bilgideki küçük logolar artık büyük logo gibi davranıyor: yüklenirken diyafram açılıyor, fareyle üzerine gelince dönüp arşiv kırmızısına geçiyor, sayfa kaydırıldıkça dönüyor. Hareket azaltma tercihi olan ziyaretçilerde hareket yok. axe 0 ihlal, konsol hatası 0.
- **Tur 4 (29.09, elle başlatılan günlük tur):** Pasaport penceresi artık alanları üç doğrulama kontrolüne göre gruplayarak gösteriyor: Kaynak (RAW, sjekksum, çekim verisi, C2PA), Kimlik (fotoğrafçı; doğrulayan kişi eseri yapan kişi olamaz) ve Haklar (lisans kapsamı, izinler, yapay zekâ eğitimi çekincesi). Her kontrolün durumu "Karşılanmadı" olarak ve gereken kanıtla birlikte yazıyor. BETA-ID sorgusunda "Karşılanan kontroller: 0 / 3" satırı var. Pencere içi axe 0 ihlal, sayfa axe 0 ihlal, konsol hatası 0, yatay taşma 0.
- **Tur 5 (29.09, Betul'un isteği: "BÜTÜN İYİLEŞTİRMELER BETA ART MASTER'DA" ve "medya ve tasarım skill'lerini bul, oluştur, kullan"):**
  - Tek kaynak kararı kayıt plakasına ve bu dosyaya işlendi ("Master · 29.09.2026", "Improvements: made on this page only").
  - Dikkat süresi: Galeri (47 → 35 kelime) ve Şeffaflık (42 → 39 kelime) gövde metinleri kısaltıldı. Artık 40 kelimeyi geçen paragraf yok.
  - Tasarım skill'leriyle yapılan eleştiri (design-critique, frontend-design, anti-slop): 8–10 px'lik bütün etiketler 11 px tabanına çıkarıldı. Göz etiketleri cümle düzenine geçti; büyük harfli metin sayısı 208'den 169'a indi. Kayıt plakasındaki tescil haçı artık metnin üstünden geçmiyor. İlk ekrandaki dört ayak bağlantısı 22 px'ten 44 px dokunma hedefine çıktı. Üst menüdeki cam bulanıklığı kaldırıldı. Not kutularının satır uzunluğu 105'ten 68 karaktere indi. Mobilde boş görünen durum çubuğu düzeltildi.
  - Klavye ve ekran okuyucu: Pasaport kapanınca odak onu açan düğmeye dönüyor. Plaka düğmelerinin kısa bir adı var ("BA-004, Still Water. Original pending. Open passport"). Sekmelerde Home ve End tuşları çalışıyor. Menü işareti `aria-current="location"` oldu.
  - Medya skill'leriyle yapılan denetim (image-audit, font-audit): Sayfada raster görsel yok. Google Fonts'tan kullanılmayan kalınlıklar çıkarıldı (Inter Tight 600, Fraunces 500–600). Yayın paketinde fontlar artık kendi sunucumuzda.
  - Vercel hazırlık paketi `dist/vercel/` içinde üretildi. **Yayınlanmadı.**
  - İki Beta Art skill'i yazıldı ve script'leri bu sayfada çalıştırıldı: `design_check` 10/10 geçti ve bu sırada kaçmış bir 10,5 px'lik sekme yazısını yakaladı. `media_check` 0 hata verdi; tek uyarı, alan adı seçilene kadar göreli kalan `og:image`.
  - axe 0 ihlal (açık/EN, koyu/NO, mobil/NO ve iki pencere görünümü), konsol hatası 0, 320 ve 390 px'te yatay taşma 0.
- **Tur 6 (29.09, elle başlatılan günlük tur): Business geri bulma soruları hazırlayıcısı.** Business bölümüne "Skriv spørsmålene før filene / Write the questions before the files" başlıklı bir çalışma sayfası eklendi. Müşteri proje adını ve dönemini, sonra 3–5 geri bulma sorusunu yazıyor. İsterse üç örnekten birini tıklayıp başlıyor. Sayfa her soru için üç kontrol satırı üretiyor: kaynak (dosya bugün nerede), erişim (beş yıl sonra kim yasal olarak açabilir) ve biçim (bugünün programı olmadan açılır mı). Notlar kopyalanabiliyor. "Legg til i henvendelsen / Add to enquiry" düğmesi soruları iletişim bölümündeki başvuru metnine taşıyor ve imleci oraya götürüyor. Hiçbir şey gönderilmiyor ya da kaydedilmiyor, sayfa kişisel veri istemiyor.
  - Değerlendirme zinciri:
    - Gözlenen ihtiyaç: Pilotun ilk adımı "3–5 gerçek geri bulma sorusu".
    - Kullanıcı problemi: Proje yöneticisi ne getireceğini ve nasıl soracağını bilmiyor.
    - Bileşen: Sayfa içinde notu hazırlayan bir araç.
    - İnsan sonucu: Müşteri ilk görüşmeye somut sorularla geliyor.
    - Teslim: Statik sayfa, kopyala ya da başvuruya ekle.
    - Sınırlar: Veri gönderilmez ve saklanmaz. Kişisel veri ya da gizli içerik istenmez; bunlar ancak kapsam, erişim ve veri işleme sözleşmesinden sonra gelir.
    - Ölçüm (yayından sonra): Notu kopyalama ve başvuruya ekleme oranı. Bunun için önce analitik kararı gerekiyor.
    - Sürekli iyileştirme: Pilotlardan gelen gerçek sorularla örnekler yenilenir.
  - Kontroller: `design_check` 10/10, `media_check` 0 hata. axe 0 ihlal (açık/EN, koyu/NO, mobil/NO ve iki pencere görünümü). Konsol hatası 0. 320 ve 390 px'te yatay taşma 0. Yayın paketinin katı CSP testi: hata 0, dış istek 0.
- **Tur 7 (29.09, Betul'un isteği: "BÜTÜN İYİLEŞTİRMELER BETA ART MASTER'DA", ikinci kez):** Listede kalan beş madde günlük turlar beklenmeden yapıldı.
  - **Galeri kontrol listesi:** "Sjekk bevisene før du søker / Check your evidence before you apply" başlıklı bölüm eklendi. Sanatçı elindeki kanıtları dört grupta işaretliyor: kaynak, kimlik, haklar ve opplag (sekiz madde). Sayfa neyin eksik olduğunu yazan bir liste üretiyor. Liste kopyalanabiliyor ya da başvuruya eklenebiliyor; eklenince işaretlenen kanıtlar "Evidence that exists" alanına geçiyor. Utlysning henüz açık değil ve sayfa bunu söylüyor. Ad, dosya ya da kişisel veri istenmiyor, hiçbir şey gönderilmiyor.
    - Değerlendirme zinciri:
      - Gözlenen ihtiyaç: Kabul, kaynak, kimlik ve hakların belgelenmesine bağlı.
      - Kullanıcı problemi: Sanatçı neyin isteneceğini başvurudan önce bilmiyor.
      - Bileşen: Sayfa içinde kontrol listesi.
      - İnsan sonucu: Başvurular eksiksiz geliyor, reddedilme ve tekrar yazışma azalıyor.
      - Teslim: Statik sayfa, kopyala ya da başvuruya ekle.
      - Sınırlar: Veri toplanmıyor. Bağımsızlık kuralı ve yapay zekâ çekincesi görünür durumda.
      - Ölçüm (yayından sonra, analitik kararıyla): Liste kopyalama ve başvuruya ekleme oranı.
      - Sürekli iyileştirme: İlk utlysning'den sonra maddeler gerçek eksiklere göre güncellenir.
  - **Şablon izleri:** Görünen orta nokta sayısı 53'ten 8'e indi. Kalan sekizi yalnızca kayıt gösteriminde (BA-001 · First Light, BETA ART · Enquiry). Etiket ve çiplerde artık virgül, iki nokta ya da "ve" var. "BA — 001" yazımı "BA-001" oldu. Ayak kartlarındaki "01 · BETA ARCHIVE" gibi etiketler "BETA ARCHIVE" oldu, çünkü numara zaten kartta büyük filigran olarak duruyor. İlkelerin üstündeki, başlığı büyük harfle tekrar eden etiketler sıra numarasına (01–04) çevrildi. Tıklanmayan kartlardaki üzerine gelme efekti kaldırıldı (ilkeler ve kanıt defteri), çünkü tıklanabilir gibi görünüyordu. Büyük harfle yazılmış üç etiket cümle düzenine geçti. `design_check` artık bu kuralı denetliyor; denemede bir geri dönüşü yakaladı.
  - **Baskı görünümü:** Sayfa beyaz kâğıda siyah olarak basılıyor. Koyu bantlar da açık basılıyor. Menü, düğmeler, dokular ve animasyonlar basılmıyor. Kartlar sayfa arasında bölünmüyor, sekmelerin hepsi basılıyor. Pasaport açıkken yalnızca pasaport basılıyor (A4'te iki sayfa).
  - **Mobil menü işareti:** Yana kayan menünün arkasında daha fazla bölüm olan kenarı hafifçe soluyor. Menü sona gelince işaret kayboluyor. Bölümler arasında gezinirken o anki bölümün adı görünür alana kayıyor; dil değişince de. Ölçüm, kaydırma sırasında düzen okumadan yapılıyor (IntersectionObserver).
  - **Performans (Lighthouse 12, yayın paketi yerelde, Vercel'deki sıkıştırma taklit edilerek):** Mobil performans 97 (FCP 1,8 s, LCP 2,4 s, TBT 0 ms, CLS 0), masaüstü 100, erişilebilirlik 100, en iyi uygulamalar 100. SEO 54 bilinçli: `noindex` var ve robots kapalı. "robots.txt indirilemedi" uyarısı katı CSP'den geliyor (`connect-src 'none'`), gerçek tarayıcılar dosyayı doğrudan alıyor; dosyanın 200 döndüğü ayrıca test edildi. Ölçüm sırasında düzeltilenler:
    - Plaka düğmelerindeki `aria-label` görünen yazıyla uyuşmuyordu (WCAG 2.5.3). Artık düğmenin adı görünen yazıdan geliyor ("BA-004 Still Water Original pending"), boş çerçeve `aria-hidden`.
    - Açılışta 91 ms'lik zorunlu yeniden düzen hesaplaması vardı. İlk kaydırma okuması ilk kareye ertelendi.
    - Mobil menüdeki düzen okuma kaldırıldı.
    - Sıkıştırmasız sayfa 164 KB, gzip ile 44 KB. Toplam aktarım 245 KB (fontlar dahil).
  - Build artık yalnızca `src/*` geri yüklenmiş bir ortamda da çalışıyor. Medya ya da font eksikse uyarı veriyor, çökmüyor.
  - Kontroller: `design_check` 11/11 geçti (sayfa ve yayın paketi), `media_check` 0 hata. axe 0 ihlal (açık/EN, koyu/NO, mobil/NO ve iki pencere görünümü). Konsol hatası 0. 320 ve 390 px'te yatay taşma 0. Klavye testi geçti (pencereye odak, Esc ile geri dönüş, Home/End). Yayın paketi katı CSP ile test edildi: hata 0, dış istek 0.
- **Tur 8 (29.09, Betul'un isteği: "bu sayfa az tekst kullan"):** Sayfadaki yazı yarıdan fazla azaltıldı.
  - Görünen metin EN'de 2 661 kelimeden 1 147'ye (−%57), NO'da 2 438'den 1 062'ye (−%56) indi. En uzun paragraf 45 kelimeden 15 kelimeye indi.
  - Ayak kartlarında artık yalnızca başlık, durum çipi, bir başlık cümlesi ve bir satır var. Uzun açıklamalar, etiket listeleri (tags) ve iç proje kodları (P-003 / BA-PUB-001) kaldırıldı.
  - Kanıt defteri, pilot ritmi ve lisans adımları yalnızca başlıklarla gösteriliyor. Diğer kart satırları en fazla 6 kelime.
  - Tekrarlar kaldırıldı:
    - Her plakadaki "görsel beklemede" yazısı ve durum çipi (başlık bunu bir kez söylüyor).
    - İletişim bölümündeki altı rota kartı (seçim kutusunda zaten var).
    - Kullanım alanlarındaki beş "Bruksområde" çipi.
    - Başlıkların üstündeki gereksiz etiketler.
  - İç bilgiler sayfadan README'ye taşındı: "yalnızca bu sayfada" satırı, logo notu, ödeme altyapısı listesi, BETA ART Creative ayrıntısı.
  - Pasaport penceresi, simülatör uyarıları ve Verify ayrıntıları da 15 kelimenin altına kısaltıldı.
  - Yeni kural: bölüm başına bir başlık ve en fazla bir kısa cümle; paragraf en fazla 20 kelime; sayfa dil başına en fazla 1 250 kelime. Yeni bir şey eklenecekse önce başka bir yerden aynı kadar metin çıkarılır. `design_check` bunu denetliyor (şu an EN 1 121, NO 1 026 kelime).
- **Tur 9 (29.09, Betul'un isteği: modern web rehberi):** `modern-web-guidance` skill'iyle sayfadaki her bileşen için 15 arama yapıldı ve 13 rehber okundu. Sayfa bu rehberlere göre düzeltildi:
  - **Pasaport:** `closedby="any"` eklendi, dışarı tıklayınca yerel olarak kapanıyor. Desteklemeyen tarayıcılar için rehberdeki geri dönüş yolu var. Kapat düğmesi `<form method="dialog">` içine alındı. Esc, dışarı tıklama ve kapat düğmesinin üçü de odağı plakaya geri veriyor.
  - **Tema:** `<meta name="color-scheme">` eklendi. Seçilen tema artık sayfa çizilmeden önce uygulanıyor, yanlış renkte bir an görünme yok. Düğme iki durumlu: sistemi izle ya da tersini sabitle. Sistem teması değişirse sayfa da takip ediyor. Düğme `aria-pressed` ile durumunu bildiriyor.
  - **Kaydırma efektleri:** İlerleme çizgisi ve dönen diyafram artık CSS scroll-driven animation ile çalışıyor. Kaydırma dinleyicisi kaldırıldı. Başa dön düğmesi IntersectionObserver ile gösteriliyor. Hareket azaltma tercihinde animasyon yok.
  - **Studio sekmeleri:** gizli paneller `hidden="until-found"` oldu. Tarayıcıda sayfa içi arama (Ctrl+F) gizli sekmedeki yazıyı bulup o sekmeyi açıyor.
  - **Erişilebilirlik:** BETA-ID formu `<search>` içine alındı ve ipucu alana bağlandı. Yazarken değişen durum mesajları geciktirildi, böylece ekran okuyucu her tuşta konuşmuyor. Atlama bağlantısının hedefi odaklanabilir hale geldi. `autocomplete="off"` kaldırıldı. Alıntı olmayan slogan `<blockquote>`'tan çıkarıldı. Yüksek kontrast (`prefers-contrast`) ve zorunlu renk (`forced-colors`) modları eklendi; seçili durumlar bu modlarda da görünüyor.
  - **Marka rengi:** onay kutuları `accent-color` ile arşiv kırmızısında. Desteklemeyen tarayıcı için aynı renkte küçük bir geri dönüş stili var.
  - **Ölçüm:** Lighthouse mobil 99 (önce 97), FCP 1,5 s, LCP 2,1 s, TBT 0, CLS 0. Rehberin önerdiği `text-wrap: pretty` bütün paragraflara uygulanınca mobilde 120 ms engelleme ekledi. Metin artık kısa olduğu için yalnızca hero cümlesinde bırakıldı.
  - **Bilerek uygulanmayanlar:** `content-visibility: auto` (menü bağlantılarının doğru yere inmesi daha önemli, sayfa zaten hızlı) ve `font-size-adjust` (fontlar önceden yükleniyor, CLS 0).
  - **Kontroller:** axe 0 ihlal (açık/EN, koyu/NO, mobil/NO ve iki pencere görünümü). Konsol hatası 0. 320 ve 390 px'te yatay taşma 0. `design_check` 12/12. Katı CSP altında iki betik de çalışıyor: hata 0, dış istek 0. Baskı ve pasaport baskısı temiz.
- **Tur 10 (29.09, elle başlatılan günlük tur): Norveççe gözden geçirme.** Tur 5–8'de eklenen ve kısaltılan bütün NO metinleri bokmål açısından okundu. Anlam değişmedi, yalnızca dil düzeltildi:
  - **Pilot adımları:** "Avgrens / Kartlegg / Test / Avslutt". Hepsi aynı kip (emir), karışık isim ve fiil yok.
  - **Galeri listesi:** "Jeg har laget verket og kan bekrefte hvem jeg er." / "Jeg har rett til å vise verket og gjengi det i katalogen." / "Jeg har skriftlig tatt stilling til KI-trening." İngilizceden birebir çeviri gibi duran yapılar doğal bokmåla çevrildi.
  - **Kısa satırlar:** "Privat, ikke-kommersiell bruk." · "Nøter, fiskehelse, miljø." · "Demo: 12 eksempelposter, ingen verifiserte." · "Lokal prototype, ingenting er koblet til".
  - **Hero:** "…bevar kilde, kontekst og rettigheter – og finn riktig post igjen." (kısa çizgi ve doğru fiil).
  - **Pasaport ve simülatör:** "Loggføres, dateres og kan trekkes tilbake." · "Rettighetene er godkjent, tilbudet ikke. Lisensen venter."
  - **Kontroller:** `design_check` 12/12 (NO 1 038 kelime, bütçe 1 250). axe 0 ihlal (açık/EN, koyu/NO, mobil/NO ve iki pencere görünümü). Konsol hatası 0. 320, 390 ve 1440 px'te yatay taşma 0. Katı CSP altında sürüm paketi: hata 0, dış istek 0.

- **Tur 11 (29.09, Betul'un isteği: "kan du skanne min side og overfør de beste idene her"):** GoDaddy Airo'daki beta-art.com tarandı (ana sayfa, bir plaka sayfası, lisans şartları). Editör GoDaddy girişi istediği ve önizleme adresi "Service Unavailable" verdiği için yayındaki site okundu. Değerlendirme zincirinden geçen beş fikir BETA ART MASTER'a taşındı:
  - **Motife göre süzgeç:** Katalogun üstünde "Tümü 12 · Manzara 7 · Şehir 3 · Portre 2" düğmeleri var (`aria-pressed`). Motif grupları Betul'un kendi sitesindeki gruplamadır. Pasaportta "Katalog" altına "Motif" satırı eklendi. İhtiyaç: 12 boş çerçevede aranan türü bulmak. Ölçüm (yayından sonra): süzgeç kullanımı ve pasaport açılışı.
  - **Pasaportta önceki/sonraki plaka:** Pencere kapanmadan plakalar arasında geçiliyor. Ok tuşları da çalışıyor. Süzgeç açıksa yalnızca görünen plakalar arasında dolaşıyor. Geçişler pencerenin içindeki canlı bölgeden duyuruluyor, çünkü pencere açıkken sayfanın geri kalanı etkisiz (modern-web-guidance, accessibility). Kapanınca odak o an gösterilen plakaya dönüyor.
  - **Hak kapısında yeni alanlar:** "Hak sahibi" ile "Model ve mülk izinleri" eklendi, ikisi de "Not supplied". Kapının açıklaması zaten izinlerden söz ediyordu ama alan yoktu.
  - **Hak itirazı yolu:** Başvuru oluşturucuda yeni tür: "Rights claim / Rettighetskrav". Pasaporttaki "Report a rights issue" düğmesi pencereyi kapatıp bu türü seçiyor, plakayı yazıyor ve imleci metin alanına koyuyor. Hiçbir şey gönderilmiyor.
  - **Kaydı e-postayla gönder:** Okuyucunun kendi e-posta uygulamasını açan bir `mailto:` bağlantısı. Alıcı adresi yok, sayfa hiçbir şey göndermiyor. Metinde "örnek kayıt, doğrulanmamış" ve "0 / 3 kapı" yazıyor.
  - **Lisans:** "Her lisansta hariç: yapay zekâ eğitimi, logo ve marka kullanımı, üst verinin silinmesi" satırı eklendi. Kaynak Betul'un lisans şartları sayfası.
  - **Taşınmayanlar:** yukarıdaki "Bilerek alınmayanlar" bölümüne bakın. SSS de taşınmadı: metin bütçesini aşardı ve cevapların çoğu sayfada araç olarak zaten var.
  - **Kontroller:** `design_check` 12/12 (EN 1 145, NO 1 062 kelime). axe 0 ihlal (açık/EN, koyu/NO, mobil/NO ve iki pencere görünümü). Konsol hatası 0. 320, 390 ve 1440 px'te taşma 0. Katı CSP altında sürüm paketi: hata 0, dış istek 0. Yeni etkileşim testi (`tur11.py`): süzgeç, önceki/sonraki, ok tuşları, Esc sonrası odak, hak itirazı ve e-posta bağlantısı EN ve NO'da geçti.

- **Tur 12 (29.09 akşam, Betul'un seçimi: beta-art.com'dan MASTER'a dört fikir).** Betul: "bu sayfaların ikisi bizim"; iki site arasında içerik taşımak serbest.
  - **Lisans kapsamı:** Her kademenin altında açılır bir "Scope" var: "Covers" ve "Excludes" satırları. Kaynak Betul'ün beta-art.com lisans şartları. Eski tek satırlık açıklamalar çıktı.
  - **Kullanım seçici:** "All / Personal use / Business use" düğmeleri (`aria-pressed`) uymayan kademeleri gizliyor.
  - **Lisans soruları:** Beş açılır soru var: düzenleme, yapay zekâ eğitimi, münhasırlık, müşteriye devir, cayma hakkı. "Her lisansta hariç" satırı yapay zekâ sorusunun cevabına taşındı; aynı bilgi iki kez yazılmıyor.
  - **Bağlantıyı kopyala:** Pasaportta düğme var. `#BA-003` gibi bir bağlantı sayfayı o plakanın pasaportuyla açıyor. Hiçbir servis kullanılmıyor.
  - **Metin bütçesi:** Yer açmak için dört cümle kısaldı (Archive çağrısı, BETA-ID ve Passport kanıt satırları). EN 1 250 / NO 1 177 kelime, bütçe sınırında.
  - **Kontroller:** `design_check` 12/12, axe 0 ihlal (beş görünüm), konsol hatası 0, taşma 0 (320/390/1440), katı CSP altında sürüm paketi temiz. `tur12.py`: seçici, kapsam, SSS, bağlantı kopyalama ve `#BA-007` doğrudan açılış EN ve NO'da geçti.

- **Tur 13 (04.10, Betul'un isteği: "buradan aktaracaklarını aktar", "web sayfasını GitHub'da güncelle", "iyileştir"):** Yüklenen dört dosya karşılaştırıldı.
  - `beta-art_FINAL_1.html` ve `BETA_ART_Master.zip` bu artifact'in 16. sürümüyle bayt bayt aynı; aktarılacak yeni bir şey yok.
  - `BETA_ART_MAIN_FINAL_2026-10-02.html` Betul'ün yeni yapısı, ama `dist/` üzerinde elle düzenlenmişti. Değişiklikler `src/build.py`, `src/app.js` ve `src/styles.css`'e taşındı, böylece build onları silmiyor. Bölüm kimlikleri `#explore`, `#record`, `#join` oldu; menü, hero altı bağlantılar, alt bilgi, pasaporttaki hak itirazı ve Business düğmesi yeni kimliklere gidiyor. Dil düğmesi "NB".
  - `BETA_ART_MAIN_V04_2026-10-01.html`'den hiçbir şey alınmadı (yukarıda "Bilerek alınmayanlar").
  - **Kurala uydurulanlar:** orta noktalı liste virgüle döndü; büyük harfli başlık cümle düzenine geçti; Explore'daki hero tekrarı yerine arşivin kendi cümlesi geldi ("Made by a human. Verified at the source."); Norveççe büyük başlıklarda "posten" yerine "registreringen" (FINAL'deki gibi; "post" posta da demek).
  - **İyileştirmeler:** FINAL'de "What are you here to do?" rotalarından Business düşmüştü; kuruluşların bir girişi olsun diye "02 Document a project" eklendi. Rotalar sayfa sırasını izliyor, ızgara 5 sütun (1100 px altında 2 sütun, sonuncu tam genişlik). Galeri döngüsü organizatör kaydına döndüğü için kontrol listesi ve Field Notes metni "açık çağrı"dan "başvuru"ya uyarlandı; Privat başvuru ipuçları yaratıcı pazaryerine göre yeniden yazıldı. Studio fatura kartlarındaki satırlar, Business fiyatını tekrarladığı için çıktı. `media/render.py` artık sabit bir Chromium yolu istemiyor (`BA_CHROMIUM` ya da `PLAYWRIGHT_BROWSERS_PATH` altındaki Chromium).
  - **Kullanılmayan CSS:** 167 sınıf seçicisinin hepsi kaynakta kullanılıyor, tek istisna `.rc` kuralıydı ve silindi. Lighthouse'un gösterdiği 11–14 KB ölü kod değil: hover, pencere, baskı ve medya sorgusu kuralları ilk yüklemede çalışmıyor.
  - **Kontroller:** `design_check` 12/12 (EN 1 244, NO 1 174 kelime), `media_check` 0 hata (tek uyarı göreli `og:image`). axe 0 ihlal (açık/EN, koyu/NO, mobil/NO, pasaport açık). Konsol hatası 0, sayfa içi kırık bağlantı 0, 390 px'te taşma 0. Pasaport kapanınca odak plakaya dönüyor; hak itirazı Join'deki başvuruya plakayı yazıyor.

## beta-art.com taraması (29.09.2026)

Yayındaki GoDaddy Airo sitesinde görülen sorunlar. Bunlar o sitede düzeltilir; BETA ART MASTER'a girmedi.

1. **Kamera ile tarih çelişiyor:** Sea of Fog "Ventura, CA · July 2019" ve "Sony A7R V" diyor. Bu kamera Ekim 2022'de duyuruldu. Aynı kayıtta "Capture date: Not provided" da yazıyor.
2. **Ana sayfa iddiaları kayıtlarla uyuşmuyor:** Ana sayfa RAW'ın arşivde olduğunu, C2PA'yı, numaralı sertifikayı, "2 şu an satışta" ve "1 doğrulanmış fotoğrafçı" bilgisini söylüyor. Plaka sayfası ise "RAW original: Not provided", "Copyright owner: Not provided", "Human Capture Seal: Not issued" diyor.
3. **Fiyatlar çelişiyor:** Ana sayfada Commercial ve Extended için "Price on request", plaka sayfasında kr 890 ve kr 2 900 yazıyor.
4. **İki farklı e-posta var:** `hello@beta-art.com` ve `hallo@beta-art.com`.
5. **Lisans şartlarında doldurulmamış alan var:** "Effective [DATE]".
6. **Görseller:** Fotoğraflar `/airo-assets/` altında. Bunların Betul'un kendi orijinalleri olduğu, site oluşturucunun yer tutucusu olmadığı doğrulanmalı. Aksi halde "Verified Human / nothing generated" iddiası yanlış olur.
7. **Sayfa düzeni:** Koleksiyon iki kez listeleniyor (12 + 12). "Twelve plates," başlığı virgülle yarım kalıyor. Çerez bandı iki kez görünüyor. İngilizce sayfada Norveççe bölümler var ("Bli fotograf", "Handlekurv").
8. **Hukuki ifade:** Lisans şartları ihlalde "en az üç katı" tazminat için åndsverkloven § 81'i gösteriyor. Bildiğim kadarıyla 2018 yasasının § 81'i kasıt ya da ağır ihmalde iki kat bedelden söz ediyor. Bir avukata kontrol ettirilmeli.
9. **Tarihli sergiler:** "Autumn 2026 · Oslo" sergisi için yer ya da tarih teyitli değilse "planlanıyor" diye yazılmalı.
10. **Alan adı:** beta-art.com ve www.beta-art.com GoDaddy sunucusunu gösteriyor (160.153.0.176). Site gerçek bir tarayıcıda HTTPS ile açılıyor.

## Rutin (11.10.2026'dan beri)

Betul: "bütün bu işlemi rutin olarak yap". Her gün 08:58'de (Oslo saati) bir tur çalışır. Betul dosya paylaştığında ya da bir şey istediğinde de aynı tur çalışır.

1. **Kaynak:** Yeni dosyalar ve artifact'te dışarıdan yapılmış değişiklikler incelenir. Kurala uyan aktarılır, uymayan "Bilerek alınmayanlar"a yazılır.
2. **Fikir ve doğrulama:** Dört açıdan öneri gelir (kurallar, erişilebilirlik, içerik, açık liste). Her öneriyi üç şüpheci çürütmeye çalışır. En fazla üç değişiklik seçilir. Betul'ün kararına bağlı hiçbir şey seçilmez.
3. **Uygula ve test:** Değişiklikler `src/` içinde tek tek yapılır, her birinden sonra `tools/check_all.sh` çalışır (build, `design_check`, `media_check`, axe, bağlantılar, 320/390 px taşma, katı CSP).
4. **İnceleme:** Fark üç açıdan gözden geçirilir, doğrulanan sorunlar düzeltilir.
5. **Yayın rutini (`web-yayin-rutini`):** `versions/beta-art-main-vNN.html` yazılır, eski sürümler silinmez. Commit "vNN: …" olur, GitHub'a gönderilir, taslak PR güncellenir, artifact yeniden yayınlanır. **Vercel adımı atlanır:** BETA ART için yayın dondurması sürüyor, Betul "yayınla" diyene kadar.

Workflow: `.claude/workflows/beta-art-tur.js`. Araçlar: `tools/check_all.sh`, `tools/browser_check.py`, `tools/new_version.py`. Numaralama v09'dan başladı, çünkü Betul'ün kendi dosyaları V04 ve V08'i kullanıyor.

## Sıradaki turlar

**29.09 akşamından itibaren iş beta-art.com'da (Airo) yapılır.** Airo'nun editöründe sohbet, doğrudan kod düzenleme, yedekler ve ayrı bir yayınlama adımı var ([GoDaddy yardım](https://www.godaddy.com/help/build-a-custom-app-or-site-with-godaddy-airo-ai-builder-42824)). Sıra:

**A. beta-art.com düzeltmeleri** (yukarıdaki taramadan):
1. Sea of Fog kaydı: kamera, objektif, ISO ve konum, RAW eldeyken doldurulur. O zamana kadar "Not supplied" yazar (kamera-tarih çelişkisi).
2. Ana sayfa sayaçları: "2 available now" ve "1 verified photographer" kaldırılır ya da plaka kayıtlarıyla aynı dili konuşan dürüst bir durumla değişir ("0 / 3 kapı").
3. Doğrulama bölümü: "RAW arşivde, C2PA gömülü, numaralı sertifika" şimdiki zamanla değil, bir plakanın geçmesi gereken adımlar olarak yazılır.
4. Koleksiyon bir kez listelenir, "Twelve plates," başlığı düzelir, çerez bandı bir kez görünür.
5. Commercial ve Extended fiyatı her sayfada aynı yazar (Betul'ün kararına kadar "Price on request").
6. Lisans şartlarında § 81 cümlesi çarpan olmadan yazılır (avukat kontrolüne kadar). "[DATE]" Betul'ün kararını bekler.
7. Sergiler: yer ve tarih teyitli değilse "Planned" diye yazılır.
8. İngilizce sayfadaki Norveççe bölümler için EN/NO düzeni tekleşir.

**B. BETA ART MASTER'dan taşınacaklar:** BETA-ID ile kayıt arama ("An ID finds a record. It does not prove it."), plakada üç kapılı doğrulama durumu (kaynak, kimlik, haklar, "0 / 3"), pasaportta önceki/sonraki geçiş, "Paid is not licensed" gösterimi. beta-art.com'da motif süzgeci ve hak itirazı sayfası zaten var.

**C. Betul'ün kararı:** beta-art.com dört ayağı da (Archive, Business, Privat, Gallery & Events) taşıyacak mı, yoksa arşiv ve lisans sitesi olarak mı kalacak?

Aşağıdaki eski liste BETA ART MASTER içindi; artık yalnızca kaynak işi.

1. **Privat erişim notu:** Sahip ya da koleksiyoncu, kimin neyi görebileceğini (kendisi, varisi, sigortacı, galeri) işaretler. Sayfa bir erişim ve saklama notu üretir. Hiçbir şey gönderilmez, kişi adı istenmez. Değerlendirme zincirinden geçirilecek. Metin bütçesine sığmalı: eklediği kadar yazı başka yerden çıkarılacak.
2. ~~**Kullanılmayan CSS'in temizlenmesi**~~ Tur 13'te yapıldı: tek ölü kural vardı.
3. İlk gerçek plaka orijinali geldiğinde: `make_derivatives.py` çalıştırılacak, `gatesMet()` plaka kaydından hesaplanacak, alt metinler EN ve NO olarak elle yazılacak. (Kanıt bekliyor.)
4. Betul'un aşağıdaki kararları geldikçe sayfaya işlenecek. (Karar bekliyor.)

## Skill'ler

**Bu turda bulunan ve kullanılanlar:** frontend-design, design-critique, anti-slop (VectorLab), canvas-design (paylaşım görseli), image-audit ve font-audit (web-vitals-auditor), skill-creator. Ayrıca bakıldı ama BETA ART'a uymadığı için kullanılmadı: theme-factory (Beta Art'ın kendi teması var), brand-guidelines (Anthropic markası) ve naviar-tasarim-sistemi (yalnızca NAVIAR; biçim örneği olarak okundu).

**Beta Art için yazılanlar** (`skills/`, paketler `dist-skills/*.skill`):

| Skill | Ne yapar | Script |
| --- | --- | --- |
| `beta-art-tasarim-sistemi` | Token, tipografi tabanı, ızgara, hareket, erişilebilirlik, 45 kelime kuralı, uydurma sınırları, bitirme sırası | `scripts/design_check.py` |
| `beta-art-medya` | Görselin sayfaya girmeden önce geçmesi gereken üç kontrol, orijinal/kopya ayrımı, AVIF/WebP/JPEG, GPS ve EXIF temizliği, EN/NO alt metin, video altyazısı, paylaşım görseli ve ikonlar, fontlar, dış araç izni | `scripts/media_check.py`, `scripts/make_derivatives.py` |

**Container sıfırlanırsa** `src/*` ile birlikte artifact'in ek dosyalarındaki `media/*` ve `skills/*` dosyaları da aynı yollara geri indirilir. Fontlar yeniden kurulur: `npm install @fontsource-variable/fraunces@5.3.0 @fontsource/inter-tight@5.3.0 @fontsource/ibm-plex-mono@5.3.0`. Ardından README'de sayılan altı woff2 dosyası ve üç OFL dosyası `media/fonts/` klasörüne kopyalanır. Font indirilemezse `python3 src/build.py --no-media` yine çalışır; yalnızca yayın paketi eksik kalır.

## Vercel hazırlık paketi (yayınlanmadı)

`dist/vercel/` klasörü `python3 src/build.py` ile yeniden üretilir. İçindekiler:

- `index.html`: Google Fonts yok. Fontlar `fonts/` klasöründen yükleniyor (woff2 ve OFL lisansları). Paylaşım görseli ve ikon etiketleri var.
- `vercel.json`: `git.deploymentEnabled: false` (git'e gönderim otomatik yayına dönüşmez). Güvenlik başlıkları: CSP (`default-src 'none'`, betik yalnızca SHA-256 özetiyle), nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options DENY, COOP, HSTS ve `X-Robots-Tag: noindex`.
- `robots.txt` (`Disallow: /`), `404.html` (EN ve NO), `og.png` 1200×630, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `checksums.json`.
- Yerel test bu başlıklarla yapıldı: CSP ihlali 0, konsol hatası 0, dış alan adına istek 0. Fontların hepsi kendi sunucumuzdan yüklendi.

**Betul "yayınla" dediğinde yapılacaklar** (öncesinde hiçbiri yapılmaz):

1. Hangi Vercel projesine gideceği seçilir.
2. `src/build.py` içindeki `SITE` sabitine alan adı yazılır. Bu adım canonical etiketini ve mutlak `og:image` adresini açar.
3. `noindex` kaldırılır. `robots.txt` → `Allow: /` olur. `X-Robots-Tag` başlığı çıkarılır.
4. Build yeniden alınır ve kontroller çalıştırılır. Ondan sonra yayın yapılır.

## Betul'un karar vermesi gerekenler

1. **Business faz 1:** Yeni sürümler "önce inşaat" diyor, 21.09 seçimin beş sektör içeriyordu. Sayfada inşaat faz 1, diğer beş sektör "kullanım alanı" olarak duruyor. Bu doğru mu?
2. **Personal lisans:** "kr 190'dan · veiledende" kalsın mı?
3. **Alan adı:** beta-art.com, beta-art.no ve betaart.no'dan hangisi kanonik olacak? Sayfada henüz canonical yok. 29.09 itibarıyla beta-art.com GoDaddy Airo sitesine bağlı. BETA ART MASTER oraya gidecekse Airo sitesinin yerini alır ya da ayrı bir alt alan adı gerekir.
4. **İletişim:** Her ayak için doğrulanmış iletişim kanalı hangisi?
5. **Yayın:** Hangi Vercel projesine gidecek? Yeni bir proje mi, beta-art-directory (boş) mı, yoksa başka bir proje mi?
6. **Dış medya araçları:** Beta Art orijinalleri Adobe, Canva, Figma veya görsel üreten bir servise yüklenebilir mi? Şimdilik hayır; `beta-art-medya` skill'i açık izin istiyor.
7. **Göz etiketleri:** Bu turda büyük harften cümle düzenine geçti (okunurluk için). Eski görünüm istenirse tek satırla geri alınır.
8. **Kayıt numarası:** BETA ART MASTER BA-001–BA-012 kullanıyor, beta-art.com 2026.0142–2026.0153. Hangisi kalıcı olacak?
9. **Commercial ve Extended fiyatı:** beta-art.com'un plaka sayfasında kr 890 ve kr 2 900 var. BETA ART MASTER'da "Quoted per use" duruyor. Sabit fiyat mı olacak?
10. **Fotoğrafçı programı:** beta-art.com'da "Bli fotograf" (kr 0 / 290 / 590 ay) var. Bu gerçek bir teklif mi? Gallery & Events'teki açık başvuruyla nasıl ilişkili?
11. **Hangi site kanonik?** beta-art.com (Airo) ile BETA ART MASTER aynı 12 plakayı farklı iddialarla gösteriyor. İkisinden biri kaynak olarak kalmalı.
12. **Privat'ın eski anlamı:** 02.10 yapısıyla Privat yaratıcı pazaryeri oldu. Özel koleksiyon ve opplag kayıtları (eski Privat: kontrollü erişim, geri alma, saklama süresi) ayrı bir yere mi gidecek, yoksa bırakıldı mı?
13. **Oslo salonu:** 21.09 kararındaki sezonluk salon (çağrı → jüri → doğrulama → katalog → salon) yeni Galeri yapısında yok. Bırakıldı mı, yoksa organizatör kaydının bir örneği mi olacak?

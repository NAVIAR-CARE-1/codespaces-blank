---
name: beta-art-medya
description: "Use this skill whenever any image, photograph, video, audio file, icon, share image or font goes into or out of BETA ART (Betul's photography, archive and art brand), or when a plate on BETA ART MASTER gets its real original. It covers the evidence gates before an image may be shown, public derivatives (AVIF/WebP/JPEG, sRGB, no GPS or camera data), EN/NO alt text, picture markup, video captions, the Registered Light share image and icons, self-hosted fonts, and which outside media tools may be used. It includes scripts for checking and for making derivatives. Only for BETA ART."
---

# BETA ART medya

Kapsam **yalnızca BETA ART**. Tasarım kuralları (token, tipografi, hareket) `beta-art-tasarim-sistemi`
skill'indedir. Bu skill bir dosyanın sayfaya **hangi koşulla ve hangi biçimde** gireceğini söyler.

Kural tek cümledir: **kanıt görselden önce gelir.** BETA ART "stok fotoğraf değil"
diyor. Kaynağı, kimliği ve hakkı belgelenmemiş bir görsel, ne kadar güzel olursa olsun, arşiv
plakası olarak gösterilmez.

## 1. Bir görsel ne zaman gösterilebilir

Plaka pasaportundaki üç kontrol karşılanmadan plaka çerçevesi boş kalır. Çerçevenin üstüne açıklama yazılmaz; katalog başlığı ("The frames are empty on purpose / Rammene er tomme med vilje") bunu bir kez söyler:

1. **Kaynak:** RAW ya da birinci kuşak dosya kasada ve SHA-256 sağlaması kayıtlı. Çekim
   verisi dosyadan okunur, elle yazılmaz.
2. **Kimlik:** Fotoğrafçı belli. Doğrulayan kişi, eseri yapan kişi olamaz.
3. **Haklar:** Yazılı lisans kapsamı var. Tanınabilir kişi ya da özel mülk için izin var.
   Yapay zekâ eğitimi çekincesi açıkça yazılı.

Bugün `app.js` içindeki `gatesMet()` sabit `0` döndürüyor, çünkü hiçbir plakanın kanıtı yok.
İlk gerçek kanıt geldiğinde bu fonksiyon plakanın kaydından hesaplanacak şekilde değiştirilir.
Görsel çerçeveye ancak üç kontrol birden karşılanınca girer. Durum çipi de aynı kayıttan gelir.
Sayfa hiçbir zaman tahminle "Verified" yazmaz.

**Yapay zekâ ile üretilmiş, stok ya da başka bir siteden alınmış görsel** arşiv plakası,
galeri eseri ya da müşteri işi olarak kullanılmaz. Lovable'daki eski plaka ve galeri
görselleri bu yüzden alınmadı: kaynakları ve hakları belgelenmiş değil.

## 2. Orijinal ile kamuya açık kopya

Orijinal kasada kalır, dokunulmaz. Sayfaya yalnızca kopyası girer:

```
python3 skills/beta-art-medya/scripts/make_derivatives.py ORIJINAL --id BA-003 --out media/public
```

- Genişlikler 480 / 960 / 1600 / 2400 px'tir. **Asla büyütülmez.** Orijinalden büyük genişlik atlanır.
- Biçimler AVIF (q55), WebP (q78) ve JPEG (q82, progressive) olur. Renk sRGB'dir.
- Kopyada **EXIF, GPS ve kamera verisi yoktur.** Kamera, tarih ve konum pasaportta durur
  ve kasadaki orijinalden okunur.
- `BA-003-media.json` her kopyayı orijinalin SHA-256'sına bağlar. Kanıt zinciri buradan
  sürer.
- Script'in yazdığı `<picture>` bloğunda alt metinleri **bilerek boştur**.

## 3. İşaretleme

```html
<picture>
  <source type="image/avif" srcset="BA-003-480.avif 480w, … 2400w" sizes="(max-width: 860px) 100vw, 50vw">
  <source type="image/webp" srcset="…" sizes="…">
  <img src="BA-003-960.jpg" srcset="…" sizes="…" width="2400" height="1600"
       loading="lazy" decoding="async" alt="…">
</picture>
```

- `width` ve `height` her zaman yazılır, yoksa sayfa kayar.
- İlk ekrandaki tek büyük görsel `loading="eager" fetchpriority="high"` alır. Diğer bütün görseller `lazy` olur.
- Dosyalar sitenin kendisinden gelir. CSP `img-src 'self' data:`'dır, dış alan adından görsel yüklenmez.

## 4. Alt metin (EN ve NO)

- Görseli **gören bir insan** yazar. İki dil aynı anda girer (`T(en, no)` ya da
  `data-alt-en` / `data-alt-no`).
- Yalnızca görüneni anlatır. Görünmeyen yer, tarih, kişi adı ya da ruh hâli eklenmez. Kişi
  tanınabiliyorsa ve izin yoksa ad yazılmaz.
- Yaklaşık 125 karakter olur. "Fotoğrafı" ya da "görseli" diye başlamaz.
- Boş çerçeve bir görsel değildir. Durumu metinle söyler, `alt` gerekmez.

## 5. Video ve ses

- Otomatik oynatma sesle yapılmaz. Sessiz döngü yalnızca `muted playsinline` ile olur ve hareket
  azaltma tercihinde durur.
- Her videoda EN ve NO altyazı (`<track kind="captions">`) ve bir `poster` karesi bulunur.
- YouTube, Vimeo ve Instagram gömmeleri yoktur. CSP `frame-src` izni vermez. Gömmek, çerez
  ve gizlilik metni kararı ister. Bu Betul'ün kararıdır.
- Aynı kanıt kuralları video ve ses için de geçerlidir: kaynak, kimlik ve haklar belgelenmeden yayınlanmaz.

## 6. Paylaşım görseli, ikonlar, fontlar

**"Registered Light"** felsefesine göre yapılır (`media/philosophy.md`, canvas-design
skill'i ile yazıldı). Kâğıt zemin kullanılır, tek renk olayı mührün kırmızı noktasıdır. Tescil haçı,
alt kenarda film kenarı gibi bir cetvel ve çok az yazı vardır.

- Kaynaklar `media/og.html`, `media/icon.html` ve `media/favicon.svg`'dir. `python3 media/render.py dist/vercel`
  komutu şu dosyaları üretir: `og.png` 1200×630, `apple-touch-icon.png` 180×180, `favicon-32.png`, `favicon.svg`
  (koyu temada renk değiştirir). `src/build.py` bunu kendisi çağırır.
- `og:image` alan adı belli olana kadar göreli kalır. Betul alan adını seçince
  build.py'deki `SITE` sabiti tek satırda değişir.
- **Fontlar** yayın paketinde kendi sunucumuzdadır. Kaynak Fontsource 5.3.0 ve woff2'dir.
  Fraunces opsz (normal ve italik), Inter Tight 400/500 ve IBM Plex Mono 400/500 kullanılır.
  OFL lisansları `fonts/` içinde durur. Google Fonts yalnızca artifact önizlemesinde kullanılır.
  Yayın paketinde Google'a istek gitmez.

## 7. Dış medya araçları

Adobe, Canva, Figma, görsel ve video üreten modeller ile sosyal medya yeniden boyutlandırıcılar
kullanılabilir, ancak iki koşulla:

1. **BETA ART orijinali üçüncü bir servise yüklenmeden önce Betul'ün açık izni alınır.** Haklar ve
   yapay zekâ eğitimi çekincesi buna bağlıdır.
2. Üretilen ya da düzenlenen dosya, arşiv kaydının yerine geçmez. Retuş varsa pasaportta
   "işlenmiş kopya" olarak yazılır. Orijinalin sağlaması değişmez.

Yerel araçlar serbesttir, çünkü dosya bu ortamdan çıkmaz. Bunlar Pillow, Playwright ile HTML'den PNG üretme,
`make_derivatives.py`, image-audit ve font-audit skill'leridir.

## Bitirme sırası

```
python3 src/build.py
python3 skills/beta-art-medya/scripts/media_check.py            # sayfalar + dist/vercel
python3 skills/beta-art-medya/scripts/media_check.py --html --assets media/public
```

`FAIL` varsa iş bitmemiştir: GPS içeren dosya, `width`/`height`'ı eksik görsel, sesle
otomatik oynayan video, altyazısız video, dış alan adından medya ya da gömme. `WARN` satırları
README'deki tur günlüğüne yazılır. Göreli `og:image` şimdilik beklenen tek uyarıdır.

# BETA ART MAIN

Betul'ün fotoğraf, arşiv ve sanat markası BETA ART'ın geliştirme sayfası. **Yayında değil** (`noindex`).

- **Sayfa:** `dist/index.html`. Çift tıklayınca tarayıcıda açılır.
- **Kaynak:** `src/build.py`, `src/app.js`, `src/styles.css`. `dist/` elle düzenlenmez, build yeniden yazar.
- **Kararlar, kaynaklar ve tur günlüğü:** `src/README.md`.
- **Kurallar:** `skills/beta-art-tasarim-sistemi/` (tasarım) ve `skills/beta-art-medya/` (görsel ve medya).

## Build ve kontroller

```
python3 src/build.py
python3 skills/beta-art-tasarim-sistemi/scripts/design_check.py
python3 skills/beta-art-medya/scripts/media_check.py
```

`dist/vercel/` yalnızca yayın hazırlığıdır. Betul "yayınla" demeden hiçbir yere deploy edilmez; kök dizindeki `vercel.json` git push'larının otomatik yayına dönüşmesini engeller.

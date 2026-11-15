# Alapkészlet (kettő stúdió)

A legjobb oldalaink bevált, stílustól független részei egy helyen, plusz egy automatikus minőségkapu.
Új oldal = ebből a repóból indulsz, a kinézetet (betűk, színek, hero, szakaszok) mindig az adott helyhez írod újra.

## Új oldal indítása (5 perc)

1. GitHubon: **Use this template → Create a new repository** (a repó beállításaiban egyszer be kell pipálni: *Template repository*).
2. `oldal.json` kitöltése: név, cím, telefon, nyelvek, nyitvatartás, intro szövege, üzemeltető adatai, funkciók.
3. `python3 eszkozok/beallit.py` → megírja a `site/js/oldal.js`, `site/js/kit.js` és `site/jogi.html` fájlt.
4. `npm install` → `npm test` (Playwright + Lighthouse). Zöld = mehet.
5. Netlify: új projekt a repóból, publish könyvtár `site` (a `netlify.toml` ezt már tudja). Köztes commitokba `[skip netlify]`.

## Mi van benne

| Modul (`site/js/kit/`) | Honnan | Mit csinál |
|---|---|---|
| `00-alap.js` | mind | segédek, egér/érintő, csökkentett mozgás, valódi GPU-teszt, budapesti idő Intl nélkül |
| `10-nyelv.js` | Darling, Cafe Flow | HU a HTML-ben, DE/EN a `szovegek.js`-ben; elmentett vagy böngészőnyelv, különben angol; magyar nbsp |
| `20-gorgetes.js` | Cafe Flow v2 | Lenis (lerp 0.085, kerék 0.9) csak egérrel; horgonylinkek a fejléc alá |
| `30-kurzor.js` | Cafe Flow | pont, linken gyűrű, fotón pötty, lomha fény mögötte; érintőn nincs |
| `40-cimek.js` | Darling | címek soronként maszkból, `overflow: clip` + clip-margin (nincs levágott ékezet) |
| `50-lampak.js` | Darling v2 | függőlámpa a `.lampas` címek fölött, vibrálva felkapcsol, fénykúppal |
| `60-nyitva.js` | Darling | nyitvatartás-táblázat + „most nyitva / holnap 12:00-kor nyitunk” |
| `70-apro.js` | mind | mobil menü (Esc, aria), térkép csak kattintásra, fülcím elnavigáláskor |
| `80-intro.js` | Darling v2 | film-intro: gépelt cím, mostani idő, filmfelirat, fény felkapcsol; munkamenetenként egyszer, kihagyható |
| `90-etlap.js` | új | étlap `data/menu.json`-ból vagy Google-táblázatból |

**Alapból csak a stílustól független részek futnak** (nyelv, nyitvatartás, étlap, mobil menü, térkép, jogi oldal).
A hangulati elemek (görgetés, kurzor, címek beúszása, lámpák, intro) mind ki vannak kapcsolva: minden oldal egyedi, ezeket csak akkor kapcsold be
(`site/js/main.js`, egy-egy sor), ha az adott hely történetéhez illenek, és a stílusválasztóban is ezt választottuk. A lámpa a Darlingé, máshova nem visszük át változatlanul.
Régi oldalba is átvihető: a modul fájlja + a hozzá tartozó rész a `css/kit.css`-ből.

## Amit a beallit.py magától megcsinál (minden oldalon, stílustól függetlenül)

- **Google-nek szóló cégadatok (JSON-LD):** típus, cím, telefon, koordináta, nyitvatartás, ünnepnapok, profilok, ár-kategória.
  Ettől jelenhet meg a Google-ben a nyitvatartás és a térképes adat.
- **Megosztási kép és ikonok:** og/twitter adatok (Messengeren, Facebookon szép előnézet), apple-touch-icon, webmanifest, téma szín.
  Ha hiányzik a kép, helykitöltőt készít, és figyelmeztet, hogy cseréld valódira.
- **Útvonaltervezés link:** `<a href="#" data-utvonal>` → Google Térkép útvonal a hely nevére és címére.
- **Ünnepnapi nyitvatartás:** `oldal.json` → `kivetelek`. A „most nyitva” sor és a Google is ezt használja, a táblázat alatt 3 héttel előre kiírja.

- **Stúdió-hivatkozás a láblécben:** `oldal.json` → `keszito.url` (üresen nem jelenik meg).

## Kész részletek és eszközök

- `docs/minta-reszletek.html`: kapcsolati űrlap (Netlify Forms, spam-csapda, hozzájárulás, köszönő üzenet oldalváltás nélkül;
  ingyen 100 beküldés/hó), YouTube/Instagram csak kattintásra (`data-beagyazas`, youtube-nocookie). A funkciót az `oldal.json`-ban is kapcsold be,
  a jogi oldal magától kiegészül.
- **Betű saját tárhelyre:** `npm run betu -- "Fraunces" 300,400 --dolt` → woff2 a `site/fonts/`-ba (latin + latin-ext, benne ő/ű), `site/css/betuk.css`,
  licenc, és kiírja a preload sort. Google Fonts linket soha ne tegyél az oldalba (GDPR, a kapu megbuktatja).

## Képek

`python3 eszkozok/kepek.py`: a `forras/kepek/` fotóiból 640/1280/1920 px AVIF + WebP + JPEG, és kész `<picture>` kód
(`site/img/kepek.html`) width/height-tal, srcset-tel, lazy betöltéssel. A nyitóképnél a lazy helyett `fetchpriority="high"`.

## Szabályok és források

- `docs/minosegi-szabalyok.md`: az 5 pontos terv az első szakasz előtt, a sablonos oldal jelei, szöveg-, mozgás- és teljesítményszabályok
  (a darkroom.engineering nyilvános csapatszabályaiból, MIT).
- `docs/forrasok.md`: a díjnyertes stúdiók nyílt kódja, licenccel: mit szabad átvenni, miből csak tanulunk.
- `THIRD-PARTY-NOTICES.md`: licencek.

## Jogi oldal és élesítés

- `eszkozok/jogi.py`: impresszum + adatkezelési tájékoztató + sütik, HU/DE/EN, az `oldal.json` funkciói szerint
  (telefonos foglalás, e-mail, űrlap, térkép kattintásra, Google-táblázat, analitika). Hiányzó adat = narancs **[kitöltendő]**.
  Minta szöveg, nem jogi tanácsadás: űrlapnál, webshopnál, analitikánál nagyobb ügyfélnél nézesse át jogász.
- `python3 eszkozok/elesites.py pelda.hu`: canonical, og:url, noindex le, robots.txt, sitemap.xml. Megáll, ha hiányzik üzemeltetői adat
  (`--jogi-kesobb`: élesít, de a jogi oldal noindex marad).

## Minőségkapu (GitHub Action: `minosegkapu`)

Minden pushnál lefut, és pirosra vált, ha:
- konzolhiba, JS-hiba, 404-es fájl van;
- bármelyik oldal bármelyik nyelven 320, 375, 414, 768, 1024, 1280, 1440 vagy 1920 px-en vízszintesen görget;
- egy cím nem fér ki, hiányzik egy fordítás, egy képnek nincs alt-ja vagy nem töltődik be, egy menülink célja nincs meg;
- akadálymentességi hiba (axe-core, WCAG 2.1 AA: kontraszt, címkék, gombnevek; minden nyelven, mobilon és gépen);
- láthatatlan réteg takar el egy linket (a régi `hidden` + `display:flex` hiba);
- az oldal hozzájárulás nélkül külső szerverhez kapcsolódik (pl. Google Fonts, YouTube, térkép kattintás előtt: GDPR-hiba);
- hiányzik vagy rossz hosszú a lap címe / leírása, nincs megosztási kép, hibásak a cégadatok, nem pontosan 1 db h1 van;
- egy képnek nincs width/height-ja (ugrál betöltéskor), egy betűnek nincs font-display-e;
- az első képernyőn lusta (`loading=lazy`) kép van; JS 300 KB vagy CSS 100 KB fölött; egy kép 1 MB, videó 8 MB, ikon 40 KB fölött;
- az élő nyelvváltás más szöveget ad, mint a friss betöltés;
- az intro nem tűnik el 15 mp alatt, vagy újratöltéskor megint lejátszódik;
- csökkentett mozgásnál fut az intro vagy elbújik egy cím; érintőn van egyedi kurzor vagy Lenis;
- Lighthouse mobilon (3 futás középértéke) teljesítmény, akadálymentesség, bevált gyakorlatok vagy SEO 90 alatt
  (noindexes demón a SEO csak figyelmeztet).

Helyben: `npm run kapu`, `npm run lighthouse`, mind: `npm test`. Gyorsabban: `KAPU_SZELESSEG=375,1280 npm run kapu`.
Eredmény: `teszt/eredmeny/` (a GitHubon letölthető artifact).

Tipp: GitHub → Settings → Branches → a `main` védelme, *Require status checks: minosegkapu*. Így a main (és vele a Netlify) csak zöld kódot kap.

## Tartalomkezelés: két lehetőség

**A) Google-táblázat (alap, ingyenes, nincs deploy):** az ügyfél egy táblázatban írja az étlapot, az oldal betöltéskor onnan olvassa.
1. Táblázat ezekkel az oszlopokkal: `kategoria_hu, kategoria_de, kategoria_en, nev_hu, nev_de, nev_en, leiras_hu, leiras_de, leiras_en, ar`
2. Fájl → Megosztás → Közzététel az interneten → a lap, formátum: CSV → a linket az `oldal.json` `tablazat_csv` mezőjébe.
3. `funkciok.google_tablazat_menu: true`, aztán `beallit.py` (a jogi oldal is kiegészül a Google-lal).
4. Időnként `npm run menu-tablazatbol`: a beégetett `menu.json` is friss lesz (ha a Google nem elérhető, ez látszik).

**B) Decap CMS (nagyobb ügyfélnek, szöveg + képek is):** az ügyfél a `/admin` oldalon szerkeszt, minden mentés egy commit és egy Netlify deploy (~15 kredit).
1. `site/admin/config.yml`: a `repo` sorba az oldal repója.
2. GitHubon OAuth App (Settings → Developer settings), callback: `https://api.netlify.com/auth/done`.
3. Netlify → a projekt → Access & security → OAuth → GitHub provider: a Client ID és Secret.
4. Az ügyfélnek GitHub-fiók kell, és írási jog a repóhoz. `funkciok.decap_cms: true`.

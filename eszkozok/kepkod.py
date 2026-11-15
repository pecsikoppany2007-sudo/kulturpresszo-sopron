# <!--pic:név|altKulcs|sizes--> jelölőből kész <picture> kód (AVIF + WebP + JPEG, srcset a meglévő szélességekből).
# Az alt magyar szövege a forras/altok.json-ból jön (kulcs: [hu, de, en]); a német és angol a szovegek.js-be kerül kézzel.
# python3 eszkozok/kepkod.py   (újrafuttatható: a <!--/pic--> jelölőig cserél)
import json, pathlib, re
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parent.parent; SITE = ROOT / 'site'; IMG = SITE / 'img'
ALT = json.loads((ROOT / 'forras' / 'altok.json').read_text())
def pic(m):
    name, key, rest = m.group(1), m.group(2), m.group(3)
    sizes, _, flag = rest.partition('|')
    ws = sorted({int(p.stem.rsplit('-', 1)[1]) for p in IMG.glob(name + '-*.jpg') if p.stem.rsplit('-', 1)[1].isdigit() and p.stem.rsplit('-', 1)[0] == name})
    big = ws[-1]; w, h = Image.open(IMG / f'{name}-{big}.jpg').size
    ss = lambda ext: ', '.join(f'img/{name}-{x}.{ext} {x}w' for x in ws)
    alt = '' if key == '-' else ALT[key][0].replace('"', '&quot;')
    ai = '' if key == '-' else f' data-i18n-attr="alt:{key}"'
    lz = 'fetchpriority="high"' if flag == 'elso' else 'loading="lazy"'
    mid = next((x for x in ws if x >= 1280), big)
    return (f'<!--pic:{name}|{key}|{rest}--><picture>'
            f'<source type="image/avif" srcset="{ss("avif")}" sizes="{sizes}">'
            f'<source type="image/webp" srcset="{ss("webp")}" sizes="{sizes}">'
            f'<img src="img/{name}-{mid}.jpg" width="{w}" height="{h}" alt="{alt}"{ai} {lz} decoding="async">'
            f'</picture><!--/pic-->')
for page in SITE.glob('*.html'):
    s = page.read_text()
    s2 = re.sub(r'<!--pic:([^|]+)\|([^|]+)\|([^>]*?)-->(?:.*?<!--/pic-->)?', pic, s, flags=re.S)
    if s2 != s: page.write_text(s2); print('kész:', page.name)

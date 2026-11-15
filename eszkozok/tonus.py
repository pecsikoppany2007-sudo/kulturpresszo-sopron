# H8 "esti meleg" tónus beégetve: enyhe szépia, telítettség, kontraszt, kicsit sötétebb, sötét szélek.
# python3 eszkozok/tonus.py <forrásmappa> [név ...]  ->  forras/kepek/<név>.jpg (max 2600 px)
import sys, pathlib, numpy as np
from PIL import Image, ImageOps
SRC = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(__file__).resolve().parent.parent / 'forras' / 'kepek'
OUT.mkdir(parents=True, exist_ok=True)
# név: (forrásfájl eleje, szépia, vignetta, kivágás arány vagy None)
KEPEK = {
 'terasz-este': ('kp-g-000', .25, .30), 'terasz-fa': ('kp-ig-000', .25, .30),
 'homlokzat': ('kp-g-030', .22, .25), 'homlokzat-ejjel': ('kp-g-138', .25, .30), 'homlokzat-feny': ('kp-ig-112', .22, .25),
 'capa': ('kp-g-274', .2, .25), 'pult': ('kp-g-188', .22, .25), 'polcok': ('kp-g-039', .22, .25), 'letra': ('kp-g-090', .2, .22),
 'belso': ('kp-g-064', .22, .25), 'c-betu': ('kp-g-013', .22, .25), 'espresso': ('kp-ig-086', .2, .28), 'marzocco': ('kp-g-157', .22, .25),
 'latte': ('kp-ig-065', .2, .28), 'reggeli': ('kp-ig-093', .2, .25), 'sutik': ('kp-ig-091', .2, .25), 'szonyeg': ('kp-ig-180', .2, .25),
 'irogep': ('kp-ig-161', .2, .25), 'konyv': ('kp-ig-116', .2, .25), 'terasz-kereso': ('kp-ig-166', .25, .3),
 'botanik': ('kp-ig-047', .06, .18, (0, 0, .71, 1)), 'botanik-belso': ('kp-ig-029', .06, .18), 'botanik-kert': ('kp-ig-021', .06, .18),
}
SEP = np.array([[.393, .769, .189], [.349, .686, .168], [.272, .534, .131]], np.float32)
ONLY = sys.argv[2:]
for name, (pre, sep, vig, *cr) in KEPEK.items():
    if ONLY and name not in ONLY: continue
    f = next(SRC.glob(pre + '*'))
    im = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
    if cr: c = cr[0]; im = im.crop((int(c[0] * im.width), int(c[1] * im.height), int(c[2] * im.width), int(c[3] * im.height)))
    im.thumbnail((2600, 2600), Image.LANCZOS)
    a = np.asarray(im, np.float32) / 255
    a = a * (1 - sep) + (a @ SEP.T) * sep                      # szépia
    l = (a @ np.array([.2126, .7152, .0722], np.float32))[..., None]
    a = l + (a - l) * 1.2                                      # telítettség
    a = (a - .5) * 1.15 + .5                                   # kontraszt
    a = a * .9                                                 # esti, kicsit sötétebb
    h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w]
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    a = a * (1 - vig * np.clip((r - .35) / .65, 0, 1) ** 1.6)[..., None]   # sötét szélek
    Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)).save(OUT / (name + '.jpg'), quality=92, subsampling=0)
    print(name, im.size)

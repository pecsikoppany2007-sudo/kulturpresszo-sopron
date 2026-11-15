# Egy CSS-fájl a gyorsabb első megjelenésért: betuk.css + kit.css + style.css -> css/oldal.min.css (kommentek és felesleges szóközök nélkül).
# A forrásfájlokat szerkeszd, utána: python3 eszkozok/css.py
import pathlib, re
C = pathlib.Path(__file__).resolve().parent.parent / 'site' / 'css'
s = '\n'.join((C / f).read_text() for f in ('betuk.css', 'kit.css', 'style.css'))
s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
s = re.sub(r'\s+', ' ', s)
s = re.sub(r'\s*([{};,>])\s*', r'\1', s).replace(';}', '}')
(C / 'oldal.min.css').write_text(s.strip() + '\n')
print('oldal.min.css', len(s) // 1024, 'KB')

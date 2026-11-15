# A német és angol szövegek forrása: forras/szovegek.json + forras/altok.json -> site/js/szovegek.js
import json, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
T = json.loads((R / 'forras' / 'szovegek.json').read_text())
A = json.loads((R / 'forras' / 'altok.json').read_text())
out = {'hu': T.get('hu', {}), 'de': dict(T['de']), 'en': dict(T['en'])}
for k, v in A.items(): out['de'][k] = v[1]; out['en'][k] = v[2]
(R / 'site' / 'js' / 'szovegek.js').write_text('/* Generált fájl: eszkozok/szovegek.py (forras/szovegek.json + altok.json). A magyar a HTML-ben van. */\nwindow.SZOVEG = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
print('szovegek.js kész', len(out['de']), 'kulcs')

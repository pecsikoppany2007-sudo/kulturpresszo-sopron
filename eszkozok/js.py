# Egy tömörített JS a gyorsabb indulásért: kit.js + main.js -> js/oldal.min.js (terser). Futtasd a beallit.py után.
import pathlib, subprocess
J = pathlib.Path(__file__).resolve().parent.parent / 'site' / 'js'
src = (J / 'kit.js').read_text() + '\n;\n' + (J / 'main.js').read_text()
(J / '_osszes.js').write_text(src)
subprocess.run(['npx', '--yes', 'terser@5.31.6', str(J / '_osszes.js'), '-c', '-m', '-o', str(J / 'oldal.min.js')], check=True)
(J / '_osszes.js').unlink()
print('oldal.min.js', (J / 'oldal.min.js').stat().st_size // 1024, 'KB')

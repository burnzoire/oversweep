import re, base64, subprocess
from PIL import Image, ImageDraw
from pathlib import Path
from playwright.sync_api import sync_playwright
p=Path('src/components/aircraft-procedures/StartupPanels.astro').read_text()
q=Path('src/pages/manual/aircraft-procedures/[airframe]/[procedure].astro').read_text()
def script(source, name):
    js=re.search(r'<script>(.*?)</script>',source,re.S)[1]
    if name=='page':
        js=js.replace('  // Turn off',"""  Object.assign(window, { readyForProof() { main = 'batt'; updatePanels(); } });
  // Turn off""")
    return subprocess.check_output(['node','-e','process.stdout.write(require("node:module").stripTypeScriptTypes(require("fs").readFileSync(0,"utf8")))'],input=js,text=True)
def img(m):
    name=m[1]
    if name=='test': name='test'
    return 'src="data:image/webp;base64,'+base64.b64encode(Path('src/assets/aircraft-procedures/f16-'+name+'.webp').read_bytes()).decode()+'"'
markup=p.split('---',2)[2].split('<script>')[0]
markup=re.sub(r'src=\{(\w+)Art.src\} width=\{\w+Art.width\} height=\{\w+Art.height\}',img,markup)
for n in ['elec','test','jfs','caution','eyebrow']:
    w,h=Image.open('src/assets/aircraft-procedures/f16-'+n+'.webp').size
    markup=markup.replace('style={`--art-ratio:${'+n+'Art.width / '+n+'Art.height}`}',f'style="--art-ratio:{w/h}"')
css=lambda s: re.search(r'<style>(.*?)</style>',s,re.S)[1].replace(':global(',':is(')
html=f'''<!doctype html><meta charset="utf-8"><style>{css(p)}{css(q)}
body{{font:17px system-ui;margin:0;background:white;--color-ink:#202020;--color-surface:#eee}}
aside{{position:relative;width:440px;margin:auto}}
[data-panel]{{margin:auto}}
</style><div data-procedure><div data-step data-step-id="ground-ready"></div><p data-progress></p><div data-complete></div>
<div data-controls><button data-prev></button><button data-confirm></button></div>
<aside class="procedure-visual"><div class="retry-mark" data-retry-mark hidden>×</div><p class="retry-hint" data-retry-hint hidden></p>
{markup}<div data-engine-reference><i data-needle="rpm"></i><i data-needle="ftit"></i><i data-value="rpm"></i><i data-value="ftit"></i><i data-signal></i></div><p data-indication></p></aside></div>
<script>{script(p,'panel')}{script(q,'page')}</script>'''
Path('/tmp/os-proof.html').write_text(html)
out=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':960,'height':1050})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('file:///tmp/os-proof.html')
    page.evaluate('readyForProof()')
    for panel in ['elec','test','jfs','eyebrow']:
        loc=page.locator(f'[data-panel="{panel}"]')
        page.evaluate('(panel) => document.querySelectorAll("[data-panel]").forEach(el=>el.hidden=el.dataset.panel!==panel)',panel)
        for button in loc.locator('button').all():
            label=button.get_attribute('aria-label') or button.inner_text()
            group=button.locator('..')
            toggle=button.locator('.toggle-cue').count()>0
            button.hover()
            if toggle:
                assert button.locator('.toggle-cue').is_visible(), label
                assert sum(c.is_visible() for c in group.locator('.toggle-cue').all())==1,label
            page.evaluate("document.querySelector('[data-retry-mark]').hidden = document.querySelector('[data-retry-hint]').hidden = true")
            button.click()
            assert page.locator('[data-retry-mark]').is_visible(),label
            assert 'Try again' in page.locator('[data-retry-hint]').inner_text(),label
            bounds=button.bounding_box()
            area=page.locator('aside').bounding_box()
            # Keep labels, controls and error marker together in each crop.
            top=max(0,min(bounds['y']-72,area['y']+area['height']-148))
            file=f'/tmp/os-control-{len(out)}.png'
            page.screenshot(path=file,clip={'x':area['x'],'y':top,'width':440,'height':148})
            out.append((label,file))
    assert not errors, errors
    browser.close()
dest=Path('F16-switch-hitzone-evidence.png')
sheet=Image.new('RGB',(3*460,((len(out)+2)//3)*188+52),'#e4e7eb')
draw=ImageDraw.Draw(sheet)
from PIL import ImageFont
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
draw.text((10,12),'F-16C trainer · Chromium capture of every control hit zone · out-of-sequence clicks',font=font,fill='#111')
for i,(label,file) in enumerate(out):
    x=(i%3)*460+10
    y=(i//3)*188+48
    draw.text((x,y),label,font=font,fill='#111')
    sheet.paste(Image.open(file),(x,y+26))
sheet.save(dest)
print(len(out),dest)

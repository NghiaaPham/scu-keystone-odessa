#!/usr/bin/env python3
"""Static build for the SCU click-through demo.

Pages live in _src/pages/*.html (main content only). Each starts with a meta comment:
  <!--meta {"title": "...", "desc": "...", "nav": "issues", "css": ["issues"], "js": []} -->
This script wraps them with the shared <head>, header (foundation navigation), icon sprite
and footer (foundation footer), and writes plain HTML to the site root. No build step is
needed to *serve* the site; run `python3 _src/build.py` only after editing _src/.

Content data (evidence library, sample stories) lives in _src/data/*.json and is rendered
into static HTML here, so a later phase can feed the same records from an API.
"""
import json, os, re, html, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '_src')

NAV = [  # exact public-facing menu labels (blueprint Part I §3)
    ('home', 'Our Community', 'index.html'),
    ('issues', 'Issues', 'issues.html'),
    ('facts', 'The Facts', 'evidence.html'),
    ('proposal', 'The Proposal', 'proposal.html'),
    ('action', 'Take Action', 'action.html'),
    ('about', 'About', 'about.html'),
]

ICONS = {
 'car': '<path d="M3 13l2-6h14l2 6v4H3z"/><path d="M6 17v2M18 17v2"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>',
 'drop': '<path d="M12 2.7s-6 6.6-6 11a6 6 0 0 0 12 0c0-4.4-6-11-6-11z"/>',
 'house': '<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/>',
 'doc': '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h8M9 9h3"/>',
 'bulb': '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z"/>',
 'streetlight': '<path d="M6 22V6a3 3 0 0 1 3-3h7"/><path d="M13 3h6l-1 3h-4z"/><path d="M3 22h6"/>',
 'road': '<path d="M5 21 9 3M19 21 15 3M12 5v2M12 11v2M12 17v2"/>',
 'walk': '<circle cx="13" cy="4" r="2"/><path d="M9 21l2-6 3 3v3M7 12l3-4 4 1 2 4 3 1M11 15l-1-4"/>',
 'bike': '<circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-7h5l3 7M10 10 8 6H6M15 10l-2-4h2"/>',
 'siren': '<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 21h14v-3H5zM12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4"/>',
 'map': '<path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2z"/><path d="M9 3v16M15 5v16"/>',
 'scale': '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
 'gear': '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
 'wrench': '<path d="M14.5 6.5a4 4 0 0 0 5 5l1.5-1.5a6 6 0 0 1-7.5 6L7 22.5 1.5 17 8 10.5a6 6 0 0 1 6-7.5z"/>',
 'waves': '<path d="M2 7c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M2 12c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M2 17c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/>',
 'leaf': '<path d="M11 20A7 7 0 0 1 4 13c0-6 6-9 16-10-1 10-4 16-9 17z"/><path d="M4 21c4-6 8-9 12-11"/>',
 'shield': '<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/>',
 'heart': '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>',
 'chart': '<path d="M3 3v18h18M7 15v3M11 11v7M15 7v11M19 12v6"/>',
 'store': '<path d="M3 9l2-5h14l2 5M3 9v12h18V9M3 9h18M9 21v-6h6v6"/>',
 'cart': '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l3 12h11l2-8H6.5"/>',
 'cross': '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
 'people': '<circle cx="9" cy="7" r="3"/><path d="M3 21v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2"/><circle cx="17" cy="8" r="2.5"/><path d="M17 13a4 4 0 0 1 4 4v2"/>',
 'fork': '<path d="M7 2v8a2 2 0 0 0 2 2v10M5 2v6M9 2v6M17 22V2c-2 1-3 4-3 8h3"/>',
 'briefcase': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M3 13h18"/>',
 'chat': '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/>',
 'megaphone': '<path d="M3 10v4h3l9 5V5L6 10zM18 9a4 4 0 0 1 0 6M6 14l1 6h3l-1-5"/>',
 'share': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
 'layers': '<path d="M12 2 2 7l10 5 10-5zM2 12l10 5 10-5M2 17l10 5 10-5"/>',
 'calendar': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 'building': '<rect x="4" y="2" width="16" height="20"/><path d="M9 22v-4h6v4M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2"/>',
 'warning': '<path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18h.01"/>',
 'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/>',
 'x': '<path d="M6 6l12 12M18 6 6 18"/>',
 'check': '<path d="M5 12l5 5 9-10"/>',
 'minus': '<path d="M5 12h14"/>',
 'database': '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
 'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
 'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
 'traffic': '<rect x="8" y="2" width="8" height="20" rx="3"/><circle cx="12" cy="7" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="17" r="1.4"/>',
 'clock': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 'eye': '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 'moon': '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
 'rain': '<path d="M7 15a5 5 0 1 1 1-9.9A6 6 0 0 1 19 8a4 4 0 0 1 0 8H7M8 19l-1 2M12 19l-1 2M16 19l-1 2"/>',
 'upload': '<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>',
 'link': '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
 'mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 6l10 7 10-7"/>',
 'tree': '<path d="M12 22v-6M12 2 5 12h4l-3 4h12l-3-4h4z"/>',
 'pin': '<path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
 'school': '<path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5"/>',
 'menu': '<path d="M3 6h18M3 12h18M3 18h18"/>',
 'faucet': '<path d="M3 9h11a4 4 0 0 1 4 4v1M8 9V5h4v4M5 5h10"/><path d="M18 17v1M18 20v1"/>',
 'flag': '<path d="M5 22V3M5 3h12l-2 4 2 4H5"/>',
 'search': '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 'bus': '<rect x="4" y="3" width="16" height="15" rx="2"/><path d="M4 11h16M7 21v-3M17 21v-3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>',
 'pipe': '<path d="M3 8h8v8H3zM11 10h6a4 4 0 0 1 4 4v7M17 14v7"/>',
 'well': '<path d="M5 10h14M7 10v11h10V10M4 10l8-6 8 6M12 14v3"/>',
 'septic': '<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8h8v3M2 20h20"/>',
 'swap': '<path d="M4 8h16M16 4l4 4-4 4M20 16H4M8 12l-4 4 4 4"/>',
}

def icon(name, cls='i'):
    return f'<svg class="{cls}" aria-hidden="true" focusable="false"><use href="#i-{name}"/></svg>'

def sprite():
    syms = ''.join(f'<symbol id="i-{k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{v}</symbol>' for k, v in ICONS.items())
    return f'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>{syms}</defs></svg>'

def header(active):
    items = []
    for key, label, href in NAV:
        cur = ' aria-current="page"' if key == active else ''
        if key == 'proposal':
            items.append(f'<li class="has-sub"><a href="{href}"{cur}>{label}</a>'
                         f'<ul class="sub"><li><a href="proposal.html#compare">Compare the Two Plans →</a></li></ul></li>')
        else:
            items.append(f'<li><a href="{href}"{cur}>{label}</a></li>')
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap bar">
  <a class="logo" href="index.html" aria-label="Safer Communities United — home"><span>Safer</span><span>Communities United</span></a>
  <nav class="main-nav" id="main-nav" aria-label="Main"><ul>{''.join(items)}</ul>
    <a class="btn btn-primary nav-cta-m" href="action.html">Get Involved</a></nav>
  <a class="btn btn-primary header-cta" href="action.html">Get Involved</a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="main-nav">{icon('menu')}<span>Menu</span></button>
</div></header>'''

FOOTER = '''<footer class="site-footer"><div class="wrap">
  <div class="f-brand"><p class="f-logo"><span>Safer</span><span>Communities United</span></p>
    <p class="f-tag">Putting the health, safety, and welfare of people first.</p></div>
  <nav class="f-cols" aria-label="Footer">
    <div><h2>Explore</h2><ul><li><a href="index.html">Our Community</a></li><li><a href="issues.html">Issues</a></li><li><a href="evidence.html">The Facts</a></li><li><a href="proposal.html">The Proposal</a></li></ul></div>
    <div><h2>Get Involved</h2><ul><li><a href="action.html">Take Action</a></li><li><a href="updates.html">Updates</a></li><li><a href="contact.html">Contact</a></li></ul></div>
    <div><h2>Information</h2><ul><li><a href="about.html">About</a></li><li><a href="sources-methods.html">Sources &amp; Methods</a></li><li><a href="accessibility.html">Accessibility</a></li><li><a href="edits.html">Edits</a></li><li><a href="privacy.html">Privacy</a></li></ul></div>
  </nav>
</div>
<div class="wrap f-base"><p>Review demo — not for public release. Forms are illustrative: nothing is submitted or saved.</p></div>
</footer>'''

DEMO_DIALOG = '''<dialog class="demo-dialog" id="demo-dialog" aria-labelledby="demo-dialog-title">
  <div class="dd-in"><p class="dd-tag">Demo preview</p><h2 id="demo-dialog-title">Demo only. Nothing is submitted or saved.</h2>
  <div class="dd-body" id="demo-dialog-body"></div>
  <button type="button" class="btn btn-navy dd-close">Close</button></div>
</dialog>'''

def render(path):
    raw = open(path, encoding='utf-8').read()
    m = re.match(r'\s*<!--meta (.*?)-->\s*', raw, re.S)
    meta = json.loads(m.group(1)); body = raw[m.end():]
    body = re.sub(r'\{\{icon:([a-z-]+)(?::([a-z0-9- ]+))?\}\}', lambda mm: icon(mm.group(1), 'i ' + (mm.group(2) or '')).replace('"i "', '"i"'), body)
    body = re.sub(r'\{\{include:([a-z0-9_-]+)\}\}', lambda mm: include(mm.group(1)), body)
    css = ''.join(f'<link rel="stylesheet" href="assets/pages/{c}.css">' for c in meta.get('css', []))
    js = ''.join(f'<script src="assets/pages/{j}.js" defer></script>' for j in meta.get('js', []))
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>{meta['title']}</title>
<meta name="description" content="{html.escape(meta.get('desc',''))}">
<link rel="preload" href="assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/source-serif-4-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/site.css">{css}
<script src="assets/site.js" defer></script>{js}
</head>
<body data-page="{meta.get('nav','')}">
{sprite()}
{header(meta.get('nav'))}
<main id="main" tabindex="-1">
{body.strip()}
</main>
{FOOTER}
{DEMO_DIALOG}
</body>
</html>
'''

# ---- data-driven partials -------------------------------------------------
def include(name):
    data = json.load(open(os.path.join(SRC, 'data', name + '.json'), encoding='utf-8'))
    return RENDERERS[name](data)

def r_library(items):
    out = []
    for it in items:
        meta = ' <span aria-hidden="true">·</span> '.join(html.escape(x) for x in it['meta'])
        tags = ''.join(f'<li>{html.escape(t)}</li>' for t in it['related'])
        if it.get('url'):
            btn = f'<a class="btn btn-soft" href="{html.escape(it["url"])}">View the Original Document →</a>'
        else:
            btn = (f'<button type="button" class="btn btn-soft" data-demo="{html.escape(it["demo"])}">'
                   f'View the Original Document →</button>')
        out.append(f'''<article class="lib-row">
  <img src="assets/img/{it['img']}" alt="" width="200" height="96" loading="lazy">
  <div class="lib-main"><h3>{html.escape(it['title'])}</h3><p class="lib-meta">{meta}</p>
  <p><b>The website uses this document to:</b> {html.escape(it['use'])}</p></div>
  <div class="lib-rel"><p class="lab">Related to</p><ul class="tags">{tags}</ul></div>
  <div class="lib-act">{btn}</div>
</article>''')
    return '\n'.join(out)

def r_stories(items):
    out = []
    for it in items:
        out.append(f'''<article class="story-card t-{it['tone']}">
  <img src="assets/img/{it['img']}" alt="{html.escape(it['alt'])}" width="465" height="212" loading="lazy">
  <div class="sc-body"><p class="chip">{icon(it['icon'])}{html.escape(it['label'])}</p>
  <blockquote><p>“{html.escape(it['quote'])}”</p></blockquote>
  <p class="who">{icon('people')}<span><b>{html.escape(it['name'])}</b><br>{html.escape(it['date'])}</span></p>
  <button type="button" class="link-arrow" data-demo="Illustrative sample story. Full stories will appear here only after the person who shared it has agreed to publication and the story has been approved.">Read the Story →</button></div>
</article>''')
    return '\n'.join(out)

RENDERERS = {'library': r_library, 'stories': r_stories}

if __name__ == '__main__':
    for p in sorted(glob.glob(os.path.join(SRC, 'pages', '*.html'))):
        name = os.path.basename(p)
        open(os.path.join(ROOT, name), 'w', encoding='utf-8').write(render(p))
        print('built', name)

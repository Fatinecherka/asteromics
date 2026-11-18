const NS = 'http://www.w3.org/2000/svg'

const PAGES = [
  { id: 'home', href: 'index.html', label: 'Home' },
  { id: 'services', href: 'services.html', label: 'Services' },
  { id: 'events', href: 'events.html', label: 'Events' },
  { id: 'about', href: 'about.html', label: 'About' },
  { id: 'contact', href: 'contact.html', label: 'Contact' },
]

function el(n, a) {
  const e = document.createElementNS(NS, n)
  for (const k in a) e.setAttribute(k, a[k])
  return e
}

function rng(seed) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(r) {
  return (r() + r() + r() + r() - 2) / 1.4
}

export function mark(svg, flat = false) {
  if (!svg) return
  svg.replaceChildren()
  const rings = [
    { n: 8, rad: 40, rj: 5, size: 5.2 },
    { n: 8, rad: 30, rj: 4, size: 4.4 },
    { n: 5, rad: 18, rj: 4, size: 3.6 },
  ]
  const r = rng(1234)
  rings.forEach((ring, ri) => {
    for (let i = 0; i < ring.n; i++) {
      const a = ri * 0.4 + (i / ring.n) * Math.PI * 2
      const rad = ring.rad + gauss(r) * ring.rj
      const c = el('circle', {
        cx: (Math.cos(a) * rad).toFixed(1),
        cy: (Math.sin(a) * rad).toFixed(1),
        r: ring.size,
        opacity: (0.7 + ri * 0.1).toFixed(2),
      })
      if (flat) c.setAttribute('fill', '#EDEAE1')
      else c.setAttribute('class', 'petal')
      svg.appendChild(c)
    }
  })
  if (!flat) {
    ;[
      [52, -30],
      [46, 34],
      [-54, 20],
    ].forEach((p) => {
      const c = el('circle', { cx: p[0], cy: p[1], r: 2.6, opacity: 0.5 })
      c.setAttribute('class', 'stray')
      svg.appendChild(c)
    })
  }
  const cr = rng(9)
  for (let i = 0; i < 14; i++) {
    const a = cr() * Math.PI * 2
    const rad = cr() * 7
    const c = el('circle', {
      cx: (Math.cos(a) * rad).toFixed(1),
      cy: (Math.sin(a) * rad).toFixed(1),
      r: 3,
    })
    if (flat) c.setAttribute('fill', '#EDEAE1')
    else c.setAttribute('class', 'disc')
    svg.appendChild(c)
  }
}

function pageLinks(activePage, indent = '          ') {
  return PAGES.map((p) => {
    const active = p.id === activePage ? ' aria-current="page"' : ''
    return `${indent}<a href="${p.href}"${active}>${p.label}</a>`
  }).join('\n')
}

function navHtml(activePage) {
  const links = pageLinks(activePage)
  const drawerLinks = pageLinks(activePage, '        ')

  return `
  <nav>
    <div class="wrap">
      <a class="brand" href="index.html" aria-label="AsterOmics home">
        <svg id="nm" viewBox="-60 -60 120 120" aria-hidden="true"></svg>
        <span class="n">Aster<span class="o">O</span>mics</span>
      </a>
      <div class="navright">
        <div class="links">
${links}
        </div>
        <button class="menu-toggle" id="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-drawer" aria-label="Open menu">
          <span class="menu-toggle-bars" aria-hidden="true"></span>
        </button>
        <button class="toggle" id="tg" type="button" aria-label="Switch microscopy mode">DARKFIELD</button>
      </div>
    </div>
  </nav>
  <div class="nav-drawer" id="nav-drawer" hidden>
    <div class="nav-drawer-backdrop" data-drawer-close></div>
    <div class="nav-drawer-panel" role="dialog" aria-modal="true" aria-label="Site navigation">
      <button class="nav-drawer-close" type="button" data-drawer-close aria-label="Close menu">Close</button>
      <div class="nav-drawer-links">
${drawerLinks}
      </div>
    </div>
  </div>`
}

function footerHtml(activePage) {
  const links = pageLinks(activePage, '        ')
  return `
  <footer>
    <div class="wrap">
      <div class="footer-meta">
        <span>&copy; AsterOmics</span>
        <span>AsterOmics.com</span>
      </div>
      <div class="footer-links">
${links}
      </div>
    </div>
  </footer>`
}

function initMarks() {
  mark(document.getElementById('nm'), false)
  document.querySelectorAll('svg.aster-mark').forEach((svg) => mark(svg, false))
}

const THEME_KEY = 'asteromics-theme'

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'day' || stored === 'night') return stored
  } catch {
    /* private mode / blocked storage */
  }
  return null
}

function writeStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* private mode / blocked storage */
  }
}

function initTheme(scope) {
  const root = document.documentElement
  const tg = document.getElementById('tg')
  if (!tg) return

  const apply = (theme) => {
    const mode = theme === 'day' ? 'brightfield' : 'darkfield'
    root.setAttribute('data-theme', theme)
    root.setAttribute('data-mode', mode)
    tg.textContent = theme === 'day' ? 'DARKFIELD' : 'BRIGHTFIELD'
    writeStoredTheme(theme)
    scope?.setMode?.(mode)
  }

  apply(readStoredTheme() || root.getAttribute('data-theme') || 'day')

  tg.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'day' ? 'night' : 'day'
    apply(next)
  })
}

function initMobileNav() {
  const toggle = document.getElementById('menu-toggle')
  const drawer = document.getElementById('nav-drawer')
  if (!toggle || !drawer) return

  const focusables = () =>
    [...drawer.querySelectorAll('a, button')].filter((el) => !el.hasAttribute('disabled'))

  const setOpen = (open, { restoreFocus = true } = {}) => {
    drawer.hidden = !open
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
    document.body.classList.toggle('nav-open', open)
    if (open) {
      const first = focusables()[0]
      first?.focus()
      return
    }
    if (restoreFocus) toggle.focus()
  }

  toggle.addEventListener('click', () => {
    setOpen(drawer.hidden)
  })

  drawer.addEventListener('click', (e) => {
    if (e.target.closest('[data-drawer-close]')) setOpen(false)
  })

  drawer.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (a.getAttribute('aria-current') !== 'page') return
      e.preventDefault()
      setOpen(false)
    })
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) {
      e.preventDefault()
      setOpen(false)
      return
    }
    if (e.key !== 'Tab' || drawer.hidden) return
    const items = focusables()
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
      return
    }
    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  })
}

/**
 * Wire theme toggle and aster marks. Nav/footer are SSR'd in HTML;
 * only inject them if missing (e.g. incomplete pages in dev).
 * @param {string} activePage - one of: home | services | events | about | contact
 * @param {{ setMode?: (mode: string) => void } | null} [scope]
 */
export function initChrome(activePage, scope = null) {
  const body = document.body
  if (!body.querySelector('nav')) {
    body.insertAdjacentHTML('afterbegin', navHtml(activePage))
  }
  if (!body.querySelector('footer')) {
    body.insertAdjacentHTML('beforeend', footerHtml(activePage))
  }

  initMarks()
  initTheme(scope)
  initMobileNav()
}

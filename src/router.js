import { PAGES, setActivePage, closeMobileNav, refreshMarks } from './layout.js'
import { destroyScroll, initScroll, scrollToTop } from './scroll.js'
import * as home from './views/home.js'
import * as services from './views/services.js'
import * as events from './views/events.js'
import * as about from './views/about.js'
import * as contact from './views/contact.js'

const routes = {
  home,
  services,
  events,
  about,
  contact,
}

const LEGACY = {
  '/index.html': '/',
  '/services.html': '/services',
  '/events.html': '/events',
  '/about.html': '/about',
  '/contact.html': '/contact',
}

/** @type {typeof home | null} */
let current = null

function normalizePath(pathname) {
  let path = pathname || '/'
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  const legacy = LEGACY[path]
  if (legacy) return legacy
  return path || '/'
}

function matchRoute(pathname) {
  const path = normalizePath(pathname)
  const page = PAGES.find((p) => p.href === path)
  if (page) return { path: page.href, view: routes[page.id], id: page.id }
  return { path: '/', view: home, id: 'home' }
}

function setMeta(meta) {
  document.title = meta.title
  let el = document.querySelector('meta[name="description"]')
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', 'description')
    document.head.appendChild(el)
  }
  el.setAttribute('content', meta.description)
}

/**
 * @param {string} pathname
 * @param {{ replace?: boolean, scroll?: boolean }} [opts]
 */
export function navigate(pathname, { replace = false, scroll = true } = {}) {
  const matched = matchRoute(pathname)
  const url = matched.path + (window.location.search || '') + (window.location.hash || '')

  if (replace) history.replaceState({ path: matched.path }, '', url)
  else if (normalizePath(window.location.pathname) !== matched.path) {
    history.pushState({ path: matched.path }, '', matched.path)
  }

  renderRoute(matched, { scroll })
}

function renderRoute(matched, { scroll = true } = {}) {
  const app = document.getElementById('app')
  if (!app) return

  current?.unmount?.()
  destroyScroll()

  current = matched.view
  setMeta(matched.view.meta)
  setActivePage(matched.id)
  closeMobileNav()

  matched.view.render(app)
  refreshMarks()
  matched.view.mount()
  initScroll()

  if (scroll) scrollToTop()
}

function isInternalLink(anchor) {
  if (!anchor || anchor.target === '_blank') return false
  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return false
  if (href.startsWith('#')) return false

  let url
  try {
    url = new URL(href, window.location.origin)
  } catch {
    return false
  }
  if (url.origin !== window.location.origin) return false

  const path = normalizePath(url.pathname)
  return PAGES.some((p) => p.href === path)
}

export function startRouter() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }
    const anchor = e.target.closest?.('a[href]')
    if (!isInternalLink(anchor)) return

    const url = new URL(anchor.getAttribute('href'), window.location.origin)
    const matched = matchRoute(url.pathname)
    e.preventDefault()
    navigate(matched.path)
  })

  window.addEventListener('popstate', () => {
    navigate(window.location.pathname, { replace: true, scroll: true })
  })

  const rawPath = window.location.pathname
  const initial = matchRoute(rawPath)
  const trimmed =
    rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath || '/'
  if (trimmed !== initial.path) {
    history.replaceState({ path: initial.path }, '', initial.path)
  }
  renderRoute(initial, { scroll: false })
}

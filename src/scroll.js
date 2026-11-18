import gsap from 'gsap'

/** @type {Array<() => void>} */
let cleanups = []
/** @type {IntersectionObserver | null} */
let revealObserver = null

function revealSection(section) {
  const items = [...section.querySelectorAll('.reveal')]
  if (!items.length) return

  items.forEach((el) => el.classList.add('is-pending'))

  gsap.fromTo(
    items,
    { autoAlpha: 0, y: 22 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.07,
      onStart() {
        items.forEach((el) => el.classList.remove('is-pending'))
      },
    },
  )
}

function initReveals() {
  const sections = document.querySelectorAll('#app section, #app header.page-hero, #app header.hero')
  const roots = sections.length ? sections : document.querySelectorAll('#app > *')

  if (!window.IntersectionObserver) {
    roots.forEach((section) => revealSection(section))
    return
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        revealObserver?.unobserve(entry.target)
        revealSection(entry.target)
      })
    },
    {
      root: null,
      rootMargin: '0px 0px -22% 0px',
      threshold: 0.05,
    },
  )

  roots.forEach((section) => {
    if (!section.querySelector('.reveal')) return
    section.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-pending'))
    revealObserver.observe(section)
  })
}

function bindHashLinks() {
  const anchors = document.querySelectorAll('#app a[href^="#"]')
  anchors.forEach((anchor) => {
    const onClick = (e) => {
      const id = anchor.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      const top = target.getBoundingClientRect().top + window.scrollY - 72
      window.scrollTo({ top, behavior: 'smooth' })
    }
    anchor.addEventListener('click', onClick)
    cleanups.push(() => anchor.removeEventListener('click', onClick))
  })
}

export function destroyScroll() {
  cleanups.forEach((fn) => fn())
  cleanups = []
  revealObserver?.disconnect()
  revealObserver = null
  gsap.killTweensOf('#app .reveal')
}

export function initScroll() {
  destroyScroll()

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    return { refresh: () => {} }
  }

  initReveals()
  bindHashLinks()

  return {
    refresh: () => {},
  }
}

export function scrollToTop() {
  window.scrollTo(0, 0)
}

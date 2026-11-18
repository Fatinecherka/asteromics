import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** @type {import('lenis').default | null} */
let lenisInstance = null
/** @type {((time: number) => void) | null} */
let tickerFn = null
/** @type {Array<() => void>} */
let cleanups = []

function initReveals() {
  const sections = document.querySelectorAll('#app section, #app header.page-hero, #app header.hero')
  const roots = sections.length ? sections : document.querySelectorAll('#app > *')

  roots.forEach((section) => {
    const items = section.querySelectorAll('.reveal')
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
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          once: true,
        },
        onStart() {
          items.forEach((el) => el.classList.remove('is-pending'))
        },
      },
    )
  })
}

function bindHashLinks(scrollTo) {
  const anchors = document.querySelectorAll('#app a[href^="#"]')
  anchors.forEach((anchor) => {
    const onClick = (e) => {
      const id = anchor.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      scrollTo(target)
    }
    anchor.addEventListener('click', onClick)
    cleanups.push(() => anchor.removeEventListener('click', onClick))
  })
}

export function destroyScroll() {
  cleanups.forEach((fn) => fn())
  cleanups = []

  ScrollTrigger.getAll().forEach((t) => t.kill())

  if (tickerFn) {
    gsap.ticker.remove(tickerFn)
    tickerFn = null
  }

  if (lenisInstance) {
    lenisInstance.destroy()
    lenisInstance = null
  }
}

export function initScroll() {
  destroyScroll()

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    document.querySelectorAll('#app .reveal').forEach((el) => el.classList.add('is-visible'))
    return { lenis: null, refresh: () => {} }
  }

  const preferNative =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(max-width: 900px)').matches

  if (preferNative) {
    initReveals()
    bindHashLinks((target) => {
      const top = target.getBoundingClientRect().top + window.scrollY - 72
      window.scrollTo({ top, behavior: 'smooth' })
    })
    return { lenis: null, refresh: () => ScrollTrigger.refresh() }
  }

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    touchMultiplier: 1.4,
  })
  lenisInstance = lenis

  lenis.on('scroll', ScrollTrigger.update)

  tickerFn = (time) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(tickerFn)
  gsap.ticker.lagSmoothing(0)

  initReveals()

  bindHashLinks((target) => {
    lenis.scrollTo(target, { offset: -72 })
  })

  return {
    lenis,
    refresh: () => ScrollTrigger.refresh(),
  }
}

export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: true })
    return
  }
  window.scrollTo(0, 0)
}

import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function initReveals() {
  const sections = document.querySelectorAll('section')
  sections.forEach((section) => {
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

export function initScroll() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'))
    return { lenis: null, refresh: () => {} }
  }

  const preferNative =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(max-width: 900px)').matches

  if (preferNative) {
    initReveals()
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href')
        if (!id || id === '#') return
        const target = document.querySelector(id)
        if (!target) return
        e.preventDefault()
        const top = target.getBoundingClientRect().top + window.scrollY - 72
        window.scrollTo({ top, behavior: 'smooth' })
      })
    })
    return { lenis: null, refresh: () => ScrollTrigger.refresh() }
  }

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    touchMultiplier: 1.4,
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  initReveals()

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target, { offset: -72 })
    })
  })

  return {
    lenis,
    refresh: () => ScrollTrigger.refresh(),
  }
}

import gsap from 'gsap'
import { createMicroscope } from '../microscope.js'
import { initScroll } from '../scroll.js'
import { initChrome } from '../layout.js'
import { mountNewsletter } from '../newsletter.js'

function initHeroIntro(scope) {
  const copy = document.getElementById('hero-copy')
  const focusInput = document.getElementById('focus')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    copy?.classList.remove('is-hidden')
    scope.setFocus(0.55)
    if (focusInput) focusInput.value = '55'
    return
  }

  if (copy) {
    gsap.set(copy, { autoAlpha: 0, y: 18 })
    copy.classList.remove('is-hidden')
  }

  const state = { focus: 0 }
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })

  tl.to(state, {
    focus: 0.58,
    duration: 2.4,
    onUpdate() {
      scope.setFocus(state.focus)
      if (focusInput) focusInput.value = String(Math.round(state.focus * 100))
    },
  })

  if (copy) {
    tl.to(
      copy,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
      },
      '-=0.9',
    )
  }
}

function main() {
  const canvas = document.getElementById('scope')
  const focusInput = document.getElementById('focus')
  const labelEl = document.getElementById('fov-label')

  const initialMode =
    document.documentElement.getAttribute('data-mode') === 'darkfield'
      ? 'darkfield'
      : 'brightfield'

  const scope = createMicroscope(canvas, {
    mode: initialMode,
    focusInput,
    labelEl,
  })

  initChrome('home', scope)
  initHeroIntro(scope)
  mountNewsletter(document.getElementById('newsletter'))
  initScroll()
}

main()

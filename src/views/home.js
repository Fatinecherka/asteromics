import gsap from 'gsap'
import { createMicroscope } from '../microscope.js'
import { mountNewsletter } from '../newsletter.js'
import { setMicroscopeScope } from '../layout.js'

export const meta = {
  title: 'AsterOmics',
  description:
    'AsterOmics provides omics data analysis for research laboratories, universities and companies.',
}

export const id = 'home'

const html = `
  <header class="hero on-panel" id="hero">
    <div class="hero-stage" aria-hidden="true">
      <div class="fov">
        <canvas id="scope"></canvas>
        <div class="fov-vignette"></div>
        <div class="fov-reticle"></div>
        <div class="fov-hud">
          <div class="fov-label" id="fov-label">AsterOmics · 40× · Brightfield</div>
          <div class="fov-scale">
            <div class="fov-scale-bar"></div>
            <span>10 μm</span>
          </div>
        </div>
      </div>
    </div>

    <div class="wrap">
      <div class="hero-copy is-hidden" id="hero-copy">
        <h1>From biological question to omics answer.</h1>
        <p class="sub">AsterOmics provides omics data analysis for research laboratories, universities and companies. Single cell, spatial, bulk transcriptomics, proteomics, lipidomics and metabolomics.</p>
        <a class="cta" href="/contact">REQUEST A FIRST CONSULTATION</a>
      </div>
    </div>

    <div class="hero-controls">
      <label for="focus">Focus</label>
      <input id="focus" type="range" min="0" max="100" value="0" aria-label="Rack microscope focus">
    </div>
  </header>

  <section id="overview" class="slide-edge">
    <div class="wrap">
      <p class="eyebrow reveal">What we do</p>
      <h2 class="reveal">Omics analysis, from design to publication</h2>
      <p class="lede reveal">Support at every stage of a project — experimental design, computational analysis, and figures ready for a manuscript. Work starts with a free consultation.</p>
      <div class="grid3 after">
        <a class="teaser reveal" href="/services">
          <h3>Services</h3>
          <p>Design, analysis and publication support for single-cell, spatial and multi-omics projects.</p>
          <span class="teaser-go">Explore services →</span>
        </a>
        <a class="teaser reveal" href="/events">
          <h3>Events</h3>
          <p>Talks, workshops and meetings — including FeWhale at Impact Hub Antwerp.</p>
          <span class="teaser-go">See events →</span>
        </a>
        <a class="teaser reveal" href="/about">
          <h3>About</h3>
          <p>Led by Fatine Cherkaoui, PhD — experimental and computational training in one practice.</p>
          <span class="teaser-go">Meet Fatine →</span>
        </a>
      </div>
    </div>
    <div class="section-aster" aria-hidden="true"><svg class="aster-mark" viewBox="-60 -60 120 120"></svg></div>
  </section>

  <section id="newsletter-section" class="slide-edge">
    <div class="wrap">
      <div id="newsletter" class="reveal"></div>
    </div>
    <div class="section-aster" aria-hidden="true"><svg class="aster-mark" viewBox="-60 -60 120 120"></svg></div>
  </section>

  <section class="contact on-panel" id="contact-cta">
    <div class="wrap">
      <p class="eyebrow reveal">Contact</p>
      <h2 class="reveal">Request a first consultation</h2>
      <p class="lede reveal">Please include the biological question, the data available or planned, and your deadline.</p>
      <a class="mail reveal" href="mailto:contact@asteromics.com">contact@asteromics.com</a>
    </div>
  </section>
`

/** @type {{ destroy?: () => void } | null} */
let scope = null
/** @type {gsap.core.Timeline | null} */
let heroTl = null

function initHeroIntro(microscope) {
  const copy = document.getElementById('hero-copy')
  const focusInput = document.getElementById('focus')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    copy?.classList.remove('is-hidden')
    microscope.setFocus(0.55)
    if (focusInput) focusInput.value = '55'
    return
  }

  if (copy) {
    gsap.set(copy, { autoAlpha: 0, y: 18 })
    copy.classList.remove('is-hidden')
  }

  const state = { focus: 0 }
  heroTl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })

  heroTl.to(state, {
    focus: 0.58,
    duration: 2.4,
    onUpdate() {
      microscope.setFocus(state.focus)
      if (focusInput) focusInput.value = String(Math.round(state.focus * 100))
    },
  })

  if (copy) {
    heroTl.to(
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

export function render(container) {
  container.innerHTML = html
}

export function mount() {
  const canvas = document.getElementById('scope')
  const focusInput = document.getElementById('focus')
  const labelEl = document.getElementById('fov-label')

  const initialMode =
    document.documentElement.getAttribute('data-mode') === 'darkfield'
      ? 'darkfield'
      : 'brightfield'

  scope = createMicroscope(canvas, {
    mode: initialMode,
    focusInput,
    labelEl,
  })
  setMicroscopeScope(scope)
  initHeroIntro(scope)
  mountNewsletter(document.getElementById('newsletter'))
}

export function unmount() {
  heroTl?.kill()
  heroTl = null
  scope?.destroy?.()
  scope = null
  setMicroscopeScope(null)
}

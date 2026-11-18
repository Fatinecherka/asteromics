import { initEventsSlider } from '../events-slider.js'

export const meta = {
  title: 'Events | AsterOmics',
  description:
    'AsterOmics talks, workshops and scientific meetings, including FeWhale at Impact Hub Antwerp.',
}

export const id = 'events'

const html = `
  <header class="page-hero">
    <div class="wrap">
      <p class="eyebrow">Speaking &amp; Events</p>
      <h1>Talks, workshops and scientific meetings</h1>
      <p class="lede">Fatine speaks on single-cell and spatial omics analysis, reproducible pipelines, and bridging wet-lab and computational practice.</p>
    </div>
  </header>

  <section id="gallery" class="slide-edge">
    <div class="wrap">
      <p class="eyebrow reveal">FeWhale · Impact Hub Antwerp</p>
      <h2 class="reveal">Presenting AsterOmics</h2>
      <p class="lede reveal">
        AsterOmics at
        <a class="inline-link" href="https://antwerp.impacthub.net/fewhale/" target="_blank" rel="noopener">FeWhale</a>,
        Impact Hub Antwerp: stage, conversations and the company table.
      </p>
      <div class="after reveal">
        <div class="slider" id="slider">
          <div class="track" id="track"></div>
          <button class="snav prev" id="s-prev" type="button" aria-label="Previous">‹</button>
          <button class="snav next" id="s-next" type="button" aria-label="Next">›</button>
        </div>
        <div class="dots" id="dots" role="tablist" aria-label="Event images"></div>
      </div>
    </div>
    <div class="section-aster" aria-hidden="true"><svg class="aster-mark" viewBox="-60 -60 120 120"></svg></div>
  </section>

  <section id="talks" class="slide-edge">
    <div class="wrap">
      <p class="eyebrow reveal">Talks &amp; workshops</p>
      <h2 class="reveal">Selected appearances</h2>
      <div class="panelbox after reveal">
        <ul class="events-list">
          <li class="event reveal">
            <div class="event-year">2026</div>
            <div class="event-body">
              <h3>FeWhale</h3>
              <p class="event-meta">Impact Hub Antwerp · Company presentation</p>
              <p class="event-talk">Introducing AsterOmics to founders and researchers.
                <a class="inline-link" href="https://antwerp.impacthub.net/fewhale/" target="_blank" rel="noopener">antwerp.impacthub.net/fewhale</a>
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="section-aster" aria-hidden="true"><svg class="aster-mark" viewBox="-60 -60 120 120"></svg></div>
  </section>

  <section class="contact on-panel">
    <div class="wrap">
      <p class="eyebrow reveal">Invite</p>
      <h2 class="reveal">Invite AsterOmics to speak</h2>
      <p class="lede reveal">Workshops, panels and invited talks on single-cell, spatial omics and reproducible analysis.</p>
      <a class="mail reveal" href="mailto:contact@asteromics.com">contact@asteromics.com</a>
    </div>
  </section>
`

/** @type {(() => void) | null} */
let destroySlider = null

export function render(container) {
  container.innerHTML = html
}

export function mount() {
  destroySlider = initEventsSlider()
}

export function unmount() {
  destroySlider?.()
  destroySlider = null
}

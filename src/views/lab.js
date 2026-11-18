import '../lab.css'
import { createLabScene } from '../lab-scene.js'
import { mountContactForm } from '../contact-form.js'
import { createMicroscope } from '../microscope.js'
import { setMicroscopeScope } from '../layout.js'
import { initEventsSlider } from '../events-slider.js'

export const meta = {
  title: 'Lab | AsterOmics',
  description:
    'An experimental walkthrough of AsterOmics organized like a laboratory: benches, beakers, imaging, and consultation.',
}

export const id = 'lab'

const STATIONS = [
  { id: 'bench', label: 'Bench', zone: 'Wet bench' },
  { id: 'analysis', label: 'Analysis', zone: 'Analysis bay' },
  { id: 'imaging', label: 'Imaging', zone: 'Imaging core' },
  { id: 'seminar', label: 'Seminar', zone: 'Seminar wall' },
  { id: 'desk', label: 'Desk', zone: 'Consultation desk' },
]

const BEAKERS = [
  {
    id: 'design',
    label: 'Design',
    reagent: 'DX-01',
    fill: 'amber',
    items: [
      'Experimental and study design',
      'Feasibility and sample size assessment',
      'Platform and technology selection',
      'Analysis plans for grant applications',
    ],
  },
  {
    id: 'analysis',
    label: 'Analysis',
    reagent: 'AX-02',
    fill: 'violet',
    items: [
      'Quality control and preprocessing',
      'Cell type annotation and clustering',
      'Differential expression and abundance',
      'Pathway and enrichment analysis',
      'Integration across omics layers',
      'Re-analysis of public datasets',
    ],
  },
  {
    id: 'publication',
    label: 'Publication',
    reagent: 'PX-03',
    fill: 'teal',
    items: [
      'Figures prepared to journal specifications',
      'Methods and statistics sections',
      'Review of analytical claims before submission',
      'Responses to reviewer comments',
      'Revision and resubmission support',
    ],
  },
]

function stationButtons() {
  return STATIONS.map(
    (s) => `
      <button type="button" class="lab-station-btn" data-go-station="${s.id}" aria-controls="lab-panel-${s.id}">
        <span class="lab-station-btn-zone">${s.zone}</span>
        <span class="lab-station-btn-label">${s.label}</span>
      </button>`,
  ).join('')
}

function mapTiles() {
  return STATIONS.map(
    (s) => `
      <button type="button" class="lab-map-tile" data-go-station="${s.id}" data-tile="${s.id}">
        <span class="lab-map-tile-mark" aria-hidden="true"></span>
        <span class="lab-map-tile-zone">${s.zone}</span>
        <span class="lab-map-tile-label">${s.label}</span>
      </button>`,
  ).join('')
}

function beakerMarkup(b) {
  return `
    <div class="lab-beaker" data-beaker="${b.id}" data-fill="${b.fill}">
      <button type="button" class="lab-beaker-hit" data-open-beaker="${b.id}" aria-expanded="false" aria-controls="lab-beaker-panel-${b.id}">
        <span class="lab-beaker-glass" aria-hidden="true">
          <span class="lab-beaker-stopper"></span>
          <span class="lab-beaker-body">
            <span class="lab-beaker-liquid"></span>
            <span class="lab-beaker-meniscus"></span>
          </span>
          <span class="lab-beaker-label-tape">${b.reagent}</span>
        </span>
        <span class="lab-beaker-name">${b.label}</span>
      </button>
      <div class="lab-beaker-panel" id="lab-beaker-panel-${b.id}" hidden>
        <div class="lab-beaker-panel-inner">
          <p class="lab-beaker-panel-eyebrow">Reagent · ${b.reagent}</p>
          <h3>${b.label}</h3>
          <ul>
            ${b.items.map((item) => `<li>${item}</li>`).join('')}
          </ul>
          <button type="button" class="lab-beaker-close" data-close-beaker="${b.id}">Recap</button>
        </div>
      </div>
    </div>`
}

const html = `
  <div class="lab-experience" id="lab-root" data-phase="entrance" data-station="">
    <section class="lab-entrance" id="lab-entrance" aria-label="Lab entrance">
      <div class="lab-entrance-plane" aria-hidden="true">
        <div class="lab-entrance-door" data-door>
          <div class="lab-entrance-door-frame">
            <div class="lab-entrance-door-panel">
              <div class="lab-entrance-glass"></div>
              <div class="lab-entrance-handle"></div>
              <div class="lab-entrance-kick"></div>
            </div>
          </div>
        </div>
        <div class="lab-entrance-bench-glow"></div>
      </div>
      <div class="lab-entrance-copy">
        <div class="wrap">
          <p class="lab-eyebrow">Experimental prototype</p>
          <h1 class="lab-brand">Aster<span class="lab-brand-o">O</span>mics</h1>
          <p class="lab-entrance-lede">From biological question to omics answer — organized like the lab that asks it.</p>
          <div class="lab-entrance-actions">
            <button type="button" class="lab-cta" data-enter-lab>Step inside</button>
            <a class="lab-back-site" href="/">Return to the site</a>
          </div>
        </div>
      </div>
    </section>

    <div class="lab-chrome" id="lab-chrome" hidden>
      <div class="wrap lab-chrome-inner">
        <button type="button" class="lab-chrome-map" data-go-map>Floor plan</button>
        <nav class="lab-station-strip" aria-label="Lab stations">
          ${stationButtons()}
        </nav>
      </div>
    </div>

    <section class="lab-map" id="lab-map" hidden aria-label="Lab floor plan">
      <div class="wrap">
        <p class="lab-eyebrow">Floor plan</p>
        <h2 class="lab-map-title">Choose a station</h2>
        <p class="lab-map-lede">Five zones, one practice — wet bench, analysis bay, imaging core, seminar wall, consultation desk.</p>
        <div class="lab-map-grid">
          ${mapTiles()}
        </div>
        <div class="lab-shelf" aria-label="Affiliations">
          <p class="lab-shelf-title">Shelf · affiliations</p>
          <div class="lab-shelf-bottles">
            <span class="lab-bottle">GIGA-Cancer</span>
            <span class="lab-bottle">ULiège</span>
            <span class="lab-bottle">Maryland</span>
            <span class="lab-bottle">Vienna</span>
            <span class="lab-bottle">Brown</span>
          </div>
        </div>
      </div>
    </section>

    <section class="lab-panel" id="lab-panel-bench" data-station-panel="bench" hidden>
      <div class="wrap lab-panel-layout">
        <header class="lab-panel-head">
          <p class="lab-eyebrow">Wet bench</p>
          <h2>Experimental and computational</h2>
          <p class="lab-panel-lede">Analyses carried out by someone who knows what happens at the bench.</p>
        </header>
        <div class="lab-bench-surface">
          <div class="lab-bench-who">
            <span class="lab-bench-av">
              <img src="/assets/portrait.jpg" alt="Portrait of Fatine Cherkaoui" width="96" height="96">
            </span>
            <div>
              <p class="lab-bench-name">Fatine Cherkaoui</p>
              <p class="lab-bench-role">PhD in Biomedical Sciences · AsterOmics</p>
            </div>
          </div>
          <p>AsterOmics is led by Fatine Cherkaoui, PhD in Biomedical Sciences, with training in both laboratory work and bioinformatics.</p>
          <p>Sample preparation, batch structure and technical artefacts are assessed as part of the analysis rather than treated as background noise.</p>
          <p>We work with academic laboratories, core facilities and companies, on data they generate and on public datasets.</p>
          <dl class="lab-bench-facts">
            <div><dt>Languages</dt><dd>English, Français</dd></div>
            <div><dt>Location</dt><dd>Belgium, working remotely</dd></div>
            <div><dt>Contact</dt><dd><a class="inline-link" href="mailto:contact@asteromics.com">contact@asteromics.com</a></dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section class="lab-panel" id="lab-panel-analysis" data-station-panel="analysis" hidden>
      <div class="wrap lab-panel-layout">
        <header class="lab-panel-head">
          <p class="lab-eyebrow">Analysis bay</p>
          <h2>Open a reagent</h2>
          <p class="lab-panel-lede">Projects can start at any stage — including after the data has been generated. Lift a stopper to read the protocol.</p>
        </header>
        <div class="lab-beaker-rack" role="list">
          ${BEAKERS.map(beakerMarkup).join('')}
        </div>
        <div class="lab-analysis-note">
          <p class="lab-eyebrow">Reproducibility</p>
          <p>Every analysis is delivered as code rather than as results alone. Package versions are pinned, environments are documented and random seeds are fixed.</p>
        </div>
      </div>
    </section>

    <section class="lab-panel" id="lab-panel-imaging" data-station-panel="imaging" hidden>
      <div class="wrap lab-panel-layout">
        <header class="lab-panel-head">
          <p class="lab-eyebrow">Imaging core</p>
          <h2>Field of view</h2>
          <p class="lab-panel-lede">Rack focus and switch illumination — brightfield by day, darkfield by night.</p>
        </header>
        <div class="lab-imaging-stage">
          <div class="lab-fov">
            <canvas id="lab-scope"></canvas>
            <div class="lab-fov-vignette"></div>
            <div class="lab-fov-reticle"></div>
            <div class="lab-fov-hud">
              <div class="lab-fov-label" id="lab-fov-label">AsterOmics · Brightfield</div>
              <div class="lab-fov-scale">
                <div class="lab-fov-scale-bar"></div>
                <span>10 μm</span>
              </div>
            </div>
          </div>
          <div class="lab-imaging-controls">
            <label for="lab-focus">Focus</label>
            <input id="lab-focus" type="range" min="0" max="100" value="55" aria-label="Rack microscope focus">
          </div>
        </div>
      </div>
    </section>

    <section class="lab-panel" id="lab-panel-seminar" data-station-panel="seminar" hidden>
      <div class="wrap lab-panel-layout">
        <header class="lab-panel-head">
          <p class="lab-eyebrow">Seminar wall</p>
          <h2>Talks, workshops and meetings</h2>
          <p class="lab-panel-lede">Fatine speaks on single-cell and spatial omics analysis, reproducible pipelines, and bridging wet-lab and computational practice.</p>
        </header>
        <div class="lab-seminar-poster">
          <p class="lab-eyebrow">FeWhale · Impact Hub Antwerp</p>
          <h3>Presenting AsterOmics</h3>
          <p>
            AsterOmics at
            <a class="inline-link" href="https://antwerp.impacthub.net/fewhale/" target="_blank" rel="noopener">FeWhale</a>,
            Impact Hub Antwerp: stage, conversations and the company table.
          </p>
          <div class="lab-seminar-slider after">
            <div class="slider" id="slider">
              <div class="track" id="track"></div>
              <button class="snav prev" id="s-prev" type="button" aria-label="Previous">‹</button>
              <button class="snav next" id="s-next" type="button" aria-label="Next">›</button>
            </div>
            <div class="dots" id="dots" role="tablist" aria-label="Event images"></div>
          </div>
        </div>
        <div class="lab-seminar-talk">
          <p class="lab-eyebrow">Selected appearance</p>
          <p class="lab-seminar-year">2026</p>
          <h3>FeWhale</h3>
          <p>Impact Hub Antwerp · Company presentation</p>
        </div>
      </div>
    </section>

    <section class="lab-panel" id="lab-panel-desk" data-station-panel="desk" hidden>
      <div class="wrap lab-panel-layout">
        <header class="lab-panel-head">
          <p class="lab-eyebrow">Consultation desk</p>
          <h2>Load a sample request</h2>
          <p class="lab-panel-lede">Please include the biological question, the data available or planned, and your deadline. If it is not something we can help with, we will say so.</p>
        </header>
        <div class="lab-desk-surface">
          <div class="lab-pipette" id="lab-pipette" aria-hidden="true">
            <div class="lab-pipette-plunger"></div>
            <div class="lab-pipette-body"></div>
            <div class="lab-pipette-tip"></div>
            <div class="lab-pipette-drop"></div>
          </div>
          <div class="lab-desk-notebook">
            <div id="lab-contact-form"></div>
            <a class="mail" href="mailto:contact@asteromics.com">contact@asteromics.com</a>
          </div>
        </div>
      </div>
    </section>
  </div>
`

/** @type {{ destroy?: () => void } | null} */
let scene = null
/** @type {{ destroy?: () => void } | null} */
let scope = null
/** @type {(() => void) | null} */
let destroySlider = null

export function render(container) {
  container.innerHTML = html
}

export function mount() {
  const root = document.getElementById('lab-root')
  scene = createLabScene(root, {
    onStationEnter(stationId) {
      if (stationId === 'imaging') mountImaging()
      if (stationId === 'seminar') mountSeminar()
      if (stationId === 'desk') mountDesk()
    },
    onStationLeave(stationId) {
      if (stationId === 'imaging') unmountImaging()
      if (stationId === 'seminar') unmountSeminar()
    },
  })
}

export function unmount() {
  scene?.destroy?.()
  scene = null
  unmountImaging()
  unmountSeminar()
}

function mountImaging() {
  if (scope) return
  const canvas = document.getElementById('lab-scope')
  const focusInput = document.getElementById('lab-focus')
  const labelEl = document.getElementById('lab-fov-label')
  if (!canvas) return

  const initialMode =
    document.documentElement.getAttribute('data-mode') === 'darkfield'
      ? 'darkfield'
      : 'brightfield'

  scope = createMicroscope(canvas, {
    mode: initialMode,
    focusInput,
    labelEl,
  })
  scope.setFocus?.(0.55)
  if (focusInput) focusInput.value = '55'
  setMicroscopeScope(scope)
}

function unmountImaging() {
  scope?.destroy?.()
  scope = null
  setMicroscopeScope(null)
}

function mountSeminar() {
  if (destroySlider) return
  destroySlider = initEventsSlider()
}

function unmountSeminar() {
  destroySlider?.()
  destroySlider = null
}

function mountDesk() {
  const formHost = document.getElementById('lab-contact-form')
  if (!formHost || formHost.dataset.mounted === '1') return
  mountContactForm(formHost)
  formHost.dataset.mounted = '1'

  const submit = formHost.querySelector('.contact-form-submit')
  if (submit) submit.textContent = 'Dispense request'

  const form = formHost.querySelector('#consultation-form')
  form?.addEventListener('submit', () => {
    if (!form.checkValidity()) return
    const pipette = document.getElementById('lab-pipette')
    pipette?.classList.add('is-dispensing')
    window.setTimeout(() => pipette?.classList.remove('is-dispensing'), 700)
  })
}

export const meta = {
  title: 'Services | AsterOmics',
  description:
    'AsterOmics services: experimental design, omics data analysis, and publication support.',
}

export const id = 'services'

const NS = 'http://www.w3.org/2000/svg'

function el(name, attrs) {
  const node = document.createElementNS(NS, name)
  for (const key in attrs) node.setAttribute(key, attrs[key])
  return node
}

function rng(seed) {
  let s = seed
  return function next() {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(rand) {
  return (rand() + rand() + rand() + rand() - 2) / 1.4
}

function paintServiceArt(svg) {
  const kind = svg.getAttribute('data-art')
  const W = 320
  const H = 180
  const rand = rng(kind.length * 97)

  svg.replaceChildren()
  svg.appendChild(
    el('rect', {
      x: 0,
      y: 0,
      width: W,
      height: H,
      fill: 'color-mix(in srgb, var(--accent) 12%, var(--surface))',
    }),
  )

  if (kind === 'design') {
    for (let x = 20; x < W; x += 24) {
      svg.appendChild(
        el('line', {
          x1: x,
          y1: 16,
          x2: x,
          y2: H - 16,
          stroke: 'var(--accent-soft)',
          opacity: '.22',
          'stroke-width': 1,
        }),
      )
    }
    for (let y = 28; y < H; y += 24) {
      svg.appendChild(
        el('line', {
          x1: 16,
          y1: y,
          x2: W - 16,
          y2: y,
          stroke: 'var(--accent-soft)',
          opacity: '.22',
          'stroke-width': 1,
        }),
      )
    }
    svg.appendChild(
      el('path', {
        d: 'M28,138 C78,132 92,74 134,70 S208,104 236,54 S286,38 296,44',
        fill: 'none',
        stroke: 'var(--petal)',
        'stroke-width': 2.4,
        'stroke-linecap': 'round',
      }),
    )
    ;[
      [28, 138],
      [134, 70],
      [236, 54],
      [296, 44],
    ].forEach(([cx, cy]) => {
      svg.appendChild(
        el('circle', {
          cx,
          cy,
          r: 6,
          fill: 'var(--panel-text)',
          stroke: 'var(--petal)',
          'stroke-width': 2.4,
        }),
      )
    })
    svg.appendChild(el('circle', { cx: 188, cy: 80, r: 7, fill: 'var(--gold)' }))
    return
  }

  if (kind === 'analysis') {
    ;[
      [0.28, 0.42, '#6B5B95', 120],
      [0.56, 0.3, '#4B3C7E', 110],
      [0.7, 0.66, '#B06AA8', 100],
      [0.4, 0.74, '#5C72B8', 80],
    ].forEach(([fx, fy, fill, n]) => {
      for (let i = 0; i < n; i += 1) {
        svg.appendChild(
          el('circle', {
            cx: (fx * W + gauss(rand) * 17).toFixed(1),
            cy: (fy * H + gauss(rand) * 13).toFixed(1),
            r: (1.2 + rand() * 1.3).toFixed(1),
            fill,
            opacity: '.82',
          }),
        )
      }
    })
    for (let i = 0; i < 16; i += 1) {
      svg.appendChild(
        el('circle', {
          cx: (0.5 * W + gauss(rand) * 7).toFixed(1),
          cy: (0.5 * H + gauss(rand) * 6).toFixed(1),
          r: 2.1,
          fill: 'var(--gold)',
        }),
      )
    }
    svg.appendChild(
      el('path', {
        d: 'M24,52 L12,90 L24,128',
        fill: 'none',
        stroke: 'var(--petal)',
        'stroke-width': 2.6,
        'stroke-linecap': 'round',
        opacity: '.75',
      }),
    )
    svg.appendChild(
      el('path', {
        d: 'M296,52 L308,90 L296,128',
        fill: 'none',
        stroke: 'var(--petal)',
        'stroke-width': 2.6,
        'stroke-linecap': 'round',
        opacity: '.75',
      }),
    )
    return
  }

  svg.appendChild(
    el('rect', {
      x: 86,
      y: 20,
      width: 148,
      height: 140,
      rx: 8,
      fill: 'var(--panel-text)',
      stroke: 'var(--line)',
      'stroke-width': 1.6,
    }),
  )
  svg.appendChild(
    el('rect', {
      x: 102,
      y: 36,
      width: 116,
      height: 52,
      rx: 5,
      fill: 'color-mix(in srgb, var(--accent) 14%, var(--surface))',
    }),
  )
  for (let i = 0; i < 26; i += 1) {
    svg.appendChild(
      el('circle', {
        cx: (102 + 20 + rand() * 76).toFixed(1),
        cy: (36 + 10 + rand() * 32).toFixed(1),
        r: (1.4 + rand() * 1.4).toFixed(1),
        fill: rand() < 0.14 ? 'var(--gold)' : 'var(--accent)',
        opacity: '.9',
      }),
    )
  }
  ;[0, 1, 2, 3, 4].forEach((i) => {
    svg.appendChild(
      el('rect', {
        x: 102,
        y: 100 + i * 12,
        width: i === 4 ? 62 : 116,
        height: 5,
        rx: 2.5,
        fill: 'var(--accent-soft)',
        opacity: '.55',
      }),
    )
  })
  svg.appendChild(el('circle', { cx: 238, cy: 38, r: 11, fill: 'var(--gold)', opacity: '.95' }))
  svg.appendChild(
    el('path', {
      d: 'M233,38 l4,4 l8,-9',
      fill: 'none',
      stroke: 'var(--panel)',
      'stroke-width': 2.4,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }),
  )
}

const html = `
  <header class="page-hero">
    <div class="wrap">
      <p class="eyebrow">Services</p>
      <h1>Support at every stage of a project</h1>
      <p class="lede">Projects can start at any of the three stages below, including after the data has been generated.</p>
    </div>
  </header>

  <section id="services" class="slide-edge">
    <div class="wrap">
      <div class="grid3">
        <div class="card reveal">
          <div class="banner">
            <svg class="art" data-art="design" viewBox="0 0 320 180" aria-hidden="true"></svg>
          </div>
          <h3>Design</h3>
          <ul>
            <li>Experimental and study design</li>
            <li>Feasibility and sample size assessment</li>
            <li>Platform and technology selection</li>
            <li>Analysis plans for grant applications</li>
          </ul>
        </div>
        <div class="card reveal">
          <div class="banner">
            <svg class="art" data-art="analysis" viewBox="0 0 320 180" aria-hidden="true"></svg>
          </div>
          <h3>Analysis</h3>
          <ul>
            <li>Quality control and preprocessing</li>
            <li>Cell type annotation and clustering</li>
            <li>Differential expression and abundance</li>
            <li>Pathway and enrichment analysis</li>
            <li>Integration across omics layers</li>
            <li>Re-analysis of public datasets</li>
          </ul>
        </div>
        <div class="card reveal">
          <div class="banner">
            <svg class="art" data-art="publication" viewBox="0 0 320 180" aria-hidden="true"></svg>
          </div>
          <h3>Publication</h3>
          <ul>
            <li>Figures prepared to journal specifications</li>
            <li>Methods and statistics sections</li>
            <li>Review of analytical claims before submission</li>
            <li>Responses to reviewer comments</li>
            <li>Revision and resubmission support</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="section-aster" aria-hidden="true"><svg class="aster-mark" viewBox="-60 -60 120 120"></svg></div>
  </section>

  <section id="deliverables" class="slide-edge">
    <div class="wrap">
      <p class="eyebrow reveal">Deliverables</p>
      <h2 class="reveal">What is provided at the end of a project</h2>
      <div class="panelbox after reveal">
        <table>
          <tr class="reveal"><td>Report</td><td>Written analysis report covering methods, results and analytical decisions.</td></tr>
          <tr class="reveal"><td>Figures</td><td>Vector files at journal resolution, with the underlying source data.</td></tr>
          <tr class="reveal"><td>Methods text</td><td>Methods and statistics sections written for direct inclusion in a manuscript.</td></tr>
          <tr class="reveal"><td>Code</td><td>Version-controlled repository, documented, with pinned package versions and fixed random seeds.</td></tr>
          <tr class="reveal"><td>Handover</td><td>A walkthrough session so that your team can rerun the analysis independently.</td></tr>
        </table>
      </div>
    </div>
    <div class="section-aster" aria-hidden="true"><svg class="aster-mark" viewBox="-60 -60 120 120"></svg></div>
  </section>

  <section id="repro" class="slide-edge">
    <div class="wrap">
      <p class="eyebrow reveal">Reproducibility</p>
      <h2 class="reveal">Analyses that can be rerun and verified</h2>
      <p class="lede reveal">Every analysis is delivered as code rather than as results alone. Package versions are pinned, environments are documented and random seeds are fixed, so that figures can be regenerated by your team, by a collaborator or by a reviewer.</p>
    </div>
    <div class="section-aster" aria-hidden="true"><svg class="aster-mark" viewBox="-60 -60 120 120"></svg></div>
  </section>

  <section id="scope" class="slide-edge">
    <div class="wrap">
      <p class="eyebrow reveal">Scope</p>
      <h2 class="reveal">Data types, tools and infrastructure</h2>
      <div class="panelbox after reveal">
        <table>
          <tr class="reveal"><td>Data types</td><td>Single cell, spatial, bulk transcriptomics, proteomics, lipidomics, metabolomics, and combinations of these.</td></tr>
          <tr class="reveal"><td>Platforms</td><td>10x Genomics, Xenium, Visium, mass spectrometry, multiplex imaging.</td></tr>
          <tr class="reveal"><td>Languages</td><td>R and Python.</td></tr>
          <tr class="reveal"><td>Infrastructure</td><td>Analyses can be run on our infrastructure or on yours, including institutional clusters.</td></tr>
        </table>
      </div>
    </div>
    <div class="section-aster" aria-hidden="true"><svg class="aster-mark" viewBox="-60 -60 120 120"></svg></div>
  </section>

  <section id="engagement" class="slide-edge">
    <div class="wrap">
      <p class="eyebrow reveal">Engagement</p>
      <h2 class="reveal">How a project is set up</h2>
      <div class="steps after">
        <div class="step reveal">
          <div class="num">01</div>
          <h3>First consultation</h3>
          <p>A first discussion to define the biological question, the data available or planned, and the objective. Free of charge, with the time it takes.</p>
        </div>
        <div class="step reveal">
          <div class="num">02</div>
          <h3>Written proposal</h3>
          <p>Scope, deliverables, timeline and price, agreed in writing before work begins. Fixed price for defined projects, hourly rate for advisory work.</p>
        </div>
        <div class="step reveal">
          <div class="num">03</div>
          <h3>Delivery</h3>
          <p>Report, figures, methods text and code repository, followed by a handover session with your team.</p>
        </div>
      </div>
    </div>
    <div class="section-aster" aria-hidden="true"><svg class="aster-mark" viewBox="-60 -60 120 120"></svg></div>
  </section>

  <section class="contact on-panel">
    <div class="wrap">
      <p class="eyebrow reveal">Next step</p>
      <h2 class="reveal">Request a first consultation</h2>
      <a class="mail reveal" href="mailto:contact@asteromics.com">contact@asteromics.com</a>
    </div>
  </section>
`

export function render(container) {
  container.innerHTML = html
}

export function mount() {
  document.querySelectorAll('#services .art[data-art]').forEach(paintServiceArt)
}

export function unmount() {}

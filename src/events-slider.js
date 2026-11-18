import { mark } from './layout.js'

const EVENTS = [
  {
    img: '/assets/events/impacthub-1.jpg',
    title: 'AsterOmics on stage',
    caption: 'FeWhale, Impact Hub Antwerp',
  },
  {
    img: '/assets/events/impacthub-2.jpg',
    title: 'Meeting founders',
    caption: 'FeWhale, Impact Hub Antwerp',
  },
  {
    img: '/assets/events/impacthub-3.jpg',
    title: 'The AsterOmics table',
    caption: 'FeWhale, Impact Hub Antwerp',
  },
  {
    img: '/assets/events/impacthub-4.jpg',
    title: 'FeWhale',
    caption: 'Impact Hub Antwerp',
  },
  {
    img: '/assets/events/impacthub-5.jpg',
    title: 'Impact Hub Antwerp',
    caption: 'SheSells, connections and feedback',
  },
]

/**
 * Initialise the horizontal events photo slider.
 * Expects #slider, #track, #dots, #s-prev, #s-next in the DOM.
 */
export function initEventsSlider() {
  const track = document.getElementById('track')
  const dots = document.getElementById('dots')
  const prev = document.getElementById('s-prev')
  const next = document.getElementById('s-next')
  const box = document.getElementById('slider')
  if (!track || !dots || !box || !EVENTS.length) return

  let timer = null
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  EVENTS.forEach((ev, k) => {
    const fig = document.createElement('figure')
    fig.className = 'slide'

    const shot = document.createElement('div')
    shot.className = 'shot'

    const ph = document.createElement('div')
    ph.className = 'ph'
    const m = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    m.setAttribute('viewBox', '-60 -60 120 120')
    m.setAttribute('aria-hidden', 'true')
    mark(m, false)
    ph.appendChild(m)
    shot.appendChild(ph)

    if (ev.img) {
      const img = document.createElement('img')
      img.alt = `${ev.title || 'Event'}${ev.caption ? `, ${ev.caption}` : ''}`
      img.loading = 'lazy'
      img.onload = () => ph.remove()
      img.onerror = () => img.remove()
      img.src = ev.img
      shot.insertBefore(img, ph)
    }

    fig.appendChild(shot)

    const cap = document.createElement('figcaption')
    cap.innerHTML = `<b>${ev.title || ''}</b>${ev.caption || ''}`
    fig.appendChild(cap)
    track.appendChild(fig)

    const d = document.createElement('button')
    d.type = 'button'
    d.className = 'dot'
    d.setAttribute('aria-label', `Photo ${k + 1}`)
    d.addEventListener('click', () => {
      goTo(k)
      stop()
      start()
    })
    dots.appendChild(d)
  })

  function step() {
    const first = track.firstElementChild
    return first ? first.getBoundingClientRect().width + 16 : track.clientWidth
  }

  function index() {
    return Math.round(track.scrollLeft / step())
  }

  function goTo(k) {
    const max = EVENTS.length - 1
    track.scrollLeft = Math.max(0, Math.min(k, max)) * step()
  }

  function syncDots() {
    const i = index()
    ;[...dots.children].forEach((d, n) => {
      d.setAttribute('aria-current', n === i ? 'true' : 'false')
    })
  }

  function advance() {
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4
    atEnd ? goTo(0) : goTo(index() + 1)
  }

  function start() {
    if (!reduced && !timer) timer = setInterval(advance, 5200)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  prev?.addEventListener('click', () => {
    goTo(index() - 1)
    stop()
    start()
  })
  next?.addEventListener('click', () => {
    advance()
    stop()
    start()
  })
  track.addEventListener('scroll', syncDots, { passive: true })
  box.addEventListener('mouseenter', stop)
  box.addEventListener('mouseleave', start)
  box.addEventListener('pointerdown', stop)
  box.addEventListener('touchstart', stop, { passive: true })
  box.addEventListener('focusin', stop)
  window.addEventListener('resize', syncDots)
  syncDots()

  if (window.IntersectionObserver) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? start() : stop()))
      },
      { threshold: 0.25 },
    )
    io.observe(box)
  } else {
    start()
  }
}

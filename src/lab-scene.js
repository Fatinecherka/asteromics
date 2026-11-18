import gsap from 'gsap'

/**
 * Lab experience state machine: entrance → map → station.
 * Handles beaker open/close and reduced-motion fallbacks.
 *
 * @param {HTMLElement | null} root
 * @param {{
 *   onStationEnter?: (id: string) => void
 *   onStationLeave?: (id: string) => void
 * }} [hooks]
 */
export function createLabScene(root, hooks = {}) {
  if (!root) return { destroy() {} }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const entrance = root.querySelector('#lab-entrance')
  const chrome = root.querySelector('#lab-chrome')
  const map = root.querySelector('#lab-map')
  const panels = [...root.querySelectorAll('[data-station-panel]')]

  /** @type {string} */
  let phase = 'entrance'
  /** @type {string} */
  let station = ''
  /** @type {string | null} */
  let openBeaker = null
  /** @type {gsap.core.Tween | gsap.core.Timeline | null} */
  let activeTween = null

  function setPhase(next, nextStation = '') {
    const prevStation = station
    phase = next
    station = nextStation
    root.dataset.phase = next
    root.dataset.station = nextStation

    if (prevStation && prevStation !== nextStation) {
      hooks.onStationLeave?.(prevStation)
      closeAllBeakers(true)
    }
    if (nextStation && nextStation !== prevStation) {
      hooks.onStationEnter?.(nextStation)
    }

    syncVisibility()
    syncStationButtons()
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  function syncVisibility() {
    const showChrome = phase !== 'entrance'
    const showMap = phase === 'map'
    const showEntrance = phase === 'entrance'

    if (chrome) chrome.hidden = !showChrome
    if (map) {
      map.hidden = !showMap
      if (showMap) gsap.set(map, { clearProps: 'opacity,visibility,transform' })
    }
    if (entrance) {
      if (!showEntrance) gsap.set(entrance, { clearProps: 'opacity,visibility,transform' })
      entrance.hidden = !showEntrance
    }

    panels.forEach((panel) => {
      const id = panel.getAttribute('data-station-panel')
      const show = phase === 'station' && id === station
      if (!show) gsap.set(panel, { clearProps: 'opacity,visibility,transform' })
      panel.hidden = !show
      if (show) gsap.set(panel, { clearProps: 'opacity,visibility,transform' })
    })
  }

  function syncStationButtons() {
    root.querySelectorAll('[data-go-station]').forEach((btn) => {
      const id = btn.getAttribute('data-go-station')
      const active = phase === 'station' && id === station
      btn.classList.toggle('is-active', active)
      if (active) btn.setAttribute('aria-current', 'true')
      else btn.removeAttribute('aria-current')
    })

    const mapBtn = root.querySelector('[data-go-map]')
    if (mapBtn) {
      mapBtn.classList.toggle('is-active', phase === 'map')
      if (phase === 'map') mapBtn.setAttribute('aria-current', 'true')
      else mapBtn.removeAttribute('aria-current')
    }
  }

  function killTween() {
    activeTween?.kill?.()
    activeTween = null
  }

  function enterLab() {
    if (phase !== 'entrance') return
    killTween()

    if (reduced || !entrance) {
      setPhase('map')
      if (map && !reduced) {
        gsap.fromTo(map, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' })
      }
      return
    }

    activeTween = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete() {
        activeTween = null
      },
    })

    const door = entrance.querySelector('[data-door] .lab-entrance-door-panel')
      || entrance.querySelector('.lab-entrance-door-panel')

    activeTween
      .to(door, {
        rotateY: -68,
        duration: 0.85,
        transformOrigin: 'left center',
      })
      .to(
        entrance.querySelector('.lab-entrance-copy'),
        { autoAlpha: 0, y: -12, duration: 0.45 },
        0.2,
      )
      .to(entrance, { autoAlpha: 0, duration: 0.35 }, 0.55)
      .add(() => {
        gsap.set(entrance, { clearProps: 'opacity,visibility,transform' })
        setPhase('map')
        if (map) {
          gsap.fromTo(map, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' })
        }
      })
  }

  function goToMap() {
    if (phase === 'map') return
    const prev = station
    killTween()

    if (reduced) {
      setPhase('map')
      return
    }

    const leaving = panels.find((p) => p.getAttribute('data-station-panel') === prev)
    activeTween = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete() {
        activeTween = null
      },
    })

    if (leaving && !leaving.hidden) {
      activeTween.to(leaving, { autoAlpha: 0, y: 16, duration: 0.28 }, 0)
    }

    activeTween.add(() => {
      setPhase('map')
      if (leaving) gsap.set(leaving, { clearProps: 'opacity,transform' })
      if (map) {
        gsap.fromTo(map, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' })
      }
    })
  }

  function goToStation(id) {
    if (!id) return
    if (phase === 'station' && station === id) return
    const panel = panels.find((p) => p.getAttribute('data-station-panel') === id)
    if (!panel) return

    const prevStation = station
    const prevPanel = panels.find((p) => p.getAttribute('data-station-panel') === prevStation)
    const leavingMap = phase === 'map'
    killTween()

    if (reduced) {
      setPhase('station', id)
      return
    }

    activeTween = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete() {
        activeTween = null
      },
    })

    if (leavingMap && map && !map.hidden) {
      activeTween.to(map, { autoAlpha: 0, y: 12, duration: 0.28 }, 0)
    } else if (prevPanel && prevPanel !== panel && !prevPanel.hidden) {
      activeTween.to(prevPanel, { autoAlpha: 0, y: 16, duration: 0.28 }, 0)
    }

    activeTween.add(() => {
      if (chrome) chrome.hidden = false
      if (map) {
        map.hidden = true
        gsap.set(map, { clearProps: 'opacity,visibility,transform' })
      }
      if (entrance) entrance.hidden = true
      panels.forEach((p) => {
        p.hidden = p !== panel
        if (p !== panel) gsap.set(p, { clearProps: 'opacity,visibility,transform' })
      })

      if (prevStation && prevStation !== id) {
        hooks.onStationLeave?.(prevStation)
        closeAllBeakers(true)
      }

      phase = 'station'
      station = id
      root.dataset.phase = 'station'
      root.dataset.station = id
      syncStationButtons()
      hooks.onStationEnter?.(id)

      gsap.set(panel, { autoAlpha: 0, y: 22 })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })

    activeTween.to(panel, {
      autoAlpha: 1,
      y: 0,
      duration: 0.45,
      ease: 'power2.out',
    })
  }

  function closeAllBeakers(instant = false) {
    root.querySelectorAll('.lab-beaker').forEach((el) => {
      setBeakerOpen(el, false, instant)
    })
    openBeaker = null
  }

  /**
   * @param {Element} beaker
   * @param {boolean} open
   * @param {boolean} [instant]
   */
  function setBeakerOpen(beaker, open, instant = false) {
    const id = beaker.getAttribute('data-beaker')
    const hit = beaker.querySelector('.lab-beaker-hit')
    const panel = beaker.querySelector('.lab-beaker-panel')
    const stopper = beaker.querySelector('.lab-beaker-stopper')
    const liquid = beaker.querySelector('.lab-beaker-liquid')

    beaker.classList.toggle('is-open', open)
    hit?.setAttribute('aria-expanded', open ? 'true' : 'false')

    if (!panel) return

    if (instant || reduced) {
      panel.hidden = !open
      if (stopper) gsap.set(stopper, { clearProps: 'y,rotation' })
      if (liquid) gsap.set(liquid, { clearProps: 'scaleY' })
      if (open) {
        const inner = panel.querySelector('.lab-beaker-panel-inner')
        inner?.focus?.({ preventScroll: true })
      }
      return
    }

    if (open) {
      panel.hidden = false
      const inner = panel.querySelector('.lab-beaker-panel-inner')
      gsap.fromTo(
        inner,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          onComplete() {
            inner?.focus?.({ preventScroll: true })
          },
        },
      )
      if (stopper) {
        gsap.to(stopper, { y: -18, rotation: -12, duration: 0.4, ease: 'power2.out' })
      }
      if (liquid) {
        gsap.fromTo(liquid, { scaleY: 0.55 }, { scaleY: 1, duration: 0.5, ease: 'power2.out' })
      }
      return
    }

    if (stopper) gsap.to(stopper, { y: 0, rotation: 0, duration: 0.28, ease: 'power2.in' })
    if (liquid) gsap.to(liquid, { scaleY: 0.72, duration: 0.28, ease: 'power2.in' })
    const inner = panel.querySelector('.lab-beaker-panel-inner')
    if (inner) {
      gsap.to(inner, {
        autoAlpha: 0,
        y: 8,
        duration: 0.22,
        ease: 'power2.in',
        onComplete() {
          panel.hidden = true
          gsap.set(inner, { clearProps: 'opacity,transform' })
        },
      })
    } else {
      panel.hidden = true
    }
  }

  function toggleBeaker(id) {
    const beaker = root.querySelector(`.lab-beaker[data-beaker="${id}"]`)
    if (!beaker) return

    if (openBeaker && openBeaker !== id) {
      const prev = root.querySelector(`.lab-beaker[data-beaker="${openBeaker}"]`)
      if (prev) setBeakerOpen(prev, false)
    }

    if (openBeaker === id) {
      setBeakerOpen(beaker, false)
      openBeaker = null
      return
    }

    setBeakerOpen(beaker, true)
    openBeaker = id
  }

  function onClick(event) {
    const enter = event.target.closest?.('[data-enter-lab]')
    if (enter) {
      event.preventDefault()
      enterLab()
      return
    }

    const toMap = event.target.closest?.('[data-go-map]')
    if (toMap) {
      event.preventDefault()
      goToMap()
      return
    }

    const toStation = event.target.closest?.('[data-go-station]')
    if (toStation) {
      event.preventDefault()
      goToStation(toStation.getAttribute('data-go-station') || '')
      return
    }

    const open = event.target.closest?.('[data-open-beaker]')
    if (open) {
      event.preventDefault()
      toggleBeaker(open.getAttribute('data-open-beaker') || '')
      return
    }

    const close = event.target.closest?.('[data-close-beaker]')
    if (close) {
      event.preventDefault()
      const id = close.getAttribute('data-close-beaker') || ''
      const beaker = root.querySelector(`.lab-beaker[data-beaker="${id}"]`)
      if (beaker) setBeakerOpen(beaker, false)
      if (openBeaker === id) openBeaker = null
    }
  }

  function onKeydown(event) {
    if (event.key !== 'Escape' || !openBeaker) return
    const beaker = root.querySelector(`.lab-beaker[data-beaker="${openBeaker}"]`)
    const hit = beaker?.querySelector('.lab-beaker-hit')
    if (beaker) setBeakerOpen(beaker, false)
    openBeaker = null
    hit?.focus?.({ preventScroll: true })
  }

  function onPointerDown(event) {
    if (!openBeaker) return
    const inside = event.target.closest?.('.lab-beaker.is-open')
    if (inside) return
    const beaker = root.querySelector(`.lab-beaker[data-beaker="${openBeaker}"]`)
    if (beaker) setBeakerOpen(beaker, false)
    openBeaker = null
  }

  root.addEventListener('click', onClick)
  root.addEventListener('keydown', onKeydown)
  root.addEventListener('pointerdown', onPointerDown)
  syncVisibility()
  syncStationButtons()

  return {
    destroy() {
      killTween()
      root.removeEventListener('click', onClick)
      root.removeEventListener('keydown', onKeydown)
      root.removeEventListener('pointerdown', onPointerDown)
      if (station) hooks.onStationLeave?.(station)
      closeAllBeakers(true)
    },
  }
}

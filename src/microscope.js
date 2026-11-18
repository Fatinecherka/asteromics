/**
 * Circular microscope field-of-view with depth-of-field cell layers.
 * Day → brightfield; night → darkfield.
 */

const LAYER_COUNT = 8
const CELL_COUNT = 78
const FOCUS_BLUR_SCALE = 4.2
const OFFSCREEN_SCALE = 0.42

function rng(seed) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(r) {
  return (r() + r() + r() + r() - 2) / 1.4
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v))
}

function createCells(seed = 2026) {
  const r = rng(seed)
  const cells = []

  for (let i = 0; i < CELL_COUNT; i++) {
    const kindRoll = r()
    const kind = kindRoll < 0.55 ? 'round' : kindRoll < 0.82 ? 'oval' : 'cluster'
    const depth = r()
    const radius = 4 + r() * 14 + (kind === 'cluster' ? 4 : 0)
    const angle = r() * Math.PI * 2
    const rad = Math.sqrt(r()) * 0.92

    cells.push({
      x: Math.cos(angle) * rad,
      y: Math.sin(angle) * rad,
      depth,
      radius,
      kind,
      aspect: 0.65 + r() * 0.7,
      rot: r() * Math.PI * 2,
      nucleus: 0.28 + r() * 0.28,
      driftPhase: r() * Math.PI * 2,
      driftAmp: 0.002 + r() * 0.006,
      driftSpeed: 0.15 + r() * 0.45,
      tint: r(),
      bud: r() > 0.78,
    })
  }

  return cells
}

function layerIndex(depth) {
  return clamp(Math.floor(depth * LAYER_COUNT), 0, LAYER_COUNT - 1)
}

function drawCell(ctx, cell, mode, cx, cy, scale) {
  const x = cx + cell.x * scale
  const y = cy + cell.y * scale
  const r = cell.radius * (scale / 280)

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(cell.rot)

  if (mode === 'brightfield') {
    drawBrightfield(ctx, cell, r)
  } else {
    drawDarkfield(ctx, cell, r)
  }

  ctx.restore()
}

function drawBrightfield(ctx, cell, r) {
  const membrane = `rgba(50, 110, 100, ${0.28 + cell.tint * 0.2})`
  const fill = `rgba(80, 150, 135, ${0.16 + cell.tint * 0.12})`
  const nucleus = `rgba(35, 95, 85, ${0.4 + cell.tint * 0.22})`
  const rim = 'rgba(255, 252, 245, 0.6)'

  if (cell.kind === 'cluster') {
    const n = 3 + Math.floor(cell.tint * 3)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const ox = Math.cos(a) * r * 0.55
      const oy = Math.sin(a) * r * 0.55
      ellipseCell(ctx, ox, oy, r * 0.55, r * 0.48, fill, membrane, rim, nucleus, r * 0.2)
    }
    return
  }

  const ry = cell.kind === 'oval' ? r * cell.aspect : r
  ellipseCell(ctx, 0, 0, r, ry, fill, membrane, rim, nucleus, r * cell.nucleus)

  if (cell.bud) {
    ellipseCell(ctx, r * 0.85, -r * 0.1, r * 0.38, r * 0.34, fill, membrane, rim, nucleus, r * 0.12)
  }
}

function ellipseCell(ctx, x, y, rx, ry, fill, stroke, rim, nucleus, nr) {
  ctx.beginPath()
  ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.1
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(x, y, Math.max(0.4, rx * 0.92), Math.max(0.4, ry * 0.92), 0, 0, Math.PI * 2)
  ctx.strokeStyle = rim
  ctx.lineWidth = 0.7
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(x - rx * 0.15, y - ry * 0.1, Math.max(0.4, nr), 0, Math.PI * 2)
  ctx.fillStyle = nucleus
  ctx.fill()
}

function drawDarkfield(ctx, cell, r) {
  const glow = cell.tint > 0.5
    ? [143, 191, 182]
    : cell.tint > 0.25
      ? [224, 179, 85]
      : [95, 170, 160]

  const [cr, cg, cb] = glow
  const ry = cell.kind === 'oval' ? r * cell.aspect : r

  ctx.globalCompositeOperation = 'lighter'

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.6)
  grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.55)`)
  grad.addColorStop(0.45, `rgba(${cr},${cg},${cb},0.18)`)
  grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.6, ry * 1.6, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(0, 0, r, ry, 0, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.75)`
  ctx.lineWidth = 1.2
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(-r * 0.12, -ry * 0.08, r * cell.nucleus, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${Math.min(255, cr + 40)},${Math.min(255, cg + 40)},${Math.min(255, cb + 40)},0.9)`
  ctx.fill()

  if (cell.kind === 'cluster') {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4
      ctx.beginPath()
      ctx.arc(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.55, r * 0.28, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${cr},${cg},${cb},0.45)`
      ctx.fill()
    }
  }

  ctx.globalCompositeOperation = 'source-over'
}

function paintBackground(ctx, w, h, mode) {
  if (mode === 'brightfield') {
    const g = ctx.createRadialGradient(w * 0.5, h * 0.48, w * 0.05, w * 0.5, h * 0.5, w * 0.55)
    g.addColorStop(0, '#f2f5f2')
    g.addColorStop(0.55, '#e2eae6')
    g.addColorStop(1, '#c5d2cc')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    // mild Kohler unevenness
    ctx.fillStyle = 'rgba(150, 170, 130, 0.05)'
    ctx.beginPath()
    ctx.ellipse(w * 0.62, h * 0.38, w * 0.22, h * 0.18, 0.3, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  const g = ctx.createRadialGradient(w * 0.5, h * 0.48, 0, w * 0.5, h * 0.5, w * 0.55)
  g.addColorStop(0, '#1a2825')
  g.addColorStop(0.6, '#0f1816')
  g.addColorStop(1, '#060a09')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function makeGrainTile(size = 128, amount = 0.08) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const g = c.getContext('2d')
  const img = g.createImageData(size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = 128 + (Math.random() - 0.5) * 255 * amount * 4
    d[i] = n
    d[i + 1] = n
    d[i + 2] = n
    d[i + 3] = 40
  }
  g.putImageData(img, 0, 0)
  return c
}

export function createMicroscope(canvas, options = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cells = createCells(options.seed ?? 2026)
  const labelEl = options.labelEl ?? null
  const focusInput = options.focusInput ?? null

  let mode = options.mode ?? 'brightfield'
  let focus = reducedMotion ? 0.55 : 0
  let targetFocus = focus
  let pointer = { x: 0, y: 0 }
  let scrollPan = { x: 0, y: 0 }
  let running = false
  let visible = true
  let raf = 0
  let t0 = performance.now()
  const grainTile = makeGrainTile(128, 0.1)

  const layers = Array.from({ length: LAYER_COUNT }, () => {
    const c = document.createElement('canvas')
    return { canvas: c, ctx: c.getContext('2d') }
  })

  const ctx = canvas.getContext('2d', { alpha: false })

  function setMode(next) {
    mode = next
    if (labelEl) {
      const tag = mode === 'brightfield' ? 'Brightfield' : 'Darkfield'
      labelEl.textContent = `AsterOmics · ${tag}`
    }
    if (!running) render(performance.now())
  }

  function setFocus(v) {
    targetFocus = clamp(v, 0, 1)
    if (reducedMotion) {
      focus = targetFocus
      render(performance.now())
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.floor(rect.width * dpr))
    const h = Math.max(1, Math.floor(rect.height * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }

    const lw = Math.max(1, Math.floor(w * OFFSCREEN_SCALE))
    const lh = Math.max(1, Math.floor(h * OFFSCREEN_SCALE))
    for (const layer of layers) {
      if (layer.canvas.width !== lw || layer.canvas.height !== lh) {
        layer.canvas.width = lw
        layer.canvas.height = lh
      }
    }

  }

  function updateCells(now) {
    if (reducedMotion) return
    const t = (now - t0) / 1000
    for (const cell of cells) {
      const jig = 0.00035 / Math.sqrt(Math.max(0.2, cell.radius / 10))
      cell.x += Math.sin(t * cell.driftSpeed + cell.driftPhase) * cell.driftAmp * 0.016
        + gauss(() => Math.random()) * jig
      cell.y += Math.cos(t * cell.driftSpeed * 0.85 + cell.driftPhase) * cell.driftAmp * 0.016
        + gauss(() => Math.random()) * jig
      cell.rot += 0.0004 * cell.driftSpeed

      // soft wrap inside unit circle
      const d = Math.hypot(cell.x, cell.y)
      if (d > 1.05) {
        cell.x *= 0.96
        cell.y *= 0.96
      }
    }
  }

  function render(now) {
    resize()
    const w = canvas.width
    const h = canvas.height
    const cx = w * 0.5 + pointer.x * w * 0.03 + scrollPan.x
    const cy = h * 0.5 + pointer.y * h * 0.03 + scrollPan.y
    const scale = Math.min(w, h) * 0.48

    if (!reducedMotion) {
      focus += (targetFocus - focus) * 0.08
    }

    paintBackground(ctx, w, h, mode)

    for (const layer of layers) {
      layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
    }

    const lw = layers[0].canvas.width
    const lh = layers[0].canvas.height
    const lcx = (cx / w) * lw
    const lcy = (cy / h) * lh
    const lscale = scale * OFFSCREEN_SCALE

    for (const cell of cells) {
      const li = layerIndex(cell.depth)
      drawCell(layers[li].ctx, cell, mode, lcx, lcy, lscale)
    }

    for (let i = 0; i < LAYER_COUNT; i++) {
      const layerDepth = (i + 0.5) / LAYER_COUNT
      const defocus = Math.abs(layerDepth - focus)
      const blur = defocus * FOCUS_BLUR_SCALE
      ctx.save()
      if (blur > 0.15) {
        ctx.filter = `blur(${blur}px)`
      }
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(layers[i].canvas, 0, 0, w, h)
      ctx.restore()
    }

    ctx.save()
    ctx.globalAlpha = mode === 'brightfield' ? 0.18 : 0.28
    ctx.globalCompositeOperation = 'overlay'
    const pattern = ctx.createPattern(grainTile, 'repeat')
    if (pattern) {
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, w, h)
    }
    ctx.restore()
  }

  function frame(now) {
    if (!running) return
    updateCells(now)
    render(now)
    raf = requestAnimationFrame(frame)
  }

  function start() {
    if (running || reducedMotion) {
      render(performance.now())
      return
    }
    running = true
    t0 = performance.now()
    raf = requestAnimationFrame(frame)
  }

  function stop() {
    running = false
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  function onPointer(e) {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
  }

  function onScroll() {
    const y = window.scrollY || 0
    scrollPan.x = Math.sin(y * 0.0012) * 8
    scrollPan.y = y * 0.04
    if (reducedMotion) render(performance.now())
  }

  function onVisibility() {
    visible = document.visibilityState === 'visible'
    if (visible && !reducedMotion) start()
    else stop()
  }

  const hero = canvas.closest('.hero') || canvas
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!reducedMotion) start()
        else render(performance.now())
      } else {
        stop()
      }
    },
    { threshold: 0.05 },
  )
  io.observe(hero)

  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', () => render(performance.now()))

  if (focusInput) {
    focusInput.addEventListener('input', () => {
      setFocus(Number(focusInput.value) / 100)
    })
  }

  setMode(mode)
  resize()
  render(performance.now())
  if (!reducedMotion) start()

  return {
    setMode,
    setFocus,
    getFocus: () => focus,
    start,
    stop,
    destroy() {
      stop()
      io.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
    },
  }
}

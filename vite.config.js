import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { copyFileSync } from 'node:fs'

/**
 * Keep one global CSS asset in <head> (with preload), and defer page JS to </body>.
 */
function globalCssFirst() {
  return {
    name: 'global-css-first',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const styles = []
        const modules = []

        let next = html.replace(
          /<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi,
          (tag) => {
            if (!tag.includes('/assets/')) return tag
            styles.push(tag)
            return ''
          },
        )

        next = next.replace(
          /<link\b[^>]*\brel=["']preload["'][^>]*\bas=["']style["'][^>]*>/gi,
          '',
        )

        next = next.replace(
          /<link\b[^>]*\brel=["']modulepreload["'][^>]*>/gi,
          (tag) => {
            modules.push(tag)
            return ''
          },
        )

        next = next.replace(
          /<script\b[^>]*\btype=["']module["'][^>]*><\/script>/gi,
          (tag) => {
            modules.push(tag)
            return ''
          },
        )

        next = next.replace(/[ \t]*\n(?=[ \t]*\n)/g, '\n')

        if (styles.length) {
          const preloads = styles.map((tag) => {
            const href = tag.match(/\bhref=(["'])(.*?)\1/i)?.[2]
            if (!href) return ''
            const crossorigin = /\bcrossorigin\b/i.test(tag) ? ' crossorigin' : ''
            return `<link rel="preload" href="${href}" as="style"${crossorigin}>`
          }).filter(Boolean)

          next = next.replace(
            '</head>',
            `  ${[...preloads, ...styles].join('\n  ')}\n</head>`,
          )
        }

        if (modules.length) {
          next = next.replace(
            '</body>',
            `  ${modules.join('\n  ')}\n</body>`,
          )
        }

        return next
      },
    },
  }
}

/** Copy index.html → 404.html so GitHub Pages deep links load the SPA. */
function spaFallback() {
  return {
    name: 'spa-fallback',
    closeBundle() {
      const index = resolve(__dirname, 'dist/index.html')
      const fallback = resolve(__dirname, 'dist/404.html')
      copyFileSync(index, fallback)
    },
  }
}

export default defineConfig({
  base: '/',
  appType: 'spa',
  plugins: [globalCssFirst(), spaFallback()],
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        assetFileNames: (asset) => {
          const name = asset.names?.[0] ?? asset.name ?? ''
          if (/\.css$/i.test(name)) return 'assets/styles-[hash][extname]'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})

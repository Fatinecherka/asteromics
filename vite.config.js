import { defineConfig } from 'vite'
import { resolve } from 'node:path'

/**
 * Keep one global CSS asset in <head> (with preload), and defer page JS to </body>.
 * Styles are shared across all HTML entries so navigations hit the same cached URL.
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

        // Drop any prior CSS preloads; we regenerate them from the final asset URL.
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

export default defineConfig({
  base: '/',
  plugins: [globalCssFirst()],
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        events: resolve(__dirname, 'events.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
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

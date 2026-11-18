const BUTTONDOWN_USERNAME = 'asteromics'
const FRAME_NAME = 'bd-newsletter-frame'

/**
 * Mount a Buttondown newsletter signup into `container`.
 * Posts into a hidden iframe so the visitor stays on this page.
 * @param {HTMLElement | null} container
 */
export function mountNewsletter(container) {
  if (!container) return

  const configured = BUTTONDOWN_USERNAME && BUTTONDOWN_USERNAME !== 'YOUR_BUTTONDOWN_USERNAME'
  const action = configured
    ? `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`
    : '#'

  container.innerHTML = `
    <div class="newsletter">
      <p class="eyebrow">Newsletter</p>
      <h2>Notes on omics analysis</h2>
      <p class="lede">Occasional articles and updates on single-cell, spatial omics, and reproducible pipelines. No spam.</p>
      <form
        class="newsletter-form"
        action="${action}"
        method="post"
        target="${FRAME_NAME}"
      >
        <input type="hidden" name="embed" value="1">
        <label class="newsletter-label" for="bd-email">Email</label>
        <div class="newsletter-row">
          <input
            type="email"
            name="email"
            id="bd-email"
            required
            autocomplete="email"
            placeholder="you@university.edu"
            ${configured ? '' : 'disabled'}
          >
          <button type="submit" class="newsletter-submit" ${configured ? '' : 'disabled'}>
            Subscribe
          </button>
        </div>
        ${
          configured
            ? `<p class="newsletter-note">You can unsubscribe at any time.</p>`
            : `<p class="newsletter-note newsletter-note--warn">Newsletter signup will go live once the Buttondown account is connected.</p>`
        }
      </form>
      <iframe
        class="newsletter-frame"
        name="${FRAME_NAME}"
        title="Buttondown signup"
        hidden
        aria-hidden="true"
        tabindex="-1"
      ></iframe>
    </div>
  `

  if (!configured) return

  const form = container.querySelector('.newsletter-form')
  const submit = container.querySelector('.newsletter-submit')
  if (!form || !submit) return

  form.addEventListener('submit', (event) => {
    if (!form.checkValidity()) {
      event.preventDefault()
      form.reportValidity()
      return
    }

    submit.disabled = true
    submit.textContent = 'Subscribing…'

    // Let the native POST reach the hidden iframe, then show in-page success.
    window.setTimeout(() => {
      const thanks = document.createElement('p')
      thanks.className = 'newsletter-thanks'
      thanks.setAttribute('role', 'status')
      thanks.setAttribute('aria-live', 'polite')
      thanks.textContent =
        'Thanks — check your inbox to confirm your subscription.'
      form.replaceWith(thanks)
    }, 0)
  })
}

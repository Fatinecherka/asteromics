const BUTTONDOWN_USERNAME = 'asteromics'

/**
 * Mount a Buttondown newsletter signup into `container`.
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
      >
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
    </div>
  `
}

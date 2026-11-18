const WEB3FORMS_ACCESS_KEY = '49060946-bbd1-41d1-842f-824f4893c37a'
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

/**
 * Mount a Web3Forms contact form into `container`.
 * @param {HTMLElement | null} container
 */
export function mountContactForm(container) {
  if (!container) return

  container.innerHTML = `
    <form class="contact-form" id="consultation-form" novalidate>
      <input type="hidden" name="access_key" value="${WEB3FORMS_ACCESS_KEY}">
      <input type="hidden" name="subject" value="AsterOmics consultation request">
      <input type="checkbox" name="botcheck" class="contact-form-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">

      <div class="contact-form-field">
        <label class="contact-form-label" for="cf-name">Name</label>
        <input
          type="text"
          name="name"
          id="cf-name"
          required
          autocomplete="name"
          placeholder="Your name"
        >
      </div>

      <div class="contact-form-field">
        <label class="contact-form-label" for="cf-email">Email</label>
        <input
          type="email"
          name="email"
          id="cf-email"
          required
          autocomplete="email"
          placeholder="you@university.edu"
        >
      </div>

      <div class="contact-form-field">
        <label class="contact-form-label" for="cf-message">Message</label>
        <textarea
          name="message"
          id="cf-message"
          required
          rows="5"
          placeholder="Biological question, data available or planned, and deadline"
        ></textarea>
      </div>

      <button type="submit" class="contact-form-submit">Send request</button>
      <p class="contact-form-status" id="cf-status" role="status" aria-live="polite" hidden></p>
    </form>
  `

  const form = container.querySelector('#consultation-form')
  const status = container.querySelector('#cf-status')
  const submit = container.querySelector('.contact-form-submit')
  if (!form || !status || !submit) return

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    status.hidden = true
    status.classList.remove('contact-form-status--error', 'contact-form-status--ok')
    submit.disabled = true
    submit.textContent = 'Sending…'

    try {
      const payload = Object.fromEntries(new FormData(form).entries())
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to send right now.')
      }

      container.innerHTML = `
        <p class="contact-form-thanks reveal">
          Thank you — your request was sent. We will reply by email.
        </p>
      `
    } catch (error) {
      status.hidden = false
      status.classList.add('contact-form-status--error')
      status.textContent =
        error instanceof Error && error.message
          ? error.message
          : 'Something went wrong. Please try again or email us directly.'
      submit.disabled = false
      submit.textContent = 'Send request'
    }
  })
}

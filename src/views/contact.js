import { mountContactForm } from '../contact-form.js'
import { mountNewsletter } from '../newsletter.js'

export const meta = {
  title: 'Contact | AsterOmics',
  description: 'Contact AsterOmics for a first consultation on your omics analysis project.',
}

export const id = 'contact'

const html = `
  <section class="contact on-panel page-contact" id="contact">
    <div class="wrap">
      <p class="eyebrow reveal">Contact</p>
      <h1 class="reveal">Request a first consultation</h1>
      <p class="lede reveal">Please include the biological question, the data available or planned, and your deadline. If it is not something we can help with, we will say so.</p>
      <div id="contact-form" class="reveal"></div>
      <a class="mail reveal" href="mailto:contact@asteromics.com">contact@asteromics.com</a>
    </div>
  </section>

  <section id="newsletter-section" class="slide-edge">
    <div class="wrap">
      <div id="newsletter" class="reveal"></div>
    </div>
  </section>
`

export function render(container) {
  container.innerHTML = html
}

export function mount() {
  mountContactForm(document.getElementById('contact-form'))
  mountNewsletter(document.getElementById('newsletter'))
}

export function unmount() {}

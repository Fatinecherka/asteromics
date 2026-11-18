import { initChrome } from '../layout.js'
import { initScroll } from '../scroll.js'
import { mountNewsletter } from '../newsletter.js'

initChrome('contact')
mountNewsletter(document.getElementById('newsletter'))
initScroll()

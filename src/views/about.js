export const meta = {
  title: 'About | AsterOmics',
  description:
    'AsterOmics is led by Fatine Cherkaoui, PhD in Biomedical Sciences, with training in both laboratory work and bioinformatics.',
}

export const id = 'about'

const html = `
  <header class="page-hero">
    <div class="wrap">
      <p class="eyebrow">Expertise</p>
      <h1>Experimental and computational</h1>
      <p class="lede">Analyses carried out by someone who knows what happens at the bench.</p>
    </div>
  </header>

  <section id="about" class="slide-edge">
    <div class="wrap">
      <div class="about">
        <div>
          <div class="who reveal">
            <span class="av">
              <img src="/assets/portrait.jpg" alt="Portrait of Fatine Cherkaoui" width="120" height="120">
            </span>
            <span>
              <span class="nm">Fatine Cherkaoui</span><br>
              <span class="rl">PhD in Biomedical Sciences · AsterOmics</span>
            </span>
          </div>
          <p class="reveal">AsterOmics is led by Fatine Cherkaoui, PhD in Biomedical Sciences, with training in both laboratory work and bioinformatics.</p>
          <p class="reveal">Analyses are carried out by a person who knows what happens at the bench. Sample preparation, batch structure and technical artefacts are assessed as part of the analysis rather than treated as background noise.</p>
          <p class="reveal">We work with academic laboratories, core facilities and companies, on data they generate and on public datasets.</p>
        </div>
        <div class="facts reveal">
          <div>Fatine Cherkaoui</div>
          <div><span>PhD in Biomedical Sciences</span></div>
          <div class="k"><span>Working languages</span></div>
          <div>English, Français</div>
          <div class="k"><span>Location</span></div>
          <div>Belgium, working remotely</div>
          <div class="k"><span>Contact</span></div>
          <div><a class="inline-link" href="mailto:contact@asteromics.com">contact@asteromics.com</a></div>
        </div>
      </div>
    </div>
    <div class="section-aster" aria-hidden="true"><svg class="aster-mark" viewBox="-60 -60 120 120"></svg></div>
  </section>

  <section class="contact on-panel">
    <div class="wrap">
      <p class="eyebrow reveal">Contact</p>
      <h2 class="reveal">Request a first consultation</h2>
      <a class="mail reveal" href="mailto:contact@asteromics.com">contact@asteromics.com</a>
    </div>
  </section>
`

export function render(container) {
  container.innerHTML = html
}

export function mount() {}

export function unmount() {}

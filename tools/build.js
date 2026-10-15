// Static site generator: node tools/build.js  → writes HTML into the project root
const fs = require('fs');
const path = require('path');
const { SITE, SERVICES, POSTS } = require('./data');
const OUT = path.join(__dirname, '..');

/* ---------------- icons (SVG sprite) ---------------- */
const ICONS = {
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
  gift: '<path d="M3 9h18v4H3zM5 13h14v8H5zM12 9v12"/><path d="M12 9S9 9 8.5 7A2 2 0 0 1 12 6c0 1.5 0 3 0 3zm0 0s3 0 3.5-2A2 2 0 0 0 12 6"/>',
  laptop: '<path d="M5 6h14v9H5zM2 19h20"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  calendar: '<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  wand: '<path d="M4 20L16 8M14 6l4 4M18 2v3M16.5 3.5h3M21 9v3M19.5 10.5h3"/>',
  waves: '<path d="M3 8c3 0 3 3 6 3s3-3 6-3 3 3 6 3M3 14c3 0 3 3 6 3s3-3 6-3 3 3 6 3"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  blade: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M13 7l4 4"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',
  youtube: '<path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z"/><path d="M10 9l5 3-5 3z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'
};
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="gold-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dc9c"/><stop offset=".5" stop-color="#c9a24c"/><stop offset="1" stop-color="#96722a"/></linearGradient>
${Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join('\n')}
<symbol id="i-logo" viewBox="0 0 40 40"><path d="M33 5C17 5 6 14 6 27c0 2.4.5 4.6 1.5 6.5C10 27 15 21 22 17c-6 5-10.500 11.500-11.500 18.500C26 37 36 22 33 5z" fill="url(#gold-g)"/><path d="M33 5C27 14 21 20 13 25" stroke="#0b1d19" stroke-opacity=".35" stroke-width="1" fill="none"/></symbol>
</defs></svg>`;
const ic = (n, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const money = (p) => (p === 0 ? 'Free' : '$' + p);
const svcBySlug = (s) => SERVICES.find((x) => x.slug === s);
const link = (s) => `service-${s}.html`;
const img = (n) => `assets/img/${n}`;

/* ---------------- layout ---------------- */
const NAV = [
  ['Home', 'index.html'], ['Services', 'services.html', true], ['Virtual', 'virtual-services.html'],
  ['Shop', 'shop.html'], ['Gift Card', 'gift-card.html'], ['About', 'about.html'], ['Contact', 'contact.html']
];
const bookable = SERVICES.filter((s) => !s.soon);

function header(file) {
  const cur = (href) => (href === file || (href === 'services.html' && file.startsWith('service-')) ? ' aria-current="page"' : '');
  const dd = `<div class="dropdown" role="menu">${bookable.map((s) => `<a href="${link(s.slug)}" role="menuitem"><span class="ico">${ic(s.icon)}</span><span>${s.name}<small>${s.dur} · ${money(s.price)}</small></span></a>`).join('')}
    ${SERVICES.filter((s) => s.soon).map((s) => `<a href="${link(s.slug)}" role="menuitem"><span class="ico">${ic(s.icon)}</span><span>${s.name}<small>Coming soon</small></span></a>`).join('')}
    <a class="all" href="services.html">View all services ${ic('arrow')}</a></div>`;
  return `<a class="skip-link" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"></div>
<header class="site-header">
  <div class="container nav">
    <a class="logo" href="index.html" aria-label="Skincare Bimee — home">${ic('logo', 'logo__mark')}<span class="logo__text">Skincare Bimee<small>Esthetician · Texas</small></span></a>
    <nav aria-label="Primary"><ul class="nav__list">
      ${NAV.map(([t, h, d]) => `<li class="nav__item"><a class="nav__link" href="${h}"${cur(h)}>${t}${d ? ic('chev') : ''}</a>${d ? dd : ''}</li>`).join('\n      ')}
    </ul></nav>
    <div class="nav__actions">
      <a class="nav__phone" href="tel:${SITE.tel}">${ic('phone')}${SITE.phone}</a>
      <a class="btn btn--gold btn--sm nav__cta" href="book-online.html">Book Now</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu" aria-hidden="true"><div class="mobile-menu__inner">
  <a class="m-link" href="index.html"${cur('index.html')}>Home</a>
  <a class="m-link" href="services.html"${cur('services.html')}>Services</a>
  <div class="m-sub">${bookable.map((s) => `<a href="${link(s.slug)}">${s.name}</a>`).join('')}</div>
  <a class="m-link" href="virtual-services.html"${cur('virtual-services.html')}>Virtual Services</a>
  <a class="m-link" href="shop.html"${cur('shop.html')}>Shop</a>
  <a class="m-link" href="gift-card.html"${cur('gift-card.html')}>Gift Card</a>
  <a class="m-link" href="about.html"${cur('about.html')}>About</a>
  <a class="m-link" href="contact.html"${cur('contact.html')}>Contact</a>
  <div class="m-extra">
    <a class="btn btn--gold" href="book-online.html">Book an appointment ${ic('arrow')}</a>
    <a class="contact-line" href="tel:${SITE.tel}">${ic('phone')}${SITE.phone}</a>
    <a class="contact-line" href="mailto:${SITE.email}">${ic('mail')}${SITE.email}</a>
    <div class="socials"><a href="${SITE.instagram}" aria-label="Instagram" target="_blank" rel="noopener">${ic('instagram')}</a><a href="${SITE.youtube}" aria-label="YouTube" target="_blank" rel="noopener">${ic('youtube')}</a></div>
  </div>
</div></div>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container">
  <div class="footer-top">
    <h2 class="display">Be your own kind of <em class="gold-text">beautiful</em></h2>
    <div>
      <p style="margin-bottom:1rem">Stay with us — skincare news and offers from Bimee.</p>
      <form class="news" data-mailto data-api="/api/subscribe" data-success="You are on the list — thank you!" data-subject="Newsletter sign-up" novalidate aria-label="Newsletter sign-up">
        <input type="email" name="email" placeholder="Your email address" required aria-label="Email address">
        <button class="btn btn--gold btn--sm" type="submit">Sign up</button>
      </form>
    </div>
  </div>
  <div class="footer-grid">
    <div class="footer-brand"><a class="logo" href="index.html">${ic('logo', 'logo__mark')}<span class="logo__text">Skincare Bimee<small>Esthetician · Texas</small></span></a>
      <p>Healthy skin is a combination of science and art. Personalised facials and advanced treatments in Plano, TX.</p>
      <div class="socials"><a href="${SITE.instagram}" aria-label="Instagram" target="_blank" rel="noopener">${ic('instagram')}</a><a href="${SITE.youtube}" aria-label="YouTube" target="_blank" rel="noopener">${ic('youtube')}</a></div></div>
    <div><h4>Explore</h4><ul><li><a href="index.html">Home</a></li><li><a href="services.html">Services</a></li><li><a href="virtual-services.html">Virtual Services</a></li><li><a href="shop.html">Shop</a></li><li><a href="gift-card.html">Gift Card</a></li><li><a href="blog.html">Journal</a></li><li><a href="about.html">About</a></li></ul></div>
    <div><h4>Treatments</h4><ul>${bookable.slice(0, 6).map((s) => `<li><a href="${link(s.slug)}">${s.name}</a></li>`).join('')}</ul></div>
    <div><h4>Visit</h4><ul class="footer-contact">
      <li>${ic('pin')}<span>${SITE.studio.name}<br>${SITE.studio.line1}<br>${SITE.studio.line2} · ${SITE.studio.room}</span></li>
      <li>${ic('phone')}<a href="tel:${SITE.tel}">${SITE.phone}</a></li>
      <li>${ic('mail')}<a href="mailto:${SITE.email}">${SITE.email}</a></li></ul></div>
  </div>
  <div class="footer-bottom"><span>&copy; <span data-year>2026</span> Skincare Bimee. All rights reserved.</span><span>Designed with care in Texas</span></div>
</div></footer>
<button class="to-top" type="button" aria-label="Back to top">${ic('arrow')}</button>
<nav class="mobile-bar" aria-label="Quick actions"><a href="tel:${SITE.tel}">${ic('phone')}Call</a><a class="gold" href="book-online.html">${ic('calendar')}Book now</a></nav>`;
}

function page({ file, title, desc, body, hero3d = false, ogImg = 'hero-candles.jpg', jsonld = '' }) {
  const full = title.includes('Skincare Bimee') ? title : `${title} | Skincare Bimee`;
  const html = `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${full}</title>
<meta name="description" content="${desc.replace(/"/g, '&quot;')}">
<meta name="theme-color" content="#08171a">
<link rel="canonical" href="${SITE.url}/${file === 'index.html' ? '' : file.replace('.html', '')}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Skincare Bimee"><meta property="og:title" content="${full}"><meta property="og:description" content="${desc.replace(/"/g, '&quot;')}"><meta property="og:image" content="${SITE.url}/${img(ogImg)}">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
${hero3d ? `<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>` : ''}
${jsonld}
</head>
<body>
${sprite}
${header(file)}
<main id="main">
${body}
</main>
${footer()}
<script src="assets/js/main.js" defer></script>
${hero3d ? '<script type="module" src="assets/js/hero3d.js"></script>' : ''}
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT, file), html);
  console.log('wrote', file);
}

/* ---------------- shared blocks ---------------- */
const pageHero = ({ eyebrow, title, lead, crumbs, bg, extra = '' }) => `<section class="page-hero">
  ${bg ? `<div class="page-hero__bg"><img src="${img(bg)}" alt="" loading="eager"></div>` : ''}<div class="hero-orb" aria-hidden="true"></div>
  <div class="container">
    <div class="crumbs"><a href="index.html">Home</a>${(crumbs || []).map(([t, h]) => (h ? `<span><a href="${h}">${t}</a></span>` : `<span>${t}</span>`)).join('')}</div>
    <span class="eyebrow">${eyebrow}</span>
    <h1>${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}${extra}
  </div></section>`;

const svcCard = (s, i = 0, tilt = true) => `<article class="svc-card${tilt ? ' tilt' : ''} reveal" style="--d:${(i % 4) * 0.08}s" data-cat="${s.cat}${s.soon ? ' soon' : ''}">
  <div class="svc-card__img"><img src="${img(s.img)}" alt="${s.name}" loading="lazy" width="600" height="660">
    <span class="svc-card__tag${s.soon ? ' svc-card__tag--soon' : ''}">${s.soon ? 'Coming soon' : s.cat}</span>${s.soon ? '' : `<span class="svc-card__price">${money(s.price)}</span>`}</div>
  <div class="svc-card__body">${s.soon ? '' : `<div class="svc-card__meta">${ic('clock')}${s.dur}</div>`}<h3>${s.name}</h3><p>${s.short}</p>
  <a class="link-arrow stretch" href="${link(s.slug)}">${s.soon ? 'Learn more' : 'Discover'} ${ic('arrow')}</a></div></article>`;

const ctaBand = (title, text, cta = ['Book an appointment', 'book-online.html'], image = 'hero-candles.jpg') => `<section class="section section--tight"><div class="container"><div class="band reveal reveal--scale">
  <div class="band__copy"><span class="eyebrow">Ready when you are</span><h2>${title}</h2><p>${text}</p>
  <div class="btn-row"><a class="btn btn--gold" href="${cta[1]}">${cta[0]} ${ic('arrow')}</a><a class="btn btn--ghost" href="tel:${SITE.tel}">${ic('phone')} ${SITE.phone}</a></div></div>
  <div class="band__img"><img src="${img(image)}" alt="" loading="lazy"></div></div></div></section>`;

const mapEmbed = `<div class="map"><iframe title="Map to Skincare Bimee, Plano TX" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=3033+W+Parker+Rd+Suite+113+Plano+TX+75023&output=embed"></iframe></div>`;

const giftCardHTML = (amount = '$100') => `<div class="scene"><div class="gcard">
  <div class="gcard__face"><div class="gcard__top"><div><div class="gcard__brand">${ic('logo')}Skincare Bimee</div><div class="gcard__tag">Gift card · Just for you</div></div>${ic('sparkle')}</div>
  <div class="gcard__amount" data-amount>${amount}</div>
  <div class="gcard__bottom"><span>For<b id="gc-to">Someone special</b></span><span style="text-align:right">From<b id="gc-from">Skincare Bimee</b></span></div></div>
  <div class="gcard__face gcard__back"><small>Skincare Bimee</small><p id="gc-msg">A gift of endless possibilities.</p><small>Redeem for any treatment</small></div>
</div></div>`;

/* ---------------- pages ---------------- */

// HOME
(function home() {
  const marq = ['Facials', 'Pro Pen Luminfusion', 'Chemical Peels', 'Microdermabrasion', 'LED Light Therapy', 'Lip & Eye', 'Back Treatment', 'Virtual Consultations', 'Gift Cards'];
  const marqHTML = marq.map((m) => `<span>${m}</span>`).join('');
  const body = `
<section class="hero">
  <div class="hero__photo" aria-hidden="true"><img src="${img('hero-candles.jpg')}" alt="" fetchpriority="high"></div>
  <div class="hero__fallback" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <canvas class="hero__canvas" aria-hidden="true"></canvas>
  <div class="container hero__inner">
    <div>
      <span class="eyebrow">Esthetician · Plano, Texas</span>
      <h1><span class="line"><span>Be your own</span></span><span class="line"><span>kind of</span></span><span class="line"><span><em class="gold-text">beautiful</em></span></span></h1>
      <p class="lead">Healthy skin is a combination of science and art. Personalised facials and advanced, medical-grade treatments, crafted around you.</p>
      <div class="btn-row"><a class="btn btn--gold" href="book-online.html">Book now ${ic('arrow')}</a><a class="btn btn--ghost" href="services.html">Explore treatments</a></div>
    </div>
    <div class="hero__badges">
      <div class="glass badge-card"><span class="ico">${ic('pin')}</span><span><b>Plano, TX</b>Cross Roads Salon Suites</span></div>
      <div class="glass badge-card"><span class="ico">${ic('sparkle')}</span><span><b>8 treatments</b>from $40 · 15 min to 1 hr</span></div>
    </div>
  </div>
  <div class="scroll-cue" aria-hidden="true"><span>Scroll</span><i></i></div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee__track">${marqHTML}${marqHTML}</div></div>

<section class="section" style="padding-top:clamp(7rem,12vw,10rem)">
  <div class="container split">
    <div class="split__media reveal reveal--left">
      <div class="frame-ring"></div>
      <div class="arch"><img data-parallax="30" src="${img('owner.jpg')}" alt="Your esthetician at Skincare Bimee" loading="lazy" width="800" height="1000"></div>
      <div class="float-chip c1">${`<span class="ico">${ic('heart')}</span>`}<span><b>Science + art</b>Medical insight, esthetic care</span></div>
      <div class="float-chip c2"><span class="ico">${ic('check')}</span><span><b>Licensed</b>in esthetics</span></div>
    </div>
    <div class="split__text reveal">
      <span class="eyebrow">Meet your esthetician</span>
      <h2>Great skin, <em class="gold-text">from within</em></h2>
      <p>“From a young age, I was fascinated by the world of skincare and beauty. The transformation I experienced after seeing an esthetician was life-changing and planted the seed for my future career.”</p>
      <p>Today I combine medical insight with esthetic expertise — so every treatment is built around your skin, your goals and your safety and well-being.</p>
      <ul class="ticks"><li>Licensed in esthetics, with extensive training in skin types and the latest technology</li><li>Specialised in advanced treatments like chemical peels and microneedling</li><li>A bespoke plan, crafted after taking the time to understand your skin</li></ul>
      <div><a class="btn btn--dark" href="about.html">My story ${ic('arrow')}</a></div>
    </div>
  </div>
</section>

<section class="section section--cream" style="overflow:hidden" data-rail>
  <div class="container">
    <div class="head-row"><div class="section-head reveal"><span class="eyebrow">Signature treatments</span><h2>Find your <em>ritual</em></h2></div>
    <div class="rail-controls"><button class="round-btn prev" type="button" aria-label="Previous">${ic('arrow')}</button><button class="round-btn next" type="button" aria-label="Next">${ic('arrow')}</button></div></div>
    <div class="rail" tabindex="0" aria-label="Treatments">${bookable.map((s, i) => svcCard(s, i)).join('')}</div>
    <div style="margin-top:.5rem"><a class="btn btn--line" href="services.html">View all services &amp; prices ${ic('arrow')}</a></div>
  </div>
</section>

<section class="section section--dark">
  <div class="container split split--rev">
    <div class="split__media reveal reveal--right"><div class="arch" style="aspect-ratio:1/1.05"><img data-parallax="30" src="${img('pro-pen.jpg')}" alt="Pro Pen Luminfusion treatment" loading="lazy"></div>
      <div class="float-chip c1" style="left:auto;right:-10px"><span class="ico">${ic('sun')}</span><span><b>No downtime</b>instant glow</span></div></div>
    <div class="split__text reveal">
      <span class="eyebrow">Spotlight</span>
      <h2>Pro Pen <em class="gold-text">Luminfusion</em></h2>
      <p style="color:rgba(251,247,240,.75)">A “supercharged” facial using the Dermalogica Pro Pen and its stainless steel cone nanotips to deliver active ingredients deep into the skin — followed by red light therapy to enhance results.</p>
      <ul class="ticks"><li>Improves skin luminosity</li><li>Smooths fine lines and wrinkles</li><li>Targets the eye area</li><li>Creates an instant glow</li></ul>
      <div class="btn-row"><a class="btn btn--gold" href="book-online.html?service=pro-pen-luminfusion">Book · $130</a><a class="btn btn--ghost" href="service-pro-pen-luminfusion.html">Learn more</a></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head section-head--center reveal"><span class="eyebrow">Your journey</span><h2>Four steps to <em class="gold-text">glowing skin</em></h2><p class="lead">We take the time to understand your skin and your goals — then craft a plan just for you.</p></div>
    <div class="steps" style="--x:0">
      <div class="step reveal" style="--d:0s"><h3>Consult</h3><p>Start with a free 15-minute virtual skin consultation from home.</p></div>
      <div class="step reveal" style="--d:.1s"><h3>Customise</h3><p>Together we choose the treatments that fit your skin type and goals.</p></div>
      <div class="step reveal" style="--d:.2s"><h3>Treat</h3><p>Relax in our Plano studio while advanced technology does its work.</p></div>
      <div class="step reveal" style="--d:.3s"><h3>Glow</h3><p>Leave radiant, with the guidance to keep your results going.</p></div>
    </div>
  </div>
</section>
<style>.steps .step{background:var(--ink);color:var(--ivory)}.steps .step p{color:rgba(251,247,240,.7)}</style>

<section class="section section--cream">
  <div class="container">
    <div class="section-head reveal"><span class="eyebrow">Discover</span><h2>More from <em>Bimee</em></h2></div>
    <div class="bento">
      <a class="tile t1 reveal" href="gift-card.html"><img src="${img('gift-hands.jpg')}" alt="" loading="lazy"><span class="arrow">${ic('arrow')}</span><h3>Gift Card</h3><p>A gift of endless possibilities — treat yourself or a loved one to something special.</p></a>
      <a class="tile t2 reveal" style="--d:.08s" href="virtual-services.html"><img src="${img('virtual-laptop.jpg')}" alt="" loading="lazy" style="object-position:50% 30%"><span class="arrow">${ic('arrow')}</span><h3>Virtual Services</h3><p>Consultations, skin assessments and more — from your sofa.</p></a>
      <a class="tile t3 reveal" style="--d:.16s" href="contact.html"><img src="${img('door.jpg')}" alt="" loading="lazy"><span class="arrow">${ic('arrow')}</span><h3>Location</h3><p>Cross Roads Salon Suites, Plano, TX.</p></a>
      <a class="tile t4 reveal" href="shop.html"><img src="${img('kit.jpg')}" alt="" loading="lazy"><span class="arrow">${ic('arrow')}</span><h3>Shop</h3></a>
      <a class="tile t5 reveal" style="--d:.08s" href="about.html"><img src="${img('oils.jpg')}" alt="" loading="lazy"><span class="arrow">${ic('arrow')}</span><h3>About</h3></a>
      <a class="tile tile--gold t6 reveal" style="--d:.16s" href="book-online.html"><span class="arrow">${ic('arrow')}</span><span class="big">Book<br>now</span><p style="opacity:.8">Choose your treatment and pick a time.</p></a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container gift-layout" style="align-items:center">
    <div class="scene-col reveal">${giftCardHTML('$100')}</div>
    <div class="split__text reveal">
      <span class="eyebrow">Gift cards</span>
      <h2>Give the gift of <em class="gold-text">glowing skin</em></h2>
      <p>Indulge your loved ones with the gift of relaxation. Choose a design, an amount and a personal message — and send it by email, or keep it to print.</p>
      <div class="btn-row"><a class="btn btn--gold" href="gift-card.html">Shop gift cards ${ic('arrow')}</a></div>
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="container contact-grid" style="align-items:center">
    <div class="split__text reveal">
      <span class="eyebrow">Visit the studio</span>
      <h2>Come say <em class="gold-text">hello</em></h2>
      <div class="info-card" style="background:rgba(255,255,255,.06);border-color:var(--line-light);box-shadow:none">
        <div class="info-row"><span class="ico" style="background:rgba(201,162,76,.16);color:var(--gold-2)">${ic('pin')}</span><div><small style="color:rgba(251,247,240,.55)">Studio</small>${SITE.studio.name}<br>${SITE.studio.line1}, ${SITE.studio.line2}<br>${SITE.studio.room}</div></div>
        <div class="info-row"><span class="ico" style="background:rgba(201,162,76,.16);color:var(--gold-2)">${ic('phone')}</span><div><small style="color:rgba(251,247,240,.55)">Call us</small><a href="tel:${SITE.tel}">${SITE.phone}</a></div></div>
        <div class="info-row"><span class="ico" style="background:rgba(201,162,76,.16);color:var(--gold-2)">${ic('mail')}</span><div><small style="color:rgba(251,247,240,.55)">Email</small><a href="mailto:${SITE.email}">${SITE.email}</a></div></div>
      </div>
    </div>
    <div class="reveal reveal--scale">${mapEmbed}</div>
  </div>
</section>`;
  const jsonld = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'HealthAndBeautyBusiness', name: 'Skincare Bimee', url: SITE.url, telephone: SITE.tel, email: SITE.email,
    image: `${SITE.url}/${img('hero-candles.jpg')}`, priceRange: '$40-$130',
    address: { '@type': 'PostalAddress', streetAddress: '3033 W. Parker Rd., Suite 113', addressLocality: 'Plano', addressRegion: 'TX', postalCode: '75023', addressCountry: 'US' },
    sameAs: [SITE.instagram, SITE.youtube]
  })}</script>`;
  page({ file: 'index.html', title: 'Skincare Bimee | Esthetician in Plano & Dallas, TX', desc: 'Skincare Bimee — facials, chemical peels, LED light therapy, Pro Pen Luminfusion and virtual skin consultations in Plano, TX. Be your own kind of beautiful.', body, hero3d: true, jsonld });
})();

// SERVICES
(function services() {
  const body = `${pageHero({ eyebrow: 'Services', title: 'Treatments <em class="gold-text">designed for you</em>', lead: 'From personalised facials to advanced resurfacing — every treatment is tailored to your skin and your goals.', crumbs: [['Services']], bg: 'hero-candles.jpg' })}
<section class="section">
  <div class="container">
    <div class="filters" role="group" aria-label="Filter services">
      <button class="filter-btn is-active" data-filter="all" aria-pressed="true">All</button><button class="filter-btn" data-filter="face" aria-pressed="false">Face</button><button class="filter-btn" data-filter="advanced" aria-pressed="false">Advanced</button><button class="filter-btn" data-filter="body" aria-pressed="false">Body</button><button class="filter-btn" data-filter="virtual" aria-pressed="false">Virtual</button><button class="filter-btn" data-filter="soon" aria-pressed="false">Coming soon</button>
    </div>
    <div class="svc-grid">${SERVICES.map((s, i) => svcCard(s, i)).join('')}</div>
  </div>
</section>
<section class="section section--dark">
  <div class="container">
    <div class="section-head reveal"><span class="eyebrow">Price list</span><h2>Simple, <em class="gold-text">transparent</em> pricing</h2></div>
    <div class="menu-list">${bookable.map((s) => `<div class="menu-row reveal"><h3><a href="${link(s.slug)}">${s.name}</a></h3><span class="dur">${s.dur}</span><span class="price">${money(s.price)}</span><a class="btn btn--ghost btn--sm" href="book-online.html?service=${s.slug}">Book</a></div>`).join('')}</div>
    <p style="margin-top:1.5rem;opacity:.65;font-size:.92rem">Dermaplaning and Microneedling are coming soon.</p>
  </div>
</section>
${ctaBand('Not sure where to start?', 'Book a free 15-minute virtual skin consultation and get a personalised recommendation from home.', ['Book free consultation', 'book-online.html?service=skin-consultation'], 'consultation.jpg')}`;
  page({ file: 'services.html', title: 'Services & Treatments', desc: 'Explore facials, Pro Pen Luminfusion, chemical peels, microdermabrasion, LED light therapy, lip & eye and back treatments at Skincare Bimee in Plano, TX.', body, ogImg: 'facial.jpg' });
})();

// SERVICE DETAIL
SERVICES.forEach((s, i) => {
  const prev = SERVICES[(i + SERVICES.length - 1) % SERVICES.length], next = SERVICES[(i + 1) % SERVICES.length];
  const pairs = s.pair.map(svcBySlug);
  const facts = s.soon
    ? `<span class="notice">${ic('clock')}Coming soon</span><p style="opacity:.8">This treatment is launching soon. Call or email to be the first to know.</p><a class="btn btn--gold" href="mailto:${SITE.email}?subject=${encodeURIComponent('Notify me: ' + s.name)}">Notify me ${ic('arrow')}</a>`
    : `<div class="price"><small>Price</small>${money(s.price)}</div>
       <ul><li><span>Duration</span><span>${s.dur}</span></li><li><span>Location</span><span>${s.slug === 'skin-consultation' ? 'Virtual (online)' : 'Cross Roads Salon Suites'}</span></li><li><span>Address</span><span>${s.slug === 'skin-consultation' ? 'From home' : '3033 W Parker Rd, Plano'}</span></li><li><span>Questions</span><span><a href="tel:${SITE.tel}">${SITE.phone}</a></span></li></ul>
       <a class="btn btn--gold" href="book-online.html?service=${s.slug}">Book now ${ic('arrow')}</a>`;
  const body = `${pageHero({ eyebrow: s.soon ? 'Coming soon' : `${s.dur} · ${money(s.price)}`, title: s.name, lead: s.lead, crumbs: [['Services', 'services.html'], [s.name]], bg: s.img })}
<section class="section">
  <div class="container detail">
    <div class="detail__main">
      <div class="detail__img clip-reveal"><img data-parallax="25" src="${img(s.img)}" alt="${s.name}" width="1200" height="750"></div>
      <div class="reveal"><span class="eyebrow">About this treatment</span><h2 style="margin:1rem 0 1.2rem">What to expect</h2>${s.body.map((p) => `<p style="margin-bottom:1rem">${p}</p>`).join('')}</div>
      <div class="reveal"><h2 style="margin-bottom:1rem">Ideal for</h2><div class="chips">${s.ideal.map((x) => `<span class="chip">${x}</span>`).join('')}</div></div>
      <div class="reveal"><h2 style="margin-bottom:1.2rem">Highlights</h2><div class="feature-grid">${s.features.map(([t, d, ico]) => `<div class="feature"><span class="ico">${ic(ico)}</span><div><b>${t}</b><span>${d}</span></div></div>`).join('')}</div></div>
    </div>
    <aside class="facts reveal reveal--right" aria-label="Treatment details">${facts}</aside>
  </div>
</section>
<section class="section section--cream">
  <div class="container">
    <div class="section-head reveal"><span class="eyebrow">Pair it with</span><h2>Better <em>together</em></h2></div>
    <div class="svc-grid">${pairs.map((p, k) => svcCard(p, k)).join('')}</div>
    <div class="pager" style="margin-top:3rem"><a href="${link(prev.slug)}"><small>← Previous</small><b>${prev.name}</b></a><a class="next" href="${link(next.slug)}"><small>Next →</small><b>${next.name}</b></a></div>
  </div>
</section>`;
  page({ file: link(s.slug), title: s.name, desc: s.lead + (s.soon ? '' : ` ${s.dur} · ${money(s.price)} at Skincare Bimee, Plano TX.`), body, ogImg: s.img });
});

// VIRTUAL
(function virtual() {
  const items = [
    ['Skin Consultation', 'Explore solutions to your skin concerns and get answers to your questions, all from the comfort of your own home.', 'consultation.jpg', 'Free · 15 min', 'book-online.html?service=skin-consultation'],
    ['Skin Care Party', 'Gather your friends for a fun, guided skincare experience — together, wherever you are.', 'skin-party.jpg', 'Enquire', 'contact.html'],
    ['Skin Assessment', 'A closer look at your skin type, concerns and routine, with advice to help you move forward.', 'virtual-laptop.jpg', 'Enquire', 'contact.html']
  ];
  const body = `${pageHero({ eyebrow: 'Virtual services', title: 'Expert skincare, <em class="gold-text">from home</em>', lead: 'Our virtual services offer a convenient way to address your specific needs and achieve healthier, happier skin.', crumbs: [['Virtual Services']], bg: 'virtual-laptop.jpg' })}
<section class="section"><div class="container">
  <div class="post-grid">${items.map(([t, d, im, tag, href], i) => `<article class="post-card tilt reveal" style="--d:${i * .1}s"><div class="post-card__img"><img src="${img(im)}" alt="${t}" loading="lazy" style="object-position:50% 25%"></div><div class="post-card__body"><div class="post-meta">${tag}</div><h3>${t}</h3><p>${d}</p><a class="link-arrow" href="${href}">${tag.startsWith('Free') ? 'Book now' : 'Get in touch'} ${ic('arrow')}</a></div></article>`).join('')}</div>
</div></section>
<section class="section section--dark"><div class="container">
  <div class="section-head section-head--center reveal"><span class="eyebrow">How it works</span><h2>Three <em class="gold-text">simple steps</em></h2></div>
  <div class="steps" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
    <div class="step reveal"><h3>Book</h3><p>Choose a virtual service and a time that suits you.</p></div>
    <div class="step reveal" style="--d:.1s"><h3>Meet online</h3><p>Join from home and talk through your skin and your goals.</p></div>
    <div class="step reveal" style="--d:.2s"><h3>Glow on</h3><p>Leave with personalised advice, and book in-studio treatments when you are ready.</p></div>
  </div></div></section>
${ctaBand('Start with a free consultation', 'Fifteen minutes. No cost. Real answers about your skin.', ['Book free consultation', 'book-online.html?service=skin-consultation'], 'consultation.jpg')}`;
  page({ file: 'virtual-services.html', title: 'Virtual Skincare Services', desc: 'Virtual skincare services from Skincare Bimee: free skin consultations, skin care parties and skin assessments from the comfort of your home.', body, ogImg: 'consultation.jpg' });
})();

// SHOP
(function shop() {
  const cats = [['All Products', 'Browse everything in one place.', 'products-banner.jpg'], ['At Home Facial Kit', 'Bring the Skincare Bimee ritual home.', 'kit.jpg'], ['Gift Certification', 'The gift of glowing skin.', 'gift-cert.jpg']];
  const body = `${pageHero({ eyebrow: 'Shop', title: 'Skincare, <em class="gold-text">to take home</em>', lead: 'Curated products and gifts, chosen to keep your skin glowing between visits.', crumbs: [['Shop']], bg: 'oils.jpg' })}
<section class="section"><div class="container">
  <div class="cat-grid">${cats.map(([t, d, im], i) => `<a class="tile reveal" style="--d:${i * .1}s;min-height:340px" href="${i === 2 ? 'gift-card.html' : '#products'}"><img src="${img(im)}" alt="" loading="lazy"><span class="arrow">${ic('arrow')}</span><h3>${t}</h3><p>${d}</p></a>`).join('')}</div>
</div></section>
<section class="section section--cream" id="products"><div class="container">
  <div class="section-head reveal"><span class="eyebrow">Available now</span><h2>Gift <em>certificates</em></h2></div>
  <div class="split" style="align-items:center">
    <div class="reveal">${giftCardHTML('$100')}</div>
    <div class="split__text reveal"><h3>eGift Card</h3><p>Choose $50, $100 or $150, add a personal message and send it instantly by email — or receive it in your own inbox to print.</p><div class="btn-row"><a class="btn btn--gold" href="gift-card.html">Buy a gift card ${ic('arrow')}</a></div></div>
  </div>
  <div class="empty reveal" style="margin-top:4rem">${ic('bag')}<h3>More products arriving soon</h3><p style="color:var(--muted);max-width:46ch">Our at-home facial kits and skincare products are on their way. Join the list and we will let you know first.</p><a class="btn btn--dark" href="mailto:${SITE.email}?subject=${encodeURIComponent('Notify me about new products')}">Notify me ${ic('arrow')}</a></div>
</div></section>`;
  page({ file: 'shop.html', title: 'Shop', desc: 'Shop Skincare Bimee gift cards and, soon, at-home facial kits and skincare products.', body, ogImg: 'kit.jpg' });
})();

// GIFT CARD
(function gift() {
  const body = `${pageHero({ eyebrow: 'Gift card', title: 'Buy an instant <em class="gold-text">spa gift certificate</em>', lead: 'Indulge your loved ones with the gift of relaxation. Treat someone special to rejuvenating treatments amidst serene surroundings.', crumbs: [['Shop', 'shop.html'], ['Gift Card']], bg: 'gift-hands.jpg' })}
<section class="section"><div class="container gift-layout">
  <div class="scene-col reveal">${giftCardHTML('$100')}
    <div style="text-align:center;margin-top:2rem"><button type="button" id="flip" class="btn btn--line btn--sm">Flip card</button></div>
    <p class="form-note" style="text-align:center;margin-top:1rem">Move your mouse over the card — or flip it to preview your message.</p></div>
  <form class="builder reveal" id="gift-form" data-mailto data-api="/api/gift" data-subject="Gift card order" data-extra="giftExtra" novalidate>
    <div><span class="label">Amount</span><div class="amounts" style="margin-top:.6rem" role="radiogroup" aria-label="Amount">
      <label class="amount"><input type="radio" name="amount" value="50"><span>$50</span></label><label class="amount"><input type="radio" name="amount" value="100" checked><span>$100</span></label><label class="amount"><input type="radio" name="amount" value="150"><span>$150</span></label></div></div>
    <div class="form-grid form-grid--2"><div class="field"><label for="to">Recipient name</label><input id="to" name="recipient_name" maxlength="24" placeholder="Jane"></div><div class="field"><label for="from">From</label><input id="from" name="from" maxlength="24" placeholder="Your name"></div></div>
    <div class="form-grid form-grid--2"><div class="field"><label for="remail">Recipient email</label><input id="remail" name="recipient_email" type="email" placeholder="jane@email.com"></div><div class="field"><label for="ddate">Delivery date</label><input id="ddate" name="delivery_date" type="date"></div></div>
    <div class="field"><label for="message">Personal message</label><textarea id="message" name="message" maxlength="140" style="min-height:96px" placeholder="Enjoy a little glow-up…"></textarea></div>
    <div class="field"><label for="yemail">Your email</label><input id="yemail" name="your_email" type="email" required placeholder="you@email.com"></div>
    <div><span class="label">Quantity</span><div style="margin-top:.6rem"><div class="qty"><button type="button" id="qty-minus" aria-label="Decrease">−</button><output id="qty-out">1</output><button type="button" id="qty-plus" aria-label="Increase">+</button></div></div></div>
    <div class="total-row"><span>Total</span><b id="gc-total">$100</b></div>
    <button class="btn btn--gold" type="submit">Request gift card ${ic('arrow')}</button>
    <p class="form-note">Your email app will open with the order details pre-filled. We will confirm payment and delivery with you directly.</p>
    <div class="form-status" role="status">Thank you! Please send the email that just opened and we will be in touch shortly.</div>
  </form>
</div></section>`;
  page({ file: 'gift-card.html', title: 'Gift Card', desc: 'Give the gift of glowing skin. Buy a Skincare Bimee eGift card — choose $50, $100 or $150, add a message and send it by email.', body, ogImg: 'gift-hands.jpg' });
})();

// BOOK
(function book() {
  const slots = ['Morning', 'Afternoon', 'Evening', 'Flexible'];
  const body = `${pageHero({ eyebrow: 'Book online', title: 'Reserve your <em class="gold-text">moment</em>', lead: 'Choose a treatment and your preferred time. We will confirm your appointment by phone or email.', crumbs: [['Book Online']], bg: 'hallway.jpg' })}
<section class="section"><div class="container">
<form id="book-form" class="book-layout" data-mailto data-api="/api/book" data-subject="Appointment request" data-extra="bookExtra" novalidate>
  <div class="form" style="gap:2.2rem">
    <div><h3 style="margin-bottom:1rem">1 · Choose a service</h3><div class="choice-grid">${bookable.map((s, i) => `<label class="choice"><input type="radio" name="service" value="${s.slug}" data-price="${s.price}" data-dur="${s.dur}" data-label="${s.name}"${i === 0 ? ' checked' : ''}><span class="choice__body"><span class="ico">${ic(s.icon)}</span><span><b>${s.name}</b><small>${s.dur}</small></span><span class="p">${money(s.price)}</span></span></label>`).join('')}</div></div>
    <div><h3 style="margin-bottom:1rem">2 · Pick a date &amp; time</h3>
      <div class="field" style="max-width:320px;margin-bottom:1.2rem"><label for="date">Preferred date</label><input type="date" id="date" name="preferred_date" required></div>
      <span class="label">Preferred time</span><div class="slots" style="margin-top:.6rem" role="radiogroup" aria-label="Preferred time">${slots.map((t, i) => `<label class="slot"><input type="radio" name="preferred_time" value="${t}"${i === 3 ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div></div>
    <div><h3 style="margin-bottom:1rem">3 · Your details</h3>
      <div class="form-grid form-grid--2"><div class="field"><label for="fn">First name</label><input id="fn" name="first_name" required autocomplete="given-name"></div><div class="field"><label for="ln">Last name</label><input id="ln" name="last_name" required autocomplete="family-name"></div>
      <div class="field"><label for="em">Email</label><input id="em" name="email" type="email" required autocomplete="email"></div><div class="field"><label for="ph">Phone</label><input id="ph" name="phone" type="tel" autocomplete="tel"></div></div>
      <div class="field" style="margin-top:1.1rem"><label for="nt">Notes (optional)</label><textarea id="nt" name="notes" style="min-height:100px" placeholder="Skin concerns, allergies, questions…"></textarea></div></div>
  </div>
  <aside class="summary" aria-live="polite"><h3>Your booking</h3>
    <dl><div><dt>Service</dt><dd id="sum-service">—</dd></div><div><dt>Duration</dt><dd id="sum-dur">—</dd></div><div><dt>Date</dt><dd id="sum-date">—</dd></div><div><dt>Time</dt><dd id="sum-time">—</dd></div></dl>
    <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="opacity:.65;letter-spacing:.14em;text-transform:uppercase;font-size:.8rem">Total</span><span class="total" id="sum-total">—</span></div>
    <button class="btn btn--gold" type="submit">Request appointment ${ic('arrow')}</button>
    <div class="form-status is-hint" role="status" style="background:rgba(236,213,150,.12);border-color:var(--line-light);color:var(--gold-2)">Your email app will open with your request pre-filled. We confirm every booking personally.</div>
    <a class="contact-line" href="tel:${SITE.tel}">${ic('phone')}Prefer to call? ${SITE.phone}</a>
    <div class="contact-line">${ic('pin')}${SITE.studio.name}, Plano TX</div>
  </aside>
</form></div></section>`;
  page({ file: 'book-online.html', title: 'Book Online', desc: 'Book your Skincare Bimee appointment online: facials, chemical peels, microdermabrasion, LED light therapy, Pro Pen Luminfusion, lip & eye, back treatments and free consultations.', body, ogImg: 'hallway.jpg' });
})();

// ABOUT
(function about() {
  const body = `${pageHero({ eyebrow: 'About', title: 'Where <em class="gold-text">science</em> meets <em class="gold-text">art</em>', lead: 'My mission is to help you achieve healthy, radiant skin — with care, expertise and the latest technology.', crumbs: [['About']], bg: 'oils.jpg' })}
<section class="section"><div class="container split">
  <div class="split__media reveal reveal--left"><div class="frame-ring"></div><div class="arch"><img data-parallax="30" src="${img('owner.jpg')}" alt="Your esthetician" loading="lazy"></div></div>
  <div class="split__text reveal"><span class="eyebrow">My story</span><h2>A passion that began with <em class="gold-text">my own skin</em></h2>
    <p>From a young age, I was fascinated by the world of skincare and beauty. My passion truly blossomed in high school when I struggled with acne. The transformation I experienced after seeing an esthetician was life-changing and planted the seed for my future career.</p>
    <p>I was captivated by the complexities of the human body and the science behind healing. That curiosity led me towards the medical field — but it was my own battle with skin issues that redirected my path to esthetics. Transforming my skin through medical-grade treatments and skincare ignited a passion for helping others achieve the same.</p>
    <p>After several years, I pursued further education and became licensed in esthetics, training extensively in skin types, treatments and the latest skincare technology. This blend of medical insight and esthetic expertise lets me approach beauty treatments with a unique perspective.</p>
    <p>As a medical esthetician, I specialise in treatments that require a deeper understanding of the skin's structure and healing processes — from advanced chemical peels to microneedling. Now I am here to help you reach your skincare goals while ensuring your safety and well-being.</p></div>
</div></section>
<section class="section section--dark"><div class="container">
  <div class="section-head section-head--center reveal"><span class="eyebrow">My approach</span><h2>Healthy skin is a combination of <em class="gold-text">science and art</em></h2></div>
  <div class="steps" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">
    <div class="step reveal"><h3>Understand</h3><p>We take the time to understand your skin and your goals before anything else.</p></div>
    <div class="step reveal" style="--d:.1s"><h3>Personalise</h3><p>A bespoke treatment plan crafted just for you — no one-size-fits-all.</p></div>
    <div class="step reveal" style="--d:.2s"><h3>Protect</h3><p>Medical insight and the latest technology, always with your safety first.</p></div>
  </div></div></section>
<section class="section"><div class="container"><div class="section-head reveal"><span class="eyebrow">From the journal</span><h2>Skin <em>notes</em></h2></div>
  <div class="post-grid">${POSTS.map((p, i) => postCard(p, i)).join('')}</div></div></section>
${ctaBand('Let’s meet your skin', 'Book a treatment or start with a free virtual consultation.', ['Book now', 'book-online.html'], 'facial-portrait.jpg')}`;
  page({ file: 'about.html', title: 'About', desc: 'Meet the esthetician behind Skincare Bimee — a licensed medical esthetician combining medical insight and esthetic expertise to help you achieve healthy, radiant skin.', body, ogImg: 'owner.jpg' });
})();

function postCard(p, i = 0) {
  return `<a class="post-card tilt reveal" style="--d:${i * .1}s" href="post-${p.slug}.html"><div class="post-card__img"><img src="${img(p.img)}" alt="" loading="lazy"></div><div class="post-card__body"><div class="post-meta"><span>${p.tag}</span><span>·</span><span>${p.read}</span></div><h3>${p.title}</h3><p>${p.excerpt}</p><span class="link-arrow">Read article ${ic('arrow')}</span></div></a>`;
}

// CONTACT
(function contact() {
  const body = `${pageHero({ eyebrow: 'Contact', title: 'Let’s <em class="gold-text">talk skin</em>', lead: 'Have questions or need personalised skincare advice? Reach out — we are here to help you achieve your skincare goals.', crumbs: [['Contact']], bg: 'door.jpg' })}
<section class="section"><div class="container contact-grid">
  <div class="info-card reveal">
    <div class="info-row"><span class="ico">${ic('pin')}</span><div><small>Studio</small>${SITE.studio.name}<br>${SITE.studio.line1}<br>${SITE.studio.line2} · ${SITE.studio.room}</div></div>
    <div class="info-row"><span class="ico">${ic('pin')}</span><div><small>Allen address</small>${SITE.office.line1}<br>${SITE.office.line2}</div></div>
    <div class="info-row"><span class="ico">${ic('phone')}</span><div><small>Call</small><a href="tel:${SITE.tel}">${SITE.phone}</a></div></div>
    <div class="info-row"><span class="ico">${ic('mail')}</span><div><small>Email</small><a href="mailto:${SITE.email}">${SITE.email}</a></div></div>
    <div class="socials" style="color:var(--text)"><a href="${SITE.instagram}" aria-label="Instagram" target="_blank" rel="noopener" style="border-color:var(--line)">${ic('instagram')}</a><a href="${SITE.youtube}" aria-label="YouTube" target="_blank" rel="noopener" style="border-color:var(--line)">${ic('youtube')}</a></div>
  </div>
  <form class="builder reveal" data-mailto data-api="/api/contact" data-subject="Website enquiry" novalidate>
    <h3>Send a message</h3>
    <div class="form-grid form-grid--2"><div class="field"><label for="c-fn">First name</label><input id="c-fn" name="first_name" required autocomplete="given-name"></div><div class="field"><label for="c-ln">Last name</label><input id="c-ln" name="last_name" required autocomplete="family-name"></div></div>
    <div class="field"><label for="c-em">Email</label><input id="c-em" name="email" type="email" required autocomplete="email"></div>
    <div class="field"><label for="c-ms">Message</label><textarea id="c-ms" name="message" required></textarea></div>
    <button class="btn btn--gold" type="submit">Send ${ic('arrow')}</button>
    <div class="form-status" role="status">Thanks for reaching out! Please send the email that just opened.</div>
  </form>
</div>
<div class="container reveal" style="margin-top:2.5rem">${mapEmbed}</div></section>`;
  page({ file: 'contact.html', title: 'Contact', desc: 'Contact Skincare Bimee — Cross Roads Salon Suites, 3033 W. Parker Rd., Suite 113, Plano, TX. Call (214) 944-0191 or email skincarebimee@gmail.com.', body, ogImg: 'door.jpg' });
})();

// BLOG
(function blog() {
  const body = `${pageHero({ eyebrow: 'Journal', title: 'Skin <em class="gold-text">notes</em>', lead: 'Expert tips and straight answers on treatments, technology and caring for your skin.', crumbs: [['Journal']], bg: 'oils.jpg' })}
<section class="section"><div class="container"><div class="post-grid">${POSTS.map((p, i) => postCard(p, i)).join('')}</div></div></section>`;
  page({ file: 'blog.html', title: 'Journal', desc: 'The Skincare Bimee journal: expert skincare tips, treatment guides and product insight.', body, ogImg: 'oils.jpg' });
})();
POSTS.forEach((p) => {
  const body = `${pageHero({ eyebrow: p.tag, title: p.title, crumbs: [['Journal', 'blog.html'], [p.tag]], bg: p.img, extra: `<p class="lead" style="margin-top:.4rem">${p.read}</p>` })}
<section class="section" style="padding-top:0"><div class="container--narrow container"><div class="article__cover clip-reveal"><img src="${img(p.img)}" alt=""></div><article class="article reveal">${p.body}</article>
  <div class="btn-row" style="margin-top:3rem"><a class="btn btn--gold" href="book-online.html">Book an appointment ${ic('arrow')}</a><a class="btn btn--line" href="blog.html">More articles</a></div></div></section>`;
  page({ file: `post-${p.slug}.html`, title: p.title, desc: p.excerpt, body, ogImg: p.img });
});

// 404
page({ file: '404.html', title: 'Page not found', desc: 'The page you are looking for could not be found.', body: `${pageHero({ eyebrow: '404', title: 'This page <em class="gold-text">drifted away</em>', lead: 'The page you are looking for does not exist or has moved.', extra: `<div class="btn-row" style="margin-top:2rem"><a class="btn btn--gold" href="index.html">Back home ${ic('arrow')}</a><a class="btn btn--ghost" href="services.html">Browse services</a></div>` })}<section class="section"></section>` });

/* ---------------- favicon + vercel config ---------------- */
fs.writeFileSync(path.join(OUT, 'assets/img/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#08171a"/><g transform="translate(5 5) scale(.75)"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dc9c"/><stop offset=".5" stop-color="#c9a24c"/><stop offset="1" stop-color="#96722a"/></linearGradient></defs><path d="M33 5C17 5 6 14 6 27c0 2.4.5 4.6 1.5 6.5C10 27 15 21 22 17c-6 5-10.500 11.500-11.500 18.500C26 37 36 22 33 5z" fill="url(#g)"/></g></svg>`);
const redirects = [
  ['/home', '/'], ['/skin-care', '/services'], ['/services/:slug', '/service-:slug'], ['/eye-brow', '/service-lip-and-eye-treatment'],
  ['/service-microdermabraison', '/service-microdermabraison'], ['/category/:slug', '/shop'], ['/blog/:slug', '/blog'], ['/service-page/:slug', '/service-:slug']
].filter(([a, b]) => a !== b).map(([source, destination]) => ({ source, destination, permanent: true }));
fs.writeFileSync(path.join(OUT, 'vercel.json'), JSON.stringify({ cleanUrls: true, redirects }, null, 2));
console.log('done');

// Site content — sourced from /raw (skincarebimee.com export)
const SITE = {
  name: 'Skincare Bimee',
  phone: '(214) 944-0191',
  tel: '+12149440191',
  email: 'skincarebimee@gmail.com',
  studio: { name: 'Cross Roads Salon Suites', line1: '3033 W. Parker Rd., Suite 113', line2: 'Plano, TX 75023', room: 'Room 111' },
  office: { line1: '945 Stockton Dr Ste 4110', line2: 'Allen, TX 75013' },
  instagram: 'https://www.instagram.com/skincarebimee',
  youtube: 'https://www.youtube.com/@skincarebimee',
  url: 'https://www.skincarebimee.com'
};

const SERVICES = [
  {
    slug: 'facial', name: 'Facial', dur: '1 hr', price: 95, img: 'facial.jpg', icon: 'sparkle', cat: 'face',
    short: 'A deep-cleansing, circulation-boosting ritual with exfoliation, mask, moisturiser and SPF.',
    lead: 'A personalised facial that cleanses deeply, exfoliates away dull skin and leaves you hydrated, protected and glowing.',
    body: [
      'A facial is a skin-care treatment designed to deeply cleanse, improve circulation, exfoliate to remove dead skin cells, then mask, moisturise and protect with SPF.',
      'We also help with common skin concerns like ageing, dry skin, acne and hyperpigmentation. Some facials incorporate oxygen, high-frequency microcurrents, dermaplaning and LED light to deliver more intense or specific results.',
      'Facials can also be combined with chemical peels, microdermabrasion and microneedling for more comprehensive results.'
    ],
    ideal: ['Ageing', 'Dry skin', 'Acne', 'Hyperpigmentation'],
    features: [['Deep cleanse', 'Lifts away impurities and prepares skin for treatment.', 'drop'], ['Exfoliation', 'Removes dead skin cells for a smoother surface.', 'sparkle'], ['Circulation boost', 'Encourages a healthy, rested glow.', 'heart'], ['Mask, moisturiser & SPF', 'Nourish first, then protect your results.', 'layers']],
    pair: ['chemical-peels', 'microdermabraison', 'led-light-therapy']
  },
  {
    slug: 'pro-pen-luminfusion', name: 'Pro Pen Luminfusion', dur: '1 hr', price: 130, img: 'pro-pen.jpg', icon: 'wand', cat: 'advanced',
    short: 'A “supercharged” Dermalogica facial that delivers actives deeper — instant glow, no downtime.',
    lead: 'A professional, non-invasive skin-resurfacing treatment developed by Dermalogica — instant glow with no downtime.',
    body: [
      'LuminFusion is a “supercharged” facial that uses the Dermalogica Pro Pen — a professional-grade device with stainless steel cone nanotips — to deliver active ingredients deep into the skin.',
      'It works alongside professional-strength exfoliants and a light-energy masque, followed by red light therapy to enhance results.',
      'This service creates an instant glow and diminishes the signs of skin ageing, all with no downtime.'
    ],
    ideal: ['Dull skin', 'Fine lines & wrinkles', 'Eye area', 'Special-event glow'],
    features: [['Improves luminosity', 'Brighter, more radiant-looking skin.', 'sun'], ['Smooths fine lines', 'Softens the look of lines and wrinkles.', 'sparkle'], ['Targets the eye area', 'Precision care for delicate skin.', 'eye'], ['Instant glow', 'Visible radiance with no downtime.', 'heart']],
    pair: ['led-light-therapy', 'lip-and-eye-treatment', 'facial']
  },
  {
    slug: 'chemical-peels', name: 'Chemical Peels', dur: '30 min', price: 60, img: 'chemical-peel.jpg', icon: 'layers', cat: 'advanced',
    short: 'Refine texture and even out tone by removing the damaged outer layers of skin.',
    lead: 'A chemical solution that improves the texture and tone of your skin by removing the damaged outer layers.',
    body: [
      'A chemical peel uses a chemical solution to improve the texture and tone of your skin by removing the damaged outer layers.',
      'Although chemical peels are used mostly on the face, they can also be used to improve the skin on your neck and hands. Sun exposure, acne or just getting older can leave your skin tone uneven, wrinkled, spotted or scarred.'
    ],
    ideal: ['Uneven tone', 'Wrinkles', 'Sun spots', 'Acne marks'],
    features: [['Texture refinement', 'A smoother, more even surface.', 'layers'], ['Tone correction', 'Targets spots and uneven pigmentation.', 'sun'], ['Face, neck & hands', 'Not just for the face.', 'sparkle']],
    pair: ['facial', 'microdermabraison', 'led-light-therapy']
  },
  {
    slug: 'microdermabraison', name: 'Microdermabrasion', dur: '15 min', price: 50, img: 'microdermabrasion.jpg', icon: 'sparkle', cat: 'advanced',
    short: 'Helps thicken collagen for a younger-looking complexion.',
    lead: 'A resurfacing treatment that helps thicken your collagen for a younger-looking complexion.',
    body: [
      'Microdermabrasion helps to thicken your collagen, which results in a younger-looking complexion.',
      'Collagen is a protein in your skin which is abundant when you\'re a child and makes skin appear taut and smooth. Collagen production declines as we age, resulting in looser, uneven skin.'
    ],
    ideal: ['Loose or uneven skin', 'Early signs of ageing', 'Texture concerns'],
    features: [['Collagen support', 'Helps skin look firmer and smoother.', 'heart'], ['Quick 15 minutes', 'Easy to add to a facial.', 'clock'], ['Combines well', 'Pairs with facials and peels.', 'layers']],
    pair: ['facial', 'chemical-peels', 'led-light-therapy']
  },
  {
    slug: 'led-light-therapy', name: 'LED Light Therapy', dur: '15 min', price: 40, img: 'led-green.jpg', icon: 'sun', cat: 'face',
    short: 'Non-invasive light wavelengths to help with acne, fine lines and healing.',
    lead: 'A non-invasive treatment using different wavelengths of light to help with acne, fine lines and healing.',
    body: [
      'LED light therapy is a non-invasive treatment that utilises different wavelengths of infrared light to help treat various skin issues such as acne, fine lines and wound healing.',
      'Many of our facials incorporate LED light to deliver specific results — or add it on its own in just 15 minutes.'
    ],
    ideal: ['Acne', 'Fine lines', 'Skin healing'],
    features: [['Non-invasive', 'Relaxing, comfortable and gentle.', 'sun'], ['Targeted wavelengths', 'Different light for different concerns.', 'sparkle'], ['15 minutes', 'A quick add-on to any visit.', 'clock']],
    pair: ['facial', 'pro-pen-luminfusion', 'chemical-peels']
  },
  {
    slug: 'lip-and-eye-treatment', name: 'Lip & Eye Treatment', dur: '15 min', price: 40, img: 'lip-eye.jpg', icon: 'eye', cat: 'face',
    short: 'A customised treatment for eyes, lips and décolleté — brighter, less puffy, hydrated.',
    lead: 'Treat your eyes, lips and décolleté to a customised treatment for the most delicate areas.',
    body: [
      'Treat your eyes, lips and décolleté to a customised treatment targeted to these delicate areas, reduce puffiness and leave eyes feeling brighter.',
      'A lip treatment typically involves gentle exfoliation, hydration and plumping to improve texture, colour and definition.'
    ],
    ideal: ['Dry, flaky lips', 'Puffy eyes', 'Delicate skin'],
    features: [['Removes dry skin', 'Gentle exfoliation for soft lips.', 'drop'], ['Hydrates', 'Antioxidants and nourishing serums.', 'heart'], ['Plumps & smooths', 'A fuller, more youthful look.', 'sparkle'], ['Restores shine', 'Enhances natural colour.', 'sun']],
    pair: ['facial', 'pro-pen-luminfusion', 'led-light-therapy']
  },
  {
    slug: 'back-treatment', name: 'Back Treatment', dur: '30 min', price: 85, img: 'back-treatment.jpg', icon: 'waves', cat: 'body',
    short: 'A back facial for the often-overlooked skin on your upper and mid-back.',
    lead: 'A back facial tailored to the unique needs of the skin on your upper and mid-back.',
    body: [
      'A back treatment in skincare — most commonly called a back facial — is a professional skincare session designed to address the unique needs of the skin on your back.',
      'It follows the same core steps as a traditional facial but is tailored for the often-overlooked upper and mid-back area, which can be prone to acne, clogged pores, dryness, rough texture and uneven tone.'
    ],
    ideal: ['Back acne', 'Clogged pores', 'Dryness', 'Rough texture', 'Uneven tone'],
    features: [['Deep cleanse', 'Clears congestion from pores.', 'drop'], ['Exfoliation', 'Smooths rough texture.', 'sparkle'], ['Hydration', 'Comforts dry, tight skin.', 'heart']],
    pair: ['facial', 'chemical-peels', 'led-light-therapy']
  },
  {
    slug: 'skin-consultation', name: 'Skin Consultation', dur: '15 min', price: 0, img: 'consultation.jpg', icon: 'chat', cat: 'virtual',
    short: 'A free virtual consultation — solutions and answers from the comfort of home.',
    lead: 'Explore solutions to your skin concerns and get answers to your questions — all from home.',
    body: [
      'Explore solutions to your skin concerns and get answers to your questions, all from the comfort of your own home.',
      'Our virtual skincare consultations offer a convenient way to address your specific needs and achieve healthier, happier skin.'
    ],
    ideal: ['New clients', 'Choosing a treatment', 'Routine questions'],
    features: [['Free', 'No cost, no commitment.', 'gift'], ['From home', 'Meet online, wherever you are.', 'laptop'], ['Personal advice', 'Tailored to your concerns.', 'heart']],
    pair: ['facial', 'pro-pen-luminfusion', 'chemical-peels']
  },
  {
    slug: 'dermaplaning', name: 'Dermaplaning', dur: '', price: null, soon: true, img: 'dermaplaning.jpg', icon: 'blade', cat: 'soon',
    short: 'Exfoliating blade treatment for a smooth, radiant surface — coming soon.',
    lead: 'An exfoliating blade treatment for a smooth, radiant surface. Launching soon.',
    body: [
      'Dermaplaning is a skin treatment that uses an exfoliating blade to skim dead skin cells and hair from your face. It\'s also called microplaning or blading.',
      'Dermaplaning aims to make your skin\'s surface smooth, youthful and radiant. It\'s also used to remove “peach fuzz” — the short, soft hairs on your face.'
    ],
    ideal: ['Dull surface', 'Peach fuzz', 'Smoother make-up application'],
    features: [['Exfoliates', 'Skims away dead skin cells.', 'sparkle'], ['Removes peach fuzz', 'Soft, fine facial hair.', 'blade'], ['Radiant finish', 'A smooth, youthful surface.', 'sun']],
    pair: ['facial', 'chemical-peels', 'led-light-therapy']
  },
  {
    slug: 'microneedling', name: 'Microneedling', dur: '', price: null, soon: true, img: 'microneedling.jpg', icon: 'wand', cat: 'soon',
    short: 'Collagen induction therapy for scars, pores and texture — coming soon.',
    lead: 'Collagen induction therapy that helps skin repair itself naturally. Launching soon.',
    body: [
      'Microneedling, also called percutaneous collagen induction therapy, is performed using a handheld, drum- or pen-shaped device, electrically powered, with tiny needles that make precise, microscopic punctures in the skin.',
      'These “micro-injuries” do not leave scars; they work by helping to stimulate the skin to repair itself naturally through a process called dermal remodelling.',
      'Microneedling is used to treat a variety of skin conditions that cause depressions in the skin such as acne scarring, surgical scars, other scars, burns, enlarged pores, wrinkles and stretch marks.'
    ],
    ideal: ['Acne scarring', 'Enlarged pores', 'Wrinkles', 'Stretch marks'],
    features: [['Dermal remodelling', 'Stimulates natural skin repair.', 'layers'], ['Precise', 'Controlled, microscopic punctures.', 'wand'], ['Many concerns', 'Scars, pores, lines and more.', 'sparkle']],
    pair: ['facial', 'chemical-peels', 'led-light-therapy']
  }
];

const POSTS = [
  {
    slug: 'facial-vs-chemical-peel', title: 'Facial or chemical peel: which is right for you?', tag: 'Treatments', date: 'October 2026', read: '3 min read', img: 'facial-portrait.jpg',
    excerpt: 'Both refresh your skin, but they work differently. Here is how to choose — or combine them.',
    body: `
<p>Booking your first professional treatment can feel like a menu with too many options. Two of the most popular — a facial and a chemical peel — are often confused, so here is a quick way to tell them apart.</p>
<h2>What a facial does</h2>
<p>A facial is designed to deeply cleanse, improve circulation, exfoliate to remove dead skin cells, then mask, moisturise and protect with SPF. It is a great fit if you are dealing with ageing, dry skin, acne or hyperpigmentation and want a complete, relaxing reset.</p>
<h2>What a chemical peel does</h2>
<p>A chemical peel uses a chemical solution to improve the texture and tone of your skin by removing the damaged outer layers. It can also be used on the neck and hands. If sun exposure, acne or time have left your skin uneven, spotted or scarred, a peel is a more targeted option.</p>
<blockquote>The best results often come from combining treatments, not choosing just one.</blockquote>
<h2>Can I combine them?</h2>
<p>Yes. Facials may be combined with chemical peels, microdermabrasion and microneedling for more comprehensive results. If you are not sure where to start, a free virtual skin consultation is the easiest way to get a personalised recommendation.</p>`
  },
  {
    slug: 'back-facial-guide', title: 'Back facials: the treatment your skin is missing', tag: 'Body', date: 'September 2026', read: '2 min read', img: 'back-treatment.jpg',
    excerpt: 'Your back gets as much sun, sweat and friction as your face — yet rarely gets the same care.',
    body: `
<p>We give our faces daily attention, but the skin on our backs is often forgotten until summer or a special event. A back facial changes that.</p>
<h2>What is a back facial?</h2>
<p>A back treatment — most commonly called a back facial — is a professional skincare session designed to address the unique needs of the skin on your back. It follows the same core steps as a traditional facial but is tailored for the upper and mid-back.</p>
<h2>Who is it for?</h2>
<p>The back can be prone to acne, clogged pores, dryness, rough texture and uneven tone. If any of that sounds familiar, a 30-minute session is a simple way to deep-clean, smooth and hydrate.</p>
<ul><li>Targets back acne and congestion</li><li>Smooths rough, bumpy texture</li><li>Hydrates dry, tight skin</li></ul>
<p>Ready to treat your back? Book online or call us to find a time that suits you.</p>`
  },
  {
    slug: 'led-light-therapy-explained', title: 'LED light therapy, explained simply', tag: 'Technology', date: 'August 2026', read: '2 min read', img: 'led-green.jpg',
    excerpt: 'A non-invasive treatment that uses light to support clearer, smoother-looking skin.',
    body: `
<p>LED light therapy sounds high-tech, but the experience is calm and comfortable: you relax while specific wavelengths of light are directed at your skin.</p>
<h2>How does it work?</h2>
<p>LED light therapy is a non-invasive treatment that uses different wavelengths of infrared light to help treat various skin issues such as acne, fine lines and wound healing. Different wavelengths are chosen for different concerns.</p>
<h2>How long does it take?</h2>
<p>A stand-alone LED session takes about 15 minutes. It is also built into many facials, and the Pro Pen Luminfusion finishes with red light therapy to enhance results.</p>
<blockquote>Fifteen minutes, no downtime, and a treatment you can add to almost any visit.</blockquote>
<p>Curious whether LED is right for your skin? Book a free virtual consultation and we will talk it through.</p>`
  }
];

module.exports = { SITE, SERVICES, POSTS };

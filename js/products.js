/* ==========================================================================
   Enchantiica — product catalogue & shared helpers
   --------------------------------------------------------------------------
   This file is the single source of truth for every product on the site.
   To swap in a real photo for a product, set its `image` field to the path
   of the photo (e.g. "images/products/rose-quartz-pendant.jpg"). While
   `image` is empty, a labelled placeholder block is rendered instead.
   ========================================================================== */
(function () {
  'use strict';

  var CATEGORIES = {
    crystals: {
      label: 'Crystals',
      href: 'crystals.html',
      subs: {
        tumblestones: 'Tumblestones',
        rough: 'Rough Crystals',
        packs: 'Crystal Packs',
        shapes: 'Shapes & Carvings'
      }
    },
    jewellery: {
      label: 'Jewellery',
      href: 'jewellery.html',
      subs: {
        necklaces: 'Necklaces & Pendants',
        bracelets: 'Bracelets',
        earrings: 'Earrings',
        rings: 'Rings'
      }
    }
  };

  /* "Good for" intentions used for filters and product tags */
  var INTENTIONS = {
    love: 'Love & Self-Love',
    calm: 'Calm & Anxiety',
    sleep: 'Sleep',
    protection: 'Protection',
    grounding: 'Grounding',
    abundance: 'Abundance',
    confidence: 'Confidence',
    clarity: 'Clarity & Focus',
    energy: 'Energy',
    intuition: 'Intuition',
    joy: 'Joy',
    cleansing: 'Cleansing'
  };

  /* Crystal meanings — shown on product pages */
  var CRYSTALS = {
    'rose-quartz': {
      name: 'Rose Quartz',
      colour: 'Soft pink',
      chakra: 'Heart',
      meaning: 'Rose Quartz is the stone of unconditional love. Gentle and soothing, it is traditionally used to open the heart, encourage self-compassion and ease emotional wounds.',
      use: 'Keep it close when you need a little tenderness — on your bedside table, in your pocket, or worn over the heart.'
    },
    'amethyst': {
      name: 'Amethyst',
      colour: 'Violet to deep purple',
      chakra: 'Third eye & crown',
      meaning: 'Amethyst is the classic stone of calm. It is said to quieten a busy mind, support restful sleep and offer a gentle sense of spiritual protection.',
      use: 'Place a piece under your pillow or on your desk when you need to slow your thoughts and settle.'
    },
    'citrine': {
      name: 'Citrine',
      colour: 'Honey to golden yellow',
      chakra: 'Solar plexus',
      meaning: 'Citrine carries the warmth of sunlight. Known as the merchant’s stone, it is associated with abundance, optimism and the confidence to go after what you want.',
      use: 'Keep it where you work or in your purse as a bright reminder of your own potential.'
    },
    'clear-quartz': {
      name: 'Clear Quartz',
      colour: 'Colourless, glassy',
      chakra: 'All (crown)',
      meaning: 'Clear Quartz is known as the master healer. It is believed to amplify intention and the energy of the stones around it, bringing clarity and focus.',
      use: 'Pair it with any other crystal to strengthen your intention, or hold it while you set a goal.'
    },
    'moonstone': {
      name: 'Moonstone',
      colour: 'Milky white with blue sheen',
      chakra: 'Sacral & crown',
      meaning: 'Moonstone is the stone of new beginnings. Its soft glow is linked to intuition, emotional balance and the natural rhythm of change.',
      use: 'Wear it during times of transition, or when you want to trust your gut a little more.'
    },
    'black-tourmaline': {
      name: 'Black Tourmaline',
      colour: 'Deep black',
      chakra: 'Root',
      meaning: 'Black Tourmaline is the ultimate protective stone. It is traditionally used to ground scattered energy and create a sense of safety and boundaries.',
      use: 'Keep one by the front door, on your desk, or wear it on days when you need a stronger shield.'
    },
    'green-aventurine': {
      name: 'Green Aventurine',
      colour: 'Shimmering green',
      chakra: 'Heart',
      meaning: 'Green Aventurine is known as the stone of opportunity. It is associated with luck, optimism and the courage to try something new.',
      use: 'Carry it in your pocket before interviews, exams or any moment where you want luck on your side.'
    },
    'tigers-eye': {
      name: 'Tiger’s Eye',
      colour: 'Golden brown, chatoyant',
      chakra: 'Solar plexus',
      meaning: 'Tiger’s Eye is a stone of courage and focus. It is said to steady the nerves, sharpen decision-making and help you act with confidence.',
      use: 'Hold it when you need to speak up, or keep it on your desk to stay on task.'
    },
    'selenite': {
      name: 'Selenite',
      colour: 'Translucent white',
      chakra: 'Crown',
      meaning: 'Selenite is a high-vibration cleansing stone. It is used to clear stagnant energy from a space and to recharge other crystals.',
      use: 'Lay your jewellery or tumblestones on a selenite wand overnight to refresh them.'
    },
    'obsidian': {
      name: 'Black Obsidian',
      colour: 'Glossy black',
      chakra: 'Root',
      meaning: 'Black Obsidian is a powerful grounding stone formed from volcanic glass. It is believed to shield against negativity and reveal what needs to be released.',
      use: 'Keep it in your living space or meditation corner when you want to feel anchored.'
    },
    'lepidolite': {
      name: 'Lepidolite',
      colour: 'Lilac',
      chakra: 'Heart & third eye',
      meaning: 'Lepidolite is a naturally lithium-rich stone associated with emotional balance and easing anxious thoughts.',
      use: 'Wear it or keep it nearby during stressful stretches.'
    },
    'howlite': {
      name: 'Howlite',
      colour: 'White with grey veins',
      chakra: 'Crown',
      meaning: 'Howlite is a calming stone used to soften frustration, slow an overactive mind and support sleep.',
      use: 'Keep it on your nightstand as part of a wind-down routine.'
    },
    'rhodonite': {
      name: 'Rhodonite',
      colour: 'Pink with black veins',
      chakra: 'Heart',
      meaning: 'Rhodonite is known as the stone of compassion — for others and for yourself.',
      use: 'Pair it with Rose Quartz for a gentle self-love practice.'
    },
    'smoky-quartz': {
      name: 'Smoky Quartz',
      colour: 'Smoky brown',
      chakra: 'Root',
      meaning: 'Smoky Quartz is a gentle grounding stone said to help release what no longer serves you.',
      use: 'Hold it when you feel overwhelmed and need to come back to earth.'
    },
    'hematite': {
      name: 'Hematite',
      colour: 'Metallic silver-grey',
      chakra: 'Root',
      meaning: 'Hematite is a dense, grounding stone associated with stability and focus.',
      use: 'Carry it when you need to feel steady and present.'
    },
    'pyrite': {
      name: 'Pyrite',
      colour: 'Metallic gold',
      chakra: 'Solar plexus',
      meaning: 'Pyrite, or fool’s gold, is a stone of ambition and abundance said to spark determination.',
      use: 'Keep it on your desk or beside your goals list.'
    },
    'mixed': {
      name: 'Mixed Crystals',
      colour: 'Various',
      chakra: 'Various',
      meaning: 'A curated combination of stones chosen to work together towards a single intention.',
      use: 'Keep the set together in its pouch or arrange the stones somewhere you will see them every day.'
    }
  };

  /* Reusable review pool — assigned to products deterministically */
  var REVIEW_POOL = [
    { name: 'Sara A.', rating: 5, title: 'Even prettier in person', body: 'The colour is gorgeous and it arrived beautifully wrapped with a little meaning card. Will definitely be ordering again.' },
    { name: 'Priya S.', rating: 5, title: 'Lovely gift', body: 'Bought this for my sister’s birthday and she hasn’t taken it off. The packaging made it feel really special.' },
    { name: 'Fatima K.', rating: 4, title: 'Beautiful quality', body: 'Really well made and the stone has a lovely glow. Took a few days longer than expected to arrive but worth the wait.' },
    { name: 'Noor M.', rating: 5, title: 'My new favourite', body: 'I wear this every day now. It feels calming just having it on and I’ve had so many compliments.' },
    { name: 'Aisha R.', rating: 5, title: 'Fast delivery, great service', body: 'Arrived in Dubai the next day and the team replied to my sizing question on Instagram within the hour. Couldn’t ask for more.' },
    { name: 'Layla H.', rating: 4, title: 'Great stone, slightly smaller than I imagined', body: 'Really pretty and good quality. I’d just recommend checking the measurements before you order.' },
    { name: 'Mariam S.', rating: 5, title: 'Exactly what I was looking for', body: 'I’ve been collecting crystals for years and the quality here is some of the best I’ve found online.' },
    { name: 'Hannah L.', rating: 5, title: 'So calming', body: 'I keep this by my bed and genuinely feel it helps me wind down. The little info card was a sweet touch.' },
    { name: 'Reem T.', rating: 5, title: 'Third order and counting', body: 'Everything I’ve bought from Enchantiica has been lovely. This one is no exception.' },
    { name: 'Yasmin D.', rating: 4, title: 'Really pleased', body: 'Nice weight to it and the finish is lovely. Would have given five stars if the chain was a little longer.' },
    { name: 'Dana F.', rating: 5, title: 'Perfect little treat', body: 'Treated myself after a rough month and it made me smile as soon as I opened it.' },
    { name: 'Nadia H.', rating: 5, title: 'Stunning', body: 'Photos don’t do it justice. The stone catches the light beautifully.' }
  ];

  var products = [
    /* ------------------------------------------------------------------ */
    /* CRYSTALS — Tumblestones                                              */
    /* ------------------------------------------------------------------ */
    {
      id: 'rose-quartz-tumblestone', name: 'Rose Quartz Tumblestone',
      category: 'crystals', sub: 'tumblestones', crystal: 'rose-quartz',
      price: 15, helps: ['love', 'calm'], bestseller: true, rating: 4.9, reviewCount: 214,
      short: 'A pocket-sized piece of gentle, heart-opening love.',
      long: 'Each Rose Quartz tumblestone is hand-selected for its soft, milky pink tone and smooth finish. Roughly 2–3 cm, it is the perfect size to carry in a pocket, tuck into a bra or keep on your bedside table. Every stone is cleansed before it is sent to you.',
      variants: { label: 'Size', options: ['Small (2–2.5 cm)', 'Medium (2.5–3 cm)'] },
      image: ''
    },
    {
      id: 'amethyst-tumblestone', name: 'Amethyst Tumblestone',
      category: 'crystals', sub: 'tumblestones', crystal: 'amethyst',
      price: 18, helps: ['calm', 'sleep', 'protection'], bestseller: true, rating: 4.8, reviewCount: 187,
      short: 'A calming little companion for restless minds and late nights.',
      long: 'Our Amethyst tumblestones are chosen for their rich violet colour and glassy polish. Around 2–3 cm each, they sit beautifully on a nightstand or in a meditation corner. Naturally, every stone varies slightly in shade and shape.',
      variants: { label: 'Size', options: ['Small (2–2.5 cm)', 'Medium (2.5–3 cm)'] },
      image: ''
    },
    {
      id: 'citrine-tumblestone', name: 'Citrine Tumblestone',
      category: 'crystals', sub: 'tumblestones', crystal: 'citrine',
      price: 20, helps: ['abundance', 'confidence', 'joy'], bestseller: false, rating: 4.7, reviewCount: 96,
      short: 'A little drop of sunshine for your pocket or purse.',
      long: 'Warm, honey-toned Citrine tumblestones, each around 2–3 cm. Citrine is a favourite for anyone starting a new venture or wanting to invite more optimism into their day. Cleansed and charged before dispatch.',
      variants: { label: 'Size', options: ['Small (2–2.5 cm)', 'Medium (2.5–3 cm)'] },
      image: ''
    },
    {
      id: 'black-tourmaline-tumblestone', name: 'Black Tourmaline Tumblestone',
      category: 'crystals', sub: 'tumblestones', crystal: 'black-tourmaline',
      price: 18, helps: ['protection', 'grounding'], bestseller: false, rating: 4.8, reviewCount: 142,
      short: 'A grounding shield to keep close on heavy days.',
      long: 'Smooth, deep-black Tourmaline tumblestones around 2–3 cm. A go-to protective stone, it is often kept by the front door, on a desk or in a coat pocket. Each piece is unique in shape and finish.',
      variants: { label: 'Size', options: ['Small (2–2.5 cm)', 'Medium (2.5–3 cm)'] },
      image: ''
    },
    {
      id: 'clear-quartz-tumblestone', name: 'Clear Quartz Tumblestone',
      category: 'crystals', sub: 'tumblestones', crystal: 'clear-quartz',
      price: 14, helps: ['clarity', 'energy'], bestseller: false, rating: 4.7, reviewCount: 78,
      short: 'The master healer — clear, bright and endlessly versatile.',
      long: 'Glassy Clear Quartz tumblestones, roughly 2–3 cm. Add one to any crystal grid or set to amplify the intention of the stones around it. A lovely first crystal for anyone starting their collection.',
      variants: { label: 'Size', options: ['Small (2–2.5 cm)', 'Medium (2.5–3 cm)'] },
      image: ''
    },
    {
      id: 'green-aventurine-tumblestone', name: 'Green Aventurine Tumblestone',
      category: 'crystals', sub: 'tumblestones', crystal: 'green-aventurine',
      price: 15, helps: ['abundance', 'joy', 'confidence'], bestseller: false, rating: 4.6, reviewCount: 64,
      short: 'The stone of opportunity, for luck and fresh starts.',
      long: 'Shimmering green Aventurine tumblestones around 2–3 cm. Traditionally carried for good fortune, it is a lovely stone to keep in your pocket before an interview, exam or first date.',
      variants: { label: 'Size', options: ['Small (2–2.5 cm)', 'Medium (2.5–3 cm)'] },
      image: ''
    },
    {
      id: 'tigers-eye-tumblestone', name: 'Tiger’s Eye Tumblestone',
      category: 'crystals', sub: 'tumblestones', crystal: 'tigers-eye',
      price: 15, helps: ['confidence', 'clarity', 'grounding'], bestseller: false, rating: 4.7, reviewCount: 59,
      short: 'Golden, grounding courage in the palm of your hand.',
      long: 'Beautifully banded Tiger’s Eye tumblestones with a silky chatoyant glow. Around 2–3 cm. Keep one on your desk when you need to stay focused, or in your pocket when you need a little bravery.',
      variants: { label: 'Size', options: ['Small (2–2.5 cm)', 'Medium (2.5–3 cm)'] },
      image: ''
    },

    /* ------------------------------------------------------------------ */
    /* CRYSTALS — Rough                                                     */
    /* ------------------------------------------------------------------ */
    {
      id: 'amethyst-cluster', name: 'Amethyst Cluster',
      category: 'crystals', sub: 'rough', crystal: 'amethyst',
      price: 130, helps: ['calm', 'sleep', 'protection'], bestseller: true, rating: 4.9, reviewCount: 88,
      short: 'A natural amethyst cluster to bring calm to any room.',
      long: 'A raw Amethyst cluster with sparkling, deep-violet points on a natural base. Each cluster is roughly 6–8 cm across and is chosen for colour and sparkle. Perfect for a bedside table, bookshelf or meditation space.',
      variants: { label: 'Size', options: ['Small (5–6 cm)', 'Medium (6–8 cm)', 'Large (8–10 cm)'] },
      prices: { 'Small (5–6 cm)': 130, 'Medium (6–8 cm)': 195, 'Large (8–10 cm)': 295 },
      image: ''
    },
    {
      id: 'rose-quartz-rough', name: 'Raw Rose Quartz Chunk',
      category: 'crystals', sub: 'rough', crystal: 'rose-quartz',
      price: 40, helps: ['love', 'calm'], bestseller: false, rating: 4.8, reviewCount: 71,
      short: 'Unpolished, natural rose quartz, straight from the earth.',
      long: 'A raw Rose Quartz chunk with a lovely soft pink colour and natural, unpolished edges. Around 5–7 cm. Raw stones are believed to hold a purer, gentler energy — ideal for a bedroom or living space.',
      variants: { label: 'Size', options: ['Medium (5–7 cm)', 'Large (8–10 cm)'] },
      prices: { 'Medium (5–7 cm)': 40, 'Large (8–10 cm)': 75 },
      image: ''
    },
    {
      id: 'selenite-wand', name: 'Selenite Charging Wand',
      category: 'crystals', sub: 'rough', crystal: 'selenite',
      price: 28, helps: ['cleansing', 'clarity', 'calm'], bestseller: true, rating: 4.9, reviewCount: 163,
      short: 'Cleanse and recharge your crystals and jewellery overnight.',
      long: 'A natural, pearly-white Selenite wand, roughly 15 cm long. Lay your jewellery or tumblestones on it overnight to clear and recharge them. Selenite is soft and water-soluble, so keep it dry.',
      variants: { label: 'Length', options: ['10 cm', '15 cm', '20 cm'] },
      prices: { '10 cm': 28, '15 cm': 40, '20 cm': 55 },
      image: ''
    },
    {
      id: 'clear-quartz-point-rough', name: 'Raw Clear Quartz Point',
      category: 'crystals', sub: 'rough', crystal: 'clear-quartz',
      price: 55, helps: ['clarity', 'energy'], bestseller: false, rating: 4.7, reviewCount: 44,
      short: 'A natural quartz point for focus, intention and clarity.',
      long: 'A single natural Clear Quartz point with a raw, unpolished base and a bright, glassy tip. Roughly 5–7 cm long. Point it towards you to draw energy in, or away to release what you no longer need.',
      variants: { label: 'Size', options: ['Medium (5–7 cm)', 'Large (8–10 cm)'] },
      prices: { 'Medium (5–7 cm)': 55, 'Large (8–10 cm)': 100 },
      image: ''
    },
    {
      id: 'citrine-cluster', name: 'Citrine Cluster',
      category: 'crystals', sub: 'rough', crystal: 'citrine',
      price: 110, helps: ['abundance', 'joy', 'energy'], bestseller: false, rating: 4.7, reviewCount: 37,
      short: 'A sun-kissed cluster to brighten your workspace.',
      long: 'A sparkling Citrine cluster with golden-amber points. Around 6–8 cm across. Citrine clusters are popular for desks, studios and anywhere you make things happen.',
      variants: { label: 'Size', options: ['Small (5–6 cm)', 'Medium (6–8 cm)'] },
      prices: { 'Small (5–6 cm)': 110, 'Medium (6–8 cm)': 165 },
      image: ''
    },
    {
      id: 'black-tourmaline-rough', name: 'Raw Black Tourmaline',
      category: 'crystals', sub: 'rough', crystal: 'black-tourmaline',
      price: 35, helps: ['protection', 'grounding'], bestseller: false, rating: 4.8, reviewCount: 92,
      short: 'A raw protective stone for doorways, desks and bedsides.',
      long: 'A rough, naturally striated piece of Black Tourmaline around 4–6 cm. Raw Tourmaline is prized for its strong grounding qualities. Please note raw pieces can be brittle — handle with care.',
      variants: { label: 'Size', options: ['Medium (4–6 cm)', 'Large (7–9 cm)'] },
      prices: { 'Medium (4–6 cm)': 35, 'Large (7–9 cm)': 65 },
      image: ''
    },

    /* ------------------------------------------------------------------ */
    /* CRYSTALS — Packs                                                     */
    /* ------------------------------------------------------------------ */
    {
      id: 'self-love-crystal-pack', name: 'Self-Love Crystal Set',
      category: 'crystals', sub: 'packs', crystal: 'mixed',
      contents: ['rose-quartz', 'rhodonite', 'green-aventurine', 'clear-quartz'],
      price: 85, helps: ['love', 'confidence', 'calm'], bestseller: true, rating: 4.9, reviewCount: 156,
      short: 'Four stones chosen to help you soften towards yourself.',
      long: 'A curated set of four tumblestones — Rose Quartz, Rhodonite, Green Aventurine and Clear Quartz — presented in a blush cotton pouch with a printed meaning card. A gentle reminder to treat yourself with the kindness you give everyone else.',
      variants: null,
      image: ''
    },
    {
      id: 'calm-sleep-crystal-pack', name: 'Calm & Sleep Crystal Set',
      category: 'crystals', sub: 'packs', crystal: 'mixed',
      contents: ['amethyst', 'lepidolite', 'howlite', 'selenite'],
      price: 85, helps: ['sleep', 'calm'], bestseller: true, rating: 4.9, reviewCount: 203,
      short: 'A bedside set for slower evenings and softer nights.',
      long: 'Amethyst, Lepidolite, Howlite and a mini Selenite stick, chosen to support a calmer wind-down routine. Comes in a cotton pouch with a card explaining each stone and a simple bedtime ritual to try.',
      variants: null,
      image: ''
    },
    {
      id: 'protection-crystal-pack', name: 'Protection Crystal Set',
      category: 'crystals', sub: 'packs', crystal: 'mixed',
      contents: ['black-tourmaline', 'obsidian', 'smoky-quartz', 'hematite'],
      price: 85, helps: ['protection', 'grounding'], bestseller: false, rating: 4.8, reviewCount: 97,
      short: 'Four grounding stones to shield your space and your energy.',
      long: 'Black Tourmaline, Black Obsidian, Smoky Quartz and Hematite — a classic protective combination. Keep the set by your front door, on your desk or carry a stone with you on days that feel heavy.',
      variants: null,
      image: ''
    },
    {
      id: 'abundance-crystal-pack', name: 'Abundance & Success Set',
      category: 'crystals', sub: 'packs', crystal: 'mixed',
      contents: ['citrine', 'pyrite', 'green-aventurine', 'tigers-eye'],
      price: 85, helps: ['abundance', 'confidence', 'clarity'], bestseller: false, rating: 4.7, reviewCount: 84,
      short: 'A golden set for goals, launches and fresh beginnings.',
      long: 'Citrine, Pyrite, Green Aventurine and Tiger’s Eye, chosen to support ambition, opportunity and focus. A lovely gift for anyone starting a business, a new job or a big project.',
      variants: null,
      image: ''
    },
    {
      id: 'beginners-crystal-pack', name: 'The Beginner’s Crystal Kit',
      category: 'crystals', sub: 'packs', crystal: 'mixed',
      contents: ['rose-quartz', 'amethyst', 'citrine', 'clear-quartz', 'black-tourmaline', 'green-aventurine', 'selenite'],
      price: 150, helps: ['love', 'calm', 'protection', 'clarity'], bestseller: true, rating: 4.9, reviewCount: 231,
      short: 'Seven essential crystals and a guide to get you started.',
      long: 'Everything you need to begin: Rose Quartz, Amethyst, Citrine, Clear Quartz, Black Tourmaline, Green Aventurine and a Selenite stick for cleansing. Packed in a keepsake box with a 12-page illustrated guide to meanings, cleansing and simple rituals.',
      variants: null,
      image: ''
    },
    {
      id: 'chakra-crystal-pack', name: 'Seven Chakra Crystal Set',
      category: 'crystals', sub: 'packs', crystal: 'mixed',
      contents: ['amethyst', 'clear-quartz', 'citrine', 'green-aventurine', 'tigers-eye', 'obsidian', 'rose-quartz'],
      price: 100, helps: ['energy', 'calm', 'clarity'], bestseller: false, rating: 4.8, reviewCount: 68,
      short: 'One stone for each chakra, from root to crown.',
      long: 'A balanced set of seven tumblestones, one for each energy centre, with a fold-out card showing where each stone sits and what it supports. Presented in a cream cotton pouch.',
      variants: null,
      image: ''
    },

    /* ------------------------------------------------------------------ */
    /* CRYSTALS — Shapes                                                    */
    /* ------------------------------------------------------------------ */
    {
      id: 'rose-quartz-heart', name: 'Rose Quartz Heart',
      category: 'crystals', sub: 'shapes', crystal: 'rose-quartz',
      price: 38, helps: ['love', 'calm'], bestseller: true, rating: 4.9, reviewCount: 178,
      short: 'A polished heart that says it all.',
      long: 'A hand-polished Rose Quartz heart, around 4 cm across, with a soft, even pink tone. A beautiful gift for someone you love — or a daily reminder to be kinder to yourself.',
      variants: { label: 'Size', options: ['Small (3 cm)', 'Medium (4 cm)', 'Large (5 cm)'] },
      prices: { 'Small (3 cm)': 38, 'Medium (4 cm)': 55, 'Large (5 cm)': 85 },
      image: ''
    },
    {
      id: 'amethyst-tower', name: 'Amethyst Tower',
      category: 'crystals', sub: 'shapes', crystal: 'amethyst',
      price: 85, helps: ['calm', 'sleep', 'protection'], bestseller: false, rating: 4.8, reviewCount: 61,
      short: 'A polished tower to anchor calm in any space.',
      long: 'A six-sided polished Amethyst tower with a natural gradient from pale lilac to deep purple. Around 7–9 cm tall. Towers are said to direct energy upwards and are a lovely centrepiece for a crystal collection.',
      variants: { label: 'Height', options: ['Small (5–7 cm)', 'Medium (7–9 cm)', 'Large (10–12 cm)'] },
      prices: { 'Small (5–7 cm)': 85, 'Medium (7–9 cm)': 120, 'Large (10–12 cm)': 195 },
      image: ''
    },
    {
      id: 'clear-quartz-sphere', name: 'Clear Quartz Sphere',
      category: 'crystals', sub: 'shapes', crystal: 'clear-quartz',
      price: 155, helps: ['clarity', 'energy'], bestseller: false, rating: 4.8, reviewCount: 29,
      short: 'A clear, luminous sphere that catches every ray of light.',
      long: 'A polished Clear Quartz sphere around 4–5 cm in diameter, with natural inclusions and rainbows. Supplied with a small wooden stand. Spheres radiate energy evenly in every direction, making them lovely for the centre of a room.',
      variants: { label: 'Diameter', options: ['4 cm', '5 cm', '6 cm'] },
      prices: { '4 cm': 155, '5 cm': 220, '6 cm': 315 },
      image: ''
    },
    {
      id: 'moonstone-palm-stone', name: 'Moonstone Palm Stone',
      category: 'crystals', sub: 'shapes', crystal: 'moonstone',
      price: 75, helps: ['intuition', 'calm'], bestseller: false, rating: 4.8, reviewCount: 53,
      short: 'A smooth worry stone with a soft, shifting glow.',
      long: 'An oval Moonstone palm stone, around 5 cm, polished to a silky finish and shaped to sit comfortably in your hand. Hold it during meditation or keep it in your bag for moments when you need to steady yourself.',
      variants: null,
      image: ''
    },
    {
      id: 'obsidian-tower', name: 'Black Obsidian Tower',
      category: 'crystals', sub: 'shapes', crystal: 'obsidian',
      price: 75, helps: ['protection', 'grounding'], bestseller: false, rating: 4.7, reviewCount: 41,
      short: 'A sleek, mirror-black tower for grounding and protection.',
      long: 'A polished Black Obsidian tower with a glossy, glass-like finish. Around 8 cm tall. A striking piece for an entryway or desk, and a favourite for anyone drawn to darker, more grounding stones.',
      variants: { label: 'Height', options: ['Small (6 cm)', 'Medium (8 cm)', 'Large (11 cm)'] },
      prices: { 'Small (6 cm)': 75, 'Medium (8 cm)': 100, 'Large (11 cm)': 155 },
      image: ''
    },
    {
      id: 'citrine-point', name: 'Citrine Point',
      category: 'crystals', sub: 'shapes', crystal: 'citrine',
      price: 65, helps: ['abundance', 'joy', 'energy'], bestseller: false, rating: 4.7, reviewCount: 48,
      short: 'A polished golden point to focus your intentions.',
      long: 'A polished Citrine point with a warm, honey glow, around 6–7 cm tall. Place it where you work or plan to keep your goals front of mind.',
      variants: { label: 'Height', options: ['Small (5 cm)', 'Medium (7 cm)'] },
      prices: { 'Small (5 cm)': 65, 'Medium (7 cm)': 90 },
      image: ''
    },

    /* ------------------------------------------------------------------ */
    /* JEWELLERY — Necklaces & Pendants                                     */
    /* ------------------------------------------------------------------ */
    {
      id: 'rose-quartz-pendant', name: 'Rose Quartz Heart Pendant Necklace',
      category: 'jewellery', sub: 'necklaces', crystal: 'rose-quartz',
      price: 175, helps: ['love', 'calm'], bestseller: true, rating: 4.9, reviewCount: 312,
      short: 'Our signature heart pendant on a fine gold-plated chain.',
      long: 'A softly polished Rose Quartz heart, around 15 mm, set in an 18ct gold-plated sterling silver cap and hung on a fine, adjustable cable chain. Delicate enough for every day and beautiful layered with longer pieces. Arrives in a blush gift box with a meaning card.',
      variants: { label: 'Chain length', options: ['16" (40 cm)', '18" (45 cm)', '20" (50 cm)'] },
      image: ''
    },
    {
      id: 'amethyst-point-pendant', name: 'Amethyst Point Pendant',
      category: 'jewellery', sub: 'necklaces', crystal: 'amethyst',
      price: 195, helps: ['calm', 'sleep', 'protection'], bestseller: true, rating: 4.8, reviewCount: 198,
      short: 'A faceted amethyst point to wear close to your heart.',
      long: 'A polished Amethyst point, around 20 mm, capped in 18ct gold-plated sterling silver on an adjustable chain. The colour ranges from pale lilac to deep violet, so each necklace is one of a kind.',
      variants: { label: 'Chain length', options: ['16" (40 cm)', '18" (45 cm)', '20" (50 cm)'] },
      image: ''
    },
    {
      id: 'moonstone-drop-necklace', name: 'Moonstone Drop Necklace',
      category: 'jewellery', sub: 'necklaces', crystal: 'moonstone',
      price: 220, helps: ['intuition', 'calm'], bestseller: false, rating: 4.9, reviewCount: 124,
      short: 'A single rainbow moonstone teardrop with a soft blue flash.',
      long: 'A bezel-set Rainbow Moonstone teardrop, around 12 mm, on a fine 18ct gold-plated chain. Moonstone shifts from milky white to a soft blue sheen as it moves — a subtle, elegant piece for day or evening.',
      variants: { label: 'Chain length', options: ['16" (40 cm)', '18" (45 cm)'] },
      image: ''
    },
    {
      id: 'clear-quartz-pendant', name: 'Clear Quartz Crystal Pendant',
      category: 'jewellery', sub: 'necklaces', crystal: 'clear-quartz',
      price: 165, helps: ['clarity', 'energy'], bestseller: false, rating: 4.7, reviewCount: 86,
      short: 'A clean, bright quartz point on a minimal chain.',
      long: 'A polished Clear Quartz point, around 22 mm, capped in gold-plated sterling silver. Clear Quartz is believed to amplify intention, making this a lovely piece to layer with other crystal pendants.',
      variants: { label: 'Chain length', options: ['16" (40 cm)', '18" (45 cm)', '20" (50 cm)'] },
      image: ''
    },
    {
      id: 'citrine-pendant', name: 'Citrine Sunburst Pendant',
      category: 'jewellery', sub: 'necklaces', crystal: 'citrine',
      price: 200, helps: ['abundance', 'joy', 'confidence'], bestseller: false, rating: 4.8, reviewCount: 72,
      short: 'A warm citrine cabochon in a delicate sunburst setting.',
      long: 'A 10 mm honey-toned Citrine cabochon set in a hand-finished, gold-plated sunburst frame. A joyful piece that pairs beautifully with warm tones and summer wardrobes.',
      variants: { label: 'Chain length', options: ['16" (40 cm)', '18" (45 cm)'] },
      image: ''
    },

    /* ------------------------------------------------------------------ */
    /* JEWELLERY — Bracelets                                                */
    /* ------------------------------------------------------------------ */
    {
      id: 'amethyst-bead-bracelet', name: 'Amethyst Bead Bracelet',
      category: 'jewellery', sub: 'bracelets', crystal: 'amethyst',
      price: 100, helps: ['calm', 'sleep', 'protection'], bestseller: true, rating: 4.9, reviewCount: 267,
      short: 'Smooth 6 mm amethyst beads on a strong stretch cord.',
      long: 'Hand-strung 6 mm Amethyst beads with a single gold-plated spacer bead, on a durable stretch cord. Comfortable enough to wear all day and lovely stacked with our Rose Quartz and Citrine bracelets.',
      variants: { label: 'Wrist size', options: ['Small (15–16 cm)', 'Medium (17–18 cm)', 'Large (19–20 cm)'] },
      image: ''
    },
    {
      id: 'rose-quartz-bead-bracelet', name: 'Rose Quartz Bead Bracelet',
      category: 'jewellery', sub: 'bracelets', crystal: 'rose-quartz',
      price: 100, helps: ['love', 'calm'], bestseller: true, rating: 4.9, reviewCount: 241,
      short: 'Soft pink beads for a daily dose of self-love.',
      long: 'Hand-strung 6 mm Rose Quartz beads with a gold-plated spacer, on a strong stretch cord. Our most-gifted bracelet — sweet on its own and even prettier as part of a stack.',
      variants: { label: 'Wrist size', options: ['Small (15–16 cm)', 'Medium (17–18 cm)', 'Large (19–20 cm)'] },
      image: ''
    },
    {
      id: 'black-tourmaline-bracelet', name: 'Black Tourmaline Protection Bracelet',
      category: 'jewellery', sub: 'bracelets', crystal: 'black-tourmaline',
      price: 110, helps: ['protection', 'grounding'], bestseller: false, rating: 4.8, reviewCount: 133,
      short: 'A sleek protective bracelet for everyday wear.',
      long: 'Matte-finish 6 mm Black Tourmaline beads with a single gold-plated accent bead, on a durable stretch cord. Understated, unisex and a favourite for anyone who wants a little extra grounding through the day.',
      variants: { label: 'Wrist size', options: ['Small (15–16 cm)', 'Medium (17–18 cm)', 'Large (19–20 cm)'] },
      image: ''
    },
    {
      id: 'citrine-bracelet', name: 'Citrine Abundance Bracelet',
      category: 'jewellery', sub: 'bracelets', crystal: 'citrine',
      price: 110, helps: ['abundance', 'confidence', 'joy'], bestseller: false, rating: 4.7, reviewCount: 88,
      short: 'Warm golden beads to wear while you chase your goals.',
      long: 'Hand-strung 6 mm Citrine beads with a gold-plated spacer bead on a strong stretch cord. Citrine is a lovely stone for new chapters — new jobs, new businesses, new homes.',
      variants: { label: 'Wrist size', options: ['Small (15–16 cm)', 'Medium (17–18 cm)', 'Large (19–20 cm)'] },
      image: ''
    },
    {
      id: 'calm-stack-bracelet-set', name: 'Calm Stack Bracelet Set',
      category: 'jewellery', sub: 'bracelets', crystal: 'mixed',
      contents: ['amethyst', 'howlite', 'lepidolite'],
      price: 250, helps: ['calm', 'sleep'], bestseller: false, rating: 4.9, reviewCount: 76,
      short: 'Three bracelets, one intention: a calmer you.',
      long: 'A set of three 6 mm bead bracelets — Amethyst, Howlite and Lepidolite — chosen to work together for calm and better sleep. Presented in a gift box with a meaning card. Save AED 50 versus buying the bracelets separately.',
      variants: { label: 'Wrist size', options: ['Small (15–16 cm)', 'Medium (17–18 cm)', 'Large (19–20 cm)'] },
      image: ''
    },

    /* ------------------------------------------------------------------ */
    /* JEWELLERY — Earrings                                                 */
    /* ------------------------------------------------------------------ */
    {
      id: 'moonstone-earrings', name: 'Moonstone Drop Earrings',
      category: 'jewellery', sub: 'earrings', crystal: 'moonstone',
      price: 155, helps: ['intuition', 'calm'], bestseller: true, rating: 4.9, reviewCount: 189,
      short: 'Delicate moonstone drops with a soft blue flash.',
      long: 'Bezel-set Rainbow Moonstone teardrops, around 8 mm, on 18ct gold-plated sterling silver hooks. Light enough for all-day wear and beautiful with both gold and silver pieces.',
      variants: null,
      image: ''
    },
    {
      id: 'rose-quartz-stud-earrings', name: 'Rose Quartz Stud Earrings',
      category: 'jewellery', sub: 'earrings', crystal: 'rose-quartz',
      price: 120, helps: ['love', 'calm'], bestseller: false, rating: 4.8, reviewCount: 117,
      short: 'Tiny, everyday studs in the softest pink.',
      long: 'Round 5 mm Rose Quartz cabochons in gold-plated sterling silver settings with butterfly backs. Minimal enough for work, sweet enough for weekends.',
      variants: null,
      image: ''
    },
    {
      id: 'amethyst-huggie-earrings', name: 'Amethyst Huggie Hoops',
      category: 'jewellery', sub: 'earrings', crystal: 'amethyst',
      price: 145, helps: ['calm', 'protection'], bestseller: false, rating: 4.8, reviewCount: 94,
      short: 'Small gold huggies with a single amethyst charm.',
      long: '12 mm gold-plated sterling silver huggie hoops with a detachable faceted Amethyst charm. Wear them with the charm for a pop of colour, or without for a classic everyday hoop.',
      variants: null,
      image: ''
    },
    {
      id: 'citrine-threader-earrings', name: 'Citrine Threader Earrings',
      category: 'jewellery', sub: 'earrings', crystal: 'citrine',
      price: 140, helps: ['joy', 'confidence', 'abundance'], bestseller: false, rating: 4.7, reviewCount: 58,
      short: 'Fine gold threaders finished with a citrine drop.',
      long: 'Gold-plated sterling silver threader chains, around 7 cm, finished with a small faceted Citrine drop. Elegant, lightweight and lovely for evenings out.',
      variants: null,
      image: ''
    },

    /* ------------------------------------------------------------------ */
    /* JEWELLERY — Rings                                                    */
    /* ------------------------------------------------------------------ */
    {
      id: 'moonstone-ring', name: 'Moonstone Oval Ring',
      category: 'jewellery', sub: 'rings', crystal: 'moonstone',
      price: 210, helps: ['intuition', 'calm'], bestseller: true, rating: 4.9, reviewCount: 142,
      short: 'A bezel-set oval moonstone on a slim gold band.',
      long: 'An 8 × 6 mm Rainbow Moonstone cabochon, bezel-set on a slim 18ct gold-plated sterling silver band. The stone shifts from white to a soft blue sheen as your hand moves. A beautiful ring for new beginnings.',
      variants: { label: 'Ring size (US)', options: ['5', '6', '7', '8', '9'] },
      image: ''
    },
    {
      id: 'rose-quartz-ring', name: 'Rose Quartz Stacking Ring',
      category: 'jewellery', sub: 'rings', crystal: 'rose-quartz',
      price: 155, helps: ['love', 'calm'], bestseller: false, rating: 4.8, reviewCount: 103,
      short: 'A dainty stacking ring with a single pink stone.',
      long: 'A 4 mm round Rose Quartz cabochon on a fine 1.5 mm gold-plated sterling silver band. Designed to be stacked with our other slim rings or worn alone for a minimal look.',
      variants: { label: 'Ring size (US)', options: ['5', '6', '7', '8', '9'] },
      image: ''
    },
    {
      id: 'amethyst-ring', name: 'Amethyst Cabochon Ring',
      category: 'jewellery', sub: 'rings', crystal: 'amethyst',
      price: 200, helps: ['calm', 'sleep', 'protection'], bestseller: false, rating: 4.8, reviewCount: 79,
      short: 'A deep violet cabochon in a smooth bezel setting.',
      long: 'A 7 mm round Amethyst cabochon, bezel-set on an 18ct gold-plated sterling silver band. The rich colour makes it a lovely statement piece that still feels understated.',
      variants: { label: 'Ring size (US)', options: ['5', '6', '7', '8', '9'] },
      image: ''
    },
    {
      id: 'clear-quartz-ring', name: 'Clear Quartz Solitaire Ring',
      category: 'jewellery', sub: 'rings', crystal: 'clear-quartz',
      price: 185, helps: ['clarity', 'energy'], bestseller: false, rating: 4.7, reviewCount: 66,
      short: 'A bright, faceted quartz solitaire on a slim gold band.',
      long: 'A 5 mm faceted Clear Quartz, claw-set on a slim gold-plated sterling silver band. Clean, bright and timeless — a lovely alternative to a traditional solitaire.',
      variants: { label: 'Ring size (US)', options: ['5', '6', '7', '8', '9'] },
      image: ''
    }
  ];

  /* ---------------------------------------------------------------------- */
  /* Helpers                                                                 */
  /* ---------------------------------------------------------------------- */

  /* Prices are in UAE dirhams. Whole-dirham prices show as "AED 175"; totals with
   a discount can carry fils, e.g. "AED 157.50". currencyDisplay 'code' keeps the
   "AED" prefix consistent across browsers. */
var whole = new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', currencyDisplay: 'code', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  var fils = new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', currencyDisplay: 'code', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function formatPrice(n) {
    return (Math.round(n * 100) % 100 === 0 ? whole : fils).format(n);
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getProduct(id) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  /* Variant price: use `prices` map if provided, else base price */
  function priceFor(product, variant) {
    if (product.prices && variant && product.prices[variant] != null) {
      return product.prices[variant];
    }
    return product.price;
  }

  /* Lowest price across variants (for "From AED x" on cards) */
  function priceRange(product) {
    if (!product.prices) return { min: product.price, max: product.price };
    var min = Infinity, max = -Infinity;
    for (var k in product.prices) {
      if (Object.prototype.hasOwnProperty.call(product.prices, k)) {
        min = Math.min(min, product.prices[k]);
        max = Math.max(max, product.prices[k]);
      }
    }
    return { min: min, max: max };
  }

  function crystalName(id) {
    return CRYSTALS[id] ? CRYSTALS[id].name : id;
  }

  function intentionLabel(id) {
    return INTENTIONS[id] || id;
  }

  /* Deterministic review selection so every product page is stable */
  function reviewsFor(product) {
    var hash = 0;
    for (var i = 0; i < product.id.length; i++) {
      hash = (hash * 31 + product.id.charCodeAt(i)) >>> 0;
    }
    var count = 2 + (hash % 2); /* 2 or 3 reviews */
    var out = [];
    for (var j = 0; j < count; j++) {
      out.push(REVIEW_POOL[(hash + j * 5) % REVIEW_POOL.length]);
    }
    return out;
  }

  /* Placeholder / image media block ---------------------------------------
     Renders either a real <img> (when `src` is set) or a labelled placeholder.
     `ratio` should be a CSS class modifier: 'portrait' (4:5), 'square', 'wide'. */
  function mediaHTML(opts) {
    var label = escapeHTML(opts.label || 'Image');
    var ratio = opts.ratio || 'portrait';
    var extra = opts.className ? ' ' + opts.className : '';
    if (opts.src) {
      return '<div class="media media--' + ratio + extra + '">' +
        '<img class="media__img" src="' + escapeHTML(opts.src) + '" alt="' + label + '" loading="' + (opts.eager ? 'eager' : 'lazy') + '" decoding="async">' +
        '</div>';
    }
    return '<div class="media media--' + ratio + extra + '">' +
      '<div class="ph" role="img" aria-label="Image placeholder: ' + label + '">' +
      '<span class="ph__icon" aria-hidden="true"></span>' +
      '<span class="ph__name">' + label + '</span>' +
      '<span class="ph__tag">Image placeholder</span>' +
      '</div></div>';
  }

  function starsHTML(rating) {
    var full = Math.round(rating);
    var html = '<span class="stars" role="img" aria-label="' + rating + ' out of 5 stars">';
    for (var i = 1; i <= 5; i++) {
      html += '<span class="star' + (i <= full ? ' star--on' : '') + '" aria-hidden="true">★</span>';
    }
    return html + '</span>';
  }

  /* Product card used on home, shop, category and related-products grids */
  function productCardHTML(p) {
    var range = priceRange(p);
    var priceText = range.min !== range.max ? 'From ' + formatPrice(range.min) : formatPrice(range.min);
    var tags = p.helps.slice(0, 2).map(function (h) {
      return '<span class="tag">' + escapeHTML(intentionLabel(h)) + '</span>';
    }).join('');
    var quickAddAttrs = p.variants ? '' : ' data-add-to-cart="' + p.id + '"';
    var quickAddHref = p.variants ? ' href="product.html?id=' + p.id + '"' : '';
    var quickAdd = p.variants
      ? '<a class="btn btn--small card__cta"' + quickAddHref + '>Choose options</a>'
      : '<button class="btn btn--small card__cta" type="button"' + quickAddAttrs + '>Add to bag</button>';

    return '<article class="card" data-reveal>' +
      '<a class="card__media" href="product.html?id=' + p.id + '" aria-label="' + escapeHTML(p.name) + '" tabindex="-1">' +
        mediaHTML({ label: p.name, src: p.image, ratio: 'portrait' }) +
        (p.bestseller ? '<span class="card__badge">Bestseller</span>' : '') +
      '</a>' +
      '<div class="card__body">' +
        '<p class="card__eyebrow">' + escapeHTML(crystalName(p.crystal)) + '</p>' +
        '<h3 class="card__title"><a href="product.html?id=' + p.id + '">' + escapeHTML(p.name) + '</a></h3>' +
        '<div class="card__tags">' + tags + '</div>' +
        '<div class="card__footer">' +
          '<span class="card__price">' + priceText + '</span>' +
          quickAdd +
        '</div>' +
      '</div>' +
    '</article>';
  }

  window.ENCHANTIICA = {
    products: products,
    CATEGORIES: CATEGORIES,
    INTENTIONS: INTENTIONS,
    CRYSTALS: CRYSTALS,
    formatPrice: formatPrice,
    escapeHTML: escapeHTML,
    getProduct: getProduct,
    priceFor: priceFor,
    priceRange: priceRange,
    crystalName: crystalName,
    intentionLabel: intentionLabel,
    reviewsFor: reviewsFor,
    mediaHTML: mediaHTML,
    starsHTML: starsHTML,
    productCardHTML: productCardHTML
  };
})();

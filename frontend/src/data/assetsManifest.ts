/**
 * Centralized Asset Manifest for Visitflow.
 * Verified travel photography (Wikimedia Commons) and curated category imagery,
 * kept intentionally coastal and Eastern-Corridor focused.
 */

export const ASSETS = {
  hero: {
    // Animated coastal aerial supplied for the Visitflow landing hero.
    image: '/visitflow-hero.mp4',
    poster:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Maruthamunai_beach.jpg/1280px-Maruthamunai_beach.jpg',
    alt: 'Aerial view of turquoise ocean waves and a tropical beach on Sri Lanka’s eastern coast',
  },
  /**
   * Real Eastern Province corridor destinations (slugs match the public places
   * catalogue). Photography: verified Wikimedia Commons images of each location,
   * served at the standard 1280px thumbnail size with per-image credit links.
   */
  destinations: {
    maruthamunai: {
      id: 'maruthamunai-beach',
      title: 'Maruthamunai Beach',
      region: 'Kalmunai · Eastern Shore, Sri Lanka',
      tag: 'Corridor Stop #1 · Sunrise Shore',
      categories: ['coastal'],
      image:
        'https://res.cloudinary.com/dfcq7dpvz/image/upload/v1792611991/visitflow/places/catalogue-64-maruthamunai-beach.jpg',
      creditUrl:
        'https://commons.wikimedia.org/wiki/File:Maruthamunai_beach.jpg',
      description:
        'The golden sunrise shoreline where the Eastern corridor begins — palm-shaded fisherman’s lanes, outrigger canoes, and a coastal lighthouse watching over the reef.',
      duration: 'Half Day',
      season: 'March – October',
      slug: 'maruthamunai-beach',
    },
    deegawapi: {
      id: 'deegawapi-raja-maha-vihara',
      title: 'Deegawapi Raja Maha Vihara',
      region: 'Ampara · Eastern Province, Sri Lanka',
      tag: 'Corridor Stop #10 · Ancient Sanctum',
      categories: ['heritage'],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Deegawapi.jpg/1280px-Deegawapi.jpg',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Deegawapi.jpg',
      description:
        'A venerable Raja Maha Vihara studded with thousands of stone pillars, rising from the dry forests near Ampara with a history reaching back over two millennia.',
      duration: 'Half Day',
      season: 'Year-round',
      slug: 'deegawapi-raja-maha-vihara',
    },
    kallady: {
      id: 'kallady-beach',
      title: 'Kallady Beach',
      region: 'Batticaloa · Eastern Shore, Sri Lanka',
      tag: 'Corridor Stop #9 · Lagoon Bay',
      categories: ['coastal'],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Kallady_Beach_05.jpg/1280px-Kallady_Beach_05.jpg',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Kallady_Beach_05.jpg',
      description:
        'A wide sweeping bay north of Batticaloa where the lagoon meets the sea, framed by the historic Kallady bridge and calm sandbars.',
      duration: 'Half Day',
      season: 'April – September',
      slug: 'kallady-beach',
    },
    kalmunai: {
      id: 'kalmunai-beach-beach-mosque',
      title: 'Kalmunai Beach & Beach Mosque',
      region: 'Kalmunai · Eastern Shore, Sri Lanka',
      tag: 'Corridor Stop #2 · Living Coast',
      categories: ['coastal', 'heritage'],
      image:
        'https://res.cloudinary.com/dfcq7dpvz/image/upload/v1792611979/visitflow/places/catalogue-27-maruthamunai-beach.jpg',
      creditUrl:
        'https://commons.wikimedia.org/wiki/File:Seashore_-_Kalmunai_Beach.jpg',
      description:
        'A lively fishing coast where the illuminated beach mosque stands above the shoreline and outrigger fleets return through the surf each dawn.',
      duration: 'Half Day',
      season: 'March – October',
      slug: 'kalmunai-beach-beach-mosque',
    },
    kattankudy: {
      id: 'kattankudy-heritage-museum',
      title: 'Kattankudy Heritage Museum',
      region: 'Batticaloa · Eastern Province, Sri Lanka',
      tag: 'Corridor Stop #8 · Coastal Heritage',
      categories: ['heritage'],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Heritage_Museum%2C_Kattankudy.jpg/1280px-Heritage_Museum%2C_Kattankudy.jpg',
      creditUrl:
        'https://commons.wikimedia.org/wiki/File:Heritage_Museum,_Kattankudy.jpg',
      description:
        'A community museum documenting the trade, craft, and coastal life of the Kattankudy peninsula — from fishing heritage to handloom traditions.',
      duration: '1–2 Hours',
      season: 'Year-round',
      slug: 'kattankudy-heritage-museum',
    },
    nintavur: {
      id: 'nintavur-beach-coastal-park',
      title: 'Nintavur Beach & Coastal Park',
      region: 'Ampara · Eastern Shore, Sri Lanka',
      tag: 'Corridor Stop #6 · Dune & Birdlife',
      categories: ['coastal'],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nintavur_Beach.jpg/1280px-Nintavur_Beach.jpg',
      creditUrl:
        'https://commons.wikimedia.org/wiki/File:Nintavur_Beach.jpg',
      description:
        'Quiet dune-backed shorelines and coastal parkland held between lagoon and sea — one of the corridor’s richest stretches for wading birdlife.',
      duration: 'Half Day',
      season: 'April – September',
      slug: 'nintavur-beach-coastal-park',
    },
  },
  experiences: [
    {
      id: 'slow-cultural',
      title: 'Slow Travel & Cultural Immersion',
      eyebrow: 'Tradition & Craft',
      description: 'Step into traditional weaving hamlets, centuries-old shrines, and private tea estates guided by local heritage keepers.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Heritage_Museum%2C_Kattankudy.jpg/1280px-Heritage_Museum%2C_Kattankudy.jpg',
      badge: 'Heritage',
    },
    {
      id: 'alpine-wilderness',
      title: 'Remote Mountain Expeditions',
      eyebrow: 'Solitude & Scale',
      description: 'High-altitude ridges, secluded valleys, and dramatic sunrises where silence and scale redefine your sense of horizon.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Deegawapi.jpg/1280px-Deegawapi.jpg',
      badge: 'Adventures',
    },
    {
      id: 'coastal-lagoon',
      title: 'Coastal Escapes & Lagoon Sanctuaries',
      eyebrow: 'Ocean & Still Water',
      description: 'Pristine shorelines, outrigger fishing routines, and tranquil catamaran passages between ocean reefs and interior lagoons.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Kallady_Beach_05.jpg/1280px-Kallady_Beach_05.jpg',
      badge: 'Marine',
    },
    {
      id: 'wildlife-ecology',
      title: 'Wildlife & Biodiversity Corridors',
      eyebrow: 'Living Ecosystems',
      description: 'Encounter wild Asian elephants, coastal bird sanctuaries, and rare flora within protected reserve boundaries.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nintavur_Beach.jpg/1280px-Nintavur_Beach.jpg',
      badge: 'Ecology',
    },
  ],
  editorial: {
    feature: {
      headline: 'Some places change your perspective.',
      subhead: 'The art of unhurried exploration, one shoreline at a time.',
      body: 'True journeying is not measured by the speed of your transit, but by the stillness you allow to settle over your senses. Step off the congested circuits and the Eastern Shore begins to speak in its native cadence — outrigger canoes returning through the surf, handloom shuttles in artisan cottages, and lagoon water going glass-still at dusk.',
      location: 'Eastern Shore Corridor · 7.4394° N, 81.8172° E',
      stat: '100% Curated · 0 Crowds · 1 Coherent Route',
      image:
        'https://res.cloudinary.com/dfcq7dpvz/image/upload/v1792611991/visitflow/places/catalogue-64-maruthamunai-beach.jpg',
      alt: 'Golden sunrise shoreline at Maruthamunai on the Eastern Shore of Sri Lanka',
    },
  },
  journal: [
    {
      id: 'deegawapi-pillared-sanctum',
      topic: 'Heritage & Faith',
      title: 'The Pillared Sanctum of Deegawapi',
      summary: 'Thousands of stone pillars rise from the dry-zone forest at one of the Eastern Province’s most storied Buddhist sites.',
      readTime: '6 min read',
      date: 'Autumn 2026',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Deegawapi.jpg/1280px-Deegawapi.jpg',
      content: `Approached through scrub forest near Ampara, Deegawapi announces itself slowly — first as a low ridge of ruined platforms, then as a field of stone pillars standing in ranks where a great chapter house once held its roof. Each pillar carries the ghost of a beam, and walking between them is a little like reading a building that has been erased down to its own skeleton. Local custodians keep the site immaculate, and the vihara remains an active place of worship rather than only a monument. Late-afternoon light turns the granite gold and the surrounding forest pours with birdsong, making the stillness feel deliberate.`,
    },
    {
      id: 'kattankudy-living-archive',
      topic: 'Community & Craft',
      title: 'Kattankudy’s Living Archive',
      summary: 'A coastal town’s heritage museum keeps the memory of trade, craft and daily life on the Batticaloa peninsula.',
      readTime: '5 min read',
      date: 'Summer 2026',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Heritage_Museum%2C_Kattankudy.jpg/1280px-Heritage_Museum%2C_Kattankudy.jpg',
      content: `Kattankudy runs narrow and long along the sea, and its museum is a fine distillation of that compressed coastal life. Inside, cases hold fishing tackle, handloom textiles and household objects that trace a community’s relationship with the ocean and with trade routes that reached across the bay. The story told here is not of grand monuments but of ordinary ingenuity — how a town fed itself, built its houses, and carried its crafts forward. It is a useful pause between beaches, and a reminder that the Eastern Shore’s richest heritage is often domestic.`,
    },
    {
      id: 'eastern-shoreline-solitude',
      topic: 'Coastal Essays',
      title: 'Finding Solitude Along the Eastern Shore',
      summary: 'From the quiet sunrise at Maruthamunai to the tranquil lagoon waters of Koddaikallar and the fishing outriggers of Palamunai.',
      readTime: '5 min read',
      date: 'Spring 2026',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nintavur_Beach.jpg/1280px-Nintavur_Beach.jpg',
      content: `At latitude 7.4394° N, the sunrise begins as a violet brushstroke across the open Indian Ocean. By 6:00 AM, the beach at Maruthamunai is alive with quiet purpose—wooden outrigger canoes arriving through gentle surf with the morning catch, and the rhythmic clatter of handloom shuttles beginning in nearby artisan cottages. Continuing south toward Kalmunai's illuminated beach mosque and Koddaikallar lagoon, the landscape shifts between open ocean spray and mirror-still inland waters where white egrets wade in tranquility.`,
    },
  ],
  cta: {
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Kallady_Beach_05.jpg/1280px-Kallady_Beach_05.jpg',
    alt: 'Wide ocean bay at Kallady beach, Batticaloa, on the Eastern Shore of Sri Lanka',
  },
};


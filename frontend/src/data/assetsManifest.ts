/**
 * Centralized Asset Manifest for Aether Expeditions
 * High-resolution verified travel photography curated with consistent cinematic tone:
 * Warm sunlit tones, dramatic mountain vistas, serene coastal waters, and atmospheric cultural scenes.
 */

export const ASSETS = {
  hero: {
    // Real Eastern Shore photograph: Maruthamunai beach lighthouse view (Wikimedia Commons)
    image:
      'https://upload.wikimedia.org/wikipedia/commons/9/96/Maruthamunai_beach_light_house_view.jpg',
    poster:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Maruthamunai_beach_light_house_view.jpg/1280px-Maruthamunai_beach_light_house_view.jpg',
    alt: 'Sunrise over Maruthamunai beach and its lighthouse on the Eastern Shore of Sri Lanka',
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
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Maruthamunai_beach_light_house_view.jpg/1280px-Maruthamunai_beach_light_house_view.jpg',
      creditUrl:
        'https://commons.wikimedia.org/wiki/File:Maruthamunai_beach_light_house_view.jpg',
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
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Seashore_-_Kalmunai_Beach.jpg/1280px-Seashore_-_Kalmunai_Beach.jpg',
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
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      badge: 'Heritage',
    },
    {
      id: 'alpine-wilderness',
      title: 'Remote Mountain Expeditions',
      eyebrow: 'Solitude & Scale',
      description: 'High-altitude ridges, secluded valleys, and dramatic sunrises where silence and scale redefine your sense of horizon.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      badge: 'Adventures',
    },
    {
      id: 'coastal-lagoon',
      title: 'Coastal Escapes & Lagoon Sanctuaries',
      eyebrow: 'Ocean & Still Water',
      description: 'Pristine shorelines, outrigger fishing routines, and tranquil catamaran passages between ocean reefs and interior lagoons.',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      badge: 'Marine',
    },
    {
      id: 'wildlife-ecology',
      title: 'Wildlife & Biodiversity Corridors',
      eyebrow: 'Living Ecosystems',
      description: 'Encounter wild Asian elephants, coastal bird sanctuaries, and rare flora within protected reserve boundaries.',
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
      badge: 'Ecology',
    },
  ],
  editorial: {
    feature: {
      headline: 'Some places change your perspective.',
      subhead: 'The art of unhurried exploration in the world’s quietest corners.',
      body: 'True journeying is not measured by the velocity of your transit, but by the stillness you allow to settle over your senses. When you step off the congested tourist circuits into coastal handloom villages or high mountain passes at dawn, the world reveals its true texture.',
      location: 'Eastern Shore Corridor · 7.4394° N, 81.8172° E',
      stat: '100% Curated · 0 Crowds · 1 Coherent Route',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=85',
      alt: 'Ancient coastal fortress and ocean ramparts under golden morning sunlight',
    },
  },
  journal: [
    {
      id: 'kyoto-quiet-side',
      topic: 'Cultural Heritage',
      title: 'The Quiet Side of Kyoto',
      summary: 'Wandering through moss-carpeted cedar paths and ancient teahouses before the morning bells break the temple silence.',
      readTime: '6 min read',
      date: 'Autumn 2026',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      content: `In Kyoto's eastern hills, the early light arrives not with fanfare, but as a slow filtration through towering cryptomeria pines. While most travelers congregate around the famous vermilion gates at midday, the true soul of the old capital breathes in the first hour after dawn. Here, monks rake raked-gravel gardens into precise waves representing the cosmic ocean, and steam rises softly from cedar tubs in quiet machiya merchant houses. A slower approach reveals courtyard gardens where every moss-covered stone has been deliberately positioned for three hundred years.`,
    },
    {
      id: 'dolomites-slower-journey',
      topic: 'Alpine Expeditions',
      title: 'A Slower Journey Through the Dolomites',
      summary: 'Tracing the high alta via footpaths between remote rifugios, where alpine limestone glows terracotta at sunset.',
      readTime: '8 min read',
      date: 'Summer 2026',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      content: `The Enrosadira is the Ladin word for the phenomenon that turns the Pale Mountains into burning embers at dusk. Walking between high-altitude huts, your pack feels lighter with each passing col. Up here, above the treeline at 2,400 meters, cell service evaporates, replaced by the steady clank of distant cowbells and the whistle of alpine marmots. Dinner is hearty polenta with wild foraged chanterelles, eaten beside wood stoves while topographic route maps are studied by lantern light for tomorrow's descent through the larch valleys.`,
    },
    {
      id: 'eastern-shoreline-solitude',
      topic: 'Coastal Essays',
      title: 'Finding Solitude Along the Eastern Shore',
      summary: 'From the quiet sunrise at Maruthamunai to the tranquil lagoon waters of Koddaikallar and the fishing outriggers of Palamunai.',
      readTime: '5 min read',
      date: 'Spring 2026',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      content: `At latitude 7.4394° N, the sunrise begins as a violet brushstroke across the open Indian Ocean. By 6:00 AM, the beach at Maruthamunai is alive with quiet purpose—wooden outrigger canoes arriving through gentle surf with the morning catch, and the rhythmic clatter of handloom shuttles beginning in nearby artisan cottages. Continuing south toward Kalmunai's illuminated beach mosque and Koddaikallar lagoon, the landscape shifts between open ocean spray and mirror-still inland waters where white egrets wade in tranquility.`,
    },
  ],
  cta: {
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80',
    alt: 'Dramatic sunrise silhouette over misty peaks and ancient rock fortress',
  },
};


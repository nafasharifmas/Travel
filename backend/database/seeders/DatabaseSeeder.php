<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Itinerary;
use App\Models\ItineraryItem;
use App\Models\Media;
use App\Models\Place;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles
        $adminRole = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrator',
            'permissions' => ['places.manage', 'categories.manage', 'users.manage', 'audit.view', 'media.upload'],
        ]);

        $userRole = Role::create([
            'name' => 'user',
            'display_name' => 'Registered User',
            'permissions' => ['itineraries.manage'],
        ]);

        // 2. Users
        $admin = User::create([
            'name' => 'Sarah Jenkins (Admin)',
            'email' => 'admin@visitflow.com',
            'password' => Hash::make('Admin123!'),
            'role_id' => $adminRole->id,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $member = User::create([
            'name' => 'Alex Rivera',
            'email' => 'alex@example.com',
            'password' => Hash::make('Password123!'),
            'role_id' => $userRole->id,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $demoUser = User::create([
            'name' => 'Elena Rostova',
            'email' => 'elena@example.com',
            'password' => Hash::make('Password123!'),
            'role_id' => $userRole->id,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // 3. Categories
        $categoriesData = [
            [
                'name' => 'Cultural Heritage',
                'slug' => 'cultural-heritage',
                'description' => 'Ancient citadels, UNESCO sacred sanctuaries, and historical kingdoms.',
                'icon' => 'Landmark',
                'color' => '#d97706', // amber-600
                'is_active' => true,
            ],
            [
                'name' => 'Coastal & Marine',
                'slug' => 'coastal-marine',
                'description' => 'Golden shoreline bays, palm-fringed cliffs, and serene surf coasts.',
                'icon' => 'Waves',
                'color' => '#0284c7', // sky-600
                'is_active' => true,
            ],
            [
                'name' => 'Nature & Wildlife',
                'slug' => 'nature-wildlife',
                'description' => 'National parks, misty cloud forests, and biodiversity hotspots.',
                'icon' => 'Trees',
                'color' => '#16a34a', // green-600
                'is_active' => true,
            ],
            [
                'name' => 'Scenic Highlands',
                'slug' => 'scenic-highlands',
                'description' => 'Misty tea estates, viaduct rail arches, and sweeping mountain viewpoints.',
                'icon' => 'Mountain',
                'color' => '#7c3aed', // violet-600
                'is_active' => true,
            ],
            [
                'name' => 'Urban & Architectural',
                'slug' => 'urban-architectural',
                'description' => 'Modern architectural landmarks, coastal promenades, and bustling bazaars.',
                'icon' => 'Building2',
                'color' => '#e11d48', // rose-600
                'is_active' => true,
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $catData) {
            $categories[$catData['slug']] = Category::create($catData);
        }

        // 4. Launch Catalogue: >= 10 Verified Tourist Places (12 verified places)
        $placesData = [
            [
                'name' => 'Sigiriya Ancient Rock Citadel',
                'slug' => 'sigiriya-ancient-rock-citadel',
                'category_slug' => 'cultural-heritage',
                'description' => 'Rising dramatically 200 meters above surrounding plains, Sigiriya is a 5th-century palace fortress featuring ancient water gardens, world-famous fresco paintings, and monumental colossal lion paws guarding the summit stairway.',
                'address' => 'Sigiriya Rock Fortress Access Road, Dambulla 21112',
                'lat' => 7.9570,
                'lng' => 80.7603,
                'opening_hours' => '07:00 AM - 05:30 PM (Daily)',
                'contact_info' => '+94 66 228 6445 | ccfsigiriya@tourism.gov',
                'photos' => [
                    'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'name' => 'Galle Dutch Colonial Fort & Lighthouse',
                'slug' => 'galle-dutch-colonial-fort-lighthouse',
                'category_slug' => 'cultural-heritage',
                'description' => 'A living UNESCO World Heritage fortified seaport city built initially by the Portuguese in 1588 and fortified extensively by the Dutch. Wander cobblestone ramparts, boutique cafes, artisan jewelers, and the iconic white seaside lighthouse.',
                'address' => 'Rampart Street, Galle Fort, Galle 80000',
                'lat' => 6.0274,
                'lng' => 80.2170,
                'opening_hours' => 'Open 24 hours (Museums: 09:00 AM - 05:00 PM)',
                'contact_info' => '+94 91 224 2049 | info@gallefort.lk',
                'photos' => [
                    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1588598198321-9735fd52455d?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'name' => 'Nine Arch Bridge of Demodara',
                'slug' => 'nine-arch-bridge-demodara',
                'category_slug' => 'scenic-highlands',
                'description' => 'Also called the Bridge in the Sky, this magnificent viaduct bridge in Ella spans dense green jungle and emerald tea gardens. Built entirely out of solid brick, stone, and cement without a single piece of structural steel in 1921.',
                'address' => 'Nine Arch Track, Demodara, Ella 90090',
                'lat' => 6.8768,
                'lng' => 81.0608,
                'opening_hours' => 'Open 24 hours (Train crossings: 06:30, 09:15, 11:45, 15:30)',
                'contact_info' => '+94 57 222 8410 | railways@slr.lk',
                'photos' => [
                    'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'name' => 'Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)',
                'slug' => 'temple-of-the-sacred-tooth-relic',
                'category_slug' => 'cultural-heritage',
                'description' => 'Nestled beside Kandy Lake within the Royal Palace complex, this venerated shrine houses Sri Lanka’s most sacred relic, the tooth of the Buddha, set beneath a gleaming golden canopy and surrounded by traditional drum rituals.',
                'address' => 'Sri Dalada Veediya, Kandy 20000',
                'lat' => 7.2936,
                'lng' => 80.6413,
                'opening_hours' => '05:30 AM - 08:00 PM (Daily Thevava pooja ceremonies at 05:30, 09:30, 18:30)',
                'contact_info' => '+94 81 223 4223 | info@sridaladamaligawa.lk',
                'photos' => [
                    'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'name' => 'Yala National Park Safari Reserve',
                'slug' => 'yala-national-park-safari-reserve',
                'category_slug' => 'nature-wildlife',
                'description' => 'Sri Lanka’s premier wildlife sanctuary boasting one of the highest leopard densities on earth. Sprawling across coastal lagoons, dry woodlands, and open grasslands inhabited by wild Asian elephants, sloth bears, and crocodiles.',
                'address' => 'Palatupana Entrance Gate, Yala, Tissamaharama 82600',
                'lat' => 6.3683,
                'lng' => 81.5208,
                'opening_hours' => '06:00 AM - 06:00 PM (Early morning safari: 05:30 AM)',
                'contact_info' => '+94 47 348 9152 | wildlife@yala.gov.lk',
                'photos' => [
                    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'name' => 'Mirissa Coconut Tree Hill & Bay',
                'slug' => 'mirissa-coconut-tree-hill-bay',
                'category_slug' => 'coastal-marine',
                'description' => 'A picturesque reddish-terracotta headland jutting into the Indian Ocean, studded with towering palm trees overlooking aqua-marine waves. Renowned for spectacular sunsets, whale watching voyages, and coastal dining.',
                'address' => 'Coconut Tree Hill Trail, Mirissa South 81740',
                'lat' => 5.9431,
                'lng' => 80.4633,
                'opening_hours' => 'Open 24 hours (Best views: Sunrise & Sunset 17:30 - 18:30)',
                'contact_info' => '+94 41 225 1010 | tourism@mirissacoast.lk',
                'photos' => [
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'name' => 'Horton Plains & World\'s End Precipice',
                'slug' => 'horton-plains-worlds-end-precipice',
                'category_slug' => 'nature-wildlife',
                'description' => 'A windswept plateau elevated at 2,100 meters above sea level where montane grassland meets dwarf cloud forest. Features the sheer 880-meter vertical drop of World’s End and the cascading multi-tiered Baker’s Falls.',
                'address' => 'Ohiya Road, Horton Plains National Park, Nuwara Eliya 22200',
                'lat' => 6.8028,
                'lng' => 80.8091,
                'opening_hours' => '06:00 AM - 04:00 PM (Best visibility before 09:30 AM)',
                'contact_info' => '+94 52 223 5971 | hortonplains@dwc.gov.lk',
                'photos' => [
                    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'name' => 'Dambulla Royal Cave Temple Monastery',
                'slug' => 'dambulla-royal-cave-temple-monastery',
                'category_slug' => 'cultural-heritage',
                'description' => 'The largest and best-preserved cave temple complex in the region. Five subterranean sanctuaries carved into granite contain 153 Buddha statues, intricate Buddhist murals covering 2,100 square meters, and panoramic plains panoramas.',
                'address' => 'Kandy-Jaffna Highway, Dambulla 21100',
                'lat' => 7.8567,
                'lng' => 80.6482,
                'opening_hours' => '07:00 AM - 07:00 PM (Daily)',
                'contact_info' => '+94 66 228 4744 | dambullacaves@heritage.gov.lk',
                'photos' => [
                    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'name' => 'Lotus Tower & Urban Marina Observatory',
                'slug' => 'lotus-tower-urban-marina-observatory',
                'category_slug' => 'urban-architectural',
                'description' => 'Standing 350 meters tall over Colombo’s Beira Lake, South Asia’s tallest self-supported structure is shaped like an opening lotus blossom. Includes high-speed observation lifts, revolving dining, and 360-degree skyline views.',
                'address' => 'DR Wijewardena Mawatha, Colombo 00200',
                'lat' => 6.9298,
                'lng' => 79.8576,
                'opening_hours' => '09:00 AM - 10:00 PM (Daily)',
                'contact_info' => '+94 11 243 0088 | guest@colombolotustower.lk',
                'photos' => [
                    'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'name' => 'Pidurangala Panoramic Sunrise Peak',
                'slug' => 'pidurangala-panoramic-sunrise-peak',
                'category_slug' => 'scenic-highlands',
                'description' => 'Located directly opposite Sigiriya Rock, Pidurangala offers an exhilarating dawn hike through an ancient forest monastery and boulder scrambles to a massive flat summit summiting directly in front of the Sigiriya silhouette.',
                'address' => 'Pidurangala Temple Road, Sigiriya 21112',
                'lat' => 7.9665,
                'lng' => 80.7630,
                'opening_hours' => '05:00 AM - 06:00 PM (Dawn climb starts 05:00 AM)',
                'contact_info' => '+94 66 228 6500 | pidurangala@ecotrails.lk',
                'photos' => [
                    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'name' => 'Unawatuna Coral Lagoon Beach',
                'slug' => 'unawatuna-coral-lagoon-beach',
                'category_slug' => 'coastal-marine',
                'description' => 'A famous horseshoe-shaped golden sand bay sheltered by a natural offshore coral reef. Calmer waters make it safe for swimming, stand-up paddleboarding, and snorkeling to Japanese Peace Pagoda cliffs.',
                'address' => 'Welle Devalaya Road, Unawatuna 80600',
                'lat' => 6.0104,
                'lng' => 80.2483,
                'opening_hours' => 'Open 24 hours (Water activities: 07:30 AM - 06:00 PM)',
                'contact_info' => '+94 91 222 7119 | visit@unawatunacoast.lk',
                'photos' => [
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'name' => 'Pedro Tea Estate & Nuwara Eliya Highlands',
                'slug' => 'pedro-tea-estate-nuwara-eliya-highlands',
                'category_slug' => 'scenic-highlands',
                'description' => 'Established in 1885 at the foot of Mount Pidurutalagala, Pedro Estate produces delicate orthodox Ceylon black teas. Walk among emerald tea bushes with picker harvesters and tour original 19th-century processing rollers.',
                'address' => 'Pedro Estate Road, Nuwara Eliya 22200',
                'lat' => 6.9697,
                'lng' => 80.7938,
                'opening_hours' => '08:00 AM - 05:00 PM (Factory tour runs hourly)',
                'contact_info' => '+94 52 222 2855 | tours@pedrotea.com',
                'photos' => [
                    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
        ];

        $createdPlaces = [];
        foreach ($placesData as $p) {
            $cat = $categories[$p['category_slug']];
            $place = Place::create([
                'category_id' => $cat->id,
                'name' => $p['name'],
                'slug' => $p['slug'],
                'description' => $p['description'],
                'address' => $p['address'],
                'lat' => $p['lat'],
                'lng' => $p['lng'],
                'opening_hours' => $p['opening_hours'],
                'contact_info' => $p['contact_info'],
                'created_by' => $admin->id,
                'is_active' => true,
            ]);

            $order = 1;
            foreach ($p['photos'] as $photoUrl) {
                Media::create([
                    'place_id' => $place->id,
                    'file_path' => $photoUrl,
                    'original_name' => basename(parse_url($photoUrl, PHP_URL_PATH)) . '.jpg',
                    'mime_type' => 'image/jpeg',
                    'size' => 245000,
                    'sort_order' => $order,
                    'is_primary' => ($order === 1),
                ]);
                $order++;
            }

            $createdPlaces[] = $place;
        }

        // 5. Sample Itineraries for Member
        $itinerary = Itinerary::create([
            'user_id' => $member->id,
            'title' => 'Cultural Triangle Highlights Day Plan',
            'start_date' => now()->addDays(3)->format('Y-m-d'),
            'notes' => 'Early start to catch morning light and avoid afternoon heat.',
            'is_public' => true,
        ]);

        ItineraryItem::create([
            'itinerary_id' => $itinerary->id,
            'place_id' => $createdPlaces[9]->id, // Pidurangala
            'day_no' => 1,
            'sequence_order' => 1,
            'visit_time' => '05:30:00',
            'notes' => 'Dawn climb to catch golden sunrise over Sigiriya fortress.',
        ]);

        ItineraryItem::create([
            'itinerary_id' => $itinerary->id,
            'place_id' => $createdPlaces[0]->id, // Sigiriya
            'day_no' => 1,
            'sequence_order' => 2,
            'visit_time' => '08:30:00',
            'notes' => 'Explore ancient water gardens, frescoes and palace summit.',
        ]);

        ItineraryItem::create([
            'itinerary_id' => $itinerary->id,
            'place_id' => $createdPlaces[7]->id, // Dambulla
            'day_no' => 1,
            'sequence_order' => 3,
            'visit_time' => '14:00:00',
            'notes' => 'Cool cave sanctuary exploration and temple murals.',
        ]);

        // 6. Initial Audit Log Entries
        AuditLog::record('catalog.seed', null, [
            'places_count' => count($createdPlaces),
            'categories_count' => count($categories),
            'environment' => 'production_seed',
        ], $admin);
    }
}

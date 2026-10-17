<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Media;
use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EasternProvincePlacesSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role_id', 1)->first() ?? User::first();

        $categoriesData = [
            'beach-leisure' => [
                'name' => 'Beach & Leisure',
                'description' => 'Uncrowded golden sand stretches, sunrise viewpoints, and relaxing coastal walks.',
                'icon' => 'Waves',
                'color' => '#0284c7',
            ],
            'beach-culture' => [
                'name' => 'Beach & Culture',
                'description' => 'Lively coastal fronts, local seaside street food, and historic seaside places of worship.',
                'icon' => 'Landmark',
                'color' => '#0ea5e9',
            ],
            'culture-religion' => [
                'name' => 'Culture & Religion',
                'description' => 'Historic grand mosques and classical religious architecture.',
                'icon' => 'Compass',
                'color' => '#d97706',
            ],
            'nature-lagoon' => [
                'name' => 'Nature & Lagoon',
                'description' => 'Serene coastal lagoons, tranquil water systems, and birdwatching sanctuaries.',
                'icon' => 'Trees',
                'color' => '#16a34a',
            ],
            'beach-fishing' => [
                'name' => 'Beach & Fishing',
                'description' => 'Traditional coastal fishing hamlets lined with coconut groves and outrigger boats.',
                'icon' => 'Anchor',
                'color' => '#0891b2',
            ],
            'beach-park' => [
                'name' => 'Beach & Park',
                'description' => 'Family-friendly seaside recreational parks, green spaces, and evening promenades.',
                'icon' => 'Trees',
                'color' => '#10b981',
            ],
            'heritage-temple' => [
                'name' => 'Heritage & Temple',
                'description' => 'Revered historic Hindu temples and sacred regional festival sites.',
                'icon' => 'Sparkles',
                'color' => '#e11d48',
            ],
            'culture-history' => [
                'name' => 'Culture & History',
                'description' => 'Three-story cultural museums documenting maritime trade, crafts, and centuries of heritage.',
                'icon' => 'Building2',
                'color' => '#9333ea',
            ],
            'history-archaeology' => [
                'name' => 'History & Archaeology',
                'description' => 'Major 3rd-century BCE ancient Buddhist archaeological complexes and pilgrimage monuments.',
                'icon' => 'Landmark',
                'color' => '#c2410c',
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $slug => $c) {
            $categories[$slug] = Category::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $c['name'],
                    'description' => $c['description'],
                    'icon' => $c['icon'],
                    'color' => $c['color'],
                    'is_active' => true,
                ]
            );
        }

        $places = [
            [
                'no' => 1,
                'name' => 'Maruthamunai Beach',
                'category' => 'beach-leisure',
                'distance' => '~0.5 km',
                'lat' => 7.4420,
                'lng' => 81.8205,
                'address' => 'Beach Road, Maruthamunai 32314',
                'description' => 'Uncrowded stretch of golden sand known for sunrise views, relaxed seaside atmosphere, and nearby traditional handloom weaving villages.',
                'opening_hours' => 'Open 24 hours (Best views: Sunrise 05:45 - 07:00 AM)',
                'contact_info' => 'Maruthamunai Community Tourism Society | +94 67 222 9110',
                'photos' => [
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'no' => 2,
                'name' => 'Kalmunai Beach & Beach Mosque',
                'category' => 'beach-culture',
                'distance' => '~3.8 km',
                'lat' => 7.4125,
                'lng' => 81.8335,
                'address' => 'Coastal Promenade, Kadatkarai Palli Road, Kalmunai 32300',
                'description' => 'Lively coastal front features local street food stalls and the famous Beach Mosque (Kadatkarai Palli) illuminated against the sea.',
                'opening_hours' => 'Beach: Open 24h | Mosque: 04:30 AM - 09:30 PM',
                'contact_info' => 'Kalmunai Coastal Tourism Committee | +94 67 222 1445',
                'photos' => [
                    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'no' => 3,
                'name' => "Muhyideen Grand Jumu'ah Masjid",
                'category' => 'culture-religion',
                'distance' => '~4.0 km',
                'lat' => 7.4105,
                'lng' => 81.8290,
                'address' => 'Main Street, Kalmunaikudy, Kalmunai 32300',
                'description' => 'Historic central grand mosque in Kalmunaikudy displaying classical Islamic architectural design, intricate arched minarets, and tranquil courtyards.',
                'opening_hours' => '04:30 AM - 09:30 PM (Daily prayers)',
                'contact_info' => 'Mosque Administration Board | +94 67 222 3550',
                'photos' => [
                    'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'no' => 4,
                'name' => 'Koddaikallar Village & Lagoon',
                'category' => 'nature-lagoon',
                'distance' => '~5.5 km',
                'lat' => 7.4840,
                'lng' => 81.7960,
                'address' => 'Lagoon Road, Koddaikallar, Batticaloa District',
                'description' => 'Scenic village tucked between the sea and Batticaloa lagoon system, ideal for tranquil views, traditional catamaran rides, and birdwatching.',
                'opening_hours' => 'Open 24 hours (Best birdwatching: 06:00 - 08:30 AM & 16:30 - 18:00 PM)',
                'contact_info' => 'Koddaikallar Eco-Tourism Group | +94 65 222 4118',
                'photos' => [
                    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'no' => 5,
                'name' => 'Palamunai Beach',
                'category' => 'beach-fishing',
                'distance' => '~8.0 km',
                'lat' => 7.3750,
                'lng' => 81.8460,
                'address' => 'Palamunai Coastal Track, Addalaichenai 32350',
                'description' => 'Quiet, pristine coastal area lined with coconut groves where visitors can observe traditional outrigger fishing routines, fresh seafood harvest, and gentle ocean breezes.',
                'opening_hours' => 'Open 24 hours (Fishing activities best seen: 06:00 - 09:00 AM)',
                'contact_info' => 'Palamunai Fisheries Society | +94 67 222 5590',
                'photos' => [
                    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'no' => 6,
                'name' => 'Nintavur Beach & Coastal Park',
                'category' => 'beach-park',
                'distance' => '~10.5 km',
                'lat' => 7.3480,
                'lng' => 81.8510,
                'address' => 'Coastal Park Access Road, Nintavur 32340',
                'description' => 'Family-friendly seaside park offering recreational areas, green spaces, paved walking tracks, and calm evening strolls under coastal casuarina trees.',
                'opening_hours' => '06:00 AM - 08:30 PM (Daily)',
                'contact_info' => 'Nintavur Pradeshiya Sabha Tourism | +94 67 225 0244',
                'photos' => [
                    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'no' => 7,
                'name' => 'Suyampulinga Pillayar Temple',
                'category' => 'heritage-temple',
                'distance' => '~13.0 km',
                'lat' => 7.5380,
                'lng' => 81.7750,
                'address' => 'Main Coastal Highway A4, Kaluthavalai 30190',
                'description' => 'Revered Hindu temple in Kaluthavalai along the main coastal highway, central to regional religious festivals, colorful Gopuram architecture, and sacred traditions.',
                'opening_hours' => '06:00 AM - 12:30 PM & 04:30 PM - 08:00 PM (Daily Pooja times at 07:00, 11:30, 18:30)',
                'contact_info' => 'Temple Trustee Board | +94 65 224 8120',
                'photos' => [
                    'https://images.unsplash.com/photo-1588598198321-9735fd52455d?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'no' => 8,
                'name' => 'Kattankudy Heritage Museum',
                'category' => 'culture-history',
                'distance' => '~14.0 km',
                'lat' => 7.5620,
                'lng' => 81.7400,
                'address' => 'Main Street, Kattankudy 30130',
                'description' => 'A three-story cultural museum documenting centuries of Sri Lankan Muslim history, maritime trade routes, cultural artifacts, traditional lifestyle models, and antique currency.',
                'opening_hours' => '08:30 AM - 05:00 PM (Closed during Friday Jumu\'ah 12:00 - 14:00)',
                'contact_info' => 'Museum Curator Office | +94 65 224 7880',
                'photos' => [
                    'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'no' => 9,
                'name' => 'Kallady Beach',
                'category' => 'beach-leisure',
                'distance' => '~22.0 km',
                'lat' => 7.7120,
                'lng' => 81.7080,
                'address' => 'Kallady Beach Road, Batticaloa 30000',
                'description' => 'Expansive coastal beach in southern Batticaloa near the historic Kallady (Lady Manning) Bridge, popular for sunset walks, sea spray, and panoramic coastal views.',
                'opening_hours' => 'Open 24 hours (Evening breeze & sunset: 17:00 - 18:45)',
                'contact_info' => 'Batticaloa Tourism Information Centre | +94 65 222 2270',
                'photos' => [
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'no' => 10,
                'name' => 'Deegawapi Raja Maha Vihara',
                'category' => 'history-archaeology',
                'distance' => '~24.0 km',
                'lat' => 7.2650,
                'lng' => 81.7300,
                'address' => 'Deegawapi Access Road, Ampara District',
                'description' => 'Major 3rd-century BCE ancient Buddhist archaeological complex and historical pilgrimage site, featuring one of Sri Lanka\'s sixteen sacred Solosmasthana shrines and monumental brick stupa.',
                'opening_hours' => '06:00 AM - 06:30 PM (Daily)',
                'contact_info' => 'Archaeological Department Ampara | +94 63 222 2105',
                'photos' => [
                    'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
        ];

        foreach ($places as $item) {
            $cat = $categories[$item['category']];
            $slug = Str::slug($item['name']);

            $place = Place::withTrashed()->where('slug', $slug)->first();
            if ($place) {
                $place->restore();
                $place->update([
                    'category_id' => $cat->id,
                    'name' => $item['name'],
                    'description' => $item['description'] . " (Distance: {$item['distance']} from Maruthamunai origin)",
                    'address' => $item['address'],
                    'lat' => $item['lat'],
                    'lng' => $item['lng'],
                    'opening_hours' => $item['opening_hours'],
                    'contact_info' => $item['contact_info'],
                    'is_active' => true,
                ]);
            } else {
                $place = Place::create([
                    'category_id' => $cat->id,
                    'name' => $item['name'],
                    'slug' => $slug,
                    'description' => $item['description'] . " (Distance: {$item['distance']} from Maruthamunai origin)",
                    'address' => $item['address'],
                    'lat' => $item['lat'],
                    'lng' => $item['lng'],
                    'opening_hours' => $item['opening_hours'],
                    'contact_info' => $item['contact_info'],
                    'created_by' => $admin ? $admin->id : 1,
                    'is_active' => true,
                ]);
            }

            // Sync photos
            $place->media()->delete();
            $order = 1;
            foreach ($item['photos'] as $pUrl) {
                Media::create([
                    'place_id' => $place->id,
                    'file_path' => $pUrl,
                    'original_name' => basename(parse_url($pUrl, PHP_URL_PATH)) . '.jpg',
                    'mime_type' => 'image/jpeg',
                    'size' => 240000,
                    'sort_order' => $order,
                    'is_primary' => ($order === 1),
                ]);
                $order++;
            }
        }
    }
}


<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Media;
use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AoiPlacesSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::whereHas('role', fn ($query) => $query->where('name', 'admin'))->first()
            ?? User::first();

        $places = [
            ['Maruthamunai Beach Park', 'Beach & Recreation', 'Waves', '#0284c7', 7.4642, 81.8284, 3.2, 'A popular coastal recreation park offering open sandy beaches, sunset views, and local evening gatherings.', 'Maruthamunai, Kalmunai, Eastern Province, Sri Lanka', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Maruthamunai_beach.jpg/1280px-Maruthamunai_beach.jpg'],
            ['Kalmunai Muhyiddeen Jummah Grand Mosque', 'Religious & Cultural Landmark', 'Landmark', '#d97706', 7.4262, 81.8301, 1.2, 'A historic coastal place of worship known locally as the Beach Mosque (Kadatkarai Palli), facing the sea.', 'Kalmunai, Eastern Province, Sri Lanka', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mosque_by_the_sea.jpg/640px-Mosque_by_the_sea.jpg'],
            ['Jamia Jummah Masjid (Kalmunai Town Red Mosque)', 'Religious & Architectural Landmark', 'Landmark', '#b45309', 7.4172, 81.8329, 0.5, 'A prominent landmark located in the center of Kalmunai town, noted for its distinctive red-hued exterior.', 'Kalmunai Town, Eastern Province, Sri Lanka', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mosque_by_the_sea.jpg/640px-Mosque_by_the_sea.jpg'],
            ['Heritage Museum, Kattankudy', 'Museum & Cultural History', 'Building2', '#9333ea', 7.6841, 81.7246, 23.5, 'A multi-story cultural museum exhibiting regional artifacts, trade records, and the heritage of Sri Lankan Muslims.', 'Kattankudy, Batticaloa District, Eastern Province, Sri Lanka', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Heritage_Museum%2C_Kattankudy.jpg/1280px-Heritage_Museum%2C_Kattankudy.jpg'],
            ['Oluvil Lighthouse', 'Maritime Landmark', 'Compass', '#0e7490', 7.2882, 81.8671, 15.0, 'A 24-meter-tall white conical lighthouse built in 1999 alongside the Oluvil fisheries harbor.', 'Oluvil, Ampara District, Eastern Province, Sri Lanka', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Oluvil_Lighthouse.jpg/640px-Oluvil_Lighthouse.jpg'],
            ['Deegawapi Raja Maha Vihara', 'Archaeological & Buddhist Heritage', 'Landmark', '#c2410c', 7.3061, 81.7297, 18.5, 'An ancient Buddhist monastic complex and massive stupa dating back to King Saddhatissa in the 2nd century BC.', 'Deegawapi, Ampara District, Eastern Province, Sri Lanka', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Deegawapi.jpg/1280px-Deegawapi.jpg'],
            ['Kokkaddicholai Thaanthonreeswarar Temple', 'Hindu Temple & Historic Site', 'Sparkles', '#e11d48', 7.6322, 81.6543, 22.0, 'A revered Hindu temple situated west of Batticaloa Lagoon, celebrated for its ancient origins and annual chariot festival.', 'Kokkaddicholai, Batticaloa District, Eastern Province, Sri Lanka', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Kokkadicholai_Temple.jpg/640px-Kokkadicholai_Temple.jpg'],
            ['Batticaloa Dutch Fort', 'Historic Fortress', 'Shield', '#334155', 7.7169, 81.7011, 25.0, 'A 17th-century coastal granite fort originally established by the Portuguese and later expanded by the Dutch.', 'Batticaloa Fort, Eastern Province, Sri Lanka', 'https://commons.wikimedia.org/wiki/Special:FilePath/Batticaloa%20Fort.jpg'],
            ['Batticaloa Gate', 'Historic Monument', 'Landmark', '#475569', 7.7135, 81.6984, 24.8, 'A scenic waterfront monument commemorating the landing of the first Methodist missionaries and boat crossing points.', 'Batticaloa, Eastern Province, Sri Lanka', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Batticaloa_Gate.jpg/640px-Batticaloa_Gate.jpg'],
            ['Kallady Beach', 'Beach & Scenic', 'Waves', '#0891b2', 7.7188, 81.7247, 24.5, 'A wide eastern coastline offering scenic ocean views, casuarina groves, and proximity to the Lady Manning Bridge.', 'Kallady, Batticaloa, Eastern Province, Sri Lanka', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Kallady_Beach_05.jpg/1280px-Kallady_Beach_05.jpg'],
        ];

        foreach ($places as [$name, $categoryName, $icon, $color, $lat, $lng, $distance, $description, $address, $photo]) {
            $category = Category::updateOrCreate(
                ['slug' => Str::slug($categoryName)],
                ['name' => $categoryName, 'description' => 'Places in the Kalmunai area of interest.', 'icon' => $icon, 'color' => $color, 'is_active' => true]
            );

            $place = Place::withTrashed()->updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'category_id' => $category->id,
                    'name' => $name,
                    'description' => $description . " (AOI distance: {$distance} km from Kalmunai center.)",
                    'address' => $address,
                    'lat' => $lat,
                    'lng' => $lng,
                    'opening_hours' => 'Open daily; verify local access before visiting.',
                    'contact_info' => 'Kalmunai AOI catalogue · Wikimedia Commons image source',
                    'created_by' => $admin?->id,
                    'is_active' => true,
                ]
            );

            if ($place->trashed()) {
                $place->restore();
            }

            $place->media()->delete();
            Media::create([
                'place_id' => $place->id,
                'file_path' => $photo,
                'original_name' => basename(parse_url($photo, PHP_URL_PATH)) ?: Str::slug($name) . '.jpg',
                'mime_type' => 'image/jpeg',
                'size' => 240000,
                'sort_order' => 1,
                'is_primary' => true,
            ]);
        }
    }
}

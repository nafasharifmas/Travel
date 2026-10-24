<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Place;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LocalSubmissionSeeder extends Seeder
{
    public function run(): void
    {
        $admin = \App\Models\User::whereHas('role', fn ($query) => $query->where('name', 'admin'))->firstOrFail();
        // Reuse existing local catalogue locations, without overwriting admin edits.
        $entries = [
            ['Koddaikallar Village & Lagoon', 'Nature & Lagoon', 7.4840, 81.7960, 'A village and lagoon setting for a short sightseeing stop.'],
            ['Palamunai Beach', 'Beach & Recreation', 7.3750, 81.8460, 'A coastal stop for a beach walk and views of local fishing activity.'],
            ['Nintavur Beach & Coastal Park', 'Beach & Recreation', 7.3480, 81.8510, 'A coastal recreation stop in the Nintavur area.'],
            ['Suyampulinga Pillayar Temple', 'Religious & Cultural Landmark', 7.5380, 81.7750, 'A Hindu temple in the Kaluthavalai area.'],
            // Source: https://sri-lanka.worldplaces.me/review/190520956-thropathi-amman-temple-pandiruppu.html
            ['Thropathi Amman Temple, Pandiruppu', 'Religious & Cultural Landmark', 7.42469, 81.81999, 'A Hindu temple in Pandiruppu, near Kalmunai.'],
        ];

        foreach ($entries as [$name, $categoryName, $lat, $lng, $description]) {
            $category = Category::firstOrCreate(['slug' => Str::slug($categoryName)], [
                'name' => $categoryName, 'is_active' => true,
            ]);
            Place::firstOrCreate(['slug' => Str::slug($name)], [
                'name' => $name, 'category_id' => $category->id, 'created_by' => $admin->id,
                'description' => $description, 'lat' => $lat, 'lng' => $lng,
                'opening_hours' => 'Confirm current visiting hours locally before travelling.',
                'is_active' => true,
            ]);
        }

        // The older Eastern seeder placed this museum at a different village.
        // Use the location already supplied by the AOI catalogue; it is outside 25 km.
        Place::where('slug', 'kattankudy-heritage-museum')
            ->where('lat', 7.5620)->where('lng', 81.7400)
            ->update(['lat' => 7.6841, 'lng' => 81.7246]);

        Place::where('is_active', true)->withinLocalArea()->get()->each(function (Place $place) {
            if (blank($place->travel_tips)) {
                $place->travel_tips = 'Confirm local access and opening hours before travelling. Carry drinking water, respect worship and local customs, and follow posted safety guidance.';
            }
            $place->description = preg_replace('/\s*\(AOI distance: [^)]*\)/', '', $place->description);
            if ($place->isDirty()) {
                $place->save();
            }
        });
    }
}

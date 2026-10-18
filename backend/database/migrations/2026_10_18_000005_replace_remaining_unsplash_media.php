<?php

use App\Models\Place;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $images = [
            'Mirissa Coconut Tree Hill & Bay' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Mirissa%20Beach.jpg',
            "Horton Plains & World's End Precipice" => 'https://commons.wikimedia.org/wiki/Special:FilePath/Horton%20Plains.jpg',
            'Lotus Tower & Urban Marina Observatory' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Colombo%20Lotus%20Tower.jpg',
            'Pidurangala Panoramic Sunrise Peak' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Pidurangala%20Rock.jpg',
            'Unawatuna Coral Lagoon Beach' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Unawatuna%20Beach.jpg',
            'Pedro Tea Estate & Nuwara Eliya Highlands' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Pedro%20Tea%20Estate.jpg',
            "Muhyideen Grand Jumu'ah Masjid" => 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Seashore_-_Kalmunai_Beach.jpg/1280px-Seashore_-_Kalmunai_Beach.jpg',
            'Koddaikallar Village & Lagoon' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Kallady_Beach_05.jpg/1280px-Kallady_Beach_05.jpg',
            'Palamunai Beach' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nintavur_Beach.jpg/1280px-Nintavur_Beach.jpg',
            'Suyampulinga Pillayar Temple' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Sri%20Dalada%20Maligawa%2C%20Kandy.jpg',
        ];

        foreach ($images as $name => $url) {
            $place = Place::where('name', $name)->first();
            $place?->media()->where('file_path', 'like', '%unsplash.com%')->update([
                'file_path' => $url,
                'original_name' => basename(parse_url($url, PHP_URL_PATH)),
            ]);
        }
    }

    public function down(): void
    {
        // External source URLs are intentionally not restored during rollback.
    }
};

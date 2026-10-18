<?php

use App\Models\Place;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $images = [
            'Sigiriya Ancient Rock Citadel' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Sigiriya%20Rock%20Fortress.jpg',
            'Maruthamunai Beach' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Maruthamunai_beach_light_house_view.jpg/1280px-Maruthamunai_beach_light_house_view.jpg',
            'Kalmunai Beach & Beach Mosque' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Seashore_-_Kalmunai_Beach.jpg/1280px-Seashore_-_Kalmunai_Beach.jpg',
            'Kattankudy Heritage Museum' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Heritage_Museum%2C_Kattankudy.jpg/1280px-Heritage_Museum%2C_Kattankudy.jpg',
            'Nintavur Beach & Coastal Park' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nintavur_Beach.jpg/1280px-Nintavur_Beach.jpg',
            'Kallady Beach' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Kallady_Beach_05.jpg/1280px-Kallady_Beach_05.jpg',
            'Deegawapi Raja Maha Vihara' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Deegawapi.jpg/1280px-Deegawapi.jpg',
            'Galle Dutch Colonial Fort & Lighthouse' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Galle%20Fort%20Lighthouse.jpg',
            'Nine Arch Bridge of Demodara' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Nine%20Arch%20Bridge%2C%20Demodara.jpg',
            'Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Sri%20Dalada%20Maligawa%2C%20Kandy.jpg',
            'Yala National Park Safari Reserve' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Sri%20Lankan%20Elephant%20in%20Yala.jpg',
            'Dambulla Royal Cave Temple Monastery' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Dambulla%20Cave%20Temple.jpg',
        ];

        foreach ($images as $name => $url) {
            $place = Place::where('name', $name)->first();
            if (!$place) {
                continue;
            }

            $place->media()->where('file_path', 'like', '%unsplash.com%')->update([
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

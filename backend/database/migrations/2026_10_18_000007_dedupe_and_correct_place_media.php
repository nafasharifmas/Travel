<?php

use App\Models\Media;
use App\Models\Place;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Keep one copy of each URL per place and ensure the lowest sort order
        // is the only primary image.
        Place::with('media')->get()->each(function (Place $place): void {
            $seen = [];
            foreach ($place->media->sortBy('sort_order') as $media) {
                if (in_array($media->file_path, $seen, true)) {
                    $media->delete();
                    continue;
                }
                $seen[] = $media->file_path;
                $media->update([
                    'is_primary' => count($seen) === 1,
                    'sort_order' => count($seen),
                ]);
            }
        });

        $this->replacePrimary('muhyideen-grand-jumuah-masjid', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mosque_by_the_sea.jpg/640px-Mosque_by_the_sea.jpg');
        $this->replacePrimary('suyampulinga-pillayar-temple', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Kokkadicholai_Temple.jpg/640px-Kokkadicholai_Temple.jpg');
    }

    private function replacePrimary(string $slug, string $url): void
    {
        $place = Place::where('slug', $slug)->first();
        if (!$place) {
            return;
        }

        $place->media()->delete();
        Media::create([
            'place_id' => $place->id,
            'file_path' => $url,
            'original_name' => basename(parse_url($url, PHP_URL_PATH)),
            'mime_type' => 'image/jpeg',
            'size' => 240000,
            'sort_order' => 1,
            'is_primary' => true,
        ]);
    }

    public function down(): void
    {
        // Media cleanup is intentionally not reversed.
    }
};

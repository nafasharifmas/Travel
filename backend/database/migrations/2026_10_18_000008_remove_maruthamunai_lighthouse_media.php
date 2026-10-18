<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const REMOVED_IMAGE = 'Maruthamunai_beach_light_house_view.jpg';

    public function up(): void
    {
        DB::table('media')
            ->where('file_path', 'like', '%' . self::REMOVED_IMAGE . '%')
            ->delete();

        $placeId = DB::table('places')->where('slug', 'maruthamunai-beach')->value('id');
        if ($placeId) {
            DB::table('media')->where('place_id', $placeId)->update(['is_primary' => false]);
            $replacementId = DB::table('media')
                ->where('place_id', $placeId)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->value('id');

            if ($replacementId) {
                DB::table('media')->where('id', $replacementId)->update(['is_primary' => true]);
            }
        }
    }

    public function down(): void
    {
        // The removed source is intentionally not restored automatically.
    }
};

<?php

use App\Models\Place;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Place::withTrashed()
            ->whereIn('slug', [
                'maruthamunai-beach-park',
                'kalmunai-muhyiddeen-jummah-grand-mosque',
                'heritage-museum-kattankudy',
            ])
            ->get()
            ->each(function (Place $place): void {
                $place->media()->delete();
                $place->forceDelete();
            });
    }

    public function down(): void
    {
        // The canonical Eastern Province records remain available; duplicate
        // records are intentionally not recreated on rollback.
    }
};

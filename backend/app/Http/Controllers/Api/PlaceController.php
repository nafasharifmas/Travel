<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlaceController extends Controller
{
    /**
     * Browse catalogue with search and category filters (FR-01, FR-02).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Place::query()
            ->where('is_active', true)
            ->with(['category', 'media']);

        // Keyword search over place names and descriptions (FR-02)
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Category filtering (FR-02)
        if ($category = $request->input('category')) {
            $query->whereHas('category', function ($q) use ($category) {
                if (is_numeric($category)) {
                    $q->where('id', $category);
                } else {
                    $q->where('slug', $category);
                }
            });
        }

        // Sorting
        $sort = $request->input('sort', 'default');
        switch ($sort) {
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'latest':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->orderBy('id', 'asc');
                break;
        }

        $places = $query->get()->map(function ($place) {
            $primaryMedia = $place->media->firstWhere('is_primary', true) ?? $place->media->first();
            return [
                'id' => $place->id,
                'name' => $place->name,
                'slug' => $place->slug,
                'description' => $place->description,
                'address' => $place->address,
                'lat' => (float) $place->lat,
                'lng' => (float) $place->lng,
                'opening_hours' => $place->opening_hours,
                'contact_info' => $place->contact_info,
                'category' => $place->category ? [
                    'id' => $place->category->id,
                    'name' => $place->category->name,
                    'slug' => $place->category->slug,
                    'icon' => $place->category->icon,
                    'color' => $place->category->color,
                ] : null,
                'primary_photo' => $primaryMedia ? $primaryMedia->url : null,
                'photos_count' => $place->media->count(),
                'media' => $place->media->map(fn($m) => [
                    'id' => $m->id,
                    'url' => $m->url,
                    'is_primary' => (bool) $m->is_primary,
                ]),
            ];
        });

        return response()->json([
            'count' => $places->count(),
            'places' => $places,
            'map_config' => [
                'attribution' => '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
                'tile_layer' => 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
        ]);
    }

    /**
     * View detailed place profile (FR-01, FR-03).
     */
    public function show(string $idOrSlug): JsonResponse
    {
        $query = Place::query()
            ->where('is_active', true)
            ->with(['category', 'media']);

        if (is_numeric($idOrSlug)) {
            $place = $query->where('id', $idOrSlug)->first();
        } else {
            $place = $query->where('slug', $idOrSlug)->first();
        }

        if (!$place) {
            return response()->json([
                'message' => 'The requested place was not found or has been archived.',
            ], 404);
        }

        $primaryMedia = $place->media->firstWhere('is_primary', true) ?? $place->media->first();

        // Nearby recommendations in same category or geographically near
        $nearby = Place::query()
            ->where('is_active', true)
            ->where('id', '!=', $place->id)
            ->where('category_id', $place->category_id)
            ->with(['category', 'media'])
            ->limit(3)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'primary_photo' => ($p->media->firstWhere('is_primary', true) ?? $p->media->first())?->url,
                'category' => $p->category ? $p->category->name : '',
            ]);

        return response()->json([
            'place' => [
                'id' => $place->id,
                'name' => $place->name,
                'slug' => $place->slug,
                'description' => $place->description,
                'address' => $place->address,
                'lat' => (float) $place->lat,
                'lng' => (float) $place->lng,
                'opening_hours' => $place->opening_hours,
                'contact_info' => $place->contact_info,
                'category' => $place->category ? [
                    'id' => $place->category->id,
                    'name' => $place->category->name,
                    'slug' => $place->category->slug,
                    'icon' => $place->category->icon,
                    'color' => $place->category->color,
                ] : null,
                'primary_photo' => $primaryMedia ? $primaryMedia->url : null,
                'media' => $place->media->map(fn($m) => [
                    'id' => $m->id,
                    'url' => $m->url,
                    'original_name' => $m->original_name,
                    'is_primary' => (bool) $m->is_primary,
                ]),
                'nearby_suggestions' => $nearby,
            ],
            'map_config' => [
                'lat' => (float) $place->lat,
                'lng' => (float) $place->lng,
                'zoom' => 14,
                'attribution' => '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
                'tile_layer' => 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
        ]);
    }
}


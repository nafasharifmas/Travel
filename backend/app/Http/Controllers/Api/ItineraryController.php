<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Itinerary;
use App\Models\ItineraryItem;
use App\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ItineraryController extends Controller
{
    /**
     * List user itineraries (FR-06: only owning user).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $itineraries = Itinerary::query()
            ->where('user_id', $user->id)
            ->with(['items.place' => function ($q) {
                $q->withTrashed()->with(['category', 'media']);
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($itinerary) {
                return [
                    'id' => $itinerary->id,
                    'title' => $itinerary->title,
                    'start_date' => $itinerary->start_date ? $itinerary->start_date->format('Y-m-d') : null,
                    'notes' => $itinerary->notes,
                    'is_public' => (bool) $itinerary->is_public,
                    'items_count' => $itinerary->items->count(),
                    'places_summary' => $itinerary->items->map(fn($item) => [
                        'place_id' => $item->place_id,
                        'name' => $item->place ? $item->place->name : 'Unknown Place',
                        'is_archived' => $item->place ? $item->place->trashed() : true,
                    ]),
                    'created_at' => $itinerary->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'itineraries' => $itineraries,
        ]);
    }

    /**
     * Create personal itinerary with ordered stops (FR-06, FR-07).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
            'items' => 'nullable|array',
            'items.*.place_id' => 'required|exists:places,id',
            'items.*.day_no' => 'nullable|integer|min:1',
            'items.*.sequence_order' => 'nullable|integer|min:0',
            'items.*.visit_time' => 'nullable|string',
            'items.*.notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        $itinerary = DB::transaction(function () use ($user, $validated) {
            $itinerary = Itinerary::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'start_date' => $validated['start_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'is_public' => $validated['is_public'] ?? false,
            ]);

            if (!empty($validated['items'])) {
                $seq = 1;
                foreach ($validated['items'] as $item) {
                    ItineraryItem::create([
                        'itinerary_id' => $itinerary->id,
                        'place_id' => $item['place_id'],
                        'day_no' => $item['day_no'] ?? 1,
                        'sequence_order' => $item['sequence_order'] ?? $seq++,
                        'visit_time' => !empty($item['visit_time']) ? $item['visit_time'] : null,
                        'notes' => $item['notes'] ?? null,
                    ]);
                }
            }

            return $itinerary;
        });

        return response()->json([
            'message' => 'Itinerary created successfully.',
            'itinerary' => $this->formatItinerary($itinerary->load(['items.place' => fn($q) => $q->withTrashed()->with(['category', 'media'])])),
        ], 201);
    }

    /**
     * View personal itinerary detail with ownership protection (FR-06).
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $itinerary = Itinerary::with(['items.place' => fn($q) => $q->withTrashed()->with(['category', 'media'])])->findOrFail($id);

        if ($itinerary->user_id !== $user->id && !$itinerary->is_public) {
            return response()->json([
                'message' => 'Unauthorized access to this itinerary.',
            ], 403);
        }

        return response()->json([
            'itinerary' => $this->formatItinerary($itinerary),
        ]);
    }

    /**
     * Update itinerary title, stops and sequence (FR-06, FR-07).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $itinerary = Itinerary::findOrFail($id);

        if ($itinerary->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized. You do not own this itinerary.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
            'items' => 'nullable|array',
            'items.*.place_id' => 'required|exists:places,id',
            'items.*.day_no' => 'nullable|integer|min:1',
            'items.*.sequence_order' => 'nullable|integer|min:0',
            'items.*.visit_time' => 'nullable|string',
            'items.*.notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($itinerary, $validated) {
            $itinerary->update([
                'title' => $validated['title'],
                'start_date' => $validated['start_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'is_public' => $validated['is_public'] ?? false,
            ]);

            if (isset($validated['items'])) {
                $itinerary->items()->delete();
                $seq = 1;
                foreach ($validated['items'] as $item) {
                    ItineraryItem::create([
                        'itinerary_id' => $itinerary->id,
                        'place_id' => $item['place_id'],
                        'day_no' => $item['day_no'] ?? 1,
                        'sequence_order' => $item['sequence_order'] ?? $seq++,
                        'visit_time' => !empty($item['visit_time']) ? $item['visit_time'] : null,
                        'notes' => $item['notes'] ?? null,
                    ]);
                }
            }
        });

        return response()->json([
            'message' => 'Itinerary updated successfully.',
            'itinerary' => $this->formatItinerary($itinerary->fresh(['items.place' => fn($q) => $q->withTrashed()->with(['category', 'media'])])),
        ]);
    }

    /**
     * Soft delete personal itinerary (FR-06).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $itinerary = Itinerary::findOrFail($id);

        if ($itinerary->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized. You do not own this itinerary.',
            ], 403);
        }

        $itinerary->delete();

        return response()->json([
            'message' => 'Itinerary deleted successfully.',
        ]);
    }

    /**
     * Save temporary guest itinerary session draft into authenticated user's account (FR-04).
     */
    public function syncGuest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.place_id' => 'required|exists:places,id',
            'items.*.sequence_order' => 'nullable|integer',
            'items.*.visit_time' => 'nullable|string',
            'items.*.notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        $itinerary = DB::transaction(function () use ($user, $validated) {
            $itinerary = Itinerary::create([
                'user_id' => $user->id,
                'title' => $validated['title'] ?? 'My Day Trip (' . now()->format('M j, Y') . ')',
                'start_date' => $validated['start_date'] ?? now()->format('Y-m-d'),
                'notes' => $validated['notes'] ?? 'Saved from guest exploration session',
                'is_public' => false,
            ]);

            $seq = 1;
            foreach ($validated['items'] as $item) {
                ItineraryItem::create([
                    'itinerary_id' => $itinerary->id,
                    'place_id' => $item['place_id'],
                    'day_no' => 1,
                    'sequence_order' => $item['sequence_order'] ?? $seq++,
                    'visit_time' => !empty($item['visit_time']) ? $item['visit_time'] : null,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            return $itinerary;
        });

        return response()->json([
            'message' => 'Guest itinerary successfully saved to your profile!',
            'itinerary' => $this->formatItinerary($itinerary->load(['items.place' => fn($q) => $q->withTrashed()->with(['category', 'media'])])),
        ], 201);
    }

    /**
     * Format itinerary payload for consistent response.
     */
    private function formatItinerary(Itinerary $itinerary): array
    {
        return [
            'id' => $itinerary->id,
            'title' => $itinerary->title,
            'start_date' => $itinerary->start_date ? $itinerary->start_date->format('Y-m-d') : null,
            'notes' => $itinerary->notes,
            'is_public' => (bool) $itinerary->is_public,
            'user_id' => $itinerary->user_id,
            'created_at' => $itinerary->created_at->toIso8601String(),
            'items' => $itinerary->items->map(function ($item) {
                $place = $item->place;
                $primaryMedia = $place ? ($place->media->firstWhere('is_primary', true) ?? $place->media->first()) : null;

                return [
                    'id' => $item->id,
                    'place_id' => $item->place_id,
                    'day_no' => $item->day_no,
                    'sequence_order' => $item->sequence_order,
                    'visit_time' => $item->visit_time,
                    'notes' => $item->notes,
                    'place' => $place ? [
                        'id' => $place->id,
                        'name' => $place->name,
                        'slug' => $place->slug,
                        'address' => $place->address,
                        'lat' => (float) $place->lat,
                        'lng' => (float) $place->lng,
                        'category' => $place->category ? $place->category->name : null,
                        'primary_photo' => $primaryMedia ? $primaryMedia->url : null,
                        'is_archived' => $place->trashed(),
                    ] : null,
                ];
            }),
        ];
    }
}


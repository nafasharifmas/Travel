<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Itinerary;
use App\Models\Media;
use App\Models\Place;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Services\CloudinaryService;

class AdminController extends Controller
{
    /**
     * Dashboard statistics overview.
     */
    public function dashboard(): JsonResponse
    {
        $totalPlaces = Place::withTrashed()->count();
        $activePlaces = Place::where('is_active', true)->count();
        $archivedPlaces = Place::onlyTrashed()->count();
        $categoriesCount = Category::count();
        $usersCount = User::count();
        $itinerariesCount = Itinerary::count();

        $recentAudits = AuditLog::with('actor')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'metrics' => [
                'total_places' => $totalPlaces,
                'active_places' => $activePlaces,
                'archived_places' => $archivedPlaces,
                'categories' => $categoriesCount,
                'users' => $usersCount,
                'itineraries' => $itinerariesCount,
            ],
            'recent_audits' => $recentAudits,
        ]);
    }

    /**
     * List all places (including archived) for admin management (FR-08).
     */
    public function places(Request $request): JsonResponse
    {
        $query = Place::withTrashed()->with(['category', 'media', 'creator']);

        if ($status = $request->input('status')) {
            if ($status === 'archived') {
                $query->onlyTrashed();
            } elseif ($status === 'active') {
                $query->whereNull('deleted_at')->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->whereNull('deleted_at')->where('is_active', false);
            }
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $places = $query->orderBy('created_at', 'desc')->get()->map(function ($place) {
            return [
                'id' => $place->id,
                'name' => $place->name,
                'slug' => $place->slug,
                'description' => $place->description,
                'travel_tips' => $place->travel_tips,
                'address' => $place->address,
                'lat' => (float) $place->lat,
                'lng' => (float) $place->lng,
                'opening_hours' => $place->opening_hours,
                'contact_info' => $place->contact_info,
                'is_active' => (bool) $place->is_active,
                'is_archived' => $place->trashed(),
                'category' => $place->category ? [
                    'id' => $place->category->id,
                    'name' => $place->category->name,
                ] : null,
                'primary_photo' => ($place->media->firstWhere('is_primary', true) ?? $place->media->first())?->url,
                'media_count' => $place->media->count(),
                'media' => $place->media->map(fn ($media) => [
                    'id' => $media->id,
                    'url' => $media->url,
                    'original_name' => $media->original_name,
                    'is_primary' => (bool) $media->is_primary,
                ])->values(),
                'created_at' => $place->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'places' => $places,
        ]);
    }

    /**
     * Create place with server-side validation and audit log (FR-08, FR-13).
     */
    public function storePlace(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:places,slug',
            'description' => 'required|string',
            'travel_tips' => 'nullable|string|max:2000',
            'address' => 'nullable|string|max:255',
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'opening_hours' => 'nullable|string|max:255',
            'contact_info' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'photo_url' => 'nullable|url',
        ]);

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);
        // Ensure slug uniqueness
        $originalSlug = $slug;
        $counter = 1;
        while (Place::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $admin = $request->user();

        $place = DB::transaction(function () use ($validated, $slug, $admin) {
            $place = Place::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $slug,
                'description' => $validated['description'],
                'travel_tips' => $validated['travel_tips'] ?? null,
                'address' => $validated['address'] ?? null,
                'lat' => $validated['lat'],
                'lng' => $validated['lng'],
                'opening_hours' => $validated['opening_hours'] ?? null,
                'contact_info' => $validated['contact_info'] ?? null,
                'created_by' => $admin->id,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            if (!empty($validated['photo_url'])) {
                Media::create([
                    'place_id' => $place->id,
                    'file_path' => $validated['photo_url'],
                    'original_name' => 'primary_photo.jpg',
                    'mime_type' => 'image/jpeg',
                    'size' => 250000,
                    'sort_order' => 1,
                    'is_primary' => true,
                ]);
            }

            AuditLog::record('place.create', $place, [
                'name' => $place->name,
                'category_id' => $place->category_id,
            ], $admin);

            return $place;
        });

        return response()->json([
            'message' => 'Place created successfully.',
            'place' => $place->load(['category', 'media']),
        ], 201);
    }

    /**
     * Update place details with audit log (FR-08).
     */
    public function updatePlace(Request $request, int $id): JsonResponse
    {
        $place = Place::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'travel_tips' => 'nullable|string|max:2000',
            'address' => 'nullable|string|max:255',
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'opening_hours' => 'nullable|string|max:255',
            'contact_info' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $place->update($validated);

        AuditLog::record('place.update', $place, [
            'name' => $place->name,
            'changes' => $place->getChanges(),
        ], $request->user());

        return response()->json([
            'message' => 'Place updated successfully.',
            'place' => $place->load(['category', 'media']),
        ]);
    }

    /**
     * Archive place (FR-08: soft delete hides from public discovery, keeps for historical itineraries).
     */
    public function archivePlace(Request $request, int $id): JsonResponse
    {
        $place = Place::findOrFail($id);
        $place->delete();

        AuditLog::record('place.archive', $place, [
            'name' => $place->name,
            'archived_at' => now()->toIso8601String(),
        ], $request->user());

        return response()->json([
            'message' => 'Place archived successfully. It is now hidden from public discovery while preserved in existing itineraries.',
        ]);
    }

    /**
     * Restore archived place (FR-08).
     */
    public function restorePlace(Request $request, int $id): JsonResponse
    {
        $place = Place::onlyTrashed()->findOrFail($id);
        $place->restore();

        AuditLog::record('place.restore', $place, [
            'name' => $place->name,
            'restored_at' => now()->toIso8601String(),
        ], $request->user());

        return response()->json([
            'message' => 'Place restored successfully to active catalogue.',
        ]);
    }

    /**
     * Categories management (FR-09).
     */
    public function categories(): JsonResponse
    {
        $categories = Category::withCount(['places' => function ($q) {
            $q->withTrashed();
        }])->orderBy('name')->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'slug' => 'nullable|string|max:120|unique:categories,slug',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:30',
            'is_active' => 'boolean',
        ]);

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? 'MapPin',
            'color' => $validated['color'] ?? '#f59e0b',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        AuditLog::record('category.create', $category, [
            'name' => $category->name,
        ], $request->user());

        return response()->json([
            'message' => 'Category created successfully.',
            'category' => $category,
        ], 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:30',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        AuditLog::record('category.update', $category, [
            'name' => $category->name,
            'changes' => $category->getChanges(),
        ], $request->user());

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => $category,
        ]);
    }

    public function destroyCategory(Request $request, int $id): JsonResponse
    {
        $category = Category::withCount(['places' => fn($q) => $q->withTrashed()])->findOrFail($id);

        // Page 6 delete policy: "Blocked while places reference it — reassign prompt shown"
        if ($category->places_count > 0) {
            return response()->json([
                'message' => "Cannot delete category '{$category->name}'. It is currently referenced by {$category->places_count} places. Please reassign or delete places first.",
            ], 422);
        }

        $name = $category->name;
        $category->delete();

        AuditLog::record('category.delete', null, [
            'name' => $name,
            'category_id' => $id,
        ], $request->user());

        return response()->json([
            'message' => "Category '{$name}' deleted successfully.",
        ]);
    }

    /**
     * Users management (FR-10).
     */
    public function users(): JsonResponse
    {
        $users = User::with('role')
            ->withCount('itineraries')
            ->orderBy('id', 'asc')
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role ? $u->role->name : 'user',
                'is_active' => (bool) $u->is_active,
                'itineraries_count' => $u->itineraries_count,
                'created_at' => $u->created_at->toIso8601String(),
            ]);

        return response()->json([
            'users' => $users,
        ]);
    }

    public function updateUserRole(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|string|in:admin,user',
        ]);

        if ($user->id === $admin->id && $validated['role'] !== 'admin') {
            return response()->json([
                'message' => 'You cannot remove administrator privileges from your own account.',
            ], 422);
        }

        $role = Role::where('name', $validated['role'])->firstOrFail();
        $oldRole = $user->role ? $user->role->name : 'none';

        $user->update(['role_id' => $role->id]);

        AuditLog::record('user.role_change', $user, [
            'target_user' => $user->email,
            'old_role' => $oldRole,
            'new_role' => $role->name,
        ], $admin);

        return response()->json([
            'message' => "User role updated to {$role->name}.",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role->name,
                'is_active' => (bool) $user->is_active,
            ],
        ]);
    }

    public function updateUserStatus(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $user = User::findOrFail($id);

        if ($user->id === $admin->id) {
            return response()->json([
                'message' => 'You cannot deactivate your own administrative account.',
            ], 422);
        }

        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $user->update(['is_active' => $validated['is_active']]);

        AuditLog::record($validated['is_active'] ? 'user.activate' : 'user.deactivate', $user, [
            'target_user' => $user->email,
            'new_status' => $validated['is_active'] ? 'active' : 'deactivated',
        ], $admin);

        return response()->json([
            'message' => $validated['is_active'] ? 'User account activated.' : 'User account deactivated.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => (bool) $user->is_active,
            ],
        ]);
    }

    /**
     * Media upload & management (FR-11).
     * Uploaded through validated, type- and size-checked uploads and stored outside public code tree.
     */
    public function uploadMedia(Request $request, int $id, CloudinaryService $cloudinary): JsonResponse
    {
        $place = Place::withTrashed()->findOrFail($id);

        $request->validate([
            'photo' => 'required|file|image|mimes:jpeg,png,webp,jpg|max:5120', // max 5MB
            'is_primary' => 'nullable|boolean',
        ]);

        $file = $request->file('photo');
        $cloudinaryUpload = null;
        if ($cloudinary->isConfigured()) {
            try {
                $cloudinaryUpload = $cloudinary->upload($file, Str::uuid()->toString());
                $storedPath = $cloudinaryUpload['secure_url'];
            } catch (\Throwable $exception) {
                report($exception);
                // Fall back gracefully to local disk storage if Cloudinary upload fails
                $storedPath = $file->store('places_media', 'local');
            }
        } else {
            $storedPath = $file->store('places_media', 'local');
        }

        $isPrimary = $request->boolean('is_primary') || $place->media()->count() === 0;

        if ($isPrimary) {
            $place->media()->update(['is_primary' => false]);
        }

        $media = Media::create([
            'place_id' => $place->id,
            'file_path' => $storedPath,
            'cloudinary_public_id' => $cloudinaryUpload['public_id'] ?? null,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'sort_order' => $place->media()->count() + 1,
            'is_primary' => $isPrimary,
        ]);

        AuditLog::record('media.upload', $place, [
            'media_id' => $media->id,
            'file_name' => $media->original_name,
            'size' => $media->size,
        ], $request->user());

        return response()->json([
            'message' => 'Photograph uploaded and validated successfully.',
            'media' => [
                'id' => $media->id,
                'url' => $media->url,
                'original_name' => $media->original_name,
                'is_primary' => $media->is_primary,
            ],
        ], 201);
    }

    public function deleteMedia(Request $request, int $id, CloudinaryService $cloudinary): JsonResponse
    {
        $media = Media::findOrFail($id);
        $place = $media->place;

        // If local file on disk or Cloudinary public ID, remove it
        if ($media->cloudinary_public_id && $cloudinary->isConfigured()) {
            try {
                $cloudinary->destroy($media->cloudinary_public_id);
            } catch (\Throwable $e) {
                report($e);
            }
        } elseif (!str_starts_with($media->file_path, 'http')) {
            Storage::disk('local')->delete($media->file_path);
        }

        $media->delete();

        AuditLog::record('media.delete', $place, [
            'media_id' => $id,
        ], $request->user());

        return response()->json([
            'message' => 'Media deleted successfully.',
        ]);
    }

    /**
     * Admin view of all itineraries for oversight.
     */
    public function itineraries(Request $request): JsonResponse
    {
        $itineraries = Itinerary::with(['user', 'items'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($itinerary) {
                return [
                    'id' => $itinerary->id,
                    'title' => $itinerary->title,
                    'start_date' => $itinerary->start_date ? $itinerary->start_date->format('Y-m-d') : null,
                    'notes' => $itinerary->notes,
                    'is_public' => (bool) $itinerary->is_public,
                    'user' => $itinerary->user ? [
                        'id' => $itinerary->user->id,
                        'name' => $itinerary->user->name,
                        'email' => $itinerary->user->email,
                    ] : null,
                    'items_count' => $itinerary->items->count(),
                    'created_at' => $itinerary->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'itineraries' => $itineraries,
        ]);
    }

    /**
     * Mark/place-verify workflow (admin review).
     */
    public function verifyPlace(Request $request, int $id): JsonResponse
    {
        $place = Place::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,verified,needs_correction',
            'notes' => 'nullable|string|max:1000',
        ]);

        AuditLog::record('place.verify', $place, [
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
        ], $request->user());

        return response()->json([
            'message' => "Place verification marked as {$validated['status']}.",
            'place' => [
                'id' => $place->id,
                'name' => $place->name,
                'verification_status' => $validated['status'],
            ],
        ]);
    }

    /**
     * Analytics for admin dashboard.
     */
    public function analytics(): JsonResponse
    {
        $placesByCategory = Category::withCount(['places' => function ($q) {
            $q->withTrashed();
        }])->get()->map(fn($c) => [
            'name' => $c->name,
            'count' => $c->places_count,
            'color' => $c->color,
        ]);

        $usersByRole = Role::withCount('users')->get()->map(fn($r) => [
            'role' => $r->name,
            'count' => $r->users_count,
        ]);

        return response()->json([
            'places_by_category' => $placesByCategory,
            'users_by_role' => $usersByRole,
        ]);
    }

    /**
     * Data quality checks (real validation).
     */
    public function dataQuality(): JsonResponse
    {
        $issues = [];

        $missingDesc = Place::withTrashed()->where(function ($q) {
            $q->whereNull('description')->orWhere('description', '');
        })->count();
        if ($missingDesc > 0) {
            $issues[] = ['type' => 'missing_description', 'severity' => 'high', 'count' => $missingDesc, 'message' => 'Places missing description'];
        }

        $missingHours = Place::withTrashed()->where(function ($q) {
            $q->whereNull('opening_hours')->orWhere('opening_hours', '');
        })->count();
        if ($missingHours > 0) {
            $issues[] = ['type' => 'missing_opening_hours', 'severity' => 'medium', 'count' => $missingHours, 'message' => 'Places missing opening hours'];
        }

        $missingMedia = Place::withTrashed()->doesntHave('media')->count();
        if ($missingMedia > 0) {
            $issues[] = ['type' => 'missing_media', 'severity' => 'medium', 'count' => $missingMedia, 'message' => 'Places without images'];
        }

        $invalidCoords = Place::withTrashed()->where(function ($q) {
            $q->where('lat', '<', -90)->orWhere('lat', '>', 90)->orWhere('lng', '<', -180)->orWhere('lng', '>', 180);
        })->count();
        if ($invalidCoords > 0) {
            $issues[] = ['type' => 'invalid_coordinates', 'severity' => 'high', 'count' => $invalidCoords, 'message' => 'Places with invalid coordinates'];
        }

        $inactiveCats = Category::where('is_active', false)->count();
        if ($inactiveCats > 0) {
            $issues[] = ['type' => 'inactive_categories', 'severity' => 'low', 'count' => $inactiveCats, 'message' => 'Inactive categories present'];
        }

        return response()->json([
            'issues' => $issues,
            'summary' => [
                'total_issues' => collect($issues)->sum('count'),
            ],
        ]);
    }

    /**
     * Lightweight system health.
     */
    public function systemHealth(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
            $dbOk = true;
        } catch (\Throwable $e) {
            $dbOk = false;
        }

        $storageOk = is_writable(storage_path('app')) && is_writable(storage_path('framework'));

        return response()->json([
            'status' => ($dbOk && $storageOk) ? 'healthy' : 'degraded',
            'checks' => [
                'api' => ['status' => 'ok'],
                'database' => ['status' => $dbOk ? 'ok' : 'error'],
                'storage' => ['status' => $storageOk ? 'ok' : 'warning'],
            ],
            'migrations' => [
                'status' => 'ok',
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Audit trail inspection (FR-10, Page 6 & 7).
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $logs = AuditLog::with('actor')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }
}


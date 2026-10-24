<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ItineraryController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\PlaceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Visitflow REST API Routes
|--------------------------------------------------------------------------
*/

// --- Public Discovery & Catalog (FR-01, FR-02, FR-03, FR-14) ---
Route::get('/places', [PlaceController::class, 'index']);
Route::get('/places/{idOrSlug}', [PlaceController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/media/{id}/view', [MediaController::class, 'show']);

// --- Authentication (FR-05) ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// --- Authenticated User Routes (FR-05, FR-06, FR-07) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);

    // Itineraries
    Route::get('/itineraries', [ItineraryController::class, 'index']);
    Route::post('/itineraries', [ItineraryController::class, 'store']);
    Route::get('/itineraries/{id}', [ItineraryController::class, 'show']);
    Route::put('/itineraries/{id}', [ItineraryController::class, 'update']);
    Route::delete('/itineraries/{id}', [ItineraryController::class, 'destroy']);
    Route::post('/itineraries/sync-guest', [ItineraryController::class, 'syncGuest']);
});

// --- Admin Scoped Routes (FR-08, FR-09, FR-10, FR-11, FR-12) ---
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/analytics', [AdminController::class, 'analytics']);
    Route::get('/system-health', [AdminController::class, 'systemHealth']);
    Route::get('/data-quality', [AdminController::class, 'dataQuality']);

    // Places CRUD & Archival (FR-08)
    Route::get('/places', [AdminController::class, 'places']);
    Route::post('/places', [AdminController::class, 'storePlace']);
    Route::put('/places/{id}', [AdminController::class, 'updatePlace']);
    Route::delete('/places/{id}', [AdminController::class, 'archivePlace']);
    Route::post('/places/{id}/restore', [AdminController::class, 'restorePlace']);
    Route::post('/places/{id}/verify', [AdminController::class, 'verifyPlace']);

    // Categories CRUD (FR-09)
    Route::get('/categories', [AdminController::class, 'categories']);
    Route::post('/categories', [AdminController::class, 'storeCategory']);
    Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [AdminController::class, 'destroyCategory']);

    // Users Management (FR-10)
    Route::get('/users', [AdminController::class, 'users']);
    Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
    Route::put('/users/{id}/status', [AdminController::class, 'updateUserStatus']);

    // Itineraries Overview (Admin)
    Route::get('/itineraries', [AdminController::class, 'itineraries']);

    // Media Uploads (FR-11)
    Route::post('/places/{id}/media', [AdminController::class, 'uploadMedia']);
    Route::delete('/media/{id}', [AdminController::class, 'deleteMedia']);

    // Settings
    Route::get('/settings', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'index']);
    Route::put('/settings', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'update']);

    // Audit Trail
    Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
});

<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Itinerary;
use App\Models\ItineraryItem;
use App\Models\Place;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VisitflowApiTest extends TestCase
{
    protected User $adminUser;
    protected User $regularUser;
    protected Category $category;
    protected Place $place;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['display_name' => 'Admin']);
        $userRole = Role::firstOrCreate(['name' => 'user'], ['display_name' => 'User']);

        $this->adminUser = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            ['name' => 'Admin Test', 'password' => bcrypt('password'), 'role_id' => $adminRole->id, 'is_active' => true]
        );

        $this->regularUser = User::firstOrCreate(
            ['email' => 'user@test.com'],
            ['name' => 'User Test', 'password' => bcrypt('password'), 'role_id' => $userRole->id, 'is_active' => true]
        );

        $this->category = Category::firstOrCreate(
            ['slug' => 'heritage-test'],
            ['name' => 'Heritage Test', 'icon' => 'Landmark', 'color' => '#d97706', 'is_active' => true]
        );

        $this->place = Place::firstOrCreate(
            ['slug' => 'test-place-sigiriya'],
            [
                'category_id' => $this->category->id,
                'name' => 'Test Sigiriya Rock',
                'description' => 'Magnificent ancient fortress with sky palace and water gardens.',
                'address' => 'Sigiriya Road',
                'lat' => 7.957,
                'lng' => 80.760,
                'opening_hours' => '07:00 - 17:30',
                'created_by' => $this->adminUser->id,
                'is_active' => true,
            ]
        );
    }

    /**
     * FR-01, FR-02: Public Catalogue Discovery and Search.
     */
    public function test_guest_can_browse_places_and_filter_by_keyword_and_category(): void
    {
        $response = $this->getJson('/api/places');
        $response->assertStatus(200)
                 ->assertJsonStructure(['count', 'places', 'map_config']);

        // Search test (FR-02)
        $searchResponse = $this->getJson('/api/places?search=Sigiriya');
        $searchResponse->assertStatus(200);
        $this->assertTrue(collect($searchResponse->json('places'))->contains('slug', 'test-place-sigiriya'));

        // Category filter test (FR-02)
        $catResponse = $this->getJson('/api/places?category=heritage-test');
        $catResponse->assertStatus(200);
        $this->assertTrue(collect($catResponse->json('places'))->contains('slug', 'test-place-sigiriya'));
    }

    /**
     * FR-03, FR-14: Place Detail with Leaflet Coordinates & Attribution.
     */
    public function test_place_detail_shows_interactive_map_config_and_attribution(): void
    {
        $response = $this->getJson("/api/places/{$this->place->slug}");
        $response->assertStatus(200)
                 ->assertJsonPath('place.name', 'Test Sigiriya Rock')
                 ->assertJsonStructure([
                     'place' => ['id', 'name', 'lat', 'lng', 'category', 'media'],
                     'map_config' => ['lat', 'lng', 'attribution', 'tile_layer'],
                 ]);

        $this->assertStringContainsString('OpenStreetMap', $response->json('map_config.attribution'));
    }

    /**
     * FR-05: Authentication - Register, Login, Session Role-Scope.
     */
    public function test_user_authentication_flow(): void
    {
        $uniqueEmail = 'traveller_' . uniqid() . '@example.com';

        // Register
        $regResponse = $this->postJson('/api/auth/register', [
            'name' => 'New Explorer',
            'email' => $uniqueEmail,
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ]);
        $regResponse->assertStatus(201)
                    ->assertJsonStructure(['token', 'user' => ['id', 'email', 'role']]);

        // Login
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => $uniqueEmail,
            'password' => 'SecurePass123!',
        ]);
        $loginResponse->assertStatus(200)
                      ->assertJsonStructure(['token', 'user']);

        $token = $loginResponse->json('token');

        // Authenticated user profile
        $userResponse = $this->withHeader('Authorization', "Bearer {$token}")
                             ->getJson('/api/auth/user');
        $userResponse->assertStatus(200)
                     ->assertJsonPath('user.email', $uniqueEmail);

        // Logout
        $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
                               ->postJson('/api/auth/logout');
        $logoutResponse->assertStatus(200);
    }

    /**
     * FR-04, FR-06, FR-07: Guest sync & User Itinerary with ordered stops & ownership.
     */
    public function test_guest_itinerary_sync_and_ownership_protection(): void
    {
        // 1. Sync guest draft upon authentication
        $syncResponse = $this->actingAs($this->regularUser)
                             ->postJson('/api/itineraries/sync-guest', [
                                 'title' => 'My One-Day Golden Triangle',
                                 'start_date' => now()->format('Y-m-d'),
                                 'items' => [
                                     [
                                         'place_id' => $this->place->id,
                                         'sequence_order' => 1,
                                         'visit_time' => '08:00',
                                         'notes' => 'Early climb to beat midday sun',
                                     ],
                                 ],
                             ]);

        $syncResponse->assertStatus(201);
        $itineraryId = $syncResponse->json('itinerary.id');

        // 2. Read own itinerary (FR-06)
        $readResponse = $this->actingAs($this->regularUser)
                             ->getJson("/api/itineraries/{$itineraryId}");
        $readResponse->assertStatus(200)
                     ->assertJsonPath('itinerary.items.0.notes', 'Early climb to beat midday sun');

        // 3. Unauthorized access by another user is blocked (FR-06)
        $otherUser = User::firstOrCreate(
            ['email' => 'other@test.com'],
            ['name' => 'Other User', 'password' => bcrypt('password'), 'role_id' => $this->regularUser->role_id, 'is_active' => true]
        );

        $forbiddenResponse = $this->actingAs($otherUser)
                                  ->getJson("/api/itineraries/{$itineraryId}");
        $forbiddenResponse->assertStatus(403);
    }

    /**
     * FR-12: Privileged admin endpoints reject non-admins.
     */
    public function test_admin_endpoints_reject_unauthenticated_and_regular_users(): void
    {
        // Guest blocked
        $guestRes = $this->getJson('/api/admin/dashboard');
        $guestRes->assertStatus(401);

        // Regular user blocked
        $regularRes = $this->actingAs($this->regularUser)->getJson('/api/admin/dashboard');
        $regularRes->assertStatus(403);

        // Admin allowed
        $adminRes = $this->actingAs($this->adminUser)->getJson('/api/admin/dashboard');
        $adminRes->assertStatus(200);
    }

    /**
     * FR-08: Admin Place Archival and Preservation in Itineraries.
     */
    public function test_admin_archiving_place_hides_from_public_but_keeps_in_itinerary(): void
    {
        // Setup an itinerary referencing this place
        $itinerary = Itinerary::create([
            'user_id' => $this->regularUser->id,
            'title' => 'Historical Test Trip',
        ]);
        ItineraryItem::create([
            'itinerary_id' => $itinerary->id,
            'place_id' => $this->place->id,
            'sequence_order' => 1,
        ]);

        // Archive place (FR-08)
        $archiveRes = $this->actingAs($this->adminUser)
                           ->deleteJson("/api/admin/places/{$this->place->id}");
        $archiveRes->assertStatus(200);

        // Public discovery MUST hide archived place (FR-08)
        $discoveryRes = $this->getJson('/api/places');
        $this->assertFalse(collect($discoveryRes->json('places'))->contains('id', $this->place->id));

        // Historical itinerary STILL resolves the place (FR-08, Page 1 & 7)
        $itinRes = $this->actingAs($this->regularUser)->getJson("/api/itineraries/{$itinerary->id}");
        $itinRes->assertStatus(200);
        $this->assertEquals($this->place->name, $itinRes->json('itinerary.items.0.place.name'));
        $this->assertTrue($itinRes->json('itinerary.items.0.place.is_archived'));

        // Restore place
        $restoreRes = $this->actingAs($this->adminUser)
                            ->postJson("/api/admin/places/{$this->place->id}/restore");
        $restoreRes->assertStatus(200);
    }
}


<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppResponseTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that AppResponse returns Inertia for web requests.
     */
    public function test_app_response_returns_inertia_for_web_requests(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/settings');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Settings')
            ->has('mustVerifyEmail')
            ->has('status')
        );
    }

    /**
     * Test that AppResponse returns JSON for API requests.
     */
    public function test_app_response_returns_json_for_api_requests(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withHeaders(['Accept' => 'application/json'])
            ->get('/settings');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Success',
        ]);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'mustVerifyEmail',
                'status',
            ],
        ]);
    }
}

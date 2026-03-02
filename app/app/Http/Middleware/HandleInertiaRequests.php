<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $isInitialLoad = ! $request->header('X-Inertia');

        $shared = [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? $user->toArray() : null,
            ],
            // Forward Laravel session flash data to all Inertia pages
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ];


        if ($user && $isInitialLoad) {
            $shared['auth']['user']['profile'] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified' => (bool) $user->email_verified_at,
                'joined_at' => $user->created_at?->toDateString(),
            ];
            $shared['auth']['user']['roles'] = $user->cachedRoles();
            $shared['auth']['user']['notifications'] = [
                'unread_count' => Cache::remember(
                    Notification::cacheKeyForUser($user->id),
                    now()->addMinutes(10),
                    fn () => Notification::unreadCountForUser($user->id),
                ),
            ];
            $shared['bootstrap_active'] = true;
        }

        return $shared;
    }
}

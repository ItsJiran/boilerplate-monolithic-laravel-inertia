<?php

use App\Models\Customer;
use App\Models\CustomerRelation;
use App\Models\MarketingActivity;
use App\Enums\CustomerType;
use App\Enums\CustomerRelationType;
use App\Enums\MarketingType;
use App\Services\Marketing\OrchestratorActivityService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Login as a user (Marketing)
$user = \App\Models\User::first();
if (!$user) {
    echo "No user found!\n";
    exit(1);
}
Auth::login($user);
// Get tenant from cached roles or fallback
$cachedInfo = $user->cachedRoles();
$tenantId = null;

// Try to find a tenant ID from the cached roles
if (!empty($cachedInfo['tenants'])) {
    foreach ($cachedInfo['tenants'] as $tid => $roles) {
        if ($tid !== 'global' && is_numeric($tid)) {
            $tenantId = (int)$tid;
            break;
        }
    }
}

// Fallback if no tenant found in cache (e.g. global admin might not have explicit tenant role sometimes?)
if (!$tenantId) {
     // Check if user has any role pivot with tenant_id
     $role = $user->roles()->whereNotNull('tenant_id')->first();
     $tenantId = $role ? $role->pivot->tenant_id : 1; // Default to 1 if absolutely nothing found, just for test
}

echo "Testing with User: {$user->name} (Tenant ID: {$tenantId})\n";

// 1. Setup Data: Organization + Representative Relation
$organization = Customer::factory()->create([
    'customer_type' => CustomerType::ORGANIZATION,
    'tenant_id' => $tenantId,
    'contact_name' => 'Test Org ' . uniqid(),
]);

$representative = Customer::factory()->create([
    'customer_type' => CustomerType::INDIVIDUAL,
    'tenant_id' => $tenantId,
    'contact_name' => 'Test Rep ' . uniqid(),
]);

CustomerRelation::create([
    'fromable_type' => Customer::class,
    'fromable_id' => $representative->id,
    'targetable_type' => Customer::class,
    'targetable_id' => $organization->id,
    'type' => CustomerRelationType::REPRESENTATION,
]);

echo "Created Organization: {$organization->id} and Representative: {$representative->id}\n";

// 2. Create Activity via Service
$service = app(OrchestratorActivityService::class);

$payload = [
    'marketing_type' => MarketingType::ORGANIZATION_REPRESENTATION_BASED->value,
    'customer_id' => $representative->id, // Input is Rep
    'to_customer_id' => $organization->id, // Input is Org
    'marketing_id' => $user->id,
    'tenant_id' => $tenantId,
    'note' => 'Verification Test',
];

echo "Creating Activity (Rep Based)...\n";
try {
    $result = $service->createActivity($payload);
    $activity = $result['activity'];

    echo "Activity Created: ID {$activity->id}\n";
    echo "Activity Customer ID: {$activity->customer_id} (Expected: {$organization->id})\n";
    echo "Activity Marketing Type: {$activity->marketing_type->value}\n";

    if ($activity->customer_id !== $organization->id) {
        echo "ERROR: Activity linked to wrong customer! Expected Organization ID.\n";
        exit(1);
    }

    // Verify Relation Detail
    $relationDetail = \App\Models\MarketingActivityCustomerRelationDetail::where('marketing_activity_id', $activity->id)->first();
    if (!$relationDetail) {
        echo "ERROR: Relation detail not found!\n";
        exit(1);
    }

    echo "Relation Detail: Customer ID (Rep): {$relationDetail->customer_id} (Expected: {$representative->id})\n";
    echo "Relation Detail: To Customer ID (Org): {$relationDetail->to_customer_id} (Expected: {$organization->id})\n";

    if ($relationDetail->customer_id !== $representative->id || $relationDetail->to_customer_id !== $organization->id) {
         echo "ERROR: Relation detail mismatched!\n";
         exit(1);
    }


    echo "Verification Passed!\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}

<?php

use App\Models\Customer;
use App\Models\CustomerRelation;
use App\Enums\CustomerType;
use App\Enums\CustomerRelationType;
use Illuminate\Support\Facades\Auth;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Login as a user
$user = \App\Models\User::first();
if (!$user) {
    echo "No user found.\n";
    exit(1);
}
Auth::login($user);

// Find an Organization with representatives, or create one
$organization = Customer::where('customer_type', CustomerType::ORGANIZATION)->first();

if (!$organization) {
    echo "No organization found. Creating one.\n";
    $organization = Customer::factory()->create(['customer_type' => CustomerType::ORGANIZATION, 'tenant_id' => $user->tenants->first()->id]);
}

echo "Testing with Organization: {$organization->contact_name} (ID: {$organization->id})\n";

// Ensure it has representatives
$repCount = CustomerRelation::where('targetable_id', $organization->id)
    ->where('type', CustomerRelationType::REPRESENTATION)
    ->count();

if ($repCount < 6) {
    echo "Adding representatives...\n";
    $individuals = Customer::factory()->count(6 - $repCount)->create([
        'customer_type' => CustomerType::INDIVIDUAL,
        'tenant_id' => $organization->tenant_id
    ]);

    foreach ($individuals as $ind) {
        CustomerRelation::create([
            'fromable_type' => Customer::class,
            'fromable_id' => $ind->id, // Individual
            'targetable_type' => Customer::class,
            'targetable_id' => $organization->id, // Organization
            'type' => CustomerRelationType::REPRESENTATION,
        ]);
    }
}

// Subclass Controller to Mock Auth/Cache dependent methods
class TestCustomerController extends \App\Http\Controllers\Marketing\CustomerController
{
    public static $mockTenantId;
    public function allowedTenantIds(\App\Models\User $user): ?array
    {
        // Mock returning the specific tenant ID
        return [self::$mockTenantId ?? 1];
    }
    
    public function assertHasAnyTenantAccess(?array $allowedTenantIds): void
    {
        // Mock success
    }
}

// Test API Logic directly 
TestCustomerController::$mockTenantId = $organization->tenant_id;
$controller = new TestCustomerController(
    app(\App\Services\Marketing\CustomerService::class)
);

// Mock Request
$request = new \Illuminate\Http\Request();
$request->merge(['per_page' => 2, 'page' => 1]);

echo "Calling getPaginatedRelatedCustomers (Page 1, limit 2)...\n";
$response = $controller->getPaginatedRelatedCustomers($request, $organization);
$data = $response->getData(true); // Get as array

if (!$data['success']) {
    echo "API Call Failed: " . $data['message'] . "\n";
    exit(1);
}

$pagination = $data['data'];
echo "Total Representatives: " . $pagination['total'] . "\n";
echo "Per Page: " . $pagination['per_page'] . "\n";
echo "Current Page: " . $pagination['current_page'] . "\n";
echo "Data Count: " . count($pagination['data']) . "\n";

if (count($pagination['data']) !== 2) {
    echo "ERROR: Expected 2 items, got " . count($pagination['data']) . "\n";
    exit(1);
}

// Page 2
$request->merge(['page' => 2]);
echo "Calling getPaginatedRelatedCustomers (Page 2)...\n";
$response = $controller->getPaginatedRelatedCustomers($request, $organization);
$data = $response->getData(true);
$pagination = $data['data'];

echo "Current Page: " . $pagination['current_page'] . "\n";
echo "Data Count: " . count($pagination['data']) . "\n";

if (count($pagination['data']) !== 2) {
     echo "ERROR: Expected 2 items on page 2, got " . count($pagination['data']) . "\n";
     // Note: If total was exactly 2, page 2 would be empty. But we ensured at least 6 items.
     exit(1);
}


echo "Verification Successful!\n";

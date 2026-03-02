<?php

namespace Tests\Unit\Services\Marketing;

use App\Models\ReferenceDistrict;
use App\Models\ReferenceProvince;
use App\Models\ReferenceRegency;
use App\Models\ReferenceVillage;
use App\Services\Marketing\LocationFuzzyMatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationFuzzyMatcherTest extends TestCase
{
    use RefreshDatabase;

    protected ReferenceProvince $province;
    protected ReferenceRegency $regency;
    protected ReferenceDistrict $district;
    protected ReferenceVillage $village;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed Reference Data
        $this->province = ReferenceProvince::create(['id' => 1, 'name' => 'Jawa Barat', 'slug' => 'jawa-barat']);
        $this->regency = ReferenceRegency::create(['id' => 1, 'province_id' => 1, 'name' => 'Kota Bandung', 'slug' => 'kota-bandung']);
        
        $this->district = ReferenceDistrict::create([
            'id' => 1, 
            'regency_id' => 1, 
            'province_id' => 1, // Added
            'name' => 'Bandung Wetan', 
            'slug' => 'bandung-wetan'
        ]);
        
        $this->village = ReferenceVillage::create([
            'id' => 1, 
            'district_id' => 1, 
            'regency_id' => 1, 
            'province_id' => 1, 
            'name' => 'Citarum', 
            'slug' => 'citarum',
            'mode' => 1 // Added required field
        ]);
        
        // Add dummy data to ensure no false positives
        ReferenceProvince::create(['id' => 2, 'name' => 'Jawa Tengah', 'slug' => 'jawa-tengah']);
        ReferenceRegency::create(['id' => 2, 'province_id' => 2, 'name' => 'Kota Semarang', 'slug' => 'kota-semarang']);
    }

    /** @test */
    public function it_matches_exact_input()
    {
        $matcher = new LocationFuzzyMatcher();

        $input = [
            'province' => 'Jawa Barat',
            'regency' => 'Kota Bandung',
            'district' => 'Bandung Wetan',
            'village' => 'Citarum',
        ];

        $result = $matcher->match($input);

        $this->assertEquals($this->province->id, $result['province_id']);
        $this->assertEquals($this->regency->id, $result['regency_id']);
        $this->assertEquals($this->district->id, $result['district_id']);
        $this->assertEquals($this->village->id, $result['village_id']);
        $this->assertEquals(1.0, $result['confidence']);
    }

    /** @test */
    public function it_matches_case_insensitive_input()
    {
        $matcher = new LocationFuzzyMatcher();

        $input = [
            'province' => 'JAWA BARAT',
            'regency' => 'kota bandung',
            'district' => 'BanDung WeTan',
            'village' => 'citarum',
        ];

        $result = $matcher->match($input);

        $this->assertEquals($this->province->id, $result['province_id']);
        $this->assertEquals($this->regency->id, $result['regency_id']);
        $this->assertEquals($this->district->id, $result['district_id']);
        $this->assertEquals($this->village->id, $result['village_id']);
        $this->assertEquals(1.0, $result['confidence']);
    }

    /** @test */
    public function it_matches_by_slug_logic_implicitly() // Actually code uses explicit slug check if exact fails
    {
        // Testing inputs that look like slugs or varying formats
        $matcher = new LocationFuzzyMatcher();

        $input = [
            'province' => 'jawa-barat', // Matches slug
            'regency' => 'Kota-Bandung', // Might match slug normalization
            'district' => 'bandung wetan', // Exact match case-insensitive
            'village' => 'Citarum'
        ];

        $result = $matcher->match($input);

        $this->assertEquals($this->province->id, $result['province_id']);
        $this->assertEquals($this->regency->id, $result['regency_id']);
    }

    /** @test */
    public function it_matches_partial_input_fuzzy()
    {
        $matcher = new LocationFuzzyMatcher();

        $input = [
            'province' => 'Jawa Bar', // Partial
            'regency' => 'Bandung', // Partial of Kota Bandung
            'district' => 'Wetan', // Partial
            'village' => 'tarum' // Partial
        ];

        $result = $matcher->match($input);

        $this->assertEquals($this->province->id, $result['province_id']);
        $this->assertEquals($this->regency->id, $result['regency_id']);
        $this->assertEquals($this->district->id, $result['district_id']);
        $this->assertEquals($this->village->id, $result['village_id']);
        
        // Confidence should be less than 1.0 but high enough
        $this->assertLessThan(1.0, $result['confidence']);
        $this->assertGreaterThan(0.5, $result['confidence']);
    }

    /** @test */
    public function it_respects_hierarchy()
    {
        $matcher = new LocationFuzzyMatcher();

        // Correct Province, Wrong Regency (Regency exists but in other province)
        $input = [
            'province' => 'Jawa Barat',
            'regency' => 'Kota Semarang', // Exists in Jawa Tengah
        ];

        $result = $matcher->match($input);

        $this->assertEquals($this->province->id, $result['province_id']);
        $this->assertNull($result['regency_id']); // Should NOT match Semarang because parent is Jabar
    }

    /** @test */
    public function it_returns_nulls_for_non_existent_locations()
    {
        $matcher = new LocationFuzzyMatcher();

        $input = [
            'province' => 'Atlantis',
            'regency' => 'Lost City',
        ];

        $result = $matcher->match($input);

        $this->assertNull($result['province_id']);
        $this->assertNull($result['regency_id']);
        $this->assertEquals(0, $result['confidence']);
    }

    /** @test */
    public function it_handles_empty_inputs_gracefully()
    {
        $matcher = new LocationFuzzyMatcher();

        $input = [
            'province' => '',
            'regency' => null,
        ];

        $result = $matcher->match($input);

        $this->assertNull($result['province_id']);
    }
}

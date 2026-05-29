<?php

namespace Database\Seeders;

use App\Models\ClientType;
use Illuminate\Database\Seeder;

class ClientTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['name' => 'Residenciales', 'code' => 'RES', 'active' => true],
            ['name' => 'Comerciales', 'code' => 'COM', 'active' => true],
            ['name' => 'Institucionales', 'code' => 'INS', 'active' => true],
            ['name' => 'Industriales', 'code' => 'IND', 'active' => true],
        ];

        foreach ($types as $type) {
            ClientType::create($type);
        }
    }
}

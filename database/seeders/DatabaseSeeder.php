<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            UsersByRoleSeeder::class,
            ClientTypeSeeder::class,
            PanelSeeder::class,
            InverterSeeder::class,
            BatterySeeder::class,
            ProjectStateSeeder::class,
            RequiredDocumentSeeder::class,
            ProjectStateFieldSeeder::class,
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Models\Battery;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BatterySeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $batteries = [
            ['brand' => 'BYD', 'model' => 'Battery-Base LVL 12.8', 'capacity' => 12.80, 'voltage' => 51.20, 'type' => 'Litio', 'price' => 18500000],
            ['brand' => 'BYD', 'model' => 'Battery-Base LVL 25.6', 'capacity' => 25.60, 'voltage' => 51.20, 'type' => 'Litio', 'price' => 32000000],
            ['brand' => 'BYD', 'model' => 'Battery-Base LVL 51.2', 'capacity' => 51.20, 'voltage' => 51.20, 'type' => 'Litio', 'price' => 58000000],
            ['brand' => 'Tesla', 'model' => 'Powerwall 2', 'capacity' => 13.50, 'voltage' => 48.00, 'type' => 'Litio', 'price' => 22000000],
            ['brand' => 'LG Chem', 'model' => 'RESU10H', 'capacity' => 9.80, 'voltage' => 48.00, 'type' => 'Litio', 'price' => 16500000],
            ['brand' => 'LG Chem', 'model' => 'RESU16H', 'capacity' => 16.00, 'voltage' => 48.00, 'type' => 'Litio', 'price' => 24500000],
            ['brand' => 'Pylontech', 'model' => 'US2000 Plus', 'capacity' => 4.80, 'voltage' => 48.00, 'type' => 'Litio', 'price' => 8500000],
            ['brand' => 'Pylontech', 'model' => 'US3000 Plus', 'capacity' => 3.50, 'voltage' => 48.00, 'type' => 'Litio', 'price' => 6200000],
            ['brand' => 'Freedom', 'model' => 'FF 100Ah', 'capacity' => 5.00, 'voltage' => 48.00, 'type' => 'AGM', 'price' => 4500000],
            ['brand' => 'Freedom', 'model' => 'FF 200Ah', 'capacity' => 10.00, 'voltage' => 48.00, 'type' => 'AGM', 'price' => 7800000],
            ['brand' => 'Rolls', 'model' => 'S6 4600', 'capacity' => 4.60, 'voltage' => 48.00, 'type' => 'AGM', 'price' => 5200000],
            ['brand' => 'Rolls', 'model' => 'S6 5500', 'capacity' => 5.50, 'voltage' => 48.00, 'type' => 'AGM', 'price' => 6100000],
        ];

        foreach ($batteries as $battery) {
            Battery::updateOrCreate(
                ['brand' => $battery['brand'], 'model' => $battery['model']],
                $battery
            );
        }
    }
}

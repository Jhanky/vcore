<?php

namespace Database\Seeders;

use App\Models\Inverter;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InverterSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $inverters = [
            ['brand' => 'Fronius', 'model' => 'Primo 5.0', 'power' => 5.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 8500000],
            ['brand' => 'Fronius', 'model' => 'Primo 6.0', 'power' => 6.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 9500000],
            ['brand' => 'Fronius', 'model' => 'Primo 8.2', 'power' => 8.2, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 11500000],
            ['brand' => 'SMA', 'model' => 'Sunny Boy 3.0', 'power' => 3.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 6800000],
            ['brand' => 'SMA', 'model' => 'Sunny Boy 5.0', 'power' => 5.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 9200000],
            ['brand' => 'SMA', 'model' => 'Sunny Boy 7.0', 'power' => 7.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 11800000],
            ['brand' => 'SolarEdge', 'model' => 'SE 5000H', 'power' => 5.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 9800000],
            ['brand' => 'SolarEdge', 'model' => 'SE 7600H', 'power' => 7.6, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 13500000],
            ['brand' => 'Growatt', 'model' => 'MIN 3000TL', 'power' => 3.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 4200000],
            ['brand' => 'Growatt', 'model' => 'MIN 5000TL', 'power' => 5.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 5800000],
            ['brand' => 'Growatt', 'model' => 'MIN 8000TL', 'power' => 8.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 7800000],
            ['brand' => 'Huawei', 'model' => 'SUN2000-3KTL', 'power' => 3.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 6500000],
            ['brand' => 'Huawei', 'model' => 'SUN2000-5KTL', 'power' => 5.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 8900000],
            ['brand' => 'Huawei', 'model' => 'SUN2000-6KTL', 'power' => 6.0, 'system_type' => 'On-grid', 'grid_type' => 'monofasico', 'price' => 10500000],
            ['brand' => 'Fronius', 'model' => 'Symo 10.0', 'power' => 10.0, 'system_type' => 'On-grid', 'grid_type' => 'trifasico 220', 'price' => 18500000],
            ['brand' => 'Fronius', 'model' => 'Symo 12.5', 'power' => 12.5, 'system_type' => 'On-grid', 'grid_type' => 'trifasico 220', 'price' => 22000000],
            ['brand' => 'SMA', 'model' => 'Sunny Tripower 8.0', 'power' => 8.0, 'system_type' => 'On-grid', 'grid_type' => 'trifasico 220', 'price' => 16500000],
            ['brand' => 'SMA', 'model' => 'Sunny Tripower 10.0', 'power' => 10.0, 'system_type' => 'On-grid', 'grid_type' => 'trifasico 220', 'price' => 19500000],
            ['brand' => 'SolarEdge', 'model' => 'SE 10K', 'power' => 10.0, 'system_type' => 'On-grid', 'grid_type' => 'trifasico 220', 'price' => 21000000],
            ['brand' => 'Huawei', 'model' => 'SUN2000-10KTL', 'power' => 10.0, 'system_type' => 'On-grid', 'grid_type' => 'trifasico 220', 'price' => 18000000],
            ['brand' => 'SMA', 'model' => 'Sunny Island 6.0', 'power' => 6.0, 'system_type' => 'Off-grid', 'grid_type' => 'monofasico', 'price' => 15000000],
            ['brand' => 'SMA', 'model' => 'Sunny Island 8.0', 'power' => 8.0, 'system_type' => 'Off-grid', 'grid_type' => 'monofasico', 'price' => 18500000],
            ['brand' => 'Victron', 'model' => 'MultiPlus 3000', 'power' => 3.0, 'system_type' => 'Off-grid', 'grid_type' => 'monofasico', 'price' => 9800000],
            ['brand' => 'Victron', 'model' => 'MultiPlus 5000', 'power' => 5.0, 'system_type' => 'Off-grid', 'grid_type' => 'monofasico', 'price' => 14500000],
            ['brand' => 'Outback', 'model' => 'FlexPower 5', 'power' => 5.0, 'system_type' => 'Off-grid', 'grid_type' => 'monofasico', 'price' => 16800000],
            ['brand' => 'Fronius', 'model' => 'Eco 10.0', 'power' => 10.0, 'system_type' => 'Híbrido', 'grid_type' => 'trifasico 220', 'price' => 22500000],
            ['brand' => 'SMA', 'model' => 'Sunny Tripower 10.0 Hybrid', 'power' => 10.0, 'system_type' => 'Híbrido', 'grid_type' => 'trifasico 220', 'price' => 24000000],
            ['brand' => 'SolarEdge', 'model' => 'SE 10K Hybrid', 'power' => 10.0, 'system_type' => 'Híbrido', 'grid_type' => 'trifasico 220', 'price' => 23500000],
            ['brand' => 'Growatt', 'model' => 'SPH 5000', 'power' => 5.0, 'system_type' => 'Híbrido', 'grid_type' => 'monofasico', 'price' => 12000000],
            ['brand' => 'Growatt', 'model' => 'SPH 8000', 'power' => 8.0, 'system_type' => 'Híbrido', 'grid_type' => 'monofasico', 'price' => 16500000],
            ['brand' => 'Huawei', 'model' => 'SUN2000-5KTL-UP', 'power' => 5.0, 'system_type' => 'Híbrido', 'grid_type' => 'monofasico', 'price' => 13500000],
        ];

        foreach ($inverters as $inverter) {
            Inverter::updateOrCreate(
                ['brand' => $inverter['brand'], 'model' => $inverter['model']],
                $inverter
            );
        }
    }
}

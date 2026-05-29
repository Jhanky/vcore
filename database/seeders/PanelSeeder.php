<?php

namespace Database\Seeders;

use App\Models\Panel;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PanelSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $panels = [
            ['brand' => 'JA Solar', 'model' => 'JAM72D30-450', 'power' => 450.00, 'price' => 850000],
            ['brand' => 'JA Solar', 'model' => 'JAM72D30-500', 'power' => 500.00, 'price' => 950000],
            ['brand' => 'JA Solar', 'model' => 'JAM72D30-550', 'power' => 550.00, 'price' => 1050000],
            ['brand' => 'Longi Solar', 'model' => 'LR6-72HPH 450', 'power' => 450.00, 'price' => 880000],
            ['brand' => 'Longi Solar', 'model' => 'LR6-72HPH 500', 'power' => 500.00, 'price' => 980000],
            ['brand' => 'Longi Solar', 'model' => 'LR6-72HPH 550', 'power' => 550.00, 'price' => 1100000],
            ['brand' => 'Trina Solar', 'model' => 'TSM-450DE09', 'power' => 450.00, 'price' => 860000],
            ['brand' => 'Trina Solar', 'model' => 'TSM-500DE09', 'power' => 500.00, 'price' => 960000],
            ['brand' => 'Trina Solar', 'model' => 'TSM-550DE09', 'power' => 550.00, 'price' => 1080000],
            ['brand' => 'Canadian Solar', 'model' => 'CS3W-450P', 'power' => 450.00, 'price' => 820000],
            ['brand' => 'Canadian Solar', 'model' => 'CS3W-500P', 'power' => 500.00, 'price' => 920000],
            ['brand' => 'Canadian Solar', 'model' => 'CS3W-550P', 'power' => 550.00, 'price' => 1040000],
            ['brand' => 'Jinko Solar', 'model' => 'JKM450M-72', 'power' => 450.00, 'price' => 840000],
            ['brand' => 'Jinko Solar', 'model' => 'JKM500M-72', 'power' => 500.00, 'price' => 940000],
            ['brand' => 'Jinko Solar', 'model' => 'JKM550M-72', 'power' => 550.00, 'price' => 1060000],
            ['brand' => 'SunPower', 'model' => 'Maxeon 3 400', 'power' => 400.00, 'price' => 1200000],
            ['brand' => 'SunPower', 'model' => 'Maxeon 3 440', 'power' => 440.00, 'price' => 1350000],
            ['brand' => 'LG', 'model' => 'LG NeON 2 400', 'power' => 400.00, 'price' => 1150000],
            ['brand' => 'LG', 'model' => 'LG NeON 2 440', 'power' => 440.00, 'price' => 1320000],
            ['brand' => 'Q Cells', 'model' => 'Q.PEAK DUO G7 450', 'power' => 450.00, 'price' => 920000],
            ['brand' => 'Q Cells', 'model' => 'Q.PEAK DUO G7 500', 'power' => 500.00, 'price' => 1050000],
            ['brand' => 'First Solar', 'model' => 'Series 6 Plus 430', 'power' => 430.00, 'price' => 1100000],
            ['brand' => 'First Solar', 'model' => 'Series 6 Plus 480', 'power' => 480.00, 'price' => 1250000],
            ['brand' => 'Huasun', 'model' => 'HSP-550M', 'power' => 550.00, 'price' => 1150000],
            ['brand' => 'Huasun', 'model' => 'HSP-600M', 'power' => 600.00, 'price' => 1280000],
        ];

        foreach ($panels as $panel) {
            Panel::updateOrCreate(
                ['brand' => $panel['brand'], 'model' => $panel['model']],
                $panel
            );
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'JinkoSolar Colombia S.A.S.',
                'nit' => '901.123.456-7',
                'contact_name' => 'Carlos Martínez',
                'phone' => '3101234567',
                'email' => 'carlos@jinkosolar.co',
                'address' => 'Calle 100 # 20-30, Bogotá',
            ],
            [
                'name' => 'Huawei Technologies Colombia',
                'nit' => '800.123.456-9',
                'contact_name' => 'Ana Rodríguez',
                'phone' => '3159876543',
                'email' => 'ana.rodriguez@huawei.com',
                'address' => 'Cra 7 # 71-21, Bogotá',
            ],
            [
                'name' => 'Fronius Colombia',
                'nit' => '900.456.789-0',
                'contact_name' => 'Pedro López',
                'phone' => '3204567890',
                'email' => 'pedro@fronius.co',
                'address' => 'Av. El Poblado # 5-10, Medellín',
            ],
            [
                'name' => 'Trina Solar Andina',
                'nit' => '901.789.012-3',
                'contact_name' => 'María Gómez',
                'phone' => '3117890123',
                'email' => 'maria@trinasolar.co',
                'address' => 'Cra 43A # 20-50, Cali',
            ],
            [
                'name' => 'SolarEdge Technologies',
                'nit' => '800.456.789-1',
                'contact_name' => 'Juan Pérez',
                'phone' => '3004567890',
                'email' => 'juan@solaredge.co',
                'address' => 'Calle 93 # 15-40, Bogotá',
            ],
            [
                'name' => 'LG Energy Solutions',
                'nit' => '900.234.567-8',
                'contact_name' => 'Diana Torres',
                'phone' => '3182345678',
                'email' => 'diana@lgenergy.co',
                'address' => 'Av. Suba # 120-50, Bogotá',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
}

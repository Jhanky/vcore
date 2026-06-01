<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $roleAdmin = Role::firstOrCreate(['name' => 'admin']);
        $roleComercial = Role::firstOrCreate(['name' => 'comercial']);
        $roleTecnico = Role::firstOrCreate(['name' => 'tecnico']);
        $roleGerente = Role::firstOrCreate(['name' => 'gerente']);

        $adminUser = User::where('email', 'admin@vcore.com')->first();
        if ($adminUser) {
            $adminUser->assignRole($roleAdmin);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Permission::firstOrCreate(['name' => 'manage users']);
        Permission::firstOrCreate(['name' => 'manage roles']);
        Permission::firstOrCreate(['name' => 'view quotations']);
        Permission::firstOrCreate(['name' => 'create quotations']);
        Permission::firstOrCreate(['name' => 'edit quotations']);
        Permission::firstOrCreate(['name' => 'delete quotations']);
        Permission::firstOrCreate(['name' => 'approve quotations']);
        Permission::firstOrCreate(['name' => 'manage supplies']);
        Permission::firstOrCreate(['name' => 'view projects']);
        Permission::firstOrCreate(['name' => 'manage projects']);
        Permission::firstOrCreate(['name' => 'view evidences']);
        Permission::firstOrCreate(['name' => 'view clients']);
        Permission::firstOrCreate(['name' => 'manage clients']);
        Permission::firstOrCreate(['name' => 'view inventory']);
        Permission::firstOrCreate(['name' => 'manage inventory']);
        Permission::firstOrCreate(['name' => 'view maintenances']);
        Permission::firstOrCreate(['name' => 'manage maintenances']);
        Permission::firstOrCreate(['name' => 'view tickets']);
        Permission::firstOrCreate(['name' => 'manage tickets']);

        $roleAdmin = Role::firstOrCreate(['name' => 'admin']);
        $roleComercial = Role::firstOrCreate(['name' => 'comercial']);
        $roleTecnico = Role::firstOrCreate(['name' => 'tecnico']);
        $roleGerente = Role::firstOrCreate(['name' => 'gerente']);

        $roleGerente->givePermissionTo([
            'view quotations',
            'approve quotations',
            'view projects',
            'manage projects',
            'view clients',
            'manage clients',
            'manage supplies',
            'manage users',
            'view inventory',
            'manage inventory',
            'view maintenances',
            'manage maintenances',
            'view tickets',
            'manage tickets',
        ]);

        $roleTecnico->givePermissionTo([
            'view evidences',
            'view projects',
            'view inventory',
            'view maintenances',
            'view tickets',
            'manage tickets',
        ]);

        $adminUser = User::where('email', 'admin@vcore.com')->first();
        if ($adminUser) {
            $adminUser->assignRole($roleAdmin);
        }
    }
}

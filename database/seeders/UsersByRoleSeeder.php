<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersByRoleSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Administrador',
                'username' => 'admin',
                'email' => 'admin@vcore.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ],
            [
                'name' => 'Comercial',
                'username' => 'comercial',
                'email' => 'comercial@vcore.com',
                'password' => Hash::make('password'),
                'role' => 'comercial',
            ],
            [
                'name' => 'Técnico',
                'username' => 'tecnico',
                'email' => 'tecnico@vcore.com',
                'password' => Hash::make('password'),
                'role' => 'tecnico',
            ],
            [
                'name' => 'Gerente',
                'username' => 'gerente',
                'email' => 'gerente@vcore.com',
                'password' => Hash::make('password'),
                'role' => 'gerente',
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);

            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'email_verified_at' => now(),
                ])
            );

            $user->syncRoles([$role]);
        }
    }
}

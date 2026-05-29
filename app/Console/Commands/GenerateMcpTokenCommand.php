<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GenerateMcpTokenCommand extends Command
{
    protected $signature = 'mcp:generate-token {email : Email del usuario}';

    protected $description = 'Genera un token MCP para un usuario';

    public function handle(): int
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("Usuario con email {$email} no encontrado.");

            return Command::FAILURE;
        }

        $token = Str::random(64);

        $user->update([
            'mcp_token' => Hash::make($token),
            'mcp_token_created_at' => now(),
        ]);

        $this->info("Token MCP generado para {$user->name}");
        $this->line("Token: {$token}");
        $this->newLine();
        $this->warn('Guarda este token, no se mostrará nuevamente.');

        return Command::SUCCESS;
    }
}

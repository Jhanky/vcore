<?php

namespace App\Console\Commands;

use App\Mcp\Transport\StdioServer;
use Illuminate\Console\Command;

class McpServerCommand extends Command
{
    protected $signature = 'mcp:serve';

    protected $description = 'Inicia el servidor MCP (Model Context Protocol)';

    public function handle(): int
    {
        $this->info('Iniciando servidor MCP...');

        $server = new StdioServer;
        $server->run();

        return Command::SUCCESS;
    }
}

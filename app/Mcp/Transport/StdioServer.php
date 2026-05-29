<?php

namespace App\Mcp\Transport;

use App\Mcp\McpServer;
use Illuminate\Contracts\Console\Kernel;
use Throwable;

class StdioServer
{
    private McpServer $server;

    public function __construct()
    {
        $app = require base_path('bootstrap/app.php');
        $app->make(Kernel::class)->bootstrap();

        $this->server = new McpServer;

        $envToken = getenv('MCP_TOKEN') ?: ($_ENV['MCP_TOKEN'] ?? null);
        if ($envToken) {
            $this->server->setTokenFromEnv($envToken);
        }
    }

    public function run(): void
    {
        $input = fopen('php://stdin', 'r');

        while (! feof($input)) {
            $line = fgets($input);
            if ($line === false || trim($line) === '') {
                continue;
            }

            $request = json_decode($line, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $response = ['error' => ['code' => -32700, 'message' => 'Parse error']];
                echo json_encode($response)."\n";
                flush();

                continue;
            }

            try {
                $response = $this->server->handleRequest($request);
                echo json_encode($response)."\n";
            } catch (Throwable $e) {
                $response = [
                    'error' => [
                        'code' => -32000,
                        'message' => 'Server error: '.$e->getMessage(),
                    ],
                    'id' => $request['id'] ?? null,
                ];
                echo json_encode($response)."\n";
            }
            flush();
        }
    }
}

<?php

namespace App\Observers;

use App\Models\Client;
use App\Services\ConnectionPointService;
use Illuminate\Support\Facades\Log;

class ClientObserver
{
    public function created(Client $client): void
    {
        Log::info('ClientObserver created triggered', ['client_id' => $client->id, 'nic' => $client->nic]);

        if (! empty($client->nic)) {
            Log::info('ClientObserver: Calling syncForClient');
            $connectionPointService = app(ConnectionPointService::class);
            $connectionPointService->syncForClient($client);
        } else {
            Log::info('ClientObserver: NIC is empty, skipping sync');
        }
    }

    public function updated(Client $client): void
    {
        if ($client->isDirty('nic')) {
            $connectionPointService = app(ConnectionPointService::class);
            $connectionPointService->syncForClient($client);
        }
    }
}

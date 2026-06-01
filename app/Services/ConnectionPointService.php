<?php

namespace App\Services;

use App\Models\Client;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ConnectionPointService
{
    private const PROXY_URL = 'http://localhost:8002/puntos-conexion';

    public function syncForClient(Client $client): void
    {
        $nic = $client->nic;

        if (empty($nic)) {
            $client->connectionPoint()?->delete();

            return;
        }

        $data = $this->search($nic);

        if ($data !== null) {
            $client->connectionPoint()->updateOrCreate(
                ['client_id' => $client->id],
                $data
            );
        } else {
            $client->connectionPoint()?->delete();
        }
    }

    public function search(string $nic): ?array
    {
        $result = $this->query($nic, 'aire');

        if ($result !== null) {
            return $result;
        }

        $result = $this->query($nic, 'afinia');

        if ($result !== null) {
            return $result;
        }

        return null;
    }

    private function query(string $nic, string $empresa): ?array
    {
        try {
            $response = Http::timeout(35)->post(self::PROXY_URL, [
                'P_CODIGO' => $nic,
                'empresa' => $empresa,
            ]);

            if (! $response->successful()) {
                Log::warning("Proxy error ({$empresa}): ".$response->status());

                return null;
            }

            $data = $response->json();

            if (! isset($data['d']) || ! is_array($data['d']) || count($data['d']) === 0) {
                return null;
            }

            $amarados = array_filter($data['d'], fn ($p) => ($p['AMARADO'] ?? '0') === '1');

            if (empty($amarados)) {
                return null;
            }

            $punto = array_values($amarados)[0];

            return [
                'operador' => $empresa,
                'codigo' => $punto['codigo'] ?? null,
                'matricula' => $punto['matricula'] ?? null,
                'localizacion' => $punto['localizacion'] ?? null,
                'potencia_nominal' => $punto['potencia_nominal'] ?? null,
                'tens_pri' => $punto['tens_pri'] ?? null,
                'tens_sec' => $punto['tens_sec'] ?? null,
                'propiedad' => $punto['nom_propiedad'] ?? $punto['propiedad'] ?? null,
                'capacidad_disp' => $punto['CapacidadDisp'] ?? null,
                'latitud' => $punto['latitud'] ?? null,
                'longitud' => $punto['longitud'] ?? null,
                'datos_json' => $data['d'],
            ];
        } catch (\Exception $e) {
            Log::warning("ConnectionPointService ({$empresa}) error: ".$e->getMessage());

            return null;
        }
    }
}

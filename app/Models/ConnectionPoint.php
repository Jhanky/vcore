<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConnectionPoint extends Model
{
    protected $fillable = [
        'client_id',
        'operador',
        'codigo',
        'matricula',
        'localizacion',
        'potencia_nominal',
        'tens_pri',
        'tens_sec',
        'propiedad',
        'capacidad_disp',
        'latitud',
        'longitud',
        'datos_json',
    ];

    protected $casts = [
        'codigo' => 'integer',
        'potencia_nominal' => 'decimal:2',
        'tens_pri' => 'decimal:2',
        'capacidad_disp' => 'decimal:2',
        'latitud' => 'decimal:7',
        'longitud' => 'decimal:7',
        'datos_json' => 'array',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}

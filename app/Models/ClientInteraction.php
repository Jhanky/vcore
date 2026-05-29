<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientInteraction extends Model
{
    protected $fillable = [
        'client_id',
        'type',
        'notes',
        'interaction_date',
    ];

    protected $casts = [
        'interaction_date' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}

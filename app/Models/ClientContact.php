<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientContact extends Model
{
    protected $fillable = [
        'client_id',
        'name',
        'position',
        'email',
        'phone',
        'is_primary',
        'is_decision_maker',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_decision_maker' => 'boolean',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Client extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'nic',
        'address',
        'latitude',
        'longitude',
        'city',
        'state',
        'energy_consumption_kwh',
        'monthly_bill_amount',
        'energy_tariff',
        'available_area_m2',
        'user_id',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function contacts()
    {
        return $this->hasMany(ClientContact::class);
    }

    public function interactions()
    {
        return $this->hasMany(ClientInteraction::class);
    }

    public function clientTypes(): BelongsToMany
    {
        return $this->belongsToMany(ClientType::class, 'client_type_client');
    }

    public function connectionPoint(): HasOne
    {
        return $this->hasOne(ConnectionPoint::class);
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }
}

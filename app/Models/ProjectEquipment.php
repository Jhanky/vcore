<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectEquipment extends Model
{
    protected $table = 'project_equipment';

    protected $fillable = [
        'project_id',
        'supplier_id',
        'product_type',
        'product_id',
        'quotation_product_id',
        'brand',
        'model',
        'specs',
        'quantity',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'specs' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function serials(): HasMany
    {
        return $this->hasMany(EquipmentSerial::class);
    }
}

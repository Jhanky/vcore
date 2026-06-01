<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentSerial extends Model
{
    protected $fillable = [
        'project_equipment_id',
        'serial_number',
    ];

    public function projectEquipment(): BelongsTo
    {
        return $this->belongsTo(ProjectEquipment::class);
    }
}

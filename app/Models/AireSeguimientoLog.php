<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AireSeguimientoLog extends Model
{
    protected $table = 'aire_seguimiento_logs';

    protected $fillable = [
        'seguimiento_id',
        'from_stage',
        'to_stage',
        'action',
        'description',
        'user_id',
    ];

    public function seguimiento(): BelongsTo
    {
        return $this->belongsTo(AireSeguimiento::class, 'seguimiento_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

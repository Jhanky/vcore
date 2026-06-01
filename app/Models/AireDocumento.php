<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AireDocumento extends Model
{
    protected $table = 'aire_documentos';

    protected $fillable = [
        'seguimiento_id',
        'stage',
        'tipo_documento',
        'file_path',
        'original_filename',
        'file_size',
        'mime_type',
        'user_id',
    ];

    public function seguimiento(): BelongsTo
    {
        return $this->belongsTo(AireSeguimiento::class, 'seguimiento_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

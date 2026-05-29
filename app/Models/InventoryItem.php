<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use SoftDeletes;

    protected $appends = ['is_low_stock'];

    protected $fillable = [
        'type',
        'code',
        'name',
        'description',
        'unit',
        'quantity',
        'min_stock',
        'status',
        'last_maintenance',
        'location_type',
        'project_id',
        'warehouse_location',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'min_stock' => 'decimal:2',
            'last_maintenance' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereNotNull('min_stock')
            ->whereColumn('quantity', '<=', 'min_stock');
    }

    public function isLowStock(): bool
    {
        return $this->min_stock !== null && $this->quantity <= $this->min_stock;
    }

    public function getLocationLabelAttribute(): string
    {
        if ($this->location_type === 'project' && $this->project) {
            return "Proyecto: {$this->project->code}";
        }

        return $this->warehouse_location ?? 'Bodega';
    }
}

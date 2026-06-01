<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use SoftDeletes;

    protected $appends = ['is_low_stock', 'total_cost'];

    protected $fillable = [
        'type',
        'code',
        'brand',
        'model',
        'serial_number',
        'maintenance_interval_days',
        'supplier',
        'category',
        'name',
        'description',
        'unit',
        'quantity',
        'min_stock',
        'purchase_cost',
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
            'purchase_cost' => 'decimal:2',
            'maintenance_interval_days' => 'integer',
            'last_maintenance' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
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

    public function getTotalCostAttribute(): ?float
    {
        if ($this->purchase_cost === null) {
            return null;
        }

        return $this->quantity * $this->purchase_cost;
    }

    public function getLocationLabelAttribute(): string
    {
        if ($this->location_type === 'project' && $this->project) {
            return "Proyecto: {$this->project->code}";
        }

        return $this->warehouse_location ?? 'Bodega';
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quotation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'user_id',
        'code',
        'project_name',
        'status',
        'system_type',
        'network_type',
        'power_kwp',
        'panel_count',
        'requires_financing',
        'profit_percentage',
        'iva_profit_percentage',
        'commercial_management_percentage',
        'administration_percentage',
        'contingency_percentage',
        'withholding_percentage',
        'subtotal',
        'commercial_management',
        'subtotal2',
        'administration',
        'contingency',
        'profit',
        'profit_iva',
        'subtotal3',
        'withholdings',
        'total_value',
        'issue_date',
        'expiration_date',
    ];

    protected $casts = [
        'requires_financing' => 'boolean',
        'power_kwp' => 'float',
        'profit_percentage' => 'float',
        'iva_profit_percentage' => 'float',
        'commercial_management_percentage' => 'float',
        'administration_percentage' => 'float',
        'contingency_percentage' => 'float',
        'withholding_percentage' => 'float',
        'subtotal' => 'float',
        'commercial_management' => 'float',
        'subtotal2' => 'float',
        'administration' => 'float',
        'contingency' => 'float',
        'profit' => 'float',
        'profit_iva' => 'float',
        'subtotal3' => 'float',
        'withholdings' => 'float',
        'total_value' => 'float',
        'issue_date' => 'date',
        'expiration_date' => 'date',
    ];

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function products()
    {
        return $this->hasMany(QuotationProduct::class);
    }

    public function items()
    {
        return $this->hasMany(QuotationItem::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(QuotationStatusHistory::class)->orderBy('created_at', 'asc');
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    /** Returns the statuses this quotation can transition to right now. */
    public function allowedNextStatuses(): array
    {
        return QuotationStatusHistory::allowedFrom($this->status);
    }

    /** True when no further status changes are permitted. */
    public function isStatusLocked(): bool
    {
        return QuotationStatusHistory::isLocked($this->status);
    }

    // -------------------------------------------------------
    // Scopes
    // -------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['Rechazada', 'Vencida']);
    }
}

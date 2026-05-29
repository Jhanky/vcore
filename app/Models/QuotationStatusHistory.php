<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuotationStatusHistory extends Model
{
    protected $fillable = [
        'quotation_id',
        'user_id',
        'from_status',
        'to_status',
        'notes',
    ];

    // -------------------------------------------------------
    // Transition rules
    // Key   = current status
    // Value = array of statuses this can transition TO
    // Empty array = terminal / locked state
    // -------------------------------------------------------
    public const TRANSITIONS = [
        'Borrador' => ['Enviada', 'Vencida'],
        'Enviada' => ['Borrador', 'Aprobada', 'Rechazada', 'Vencida'],
        'Aprobada' => [],                  // Terminal — no changes allowed
        'Rechazada' => ['Borrador'],        // Can only be re-opened
        'Vencida' => ['Borrador'],        // Can only be re-opened
    ];

    /**
     * Returns the statuses reachable from $currentStatus.
     */
    public static function allowedFrom(string $currentStatus): array
    {
        return self::TRANSITIONS[$currentStatus] ?? [];
    }

    /**
     * Checks if the transition from → to is valid.
     */
    public static function canTransition(string $from, string $to): bool
    {
        return in_array($to, self::allowedFrom($from), true);
    }

    /**
     * True when a status is locked (no further transitions allowed).
     */
    public static function isLocked(string $status): bool
    {
        return empty(self::TRANSITIONS[$status] ?? []);
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

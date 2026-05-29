<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MilestoneType extends Model
{
    protected $fillable = [
        'name',
        'code',
        'icon',
        'color',
        'description',
    ];

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class);
    }
}

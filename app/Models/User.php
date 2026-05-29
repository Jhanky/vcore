<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $fillable = ['name', 'email', 'username', 'password', 'is_active', 'profile_photo_path', 'mcp_token', 'mcp_token_created_at'];

    protected $hidden = ['password', 'remember_token', 'mcp_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'mcp_token_created_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function createdClients(): HasMany
    {
        return $this->hasMany(Client::class, 'user_id');
    }

    public function createdQuotations(): HasMany
    {
        return $this->hasMany(Quotation::class, 'user_id');
    }

    public function createdProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'user_id');
    }

    public function isAdminOrGerente(): bool
    {
        return $this->hasRole(['admin', 'gerente']);
    }

    public function isTecnico(): bool
    {
        return $this->hasRole('tecnico') && ! $this->isAdminOrGerente();
    }

    public function isComercial(): bool
    {
        return $this->hasRole('comercial') && ! $this->isAdminOrGerente();
    }

    public function assignedMaintenances(): BelongsToMany
    {
        return $this->belongsToMany(Maintenance::class, 'maintenance_user');
    }

    public function assignedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'assigned_to');
    }
}

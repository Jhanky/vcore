<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('quotation_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('current_state_id')->default(1)->constrained('project_states')->onDelete('restrict');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('installation_address')->nullable();
            $table->string('coordinates')->nullable();
            $table->date('start_date')->nullable();
            $table->date('estimated_end_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->decimal('contracted_value_cop', 15, 2)->nullable();
            $table->decimal('total_cost_cop', 15, 2)->nullable();
            $table->foreignId('project_manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('technical_leader_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('priority', ['baja', 'media', 'alta'])->default('media');
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('code');
            $table->index('client_id');
            $table->index('current_state_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};

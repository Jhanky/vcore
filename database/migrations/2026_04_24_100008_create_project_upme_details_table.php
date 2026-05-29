<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_upme_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('upme_registration_number')->nullable();
            $table->date('registration_date')->nullable();
            $table->decimal('generation_capacity_kw', 10, 3)->nullable();
            $table->string('system_type')->nullable();
            $table->string('connection_type')->nullable();
            $table->date('grid_integration_date')->nullable();
            $table->enum('status', ['pending', 'in_review', 'approved', 'rejected'])->default('pending');
            $table->json('documentation')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_upme_details');
    }
};

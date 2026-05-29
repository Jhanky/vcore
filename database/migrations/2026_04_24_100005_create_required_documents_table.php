<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('required_documents', function (Blueprint $table) {
            $table->id();
            $table->enum('flow_type', ['OPERATOR', 'UPME'])->default('OPERATOR');
            $table->string('state');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_required')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index('state');
            $table->index('flow_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('required_documents');
    }
};

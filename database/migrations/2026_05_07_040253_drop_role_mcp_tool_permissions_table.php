<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('role_mcp_tool_permissions');
    }

    public function down(): void
    {
        Schema::create('role_mcp_tool_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->string('tool_name');
            $table->timestamps();

            $table->unique(['role_id', 'tool_name']);
        });
    }
};

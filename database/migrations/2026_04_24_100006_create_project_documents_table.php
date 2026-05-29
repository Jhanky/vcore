<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('required_document_id')->nullable()->constrained('required_documents')->onDelete('set null');
            $table->string('name');
            $table->string('original_filename');
            $table->string('file_path');
            $table->bigInteger('file_size')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->foreignId('uploader_id')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('version')->default(1);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('project_id');
            $table->index('required_document_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_documents');
    }
};

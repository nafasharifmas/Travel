<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('itineraries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title', 255);
            $table->date('start_date')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_public')->default(false);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('itinerary_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('itinerary_id')->constrained('itineraries')->onDelete('cascade');
            $table->foreignId('place_id')->constrained('places')->onDelete('restrict');
            $table->integer('day_no')->default(1);
            $table->integer('sequence_order')->default(0);
            $table->time('visit_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['itinerary_id', 'day_no', 'sequence_order']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action', 100);
            $table->string('subject_type', 100)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('payload')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['created_at']);
            $table->index(['actor_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('itinerary_items');
        Schema::dropIfExists('itineraries');
    }
};


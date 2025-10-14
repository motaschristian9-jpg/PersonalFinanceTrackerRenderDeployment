<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('savings_contributions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('goal_id'); // reference custom PK
            $table->decimal('amount', 10, 2);
            $table->date('date')->default(now());
            $table->timestamps();

            $table->foreign('goal_id')
                ->references('goal_id') // match SavingsGoal PK
                ->on('savings_goals')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('savings_contributions');
    }
};

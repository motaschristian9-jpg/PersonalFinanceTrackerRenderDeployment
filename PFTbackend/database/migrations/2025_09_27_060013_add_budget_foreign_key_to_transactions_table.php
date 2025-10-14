<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
      //  Schema::table('transactions', function (Blueprint $table) {
       //     // Add foreign key if it doesn't exist yet
       //     $table->foreign('budget_id')
     //           ->references('budget_id')
      //          ->on('budgets')
      //          ->onDelete('cascade');
      //  });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['budget_id']);
        });
    }
};

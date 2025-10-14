<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\JWTMiddleware;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\DashboardController;

// -------------------------
// Public Routes
// -------------------------
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('reset-password', [ResetPasswordController::class, 'reset']);
Route::post('auth/google', [GoogleAuthController::class, 'loginWithGoogle']);
Route::post('auth/google/login', [GoogleAuthController::class, 'loginExistingGoogleUser']);

// -------------------------
// Protected Routes (JWT Middleware)
// -------------------------
Route::middleware([JWTMiddleware::class])->group(function () {
    // User
    Route::get('profile', [AuthController::class, 'profile']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::post('user/change-password', [ResetPasswordController::class, 'changePassword']);
    Route::put('user/{id}', [AuthController::class, 'updateProfile']);

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        // Transactions
        Route::get('transactions', [DashboardController::class, 'transactions']);
        Route::post('transactions', [DashboardController::class, 'storeTransaction']);
        Route::put('transactions/{id}', [DashboardController::class, 'updateTransaction']);
        Route::delete('transactions/{id}', [DashboardController::class, 'deleteTransaction']);

        // Budgets
        Route::get('budgets', [DashboardController::class, 'budgets']);
        Route::post('budgets', [DashboardController::class, 'storeBudget']);
        Route::put('budgets/{id}', [DashboardController::class, 'updateBudget']);
        Route::delete('budgets/{id}', [DashboardController::class, 'deleteBudget']);
        Route::get('budgets/{id}/transactions', [DashboardController::class, 'budgetTransactions']);
        Route::post('budgets/{id}/add-expense', [DashboardController::class, 'addExpenseToBudget']);

        // Savings Goals
        Route::get('savings-goals', [DashboardController::class, 'goals']);
        Route::post('savings-goals', [DashboardController::class, 'storeGoal']);
        Route::put('savings-goals/{id}', [DashboardController::class, 'updateGoal']);
        Route::delete('savings-goals/{id}', [DashboardController::class, 'deleteGoal']);

        Route::post(
            'goals/{id}/add-contribution',
            [DashboardController::class, 'addContribution']
        );
        Route::delete(
            'contributions/{id}',
            [DashboardController::class, 'deleteContribution']
        );

        // Reports
        Route::get('reports', [DashboardController::class, 'reports']);
        
        Route::put('user/currency', [DashboardController::class, 'updateCurrency']);
    });
});

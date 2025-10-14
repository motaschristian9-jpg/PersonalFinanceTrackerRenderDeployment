<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\SavingsGoal;
use App\Models\SavingsContribution;

class DashboardController extends Controller
{
    // -------------------
    // Transactions
    // -------------------

    public function transactions(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->latest()
            ->take(10)
            ->get();

        return response()->json($transactions);
    }

    public function storeTransaction(Request $request)
    {
        $request->validate([
            'type' => 'required|in:Income,Expense',
            'category' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string|max:500',
        ]);

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'category' => $request->category,
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date,
            'description' => $request->description ?? '',
        ]);

        return response()->json([
            'message' => 'Transaction added successfully',
            'transaction' => $transaction,
        ]);
    }

    public function updateTransaction(Request $request, $id)
    {
        $transaction = Transaction::where('transaction_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $transaction->update([
            'type' => $request->type,
            'category' => $request->category,
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date,
            'description' => $request->description ?? '',
        ]);

        return response()->json([
            'message' => 'Transaction updated successfully',
            'transaction' => $transaction,
        ]);
    }

    public function deleteTransaction($id)
    {
        $transaction = Transaction::where('transaction_id', $id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted successfully']);
    }

    // -------------------
    // Budgets
    // -------------------

    public function budgets(Request $request)
    {
        $budgets = Budget::where('user_id', $request->user()->id)->get();
        return response()->json($budgets);
    }

    public function storeBudget(Request $request)
    {
        $request->validate([
            'category' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string|max:1000',
        ]);

        $budget = Budget::create([
            'user_id' => $request->user()->id,
            'category' => $request->category,
            'amount' => $request->amount,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'description' => $request->description ?? null,
        ]);

        return response()->json([
            'message' => 'Budget added successfully',
            'budget' => $budget,
        ]);
    }

    public function updateBudget(Request $request, $id)
    {
        $budget = Budget::where('budget_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$budget) {
            return response()->json(['message' => 'Budget not found'], 404);
        }

        $request->validate([
            'amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string|max:255',
        ]);

        $budget->update([
            'amount' => $request->amount,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'description' => $request->description ?? null,
        ]);

        return response()->json([
            'message' => 'Budget updated successfully',
            'budget' => $budget,
        ]);
    }

    public function deleteBudget($id)
    {
        $budget = Budget::where('budget_id', $id)->where('user_id', auth()->id())->first();
        if (!$budget) {
            return response()->json(['message' => 'Budget not found'], 404);
        }
        $budget->delete();
        return response()->json(['message' => 'Budget deleted successfully']);
    }

    public function budgetTransactions(Request $request, $budgetId)
    {
        $budget = Budget::where('budget_id', $budgetId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$budget) {
            return response()->json(['message' => 'Budget not found'], 404);
        }

        $transactions = Transaction::where('user_id', $request->user()->id)
            ->where('category', $budget->category)
            ->orderBy('transaction_date', 'desc')
            ->get();

        return response()->json([
            'budget' => $budget,
            'transactions' => $transactions,
        ]);
    }

    public function addExpenseToBudget(Request $request, $budgetId)
    {
        \Log::info('Add expense called', [
            'budgetId' => $budgetId,
            'userId' => optional($request->user())->id,
            'requestData' => $request->all(),
        ]);

        $budget = Budget::where('budget_id', $budgetId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$budget) {
            \Log::warning('Budget not found', [
                'budgetId' => $budgetId,
                'userId' => optional($request->user())->id
            ]);
            return response()->json(['message' => 'Budget not found'], 404);
        }

        $request->validate([
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'nullable|date',
            'description' => 'nullable|string|max:500',
        ]);

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'budget_id' => $budget->budget_id,
            'type' => 'Expense',
            'category' => $budget->category,
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date ?? now(),
            'description' => $request->description ?? '',
        ]);

        return response()->json([
            'message' => 'Expense added to budget successfully',
            'transaction' => $transaction,
        ]);
    }

    // -------------------
    // Savings Goals
    // -------------------

    public function goals(Request $request)
    {
        $goals = SavingsGoal::with('contributions') // now Laravel knows this relationship
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($goals);
    }

    public function addContribution(Request $request, $goal_id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'date' => 'nullable|date',
        ]);

        // ✅ Ensure goal exists and belongs to user
        $goal = SavingsGoal::where('goal_id', $goal_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // ✅ Create the contribution
        $contribution = SavingsContribution::create([
            'goal_id' => $goal->goal_id,
            'amount' => $request->amount,
            'date' => $request->date ?? now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Contribution added successfully!',
            'contribution' => $contribution,
        ], 201);
    }

    public function deleteContribution($id)
    {
        $contribution = SavingsContribution::find($id);

        if (!$contribution) {
            return response()->json(['message' => 'Contribution not found'], 404);
        }

        // ✅ Ensure the goal belongs to the authenticated user
        $goal = $contribution->goal;
        if (!$goal || $goal->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $contribution->delete();

        return response()->json(['message' => 'Contribution deleted successfully']);
    }

    public function storeGoal(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'deadline' => 'nullable|date',
            'description' => 'nullable|string|max:255',
        ]);

        $goal = SavingsGoal::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'target_amount' => $request->target_amount,
            'deadline' => $request->deadline,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Savings goal added successfully',
            'goal' => $goal,
        ]);
    }

    public function updateGoal(Request $request, $id)
    {
        // Validate request
        $request->validate([
            'title' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'deadline' => 'nullable|date',
            'description' => 'nullable|string|max:255',
        ]);

        // Find the goal belonging to the logged-in user
        $goal = SavingsGoal::where('goal_id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Update goal
        $goal->update([
            'title' => $request->title,
            'target_amount' => $request->target_amount,
            'deadline' => $request->deadline,
            'description' => $request->description ?? null,
        ]);

        return response()->json([
            'message' => 'Savings goal updated successfully',
            'goal' => $goal,
        ]);
    }

    public function deleteGoal($id)
    {
        $goal = SavingsGoal::where('goal_id', $id)
            ->where('user_id', auth()->id()) // ensure the user owns this goal
            ->first();

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        // Optionally, delete related contributions first
        $goal->contributions()->delete();

        $goal->delete();

        return response()->json(['message' => 'Goal deleted successfully']);
    }


    // -------------------
    // Reports
    // -------------------

    public function reports(Request $request)
    {
        $userId = $request->user()->id;

        // Transactions
        $totalIncome = Transaction::where('user_id', $userId)
            ->where('type', 'Income')
            ->sum('amount');

        $totalExpenses = Transaction::where('user_id', $userId)
            ->where('type', 'Expense')
            ->sum('amount');

        $balance = $totalIncome - $totalExpenses;

        // Savings
        $totalTarget = SavingsGoal::where('user_id', $userId)->sum('target_amount');

        // ✅ Sum all contributions across all goals for this user
        $totalSaved = SavingsContribution::whereHas('goal', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->sum('amount');

        // Progress (% of savings achieved)
        $savingsProgress = $totalTarget > 0
            ? round(($totalSaved / $totalTarget) * 100)
            : 0;

        return response()->json([
            'totalIncome' => $totalIncome,
            'totalExpenses' => $totalExpenses,
            'balance' => $balance,
            'totalSaved' => $totalSaved,
            'totalTarget' => $totalTarget,
            'savingsProgress' => $savingsProgress,
        ]);
    }

    public function updateCurrency(Request $request)
    {
        $request->validate([
            'currency_symbol' => 'required|string|max:10',
        ]);

        $user = $request->user();
        $user->currency_symbol = $request->currency_symbol;
        $user->save();

        return response()->json([
            'message' => 'Currency updated successfully.',
            'currency_symbol' => $user->currency_symbol,
        ]);
    }

}

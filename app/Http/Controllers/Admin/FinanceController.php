<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CreditTransaction;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index()
    {
        $totalCashRevenue = Order::where('status', 'fulfilled')->sum('amount');
        $totalCreditsInCirculation = User::sum('credits');
        
        $recentTransactions = CreditTransaction::with('user')
            ->latest()
            ->paginate(20);

        $revenueStats = [
            'total_cash' => $totalCashRevenue,
            'total_credits' => $totalCreditsInCirculation,
            'active_subscriptions' => Order::where('status', 'fulfilled')->count(),
        ];

        return Inertia::render('Admin/Finance/Index', [
            'stats' => $revenueStats,
            'transactions' => $recentTransactions,
        ]);
    }

    public function grantCredits(Request $request, User $user)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'description' => 'required|string|max:255',
        ]);

        $user->increment('credits', $request->amount);

        $user->creditTransactions()->create([
            'amount' => $request->amount,
            'type' => 'deposit',
            'description' => 'Admin Grant: ' . $request->description,
            'balance_after' => $user->credits,
            'reference_id' => 'admin_' . auth()->id(),
        ]);

        return back()->with('success', "Granted ₱{$request->amount} credits to {$user->name}.");
    }
}

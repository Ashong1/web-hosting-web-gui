<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->hasAdminRole() 
            ? Order::with('user') 
            : $request->user()->orders();

        $adminSettings = \App\Models\ResellerSetting::whereHas('user', function ($query) {
            $query->where('role', 'admin');
        })->first();

        return Inertia::render('Billing/Index', [
            'orders' => $query->latest()->paginate(10),
            'transactions' => $request->user()->creditTransactions()->latest()->take(10)->get(),
            'adminSettings' => $adminSettings
        ]);
    }

    public function downloadInvoice(Order $order)
    {
        if (!auth()->user()->hasAdminRole() && $order->user_id !== auth()->id()) {
            abort(403);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.receipt', compact('order'));
        return $pdf->download("invoice-aserotech-{$order->id}.pdf");
    }
}

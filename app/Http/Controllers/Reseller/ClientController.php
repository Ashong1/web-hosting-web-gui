<?php

namespace App\Http\Controllers\Reseller;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $reseller = $request->user();
        $clients = $reseller->subClients()
            ->withCount('instances')
            ->latest()
            ->paginate(15);

        return Inertia::render('Reseller/Clients', [
            'clients' => $clients
        ]);
    }
}

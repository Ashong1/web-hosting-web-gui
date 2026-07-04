<?php

namespace App\Http\Controllers;

use App\Models\Instance;
use App\Models\Order;
use App\Models\Plan;
use App\Services\DokployService;
use App\Jobs\DeployAppJob;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class DeploymentController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('Deployments/Create', [
            'plans' => Plan::where('is_active', true)->orderBy('price', 'asc')->get(),
            'templates' => config('templates'),
        ]);
    }

    public function store(Request $request, \App\Actions\ProvisionInstanceAction $provisionAction)
    {
        $request->validate([
            'plan_id' => 'required|string',
            'project_type' => 'required|in:application,compose',
            'build_strategy' => 'required|in:nixpacks,dockerfile',
            'app_name' => 'required|string|alpha_dash|max:255',
            'subdomain' => 'required|string|alpha_dash|max:255|unique:instances,name',
            'repository_url' => 'required_if:project_type,application|nullable|url',
            'repository_branch' => 'nullable|string|max:50',
            'install_command' => 'nullable|string|max:255',
            'build_command' => 'nullable|string|max:255',
            'compose_file' => 'required_if:project_type,compose|nullable|string',
            'env_vars' => 'nullable|array',
            'volumes' => 'nullable|array',
            'volumes.*.name' => 'required_with:volumes|string|max:50',
            'volumes.*.path' => 'required_with:volumes|string|max:255',
            'cpu' => 'required_if:plan_id,custom|nullable|numeric|min:0.5|max:8',
            'memory' => 'required_if:plan_id,custom|nullable|integer|min:512|max:16384',
            'storage' => 'required_if:plan_id,custom|nullable|integer|min:10|max:200',
            'replicas' => 'nullable|integer|min:1|max:5',
            'container_port' => 'nullable|integer|min:1|max:65535',
        ]);

        if ($request->plan_id === 'custom') {
            $cpu = (float) $request->cpu;
            $memory = (int) $request->memory;
            $storage = (int) $request->storage;
            $replicas = (int) ($request->replicas ?? 1);

            $rates = config('services.pricing.rates');
            $unitPrice = ($cpu * $rates['cpu']) + (($memory / 1024.0) * $rates['ram']) + ($storage * $rates['storage']);
            $totalPrice = $unitPrice * $replicas;

            $plan = new Plan();
            $plan->id = null;
            $plan->name = "Custom Flex Node ({$cpu} Core, " . ($memory >= 1024 ? ($memory/1024)."GB" : $memory."MB") . " RAM, {$storage}GB SSD)";
            $plan->price = $totalPrice;
            $plan->image = $request->project_type === 'compose' ? null : 'wordpress:latest';
            $plan->resource_limits = [
                'cpu' => $cpu,
                'memory' => $memory,
                'storage' => $storage,
                'replicas' => $replicas,
            ];
        } else {
            $plan = Plan::findOrFail($request->plan_id);
        }

        $user = $request->user();

        // Check Credits
        if ($user->credits < $plan->price) {
            return back()->with('error', 'Insufficient credits for deployment.');
        }

        $provisionAction->execute($user, $plan, $request->all());

        return redirect()->route('dashboard')->with('success', 'Orchestration pipeline engaged. Your node is being synthesized.');
    }
}

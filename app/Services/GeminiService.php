<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected ?string $apiKey;
    protected ?string $openrouterKey;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY') ?: env('GOOGLE_API_KEY') ?: config('services.gemini.key');
        $this->openrouterKey = env('OPENROUTER_API_KEY');
    }

    public function generateResponse(string $prompt, ?string $ignoredModel = null): string
    {
        // Failover Chain:
        // 1. Try OpenRouter (Gemini 2.5 Flash)
        // 2. Try OpenRouter (Llama 3 8B)
        // 3. Try OpenRouter (Qwen 2 7B)
        // 4. Try native Google Gemini API
        // 5. Fallback to Local Heuristics

        if ($this->openrouterKey) {
            $openRouterModels = [
                'openrouter/free',
                'meta-llama/llama-3.2-3b-instruct:free',
                'meta-llama/llama-3.3-70b-instruct:free',
                'qwen/qwen3-coder:free',
                'nousresearch/hermes-3-llama-3.1-405b:free'
            ];

            foreach ($openRouterModels as $model) {
                try {
                    $response = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $this->openrouterKey,
                        'Content-Type' => 'application/json',
                    ])->timeout(35)->post('https://openrouter.ai/api/v1/chat/completions', [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt]
                        ]
                    ]);

                    if ($response->successful() && !empty($response->json('choices.0.message.content'))) {
                        return $response->json('choices.0.message.content');
                    }

                    Log::warning("OpenRouter model {$model} failed or returned empty. Trying next in chain...");
                } catch (\Exception $e) {
                    Log::error("OpenRouter model {$model} exception: " . $e->getMessage());
                }
            }
        }

        // Native Gemini Failover
        if ($this->apiKey) {
            try {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json'
                ])->timeout(35)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$this->apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ]
                ]);

                if ($response->successful() && !empty($response->json('candidates.0.content.parts.0.text'))) {
                    return $response->json('candidates.0.content.parts.0.text');
                }
                
                Log::warning("Native Gemini API failed. Falling back to heuristics...");
            } catch (\Exception $e) {
                Log::error("Native Gemini API exception: " . $e->getMessage());
            }
        }

        // Final Heuristics Fallback
        if (stripos($prompt, 'USER QUESTION:') !== false) {
            return "### 🤖 AseroTech AI Fallback Assistant\n\nAll AI API models are currently unresponsive. Please check your container **Logs** or **Console** tab to troubleshoot your environment directly.";
        }

        return $this->getHeuristicDiagnostics($prompt);
    }

    protected function getHeuristicDiagnostics(string $logText): string
    {
        $diagnostics = "### 🔍 AseroTech Heuristic Diagnostic Report\n\n";
        $detected = false;

        if (stripos($logText, 'npm ERR!') !== false || stripos($logText, 'yarn error') !== false) {
            $diagnostics .= "#### 📦 Node Package Manager (NPM) Error\n";
            $diagnostics .= "- **Problema:** Nabigo ang pag-install ng mga Node.js dependencies o may syntax/version issue sa `package.json`.\n";
            $diagnostics .= "- **Solusyon:** \n";
            $diagnostics .= "  1. Siguraduhing tugma ang version ng iyong dependencies sa node version.\n";
            $diagnostics .= "  2. I-verify ang `install_command` o subukang patakbuhin ang `npm audit fix` locally.\n";
            $diagnostics .= "  3. Tiyaking walang syntax error sa iyong `package.json` file.\n";
            $detected = true;
        }

        if (stripos($logText, 'composer install') !== false && (stripos($logText, 'failed') !== false || stripos($logText, 'error') !== false)) {
            $diagnostics .= "#### 🐘 PHP Composer Error\n";
            $diagnostics .= "- **Problema:** Nabigo ang PHP Composer dependency resolution. Kadalasan ito ay sanhi ng hindi katugmang bersyon ng extension o PHP package.\n";
            $diagnostics .= "- **Solusyon:** \n";
            $diagnostics .= "  1. Tiyaking ang `composer.lock` ay updated.\n";
            $diagnostics .= "  2. I-verify kung kailangan mo ng karagdagang PHP extensions (tulad ng `ext-gd` o `ext-zip`) sa iyong container environment.\n";
            $diagnostics .= "  3. Gamitin ang `--ignore-platform-reqs` flag kung kinakailangan.\n";
            $detected = true;
        }

        if (stripos($logText, 'port already in use') !== false || stripos($logText, 'address already in use') !== false || stripos($logText, 'EADDRINUSE') !== false) {
            $diagnostics .= "#### 🔌 Port Binding Conflict\n";
            $diagnostics .= "- **Problema:** Ang tinukoy na container port ay kasalukuyang ginagamit ng ibang running application sa cluster.\n";
            $diagnostics .= "- **Solusyon:** \n";
            $diagnostics .= "  1. Baguhin ang `container_port` sa iyong configuration panel papunta sa bakanteng port.\n";
            $diagnostics .= "  2. I-stop o i-restart ang naunang container na gumagamit ng port na ito.\n";
            $detected = true;
        }

        if (stripos($logText, 'Permission denied') !== false || stripos($logText, 'EACCES') !== false) {
            $diagnostics .= "#### 🔑 File Permission Error\n";
            $diagnostics .= "- **Problema:** Ang application ay sumusubok magsulat o magbasa sa isang directory na walang sapat na pribilehiyo ang service user.\n";
            $diagnostics .= "- **Solusyon:** \n";
            $diagnostics .= "  1. I-verify ang volume mount permissions.\n";
            $diagnostics .= "  2. Kung gumagamit ng custom Dockerfile, siguraduhing tinukoy mo ang tamang `USER` at nagbigay ng chmod/chown access sa app directories.\n";
            $detected = true;
        }

        if (stripos($logText, 'Syntax error') !== false || stripos($logText, 'Parse error') !== false) {
            $diagnostics .= "#### ✍️ Syntax Error Detected\n";
            $diagnostics .= "- **Problema:** May code syntax error sa iyong repository file na humahadlang sa tagumpay ng compilation.\n";
            $diagnostics .= "- **Solusyon:** \n";
            $diagnostics .= "  1. Suriin ang binanggit na line number sa logs.\n";
            $diagnostics .= "  2. Ayusin ang error at i-commit/push muli ang iyong code sa GitHub para sa panibagong deployment.\n";
            $detected = true;
        }

        if (!$detected) {
            $diagnostics .= "#### ❔ Hindi Matukoy na Error\n";
            $diagnostics .= "- **Problema:** Walang tiyak na signature na tumugma sa mga heuristic check.\n";
            $diagnostics .= "- **Solusyon:** \n";
            $diagnostics .= "  1. Suriin nang mabuti ang runtime logs para sa abnormal termination o warnings.\n";
            $diagnostics .= "  2. I-verify na tama ang base image at environment variables ng iyong container.\n";
        }

        return $diagnostics;
    }
}

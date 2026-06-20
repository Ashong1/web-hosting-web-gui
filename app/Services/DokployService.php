<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DokployService
{
    protected $apiUrl;
    protected $apiKey;

    public function __construct(?\App\Models\Node $node = null)
    {
        if ($node) {
            $this->apiUrl = $node->api_url;
            $this->apiKey = $node->api_key;
        } else {
            $this->apiUrl = config('services.dokploy.url');
            $this->apiKey = config('services.dokploy.key');
        }
    }

    public function setNode(?\App\Models\Node $node)
    {
        if ($node) {
            $this->apiUrl = $node->api_url;
            $this->apiKey = $node->api_key;
        }
        return $this;
    }

    /**
     * Helper to make authenticated requests to Dokploy
     */
    private function request()
    {
        return Http::withHeaders([
            'x-api-key' => $this->apiKey,
        ])->acceptJson()
          ->timeout(60); // Deployments can take time
    }

    /**
     * Add a domain to an application and enable SSL (Let's Encrypt)
     */
    public function addDomain($applicationId, $host, $port = 80, $https = true)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/domain.create", [
            'applicationId' => $applicationId,
            'host' => $host,
            'port' => (int) $port,
            'path' => '/',
            'https' => $https,
            'certificateType' => 'letsencrypt',
            'domainType' => 'application'
        ]);

        if ($response->failed()) {
            Log::error("Dokploy Domain Creation Failed for app {$applicationId}: " . $response->body());
            return false;
        }

        return $response->json();
    }

    /**
     * Create a mount (volume or bind) for an application
     */
    public function createMount($applicationId, $volumeName, $mountPath, $type = 'volume')
    {
        $response = $this->request()->post("{$this->apiUrl}/api/mounts.create", [
            'serviceId' => $applicationId,
            'serviceType' => 'application',
            'type' => $type,
            'volumeName' => $volumeName,
            'mountPath' => $mountPath,
        ]);

        if ($response->failed()) {
            Log::error("Dokploy Mount Creation Failed for app {$applicationId}: " . $response->body());
            return false;
        }

        return $response->json();
    }

    /**
     * Create a new project in Dokploy
     */
    public function createProject($name)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/project.create", [
            'name' => $name,
            'description' => 'Created via Asero Cloud'
        ]);

        if ($response->failed()) {
            Log::error("Dokploy Project Creation Failed: " . $response->body());
            throw new \Exception("Failed to create project on worker node: " . $response->reason());
        }

        return $response->json();
    }

    /**
     * Create a new application (service) within a project
     */
    public function createApplication($projectId, $name, array $config = [])
    {
        $payload = array_merge([
            'projectId' => $projectId,
            'name' => $name,
            'description' => 'AseroCloud Automated Instance',
            'buildStrategy' => $config['buildStrategy'] ?? 'nixpacks', // Default to auto-detect
        ], $config);

        $response = $this->request()->post("{$this->apiUrl}/api/application.create", $payload);

        if ($response->failed()) {
            Log::error("Dokploy Application Creation Failed: " . $response->body());
            return null;
        }

        return $response->json();
    }

    /**
     * Create a new Docker Compose project in Dokploy
     */
    public function createCompose($projectId, $name, $composeContent)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/compose.create", [
            'projectId' => $projectId,
            'name' => $name,
            'composeFile' => $composeContent,
            'description' => 'AseroCloud Managed Stack'
        ]);

        if ($response->failed()) {
            Log::error("Dokploy Compose Creation Failed: " . $response->body());
            return null;
        }

        return $response->json();
    }

    /**
     * Get deployment history for an application
     */
    public function getDeployments($applicationId)
    {
        $response = $this->request()->get("{$this->apiUrl}/api/application.deployments", [
            'applicationId' => $applicationId
        ]);

        return $response->successful() ? $response->json() : [];
    }

    /**
     * Rollback to a specific deployment
     */
    public function rollback($applicationId, $deploymentId)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/application.rollback", [
            'applicationId' => $applicationId,
            'deploymentId' => $deploymentId
        ]);

        return $response->successful();
    }

    /**
     * Get all applications across all projects
     */
    public function getAllApplications()
    {
        $response = $this->request()->get("{$this->apiUrl}/api/application.all");

        if ($response->status() === 404) {
            // Fallback: Try project-based discovery
            $projectsResponse = $this->request()->get("{$this->apiUrl}/api/project.all");
            if ($projectsResponse->successful()) {
                $allApps = [];
                foreach ($projectsResponse->json() as $project) {
                    // Assuming projects contain 'applications' key or we need to fetch them
                    if (isset($project['applications'])) {
                        $allApps = array_merge($allApps, $project['applications']);
                    }
                }
                return $allApps;
            }
        }

        if ($response->failed()) {
            Log::error("Failed to fetch all applications from Dokploy: " . $response->body());
            return [];
        }

        return $response->json();
    }


    /**
     * Get specific application details/status
     */
    public function getApplication($applicationId)
    {
        $response = $this->request()->get("{$this->apiUrl}/api/application.one", [
            'applicationId' => $applicationId
        ]);

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Control instance state (start, stop, restart)
     */
    public function controlInstance($applicationId, $action)
    {
        if (!in_array($action, ['start', 'stop', 'restart'])) {
            return false;
        }

        $response = $this->request()->post("{$this->apiUrl}/api/application.{$action}", [
            'applicationId' => $applicationId
        ]);

        return $response->successful();
    }

    /**
     * Delete an instance
     */
    public function deleteInstance($applicationId)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/application.delete", [
            'applicationId' => $applicationId
        ]);

        return $response->successful();
    }

    /**
     * Get environment variables for an application from Dokploy
     */
    public function getEnvVars($applicationId)
    {
        $response = $this->request()->get("{$this->apiUrl}/api/application.env", [
            'applicationId' => $applicationId
        ]);

        if ($response->failed()) {
            Log::error("Failed to fetch env vars from Dokploy for app {$applicationId}: " . $response->body());
            return [];
        }

        return $response->json()['envVars'] ?? [];
    }

    /**
     * Update environment variables for an application in Dokploy
     */
    public function updateEnvVars($applicationId, array $envVars)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/application.env.update", [
            'applicationId' => $applicationId,
            'envVars' => $envVars
        ]);

        if ($response->failed()) {
            Log::error("Failed to update env vars in Dokploy for app {$applicationId}: " . $response->body());
            return false;
        }

        // Dokploy usually requires a redeploy for env changes to take effect
        $this->deploy($applicationId);

        return true;
    }

    /**
     * Update resource limits (CPU/RAM/Replicas) without full redeploy
     */
    public function updateResources($applicationId, $cpu, $memory, $replicas = 1)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/application.resources.update", [
            'applicationId' => $applicationId,
            'cpu' => $cpu,
            'memory' => $memory,
            'replicas' => (int) $replicas
        ]);

        if ($response->failed()) {
            Log::error("Failed to update resources for app {$applicationId}: " . $response->body());
        }

        return $response->successful();
    }

    /**
     * Create a backup for an application
     */
    public function createBackup($applicationId, $name)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/application.backup.create", [
            'applicationId' => $applicationId,
            'name' => $name
        ]);

        if ($response->failed()) {
            Log::error("Failed to create backup for app {$applicationId}: " . $response->body());
        }

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Restore an application from a backup
     */
    public function restoreBackup($applicationId, $backupId)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/application.backup.restore", [
            'applicationId' => $applicationId,
            'backupId' => $backupId
        ]);

        if ($response->failed()) {
            Log::error("Failed to restore backup {$backupId} for app {$applicationId}: " . $response->body());
        }

        return $response->successful();
    }

    /**
     * Delete a backup for an application
     */
    public function deleteBackup($applicationId, $backupId)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/application.backup.delete", [
            'applicationId' => $applicationId,
            'backupId' => $backupId
        ]);

        if ($response->failed()) {
            Log::error("Failed to delete backup {$backupId} for app {$applicationId}: " . $response->body());
        }

        return $response->successful();
    }

    /**
     * Execute a shell command in the container
     */
    public function executeCommand($applicationId, $command)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/application.execute", [
            'applicationId' => $applicationId,
            'command' => $command
        ]);

        if ($response->failed()) {
            \Illuminate\Support\Facades\Log::error("Dokploy executeCommand failed for app: {$applicationId}. Status: " . $response->status());
            return ['output' => "Error: Could not execute command. Infrastructure node unreachable or command not supported."];
        }

        return $response->json();
    }

    /**
     * Get real-time resource metrics (CPU/RAM) from Dokploy
     */
    public function getMetrics($applicationId)
    {
        $response = $this->request()->get("{$this->apiUrl}/api/application.metrics", [
            'applicationId' => $applicationId
        ]);

        if ($response->failed()) {
            Log::error("Failed to fetch metrics from Dokploy for app {$applicationId}: " . $response->body());
            return [
                'cpu' => 0,
                'memory' => 0,
                'memory_limit' => 0,
                'status' => 'offline'
            ];
        }

        return $response->json();
    }

    /**
     * Get detailed container metrics including Disk and Network
     */
    public function getDetailedMetrics($applicationId)
    {
        try {
            $response = $this->request()->get("{$this->apiUrl}/api/application.metrics.detailed", [
                'applicationId' => $applicationId
            ]);

            if ($response->status() === 404 || $response->failed()) {
                \Illuminate\Support\Facades\Log::warning("Dokploy detailed metrics API failed for application ID: {$applicationId}");
                return [
                    'cpu' => '0%',
                    'memory' => '0 MiB',
                    'disk_read' => '0 KB/s',
                    'disk_write' => '0 KB/s',
                    'net_in' => '0 Mbps',
                    'net_out' => '0 Mbps',
                ];
            }

            return $response->json();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Dokploy detailed metrics connection error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get application logs from Dokploy (Runtime)
     */
    public function getLogs($applicationId)
    {
        // Based on Dokploy API, assuming /api/application.logs
        $response = $this->request()->get("{$this->apiUrl}/api/application.logs", [
            'applicationId' => $applicationId
        ]);

        if ($response->failed()) {
            Log::error("Failed to fetch logs from Dokploy for app {$applicationId}: " . $response->body());
            return "Unable to retrieve logs at this time.";
        }

        $data = $response->json();
        
        // Dokploy might return logs as a string or an array of lines
        return $data['logs'] ?? $data['message'] ?? 'No logs available.';
    }

    /**
     * Get active build logs from Dokploy
     */
    public function getBuildLogs($applicationId)
    {
        $response = $this->request()->get("{$this->apiUrl}/api/application.build-logs", [
            'applicationId' => $applicationId
        ]);

        if ($response->failed()) {
            return "Build logs not yet initialized or application is idle.";
        }

        $data = $response->json();
        return $data['logs'] ?? $data['message'] ?? 'Streaming build pipeline...';
    }

    /**
     * Deploy/Redeploy an application
     */
    public function deploy($applicationId)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/application.deploy", [
            'applicationId' => $applicationId
        ]);

        return $response->successful();
    }

    /**
     * Create a new database in Dokploy
     */
    public function createDatabase($projectId, $name, $type, $user, $password)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/database.create", [
            'projectId' => $projectId,
            'name' => $name,
            'type' => $type, // e.g., 'mysql', 'mariadb', 'postgres', 'redis'
            'databaseUser' => $user,
            'databasePassword' => $password,
            'databaseName' => 'db_' . $name,
        ]);

        if ($response->failed()) {
            Log::error("Dokploy Database Creation Failed: " . $response->body());
            throw new \Exception("Failed to create database on worker node.");
        }

        return $response->json();
    }

    /**
     * Delete a database in Dokploy
     */
    public function deleteDatabase($databaseId)
    {
        $response = $this->request()->post("{$this->apiUrl}/api/database.delete", [
            'databaseId' => $databaseId
        ]);

        return $response->successful();
    }
}

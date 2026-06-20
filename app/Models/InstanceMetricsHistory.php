<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstanceMetricsHistory extends Model
{
    protected $table = 'instance_metrics_history';
    public $timestamps = false;
    protected $fillable = ['instance_id', 'cpu_usage', 'memory_usage', 'memory_limit', 'recorded_at'];

    public function instance()
    {
        return $this->belongsTo(Instance::class);
    }
}

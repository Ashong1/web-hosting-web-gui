<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('instance.{instanceId}.terminal', function ($user, $instanceId) {
    return $user->instances()->where('id', $instanceId)->exists();
});

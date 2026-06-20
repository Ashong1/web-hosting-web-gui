<?php

namespace App\Policies;

use App\Models\Instance;
use App\Models\User;

class InstancePolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Instance $instance): bool
    {
        return $user->id === $instance->user_id || $user->hasAdminRole();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Instance $instance): bool
    {
        return $user->id === $instance->user_id || $user->hasAdminRole();
    }
}

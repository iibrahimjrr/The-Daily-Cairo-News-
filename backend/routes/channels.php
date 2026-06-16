<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('news-updates', function () {
    return true;
});

Broadcast::channel('admin-notifications', function ($user) {
    return $user->hasRole(['admin', 'editor']);
});

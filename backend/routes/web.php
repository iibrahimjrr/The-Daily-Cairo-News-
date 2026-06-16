<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'The Daily Cairo API', 'version' => '1.0.0']);
});

Route::get('/up', function () {
    return response()->json(['status' => 'ok']);
});

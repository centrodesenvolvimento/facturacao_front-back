<?php

use App\Http\Controllers\Api\Auth\AuthApiController;
use App\Http\Controllers\Api\UserApiController;
use Illuminate\Support\Facades\Route;

Route::get('login', [AuthApiController::class, 'showLoginForm'])
    ->name('login');

Route::get('/csrf-token', function () {
    return response()->json([
        'csrf_token' => csrf_token()
    ]);
});
Route::get('/', function () {
    return redirect()->to('/v1/dashboard');
});
Route::prefix('v1')
    ->middleware('auth')
    ->group(function () {

        Route::post('login', [AuthApiController::class, 'login'])
            ->withoutMiddleware('auth')
            ->name('v1.login');



        Route::get('dashboard', function () {
            return view('admin');
        })->name('dashboard');

        // USERS
        Route::get('usuarios', [UserApiController::class, 'index']);
        Route::post('usuarios', [UserApiController::class, 'store']);
        Route::get('usuarios/{id}', [UserApiController::class, 'show']);
        Route::put('usuarios/{id}', [UserApiController::class, 'update']);
        Route::post('usuarios/changePassword/{id}', [UserApiController::class, 'changePassword']);
        Route::delete('usuarios/apagar/{id}/{id_user_logado}', [UserApiController::class, 'destroy']);
        Route::post('usuarios/updateTipoFolha', [UserApiController::class, 'updateTipoFolha']);
        Route::post('updateUser/{field}/{id}', [AuthApiController::class, 'updateUser'])->withoutMiddleware('auth')
        ->name('v1.updateUser');

    });

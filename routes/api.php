<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;



// Route::post('auth', 'Api\Auth\AuthApiController@login')->name('login');

//AUTENTICAÇÃO COM JWT
// Route::group([

//     'middleware' => 'api',
//     'prefix' => 'auth'

// ], function ($router) {

//     Route::post('login', 'Api\Auth\AuthApiController@login');
//     Route::post('logout', 'Api\Auth\AuthApiController@logout');
//     Route::post('refresh', 'Api\Auth\AuthApiController@refresh');
//     Route::post('me', 'Api\Auth\AuthApiController@me');

// });

// Route::get('/google', 'Api\Auth\SocialateController@google');

Route::group([
    'prefix' => 'v1',
    // 'namespace' => 'Api\v1',
    //'middleware' => 'web',
], function () {
    // AUTH
    Route::post(uri: 'login', 'Api\Auth\AuthApiController@login')->name('v1.login');
    Route::post('logout', 'Api\Auth\AuthApiController@logout');
    Route::post('refresh', 'Api\Auth\AuthApiController@refresh');
    Route::post('me', 'Api\Auth\AuthApiController@me');
    // oute::
    // Route::get('/login/google/callback', function () {
    //     // dd('ola');
    //     $user = Socialite::driver('google')->user();
    //     // $user = Socialite::driver('facebook')->user();
    //     dd($user);
    //     return 'Feito';
    // });

});
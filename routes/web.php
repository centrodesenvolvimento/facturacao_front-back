<?php

use App\Http\Controllers\Api\ArtigosController;
use App\Http\Controllers\Api\Auth\AuthApiController;
use App\Http\Controllers\Api\ClientesController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\EmpresasController;
use App\Http\Controllers\FacturaController;
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
        Route::get('novo/documento', function () {
            return view('admin');
        })->name('novoDocumento');
        Route::get('documentos/validar', function () {
            return view('admin');
        })->name('validar');
        Route::get('documentos/saft', function () {
            return view('admin');
        })->name('saft');

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


        // EMPRESA
        Route::group(['prefix' => 'empresas'], function () {
            Route::get('/', [EmpresasController::class, 'all']);
            Route::post('store', [EmpresasController::class, 'store']);
            Route::post('edit/{id}', [EmpresasController::class, 'edit']);

        });

        // FACTURAS
        Route::group(['prefix' => 'facturas'], function () {
            // Route::get('/', [ColunasController::class, 'all']);
            Route::get('', [FacturaController::class, 'facturasFilter']);
            Route::get('stats', [FacturaController::class, 'facturasStats']);

            Route::post('store/', [FacturaController::class, 'store']);
            Route::post('edit/{id}', [FacturaController::class, 'edit']);

            Route::get('searchSaft', [FacturaController::class, 'searchSaft']);

            Route::get('factura/{id}', [FacturaController::class, 'getFactura']);


        });

        // ARTIGOS
    Route::group(['prefix' => 'artigos'], function(){
        Route::get('/', [ArtigosController::class, 'index']);
        Route::post('store', [ArtigosController::class, 'store']);
        Route::post('store/preco/{id}', [ArtigosController::class, 'storePreco']);
        Route::get('show/{id}', [ArtigosController::class, 'show']);
        Route::get('preco/{id}', [ArtigosController::class, 'getPreco']);
        Route::get('precos/{id}', [ArtigosController::class, 'getPrecos']);
        Route::get('imagem/{id}', [ArtigosController::class, 'getImagem']);
        Route::post('update/{id}', [ArtigosController::class, 'update']);
    });

    // CLIENTES
    Route::group(['prefix' => 'clientes'], function(){
        Route::post('registar', [ClientesController::class, 'store']);
        Route::get('index', [ClientesController::class, 'index']);
        Route::get('detalhes/{id} ', [ClientesController::class, 'show']);
        Route::delete('apagar/{id}', [ClientesController::class, 'destroy']);
        Route::post('editar/{id}', [ClientesController::class, 'update']);
    });

    Route::group(['prefix' => 'notasCredito'], function(){
        // Route::get('/', [ColunasController::class, 'all']);
        Route::post('store/', [FacturaController::class, 'storeNota']);
        Route::post('storeRetificacao/', [FacturaController::class, 'storeNotaRetificacao']);

        // Route::post('edit/{id}', [FacturaController::class, 'edit']);
    });
    });

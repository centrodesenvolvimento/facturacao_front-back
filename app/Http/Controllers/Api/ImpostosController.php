<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImpostosController extends Controller
{
    public function taxasActivas()
    {
        $taxas = DB::table('impostos')->where('status', 'activo')->get();
        return $taxas;
    }

    public function isencoesActivas()
    {
        $isencoes = DB::table('isencoes')->where('status', 'activo')->get();
        return $isencoes;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Empresa extends Model
{
    protected $table = 'empresas';
    protected $fillable = [
        'regime_id',
        'nome_empresa',
        'tipo',
        'num_contribuinte',
        'registo_comercial',
        'designacao_comercial',
        'pais',
        'logo',
        'status'
    ];

    public function empresasActivas()
    {
        $empresas = DB::table('empresas')->where('status', 'activo')->get();
        return $empresas;
    }
}

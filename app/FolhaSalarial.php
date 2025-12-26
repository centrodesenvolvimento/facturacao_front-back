<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class FolhaSalarial extends Model
{

    

    protected $table = 'folha_salarials';

    protected $fillable = [
        'empresa_id',
        'ano_id',
        'polo_id',
        'vinculo_id',
        'mes',
        'funcionarios',
        'departamentos',
        'subsidios',
        'premios',
        'totais',
        'status',
    ];
    protected $casts = [
        'premios' => 'json',
        'subsidios' => 'json',
        'funcionarios' => 'json',
        'totais' => 'json',
        'departamentos' => 'json'
    ];
}

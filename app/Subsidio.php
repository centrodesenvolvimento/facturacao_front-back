<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Subsidio extends Model
{
    protected $table = 'subsidios';
    protected $fillable = [
        'empresa_id',
        'nome',
        'tipo_tributo_inss',
        'valor_nao_tributavel_inss',
        'tributavel_ss',
        'tipo_tributo_irt',
        'valor_nao_tributavel_irt',
        'tributavel_irt',
        'sujeicao_falta',
        'status'
    ];
}

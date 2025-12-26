<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TipoPremio extends Model
{
    //
    protected $table = 'tipo_premios';
    protected $fillable = [
        'empresa_id',
        'nome',
        'valor_nao_tributavel_inss',
        'tributavel_ss',
        'valor_nao_tributavel_irt',
        'tributavel_irt',
        'sujeicao_falta',
        'status'
    ];
}

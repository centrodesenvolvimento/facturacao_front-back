<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Premio extends Model
{


    protected $table = 'premios';
    protected $fillable = [
        'tipo_id',
        'nome',
        'descricao',
        'valor_fixo',
        'valor_porcentagem',

        'status'
    ];
}

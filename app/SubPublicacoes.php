<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SubPublicacoes extends Model
{
    protected $table = 'sub_publicacoes';
    protected $fillable = [
        'tipo_id',
        'nome',
        'descricao',
        'valor_fixo',
        'valor_porcentagem',

        'status'
    ];
}

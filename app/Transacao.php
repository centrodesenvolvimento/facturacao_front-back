<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Transacao extends Model
{

    protected $table = 'transacaos';
    protected $fillable = [
        'descricao',
        'departamento_id',
        'empresa_id',
        'polo_id',
        'valorTotal',
        'debitos',
        'creditos',
        'data',
        'status',
    ];
    protected $casts = [
        'debitos' => 'json',
        'creditos' => 'json',

    ];
}

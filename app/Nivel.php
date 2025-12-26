<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Nivel extends Model
{
    protected $table = 'nivels';
    protected $fillable = [
        'empresa_id',
        'nome',
        'descricao',
        'valor',
        'status'
    ];
}

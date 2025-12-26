<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Publicacao extends Model
{
    protected $table = 'publicacaos';
    protected $fillable = [
        'empresa_id',
        'nome',
        'descricao',
        'status'
    ];
}

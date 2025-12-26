<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Colunas extends Model
{
    protected $table = 'colunas';
    protected $fillable = [
        'empresa_id',
        'titulo',
        'descricao',
        'numero',
        'status'
    ];
}

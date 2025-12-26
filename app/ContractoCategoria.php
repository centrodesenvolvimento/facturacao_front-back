<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ContractoCategoria extends Model
{
    protected $table = 'contracto_categorias';
    protected $fillable = [
        'empresa_id',
        'nome',
        'descricao',
        'status'
    ];
}

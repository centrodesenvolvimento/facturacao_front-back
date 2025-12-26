<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Cargo extends Model
{
    protected $table = 'cargos';
    protected $fillable = [
        'empresa_id',
        'nome',
        'descricao',
        

        'status'
    ];
}

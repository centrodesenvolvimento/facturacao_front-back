<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Departamentos extends Model
{
    protected $table = 'departamentos';
    protected $fillable = [
        'nome',
        'descricao',
        'empresa_id',
        'status',
        'outra_info'
    ];
    protected $casts = [
        'outra_info' => 'json',
    ];
}

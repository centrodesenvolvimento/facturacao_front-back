<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Classe extends Model
{
    
    protected $table = 'classes';
    protected $fillable = [
        'nome',
        'codigo',
        'descricao',
        'status',
        'outra_info'
    ];
    protected $casts = [
        'outra_info' => 'json',
    ];
}

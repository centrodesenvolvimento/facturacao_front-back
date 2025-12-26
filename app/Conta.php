<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Conta extends Model
{
    protected $table = 'contas';
    protected $fillable = [
        'classe_id',
        'nome',
        'codigo',
        'natureza',
        'status',
        'outra_info'
    ];
    protected $casts = [
        'outra_info' => 'json',
    ];
}

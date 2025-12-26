<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Subcontas extends Model
{
    protected $table = 'subcontas';
    protected $fillable = [
        'conta_id',
        'nome',
        'codigo',
        'status',
        'outra_info'
    ];
    protected $casts = [
        'outra_info' => 'json',
    ];
}

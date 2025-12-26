<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VinculosLaborais extends Model
{
    protected $table = 'vinculos_laborais';
    protected $fillable = [
        'empresa_id',
        'nome',
        'descricao',
        'status'
    ];
}

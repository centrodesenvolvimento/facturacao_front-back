<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class AssinaturasFolha extends Model
{
    protected $table = 'assinaturas_folhas';
    protected $fillable = [
        'empresa_id',
        'titulo',
        'descricao',
        'posicao',
        'status'
    ];
}

<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Ferias extends Model
{
    //

    protected $table = 'ferias';

    protected $fillable = [
        'funcionario_id',
        'ano_id',
        'data_inicial',
        'data_final',
        'dias',
        'meses',
        'status_pedido',
        'status',
    ];
    protected $casts = [
        'meses' => 'json',

    ];

    public function funcionario()
    {
        return $this->belongsTo(Funcionario::class, 'funcionario_id');
    }

    public function contrato()
    {
        
    }
}

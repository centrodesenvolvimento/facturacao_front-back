<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TaxasIrt extends Model
{
    //
    protected $table = 'taxas_irt';
    protected $fillable = [
        'escalao',
        'salario_min',
        'salario_max',
        'parcela_fixo',
        'taxa',
        'excesso',
        'status'
    ];
}

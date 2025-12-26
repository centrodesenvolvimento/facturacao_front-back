<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class AnoServico extends Model
{
    protected $table = 'anos_servico';
    protected $fillable = [
        'ano',
        'status'
    ];
}

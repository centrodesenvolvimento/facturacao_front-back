<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SubsidioValor extends Model
{
    protected $table = 'subsidio_valors';
    protected $fillable = [
        'subsidio_id',
        'valor',
        'valor_nao_coletavel',
        'status',
    ];
}

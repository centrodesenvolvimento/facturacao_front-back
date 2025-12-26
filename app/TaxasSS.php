<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TaxasSS extends Model
{
    protected $table = 'taxas_ss';
    protected $fillable = [
        'pessoal',
        'patronal',
        'status'
    ];
}

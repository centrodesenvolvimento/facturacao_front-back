<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Familia extends Model
{
    protected $table = 'familias';
    protected $fillable = [
        'empresa_id',
        'designacao',
        'status'
    ];
}

<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Adiantamento extends Model
{
    protected $table = 'adiantamentos';
    protected $fillable = [
        'funcionario_id',
        'ano_id',
        'valorTotal',
        'valorDebito',
        'mes',
    ];
    
    public function funcionario()
    {
        return $this->belongsTo(Funcionario::class, 'funcionario_id');
    }

}

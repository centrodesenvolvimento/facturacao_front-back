<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ControlePresenca extends Model
{
    //

    protected $table = 'controle_presencas';
    protected $fillable = [
        'empresa_id',
        'ano_id',
        'departamento_id',
        'mes',
        'lista',
        'status',
        'tipo'
    ];
    protected $casts = [
        'lista' => 'json',
    ];

    public function departamento()
    {
        return $this->belongsTo(Departamentos::class, 'departamento_id');
    }

    public function vinculo()
    {
        return $this->belongsTo(VinculosLaborais::class, 'tipo');
    }
}

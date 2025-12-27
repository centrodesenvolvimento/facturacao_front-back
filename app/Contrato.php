<?php

namespace App;

use App\Models\Polo;
use Illuminate\Database\Eloquent\Model;
use App\Departamentos;


class Contrato extends Model
{
    protected $table = 'contratos';

    protected $fillable = [
        'funcionario_id',
        'polo_id',
        'departamento_id',
        'cargo',
        'categoria',
        'vinculo',
        'salario',
        'banco',
        'conta',
        'iban',
        'nib',
        'swift',
        'contracto',
        'dataCelebracao',
        'dataConclusao',
        'premios',
        'subsidios',
        'avenca',
        'avenca_normal',
        'impostos_coletavel',
        'carga',
        'licensa_maternidade',
        'licensa_meses',
        'status',
        'proporcional'
    ];
    protected $casts = [
        'premios' => 'json',
        'subsidios' => 'json',
        'cargo' => 'json',
        'licensa_meses' => 'json'
    ];

    // Relationships
    public function funcionario()
    {
        return $this->belongsTo(Funcionario::class, 'funcionario_id');
    }

    public function polo()
    {
        return $this->belongsTo(Polo::class, 'polo_id');
    }

    public function departamento()
    {
        return $this->belongsTo(Departamentos::class, 'departamento_id');
    }

}

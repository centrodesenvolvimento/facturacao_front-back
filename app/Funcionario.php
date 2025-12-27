<?php

namespace App;

use App\Models\Empresa;
use Illuminate\Database\Eloquent\Model;

class Funcionario extends Model
{
    protected $table = 'funcionarios';
    protected $fillable = [
        'user_id',
        'status',
        'logo',
        'nome',
        'agregado',
        'social',
        'genero',
        'estado',
        'nacionalidade',
        'nascimento',
        'municipio',
        'bairro',
        'morada',
        'telemovel',
        'telemovel1',
        'habilitacoesA',
        'habilitacoesP',
        'tipoDocumento',
        'localEmissao',
        'codigoDocumento',
        'dataEmissao',
        'dataValidade',
        'documento',
        'tipo', // 'docente' ou 'nao docente',
        'empresa_id',
        'publicacoes'
    ];

    protected $casts = [
        'habilitacoesA' => 'json',
        'habilitacoesP' => 'json',
        'publicacoes' => 'json'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function contrato()
    {
        return $this->hasMany(Contrato::class)->latest();
    }
    



}

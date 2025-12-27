<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class UnidadeMedida extends Model
{
    protected $table = 'unidades_medida';
    protected $fillable = [
        'empresa_id',
        'designacao',
        'abreviacao',
        'status'
    ];

    public function unidadesMedidasActivas($id)
    {
        $unidades_medidas = DB::table('unidades_medida')->where([
            ['empresa_id', $id],
            ['status', 'activo'],
        ])
        ->get();
        return $unidades_medidas;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class TipoArtigo extends Model
{
    protected $table = 'tipos_artigos';
    protected $fillable = [
        'empresa_id',
        'designacao',
        'status'
    ];

    public function tiposArtigosActivos($id)
    {
        $tipos_artigos = DB::table('tipos_artigos')->where([
            ['empresa_id', $id],
            ['status', 'activo'],
        ])
        ->get();
        return $tipos_artigos;
    }
}

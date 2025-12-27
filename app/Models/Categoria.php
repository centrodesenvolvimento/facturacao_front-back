<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Categoria extends Model
{
    protected $table = 'categorias';
    protected $fillable = [
        'familia_id',
        'designacao',
        'status'
    ];

    public function categoriasActivas($id)
    {
        $_SESSION['empresa_id'] = $id;
        $categorias = DB::table('categorias')->where([
            ['categorias.status', 'activo'],
        ])
        ->join('familias', function ($join) {
            $join->on('familias.id', '=', 'categorias.familia_id')
                ->where([
                ['familias.empresa_id', $_SESSION['empresa_id']],
                ['familias.status', 'activo'],
            ]);
        })
        ->select('categorias.*')
        ->get();
        return $categorias;
    }
}

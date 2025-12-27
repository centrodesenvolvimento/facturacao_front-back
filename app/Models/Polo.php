<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class Polo extends Model
{
    protected $table = 'polos';
    protected $fillable = [
        'empresa_id',
        'nome_polo',
        'telemovel',
        'email',
        'localizacao',
        'rua',
        'provincia',
        'descricao',
        'serie',
        'status'
    ];

    public function store($request)
    {
        $empresa = Empresa::where('id', $request->empresa_id)->first();
        $serie_anterior = DB::table('polos')->where('empresa_id', $empresa->id)->latest()->first();
        if(isset($serie_anterior->serie)):
            $serie_nova = $serie_anterior->serie + 1;
        else:
            $serie_nova = 1;
        endif;
        $polos_count = DB::table('polos')->where([
            ['empresa_id', $request->empresa_id],
            ['nome_polo', $request->nome_polo],
        ])->count();
        if($polos_count == 0):
            $create = DB::table('polos')->insert([
                'empresa_id' => $request->empresa_id,
                'nome_polo' => $request->nome_polo,
                'localizacao' => $request->localizacao,
                'rua' => $request->rua,
                'provincia' => $request->provincia,
                'serie' => $serie_nova,
                'telemovel' => $request->telemovel,
                'email' => $request->email,
                'descricao' => $request->descricao,
                'status' => 'activo',
                'created_at' => new \DateTime(),
                'updated_at' => new \DateTime(),
            ]);

            if($create):
                return 'sucesso';
            else:
                return 'erro';
            endif;
        else:
            return 'existe';
        endif;
    }

    public function polosActivosEmpresa($id)
    {
        $polos = DB::table('polos')->where([
            ['empresa_id', $id],
            ['status', 'activo'],
        ])->get();
        return $polos;
    }
}

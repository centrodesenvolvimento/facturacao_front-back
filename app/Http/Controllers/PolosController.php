<?php

namespace App\Http\Controllers;

use App\Modelos\Polo;
use Illuminate\Http\Request;

class PolosController extends Controller
{
    public function empresaPolos($id) {
        $polos = Polo::where('empresa_id', $id)->get();
        return $polos;
    }

    public function store(Request $request, $id){
        // protected $fillable = [
        //     'empresa_id',
        //     'nome_polo',
        //     'telemovel',
        //     'email',
        //     'localizacao',
        //     'rua',
        //     'provincia',
        //     'descricao',
        //     'serie',
        //     'status'
        // ];
        $polo = Polo::create([
            'empresa_id' => $id,
            'nome_polo' => $request->nome,
            'telemovel' => $request->telemovel,
            'email' => $request->email,
            'localizacao' => $request->localizacao,
            'rua' => $request->rua,
            'provincia' => $request->provincia,
            'descricao' => $request->descricao,
            'serie' => $request->serie,
            'status' => 'activo'
        ]);
        $polos = Polo::where('empresa_id', $id)->get();
        return $polos;

    }

    public function edit(Request $request, $id){

        $polo = Polo::find($id);
        if (!$request->status){
            $polo->nome_polo = $request->nome;
            $polo->telemovel = $request->telemovel;
            $polo->email = $request->email;
            $polo->localizacao = $request->localizacao;
            $polo->rua = $request->rua;
            $polo->provincia = $request->provincia;
            $polo->descricao = $request->descricao;
            $polo->serie = $request->serie;
            $polo->save();
        }else {

            $polo->status = $request->status;
            $polo->save();
        }
        $polos = Polo::where('empresa_id', $request->empresa_id)->get();
        return $polos;

    }


}

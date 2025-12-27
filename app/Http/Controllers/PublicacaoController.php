<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Publicacao;
use App\SubPublicacoes;
use Illuminate\Http\Request;

class PublicacaoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $publicacoes = Publicacao::all();
        $publicacoes = $publicacoes->map(function ($item){
            $publicacoes = SubPublicacoes::where('tipo_id', $item->id)->get();
            $item->publicacoes = $publicacoes;
            return $item;
        });

        return $publicacoes;
    }

    public function empresaPublicacoes($id)
    {
        $publicacoes = Publicacao::where('empresa_id', $id)->get();
        $publicacoes = $publicacoes->map(function ($item){
            $publicacoes = SubPublicacoes::where('tipo_id', $item->id)->get();
            $item->publicacoes = $publicacoes;
            return $item;
        });
        return $publicacoes;
    }

    public function store(Request $request, $id) {

        $categoria = Publicacao::create([
            'nome'=> $request->nome,
            'descricao'=> $request->descricao,
            'empresa_id' => $id,
            'status' => 'activo',
        ]);
        $publicacoes = Publicacao::where('empresa_id', $id)->get();
        return $publicacoes;
    }
    public function edit(Request $request, $id){

        $categoria = Publicacao::find($id);
        if (!$request->status){
            $categoria->nome = $request->nome;
            $categoria->descricao = $request->descricao;
            $categoria->save();
        }else {
            $categoria->status = $request->status;
            $categoria->save();
        }
        $publicacoes = Publicacao::where('empresa_id', $request->empresa_id)->get();
        $publicacoes = $publicacoes->map(function ($item){
            $publicacoes = SubPublicacoes::where('tipo_id', $item->id)->get();
            $item->publicacoes = $publicacoes;
            return $item;
        });
        return $publicacoes;

    }
}

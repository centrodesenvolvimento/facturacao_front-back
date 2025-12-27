<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Nivel;
use Illuminate\Http\Request;

class NivelController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $niveis = Nivel::all();
        $niveis = $niveis->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $niveis;
    }

    public function empresaNiveis($id)
    {
        $niveis = Nivel::where('empresa_id', $id)->get();
        $niveis = $niveis->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $niveis;
    }

    public function store(Request $request, $id) {

        $nivel = Nivel::create([
            'nome'=> $request->nome,
            'descricao'=> $request->descricao,
            'valor'=> $request->valor,
            'empresa_id' => $id,
            'status' => 'activo',
            'outra_info' => null
        ]);
        $niveis = Nivel::where('empresa_id', $id)->get();
        return $niveis;
    }
    public function edit(Request $request, $id){

        $nivel = Nivel::find($id);
        if (!$request->status){
            $nivel->nome = $request->nome;
            $nivel->descricao = $request->descricao;
            $nivel->valor = $request->valor;
            $nivel->save();
        }else {
            $nivel->status = $request->status;
            $nivel->save();
        }
        $niveis = Nivel::where('empresa_id', $request->empresa_id)->get();
        $niveis = $niveis->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $niveis;

    }
}

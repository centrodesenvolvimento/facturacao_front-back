<?php

namespace App\Http\Controllers;

use App\Colunas;
use App\Modelos\Empresa;
use Illuminate\Http\Request;

class ColunasController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $colunas = Colunas::all();
        $colunas = $colunas->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $colunas;
    }

    public function empresaColunas($id)
    {
        $colunas = Colunas::where('empresa_id', $id)->get();
        $colunas = $colunas->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $colunas;
    }

    public function store(Request $request, $id) {

        $coluna = Colunas::create([
            'empresa_id' => $id,
            'titulo'=> $request->titulo,
            'numero' => $request->numero,
            'descricao'=> $request->descricao,
            'status' => 'activo',
        ]);
        $colunas = Colunas::where('empresa_id', $id)->get();
        return $colunas;
    }

    public function edit(Request $request, $id){

        $coluna = Colunas::find($id);
        if (!$request->status){
            $coluna->titulo = $request->titulo;
            $coluna->numero = $request->numero;
            $coluna->descricao = $request->descricao;
            $coluna->save();
        }else {
            $coluna->status = $request->status;
            $coluna->save();
        }

        $colunas = Colunas::where('empresa_id', $request->empresa_id)->get();
        $colunas = $colunas->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $colunas;

    }
}

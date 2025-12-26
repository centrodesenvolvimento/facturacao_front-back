<?php

namespace App\Http\Controllers;

use App\Cargo;
use App\Modelos\Empresa;
use Illuminate\Http\Request;

class CargoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $cargos = Cargo::all();
        $cargos = $cargos->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $cargos;
    }

    public function empresaCargos($id)
    {
        $cargos = Cargo::where('empresa_id', $id)->get();
        $cargos = $cargos->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $cargos;
    }

    public function store(Request $request, $id) {

        $Cargo = Cargo::create([
            'nome'=> $request->nome,
            'descricao'=> $request->descricao,
            'empresa_id' => $id,
            'status' => 'activo',
            'outra_info' => null
        ]);
        $cargos = Cargo::where('empresa_id', $id)->get();
        return $cargos;
    }
    public function edit(Request $request, $id){

        $Cargo = Cargo::find($id);
        if (!$request->status){
            $Cargo->nome = $request->nome;
            $Cargo->descricao = $request->descricao;
            $Cargo->save();
        }else {
            $Cargo->status = $request->status;
            $Cargo->save();
        }
        $cargos = Cargo::where('empresa_id', $request->empresa_id)->get();
        $cargos = $cargos->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $cargos;

    }
}


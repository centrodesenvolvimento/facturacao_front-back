<?php

namespace App\Http\Controllers;

use App\Conta;
use App\Subcontas;
use Illuminate\Http\Request;

class ContaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all() {
        $contas = Conta::all();
        $contas = $contas->map(function ($item){
            $subcontas = Subcontas::where('conta_id', $item->id)->get();
            $item->subcontas = $subcontas;
            return $item;
        });

        return $contas;
    }

    public function contasId($id) {
        $contas = Conta::where('classe_id', $id)->get();
        $contas = $contas->map(function ($item){
            $subcontas = Subcontas::where('conta_id', $item->id)->get();
            $item->subcontas = $subcontas;
            return $item;
        });
        return $contas;
    }

    public function store(Request $request, $id){
        $conta = Conta::create([
            'classe_id' => $id,
            'nome' => $request->nome,
            'natureza' => $request->natureza,
            'codigo' => $request->codigo,
            'outra_info' => null,
            'status' => 'activo'
        ]);
        $contas = Conta::where('classe_id', $id)->get();
        $contas = $contas->map(function ($item){
            $subcontas = Subcontas::where('conta_id', $item->id)->get();
            $item->subcontas = $subcontas;
            return $item;
        });
        return $contas;

    }

    public function edit(Request $request, $id){

        $conta = Conta::find($id);
        if (!$request->status){
            $conta->nome = $request->nome;
            $conta->codigo = $request->codigo;
            $conta->natureza = $request->natureza;
            $conta->save();
        }else {
            $conta->status = $request->status;
            $conta->save();
        }
        $contas = Conta::where('classe_id', $request->classe_id)->get();
        $contas = $contas->map(function ($item){
            $subcontas = Subcontas::where('conta_id', $item->id)->get();
            $item->subcontas = $subcontas;
            return $item;
        });
        return $contas;

    }
}

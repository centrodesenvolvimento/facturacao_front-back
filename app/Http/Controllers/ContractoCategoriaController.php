<?php

namespace App\Http\Controllers;

use App\ContractoCategoria;
use App\Models\Empresa;
use Illuminate\Http\Request;

class ContractoCategoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $categorias = ContractoCategoria::all();
        $categorias = $categorias->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $categorias;
    }

    public function empresaCategorias($id)
    {
        $categorias = ContractoCategoria::where('empresa_id', $id)->get();
        $categorias = $categorias->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $categorias;
    }

    public function store(Request $request, $id) {

        $categoria = ContractoCategoria::create([
            'nome'=> $request->nome,
            'descricao'=> $request->descricao,
            'empresa_id' => $id,
            'status' => 'activo',
        ]);
        $categorias = ContractoCategoria::where('empresa_id', $id)->get();
        return $categorias;
    }
    public function edit(Request $request, $id){

        $categoria = ContractoCategoria::find($id);
        if (!$request->status){
            $categoria->nome = $request->nome;
            $categoria->descricao = $request->descricao;
            $categoria->save();
        }else {
            $categoria->status = $request->status;
            $categoria->save();
        }
        $categorias = ContractoCategoria::where('empresa_id', $request->empresa_id)->get();
        $categorias = $categorias->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $categorias;

    }
}

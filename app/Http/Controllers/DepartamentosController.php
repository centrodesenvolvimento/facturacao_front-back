<?php

namespace App\Http\Controllers;

use App\Departamentos;
use App\Models\Empresa;
use Illuminate\Http\Request;

class DepartamentosController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $departamentos = Departamentos::all();
        $departamentos = $departamentos->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $departamentos;
    }

    public function empresaDepartamentos($id)
    {
        $departamentos = Departamentos::where('empresa_id', $id)->get();
        $departamentos = $departamentos->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $departamentos;
    }

    public function store(Request $request, $id) {

        $departamento = Departamentos::create([
            'nome'=> $request->nome,
            'descricao'=> $request->descricao,
            'empresa_id' => $id,
            'status' => 'activo',
            'outra_info' => null
        ]);
        $departamentos = Departamentos::where('empresa_id', $id)->get();
        return $departamentos;
    }
    public function edit(Request $request, $id){

        $departamento = Departamentos::find($id);
        if (!$request->status){
            $departamento->nome = $request->nome;
            $departamento->descricao = $request->descricao;
            $departamento->save();
        }else {
            $departamento->status = $request->status;
            $departamento->save();
        }
        $departamentos = Departamentos::where('empresa_id', $request->empresa_id)->get();
        $departamentos = $departamentos->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $departamentos;

    }
}

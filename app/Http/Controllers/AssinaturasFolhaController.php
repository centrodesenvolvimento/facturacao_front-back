<?php

namespace App\Http\Controllers;

use App\AssinaturasFolha;
use App\Models\Empresa;
use Illuminate\Http\Request;

class AssinaturasFolhaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $assinaturas = AssinaturasFolha::all();
        $assinaturas = $assinaturas->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $assinaturas;
    }

    public function empresaAssinaturas($id)
    {
        $assinaturas = AssinaturasFolha::where('empresa_id', $id)->get();
        $assinaturas = $assinaturas->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $assinaturas;
    }

    public function store(Request $request, $id) {

        $nivel = AssinaturasFolha::create([
            'titulo'=> $request->titulo,
            'descricao'=> $request->descricao,
            'posicao'=> $request->posicao,
            'empresa_id' => $id,
            'status' => 'activo',
        ]);
        $assinaturas = AssinaturasFolha::where('empresa_id', $id)->get();
        return $assinaturas;
    }
    public function edit(Request $request, $id){

        $nivel = AssinaturasFolha::find($id);
        if (!$request->status){
            $nivel->titulo = $request->titulo;
            $nivel->descricao = $request->descricao;
            $nivel->posicao = $request->posicao;
            $nivel->save();
        }else {
            $nivel->status = $request->status;
            $nivel->save();
        }
        $assinaturas = AssinaturasFolha::where('empresa_id', $request->empresa_id)->get();
        $assinaturas = $assinaturas->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $assinaturas;

    }
}

<?php

namespace App\Http\Controllers;

use App\SubPublicacoes;
use Illuminate\Http\Request;

class SubPublicacoesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $id){
        $subpublicacoes = SubPublicacoes::create([
            'tipo_id' => $id,
            'nome' => $request->nome,
            'descricao' => $request->descricao,
            'status' => 'activo'
        ]);

        $subpublicacoess = SubPublicacoes::where('tipo_id', $id)->get();
        return $subpublicacoess;


    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Subcontas  $subcontas
     * @return \Illuminate\Http\Response
     */


    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Subcontas  $subcontas
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id){

        $subpublicacoes = SubPublicacoes::find($id);
        if (!$request->status){
            $subpublicacoes->nome = $request->nome;
            $subpublicacoes->descricao = $request->descricao;
            $subpublicacoes->save();
        }else {
            $subpublicacoes->status = $request->status;
            $subpublicacoes->save();
        }
        $subpublicacoess = SubPublicacoes::where('tipo_id', $request->tipo_id)->get();
        return $subpublicacoess;

    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Subcontas  $subcontas
     * @return \Illuminate\Http\Response
     */


    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Subcontas  $subcontas
     * @return \Illuminate\Http\Response
     */

}

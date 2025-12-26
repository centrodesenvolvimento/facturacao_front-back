<?php

namespace App\Http\Controllers;

use App\Premio;
use Illuminate\Http\Request;

class PremioController extends Controller
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
        $premio = Premio::create([
            'tipo_id' => $id,
            'nome' => $request->nome,
            'descricao' => $request->descricao,
            'valor_fixo' => $request->valor_fixo,
            'valor_porcentagem' => $request->valor_porcentagem,
            'status' => 'activo'
        ]);

        $premios = Premio::where('tipo_id', $id)->get();
        return $premios;


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

        $premio = Premio::find($id);
        if (!$request->status){
            $premio->nome = $request->nome;
            $premio->descricao = $request->descricao;
            $premio->valor_fixo = $request->valor_fixo;
            $premio->valor_porcentagem = $request->valor_porcentagem;
            $premio->save();
        }else {
            $premio->status = $request->status;
            $premio->save();
        }
        $premios = Premio::where('tipo_id', $request->tipo_id)->get();
        return $premios;

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

<?php

namespace App\Http\Controllers;

use App\SubsidioValor;
use Illuminate\Http\Request;

class SubsidioValorController extends Controller
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
        $valor = SubsidioValor::create([
            'subsidio_id' => $id,
            'valor' => $request->valor,
            'valor_nao_coletavel' => $request->valor_nao_coletavel,
            'status' => 'activo'
        ]);

        $valores = SubsidioValor::where('subsidio_id', $id)->get();
        return $valores;


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

        $valor = SubsidioValor::find($id);
        if (!$request->status){
            $valor->valor = $request->valor;
            $valor->valor_nao_coletavel = $request->valor_nao_coletavel;
            $valor->save();
        }else {
            $valor->status = $request->status;
            $valor->save();
        }
        $valores = SubsidioValor::where('subsidio_id', $request->subsidio_id)->get();
        return $valores;

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

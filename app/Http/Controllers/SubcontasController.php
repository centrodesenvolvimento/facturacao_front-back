<?php

namespace App\Http\Controllers;

use App\Subcontas;
use Illuminate\Http\Request;

class SubcontasController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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
        $subconta = Subcontas::create([
            'conta_id' => $id,
            'nome' => $request->nome,
            'codigo' => $request->codigo,
            'outra_info' => null,
            'status' => 'activo'
        ]);

        $subcontas = Subcontas::where('conta_id', $id)->get();
        return $subcontas;


    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Subcontas  $subcontas
     * @return \Illuminate\Http\Response
     */
    public function show(Subcontas $subcontas)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Subcontas  $subcontas
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id){

        $subconta = Subcontas::find($id);
        if (!$request->status){
            $subconta->nome = $request->nome;
            $subconta->codigo = $request->codigo;
            $subconta->save();
        }else {
            $subconta->status = $request->status;
            $subconta->save();
        }
        $subcontas = Subcontas::where('conta_id', $request->conta_id)->get();
        return $subcontas;

    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Subcontas  $subcontas
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Subcontas $subcontas)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Subcontas  $subcontas
     * @return \Illuminate\Http\Response
     */
    public function destroy(Subcontas $subcontas)
    {
        //
    }
}

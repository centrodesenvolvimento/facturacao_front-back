<?php

namespace App\Http\Controllers;

use App\Contrato;
use Illuminate\Http\Request;

class ContratoController extends Controller
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


    public function store(Request $request)
    {
        $file = $request->file('contrato');
        $filename = 'contrato_' . time() . '.' . $file->getClientOriginalExtension();
        $path = 'funcionarios/documentos/' . $filename;
        $file->storeAs('funcionarios/documentos', $filename);


        $contrato = Contrato::create([
            'funcionario_id' => $request->funcionario_id,
            'polo_id' => $request->input('polo'),
            'departamento_id' => $request->input('departamento'),
            'cargo' => json_decode($request->input('cargo')),
            'categoria' => $request->input('categoria'),
            'vinculo' => $request->input('vinculoLaboral'),
            'salario' => $request->input('salario'),
            'banco' => $request->input('banco'),
            'conta' => $request->input('conta'),
            'iban' => $request->input('iban'),
            'nib' => $request->input('nib'),
            'swift' => $request->input('swift'),
            'premios' => json_decode($request->input('premios')),
            'subsidios' => json_decode($request->input('subsidios')),
            'avenca' => $request->input('avenca'),
            'escalao' => $request->input('escalao'),
            'carga' => $request->input('carga'),
            'impostos_coletavel' => $request->input('coletavel'),
            'licensa_maternidade' => $request->input('licensa_maternidade'),
            'licensa_meses' => json_decode($request->input('licensa_meses')),
            'contracto' => $path,
            'dataCelebracao' => $request->input('dataCelebracao'),
            'dataConclusao' => $request->input('dataConclusao'),
            'status' => 'activo',
        ]);

        return Contrato::where('funcionario_id', $request->funcionario_id)->with(['polo', 'departamento'])->get();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Contrato  $contrato
     * @return \Illuminate\Http\Response
     */
    public function show(Contrato $contrato)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Contrato  $contrato
     * @return \Illuminate\Http\Response
     */
    public function edit(Contrato $contrato)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Contrato  $contrato
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Contrato $contrato)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Contrato  $contrato
     * @return \Illuminate\Http\Response
     */
    public function destroy(Contrato $contrato)
    {
        //
    }
}

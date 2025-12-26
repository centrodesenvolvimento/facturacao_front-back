<?php

namespace App\Http\Controllers;

use App\TaxasIrt;
use Illuminate\Http\Request;

class TaxasIrtController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $taxas = TaxasIrt::all();

        return $taxas;
    }



    public function store(Request $request) {

        $taxa = TaxasIrt::create([
            'escalao'=> $request->escalao,
            'salario_min'=> $request->salario_min,
            'salario_max'=> $request->salario_max,
            'parcela_fixo' => $request->parcela,
            'taxa' => $request->taxa,
            'excesso' => $request->excesso,
            'status' => 'activo',
        ]);
        $taxas = TaxasIrt::all();
        return $taxas;
    }
    public function edit(Request $request, $id){

        $taxa = TaxasIrt::find($id);
        if (!$request->status){
            $taxa->escalao = $request->escalao;
            $taxa->salario_min = $request->salario_min;
            $taxa->salario_max = $request->salario_max;
            $taxa->parcela_fixo = $request->parcela;
            $taxa->taxa = $request->taxa;
            $taxa->excesso = $request->excesso;
            $taxa->save();
        }else {
            $taxa->status = $request->status;
            $taxa->save();
        }
        $taxas = TaxasIrt::all();

        return $taxas;

    }
}


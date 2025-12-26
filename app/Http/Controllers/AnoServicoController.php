<?php

namespace App\Http\Controllers;

use App\AnoServico;
use Illuminate\Http\Request;

class AnoServicoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $anos = AnoServico::all();

        return $anos;
    }

    public function store(Request $request) {

        $ano = AnoServico::create([

            'ano' => $request->ano,
            'status' => 'activo',
        ]);
        $anos = AnoServico::all();
        return $anos;
    }

    public function edit(Request $request, $id){

        $ano = AnoServico::find($id);
        if (!$request->status){

            $ano->ano = $request->ano;
            $ano->save();
        }else {
            $ano->status = $request->status;
            $ano->save();
        }
        $anos = AnoServico::all();

        return $anos;
    }
}

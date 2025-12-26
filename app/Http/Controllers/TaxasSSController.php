<?php

namespace App\Http\Controllers;

use App\TaxasSS;
use Illuminate\Http\Request;

class TaxasSSController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $taxas = TaxasSS::all();

        return $taxas;
    }

    public function store(Request $request) {

        $taxa = TaxasSS::create([

            'pessoal' => $request->pessoal,
            'patronal' => $request->patronal,
            'status' => 'activo',
        ]);
        $taxas = TaxasSS::all();
        return $taxas;
    }

    public function edit(Request $request, $id){

        $taxa = TaxasSS::find($id);
        if (!$request->status){

            $taxa->pessoal = $request->pessoal;
            $taxa->patronal = $request->patronal;
            $taxa->save();
        }else {
            $taxa->status = $request->status;
            $taxa->save();
        }
        $taxas = TaxasSS::all();

        return $taxas;
    }
}

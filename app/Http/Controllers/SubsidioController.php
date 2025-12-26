<?php

namespace App\Http\Controllers;

use App\Subsidio;
use App\SubsidioValor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubsidioController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all() {
        $tipos = Subsidio::all();
        $tipos = $tipos->map(function ($item){
            $valores = SubsidioValor::where('subsidio_id', $item->id)->get();
            $item->valores = $valores;
            return $item;
        });

        return $tipos;
    }

    public function subsidiosId($id) {
        $subsidios = Subsidio::where('empresa_id', $id)->get();
        $subsidios = $subsidios->map(function ($item){
            $valores = SubsidioValor::where('subsidio_id', $item->id)->get();
            $item->valores = $valores;
            return $item;
        });
        return $subsidios;
    }

    public function store(Request $request, $id){
        $tipos = Subsidio::create([
            'empresa_id' => $id,
            'nome' => $request->nome,
            'tipo_tributo_inss' => $request->tributavel_ss_tipo,
            'valor_nao_tributavel_inss' => $request->valor_nt_inss,
            'tributavel_ss' => $request->tributavel_ss,
            'tipo_tributo_irt' => $request->tributavel_irt_tipo,
            'valor_nao_tributavel_irt' => $request->valor_nt_irt,
            'tributavel_irt' => $request->tributavel_irt,
            'sujeicao_falta' => $request->sujeicao_a_falta,
            'status' => 'activo'
        ]);
        $tipos = Subsidio::where('empresa_id', $id)->get();
        $tipos = $tipos->map(function ($item){
            $valores = SubsidioValor::where('subsidio_id', $item->id)->get();
            $item->valores = $valores;
            return $item;
        });
        return $tipos;

    }

    public function edit(Request $request, $id){

        $tipo = Subsidio::find($id);
        if (!$request->status){
            DB::table('subsidios')
            ->where('id', $id)
            ->update([
                'updated_at' => now(),
                'nome' => $request->nome,
                'tipo_tributo_inss' => $request->tributavel_ss_tipo,
                'valor_nao_tributavel_inss' => $request->valor_nt_inss,
                'tributavel_ss' => $request->tributavel_ss,
                'tipo_tributo_irt' => $request->tributavel_irt_tipo,
                'valor_nao_tributavel_irt' => $request->valor_nt_irt,
                'tributavel_irt' => $request->tributavel_irt,
                'sujeicao_falta' => $request->sujeicao_a_falta,
            ]);
        }else {
            $tipo->status = $request->status;
            $tipo->save();
        }
        $tipos = Subsidio::where('empresa_id', $request->empresa_id)->get();
        $tipos = $tipos->map(function ($item){
            $valores = SubsidioValor::where('subsidio_id', $item->id)->get();
            $item->valores = $valores;
            return $item;
        });
        return $tipos;

    }
}

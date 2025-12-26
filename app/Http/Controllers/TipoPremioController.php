<?php

namespace App\Http\Controllers;

use App\Premio;
use App\TipoPremio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TipoPremioController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all() {
        $tipos = TipoPremio::all();
        $tipos = $tipos->map(function ($item){
            $premios = Premio::where('tipo_id', $item->id)->get();
            $item->premios = $premios;
            return $item;
        });

        return $tipos;
    }

    public function premiosId($id) {
        $premios = TipoPremio::where('empresa_id', $id)->get();
        $premios = $premios->map(function ($item){
            $premios = Premio::where('tipo_id', $item->id)->get();
            $item->premios = $premios;
            return $item;
        });
        return $premios;
    }

    public function store(Request $request, $id){
        $tipos = TipoPremio::create([
            'empresa_id' => $id,
            'nome' => $request->nome,
            'valor_nao_tributavel_inss' => $request->valor_nt_inss,
            'tributavel_ss' => $request->tributavel_ss,
            'valor_nao_tributavel_irt' => $request->valor_nt_irt,
            'tributavel_irt' => $request->tributavel_irt,
            'sujeicao_falta' => $request->sujeicao_a_falta,
            'status' => 'activo'
        ]);
        $tipos = TipoPremio::where('empresa_id', $id)->get();
        // $contas = $contas->map(function ($item){
        //     $subcontas = Subcontas::where('conta_id', $item->id)->get();
        //     $item->subcontas = $subcontas;
        //     return $item;
        // });
        return $tipos;

    }

    public function edit(Request $request, $id){

        $tipo = TipoPremio::find($id);
        if (!$request->status){
            DB::table('tipo_premios')
            ->where('id', $id)
            ->update([
                'updated_at' => now(),
                'nome' => $request->nome,
                'valor_nao_tributavel_inss' => $request->valor_nt_inss,
                'tributavel_ss' => $request->tributavel_ss,
                'valor_nao_tributavel_irt' => $request->valor_nt_irt,
                'tributavel_irt' => $request->tributavel_irt,
                'sujeicao_falta' => $request->sujeicao_a_falta,
            ]);
        }else {
            $tipo->status = $request->status;
            $tipo->save();
        }
        $tipos = TipoPremio::where('empresa_id', $request->empresa_id)->get();
        $tipos = $tipos->map(function ($item){
            $premios = Premio::where('tipo_id', $item->id)->get();
            $item->premios = $premios;
            return $item;
        });
        return $tipos;

    }
}

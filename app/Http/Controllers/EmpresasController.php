<?php

namespace App\Http\Controllers;

use App\Departamentos;
use App\Modelos\Empresa;
use App\Modelos\Polo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EmpresasController extends Controller
{
    public function all(){
        $empresas = DB::table('empresas')
        ->get();
        $empresas = $empresas->map(function ($item) {
            $regime = DB::table('regimes')->where('id', $item->regime_id)->first();
            $item->regime = $regime;
            $polos = Polo::where('empresa_id', $item->id)->get();
            $item->polos = $polos;
            $item->departamentos = Departamentos::where('empresa_id', $item->id)->get();
            return $item;
        });
        return $empresas;
    }
    public function store(Request $request) {
        $imageData = base64_decode($request->input('image'));
        $filename = 'image_'.time(). '.'.$request->extension;
        $path = Storage::put('logos/imagens/' . $filename, $imageData);
        $empresa = Empresa::create([
            'regime_id'=> $request->id,
            'nome_empresa'=> $request->nome,
            'tipo' => $request->tipo,
            'num_contribuinte' => $request->num,
            'registo_comercial' => $request->registo,
            'designacao_comercial' => $request->designacao,
            'pais' => $request->pais,
            'logo'=> 'logos/imagens/'.$filename,
            'status' => 'activo'
        ]);
        $empresas = Empresa::all();
        $empresas = $empresas->map(function ($item) {
            $regime = DB::table('regimes')->where('id', $item->regime_id)->first();
            $item->regime = $regime;
            return $item;
        });
        return $empresas;
    }
    public function edit(Request $request, $id){

        $empresa = Empresa::find($id);
        if (!$request->status){
            $empresa->regime_id = $request->id;
            $empresa->nome_empresa = $request->nome;
            $empresa->tipo = $request->tipo;
            $empresa->num_contribuinte = $request->num;
            $empresa->registo_comercial = $request->registo;
            $empresa->designacao_comercial = $request->designacao;
            $empresa->pais = $request->pais;

            if ($request->image){
                $imageData = base64_decode($request->input('image'));
                $filename = 'image_'.time(). '.'.$request->extension;
                $path = Storage::put('logos/imagens/' . $filename, $imageData);
                $empresa->logo = 'logos/imagens/'.$filename;
            }


            $empresa->save();

        }else {
            $empresa->status = $request->status;
            $empresa->save();
        }

        $regime = DB::table('regimes')->where('id', $empresa->regime_id)->first();
        $empresa->regime = $regime;
        return $empresa;

    }
}

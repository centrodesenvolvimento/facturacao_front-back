<?php

namespace App\Http\Controllers;

use App\AssinaturasFolha;
use App\Cargo;
use App\ContractoCategoria;
use App\Departamentos;
use App\Models\Empresa;
use App\Nivel;
use App\Premio;
use App\Publicacao;
use App\SubPublicacoes;
use App\Subsidio;
use App\SubsidioValor;
use App\TaxasIrt;
use App\TipoPremio;
use App\VinculosLaborais;
use Illuminate\Http\Request;

class VinculosLaboraisController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $vinculos = VinculosLaborais::all();
        $vinculos = $vinculos->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $vinculos;
    }

    public function empresaVinculos($id)
    {
        $vinculos = VinculosLaborais::where('empresa_id', $id)->get();
        $vinculos = $vinculos->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $vinculos;
    }

    public function store(Request $request, $id) {

        $vinculo = VinculosLaborais::create([
            'nome'=> $request->nome,
            'descricao'=> $request->descricao,
            'empresa_id' => $id,
            'status' => 'activo',
        ]);
        $vinculos = VinculosLaborais::where('empresa_id', $id)->get();
        return $vinculos;
    }
    public function edit(Request $request, $id){

        $vinculo = VinculosLaborais::find($id);
        if (!$request->status){
            $vinculo->nome = $request->nome;
            $vinculo->descricao = $request->descricao;
            $vinculo->save();
        }else {
            $vinculo->status = $request->status;
            $vinculo->save();
        }
        $vinculos = VinculosLaborais::where('empresa_id', $request->empresa_id)->get();
        $vinculos = $vinculos->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            return $item;
        });
        return $vinculos;

    }

    public function contractoInfo($id){
        $departamentos = Departamentos::where('empresa_id', $id)->get();

        $subsidios = Subsidio::where('empresa_id', $id)->get();
        $subsidios = $subsidios->map(function ($item){
            $valores = SubsidioValor::where('subsidio_id', $item->id)->get();
            $item->valores = $valores;
            return $item;
        });

        $premios = TipoPremio::where('empresa_id', $id)->get();
        $premios = $premios->map(function ($item){
            $premios = Premio::where('tipo_id', $item->id)->get();
            $item->premios = $premios;
            return $item;
        });
        $publicacoes = Publicacao::where('empresa_id', $id)->get();
        $publicacoes = $publicacoes->map(function ($item){
            $publicacoes = SubPublicacoes::where('tipo_id', $item->id)->get();
            $item->publicacoes = $publicacoes;
            return $item;
        });

        $niveis = Nivel::where('empresa_id', $id)->get();

        $cargos = Cargo::where('empresa_id', $id)->get();

        $categorias = ContractoCategoria::where('empresa_id', $id)->get();

        $vinculos = VinculosLaborais::where('empresa_id', $id)->get();

        $taxasIrt = TaxasIrt::where(
            'status', 'activo'
        )
        ->get();

        $assinaturas = AssinaturasFolha::where('empresa_id', $id)
        ->get();



        return response()->json([
            'departamentos' => $departamentos,
            'subsidios' => $subsidios,
            'tipos_premios' => $premios,
            'niveis' => $niveis,
            'cargos' => $cargos,
            'categorias' => $categorias,
            'publicacoes' => $publicacoes,
            'vinculos' => $vinculos,
            'taxasIrt' => $taxasIrt,
            'assinaturas' => $assinaturas
        ]);

    }
}

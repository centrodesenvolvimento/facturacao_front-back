<?php

namespace App\Http\Controllers;

use App\Contrato;
use App\ControlePresenca;
use App\Funcionario;
use App\VinculosLaborais;
use Illuminate\Http\Request;
use Mockery\Undefined;

class ControlePresencaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function empresaPresencas($id)
    {
        $ano_id = request()->query('ano');

        if ($ano_id) {
            $lista = ControlePresenca::where('empresa_id', $id)
                ->where('ano_id', $ano_id)
                ->with(['departamento', 'vinculo'])
                ->get();
        } else {
            $lista = ControlePresenca::where('empresa_id', $id)
                ->with(['departamento', 'vinculo'])
                ->get();
        }
        return $lista;
    }


    public function pesquisa(Request $request)
    {
        $empresa_id = request()->query('empresa');
        $ano_id = request()->query('ano');
        $mes = request()->query('month');
        $departamento_id = request()->query('departamento') ? request()->query('departamento') : null;

        $vinculo_id = request()->query('vinculo');


        $exists = ControlePresenca::where('empresa_id', $empresa_id)
            ->where('ano_id', $ano_id)
            ->where('mes', $mes)
            ->where('departamento_id', $departamento_id)
            ->where('tipo', $vinculo_id)
            ->exists();

        if ($exists) {

            $exists = ControlePresenca::where('empresa_id', $empresa_id)
                ->where('ano_id', $ano_id)
                ->where('mes', $mes)
                ->where('departamento_id', $departamento_id)
                ->where('tipo', $vinculo_id)
                ->first();
            return response()->json([
                'response' => $departamento_id,
                'presenca' => $exists,
                'empresa_id'=> $empresa_id,
                'ano_id' => $ano_id,
                'mes' => $mes,
                'departamento_id' => $departamento_id
            ]);
        } else {
            //pegar todos os funcionarios que facam parte de x departamento com base no departamento_id field da tabela contrato
            $funcionarios = Funcionario::with(['contrato' => function ($query) use ($departamento_id) {
                if ($departamento_id !== null) {
                    $query->with(['polo', 'departamento'])
                    ->where('departamento_id', $departamento_id)
                    ->latest();
                } else {
                    $query->where('departamento_id', '!=', null)
                    ->latest();
                }

            }])->whereHas('contrato', function ($query) use ($departamento_id) {
                if ($departamento_id !== null) {
                    $query->where('departamento_id', $departamento_id);
                } else {
                    $query->where('departamento_id', '!=', null);
                }
            })
            ->whereHas('contrato', function ($query) use ($vinculo_id) {
                $query->where('vinculo', $vinculo_id);
            })
            ->orderBy('nome')
            ->get();

            $funcionarios = $funcionarios->map(function ($item) {
                $item->contratos = Contrato::where('funcionario_id', $item->id)->with(['polo', 'departamento'])->get();

                $item->vinculo_nome = VinculosLaborais::where('id', $item->contrato[0]->vinculo)->first()->nome;
                return $item;
            });
            return response()->json([
                'response' => $vinculo_id,
                'funcionarios' => $funcionarios,
                'empresa_id'=> $empresa_id,
                'ano_id' => $ano_id,
                'mes' => $mes,
                'departamento_id' => $departamento_id
            ]);
        }
    }

    public function pesquisaMissing(Request $request)
    {
        $empresa_id = request()->query('empresa');
        $departamento_id = request()->query('departamento') ? request()->query('departamento') : null;

        $vinculo_id = request()->query('vinculo');

        $funcionarios = Funcionario::with(['contrato' => function ($query) use ($departamento_id) {
                if ($departamento_id !== null) {
                    $query->with(['polo', 'departamento'])
                    ->where('departamento_id', $departamento_id)
                    ->latest();
                } else {
                    $query->where('departamento_id', '!=', null)
                    ->latest();
                }

            }])->whereHas('contrato', function ($query) use ($departamento_id) {
                if ($departamento_id !== null) {
                    $query->where('departamento_id', $departamento_id);
                } else {
                    $query->where('departamento_id', '!=', null);
                }
            })
            ->whereHas('contrato', function ($query) use ($vinculo_id) {
                $query->where('vinculo', $vinculo_id);
            })
            ->orderBy('nome')
            ->get();

            $funcionarios = $funcionarios->map(function ($item) {
                $item->contratos = Contrato::where('funcionario_id', $item->id)->with(['polo', 'departamento'])->get();

                $item->vinculo_nome = VinculosLaborais::where('id', $item->contrato[0]->vinculo)->first()->nome;
                return $item;
            });
            return response()->json([
                'response' => $vinculo_id,
                'funcionarios' => $funcionarios,
                'empresa_id'=> $empresa_id,
                'departamento_id' => $departamento_id,
                'vinculo_id' => $vinculo_id
            ]);
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
    public function store(Request $request)
    {

        $presenca = ControlePresenca::create([
            'empresa_id' => $request->empresa_id,
            'ano_id' => $request->ano_id,
            'departamento_id' => $request->departamento_id,
            'mes' => $request->mes,
            'lista' => $request->lista,
            'taxa' => $request->taxa,
            'tipo' => $request->tipo,
            'status' => 'aberto',

        ]);
        $presencas = ControlePresenca::all();
        return $presencas;
    }
    public function edit(Request $request, $id){
        $presenca = ControlePresenca::find($id);
        if (!$request->status){
            $presenca->lista = $request->lista;
            $presenca->save();
        }else {
            $presenca->status = $request->status;
            $presenca->save();
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\ControlePresenca  $controlePresenca
     * @return \Illuminate\Http\Response
     */
    public function show(ControlePresenca $controlePresenca)
    {
        //
    }



    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\ControlePresenca  $controlePresenca
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, ControlePresenca $controlePresenca)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\ControlePresenca  $controlePresenca
     * @return \Illuminate\Http\Response
     */
    public function destroy(ControlePresenca $controlePresenca)
    {
        //
    }
}

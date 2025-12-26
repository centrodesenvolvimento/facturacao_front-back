<?php

namespace App\Http\Controllers;

use App\Adiantamento;
use App\Contrato;
use Illuminate\Http\Request;

class AdiantamentoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function empresaAdiantamentos($id)
    {

        $ano_id = request()->query('ano');

        if ($ano_id) {
            $lista = Adiantamento::with(['funcionario'])
                ->where('ano_id', $ano_id)
                ->whereHas('funcionario', function ($query) use ($id) {
                    $query->where('empresa_id', $id);
                })->get();

            // Group by mes
            $grouped = $lista->groupBy(function ($item) {
                return $item->mes;
            });

            $result = [];
            foreach ($grouped as $key => $items) {
                $result[] = [
                    'ano_id' => $items->first()->ano_id,
                    'mes' => $items->first()->mes,
                    // 'lista' => $items->pluck('mes'),
                    'lista' => $items->map(function ($item){
                        $item->contrato = Contrato::where('funcionario_id', $item->funcionario_id)->with(['departamento'])
                        ->latest()
                        ->first();
                        return $item;
                    })
                ];
            }

            return $result;
        } else {
            $lista = Adiantamento::with(['funcionario'])
                ->whereHas('funcionario', function ($query) use ($id) {
                    $query->where('empresa_id', $id);
                })->get();
            return $lista;
        }
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

        $months = $request->input('selMonths');
        $created = [];

        foreach ($months as $month) {
            $adiantamento = Adiantamento::create([
                'funcionario_id' => $request->funcionario_id,
                'ano_id' => $request->ano,
                'valorTotal' => $request->valor,
                'valorDebito' => $month['valor1'],
                'mes' => $month['mes'],
            ]);
            $created[] = $adiantamento;
        }
        return response()->json([
            'created' => $created,
        ]);
    }
    public function existing(Request $request)
    {
        $ano_id = request()->query('ano');
        $funcionario_id = request()->query('funcionario');

        $lista = Adiantamento::where('ano_id', $ano_id)
            ->where('funcionario_id', $funcionario_id)
            ->get();


        // Group by funcionario_id, ano_id, and valorTotal
        $grouped = $lista->groupBy(function ($item) {
            return $item->funcionario_id . '-' . $item->ano_id . '-' . $item->valorTotal;
        });

        $result = [];
        foreach ($grouped as $key => $items) {
            $result[] = [
                'funcionario_id' => $items->first()->funcionario_id,
                'ano_id' => $items->first()->ano_id,
                'valorTotal' => $items->first()->valorTotal,
                'meses' => $items->pluck('mes'),
                'adiantamentos' => $items
            ];
        }

        return $result;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Adiantamento  $adiantamento
     * @return \Illuminate\Http\Response
     */
    public function show(Adiantamento $adiantamento)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Adiantamento  $adiantamento
     * @return \Illuminate\Http\Response
     */
    public function edit(Adiantamento $adiantamento)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Adiantamento  $adiantamento
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Adiantamento $adiantamento)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Adiantamento  $adiantamento
     * @return \Illuminate\Http\Response
     */
    public function destroy(Adiantamento $adiantamento)
    {
        //
    }
}

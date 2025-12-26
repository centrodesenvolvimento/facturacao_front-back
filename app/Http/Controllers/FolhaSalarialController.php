<?php

namespace App\Http\Controllers;

use App\ControlePresenca;
use App\Departamentos;
use App\FolhaSalarial;
use App\Modelos\Polo;
use App\VinculosLaborais;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use PDO;

class FolhaSalarialController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function empresaFolhas($id)
    {
        $ano_id = request()->query('ano');
        $mapa = request()->query('mapaTributos');


        if ($ano_id) {
            if (!$mapa) {
                $lista = FolhaSalarial::where('empresa_id', $id)
                    ->where('ano_id', $ano_id)
                    ->get();

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
                        'lista' => $items->map(function ($item) {
                            $item->departamentosFull = collect($item->departamentos)->map(function ($item) {
                                return Departamentos::where('id', $item)->first();
                            })->values();

                            $item->poloFull = Polo::where('id', $item->polo_id)->first();
                            $item->vinculoFull = VinculosLaborais::where('id', $item->vinculo_id)->first();
                            return $item;
                        })
                    ];
                }

                return $result;
            } else {
                $lista = FolhaSalarial::where('empresa_id', $id)
                    ->where('ano_id', $ano_id)
                    ->get();

                // First group by 'mes'
                $groupedByMes = $lista->groupBy('mes');

                $result = [];

                foreach ($groupedByMes as $mes => $itemsByMes) {
                    // Then group by 'polo_id' within each 'mes'
                    $groupedByPolo = $itemsByMes->groupBy('polo_id');

                    $polosArray = [];

                    foreach ($groupedByPolo as $polo_id => $items) {
                        $polosArray[] = [
                            'polo_id' => $polo_id,
                            'poloFull' => Polo::where('id', $polo_id)->first(),
                            'lista' => $items->map(function ($item) {
                                $item->departamentosFull = collect($item->departamentos)->map(function ($deptId) {
                                    return Departamentos::where('id', $deptId)->first();
                                })->values();

                                $item->vinculoFull = VinculosLaborais::where('id', $item->vinculo_id)->first();
                                return $item;
                            })
                        ];
                    }

                    $result[] = [
                        'ano_id' => $itemsByMes->first()->ano_id,
                        'mes' => $mes,
                        'polos' => $polosArray, // Each mes now contains multiple polos
                    ];
                }

                return $result;
            }
        } else {
            $lista = FolhaSalarial::where('empresa_id', $id)
                ->get();
            return $lista;
        }
    }





    public function recibo(Request $request)
    {

        $empresaId = $request->empresa_id;
        $funcionario_id = $request->funcionario_id;
        $ano = $request->ano;
        $mes = $request->mes;

        $folha = FolhaSalarial::where('mes', $mes)
            ->where('empresa_id', $empresaId)
            ->where('ano_id', $ano)
            ->where(function ($query) use ($funcionario_id) {
                $query->whereJsonContains('funcionarios', [['id' => $funcionario_id]]);
            })
            ->first();
        if ($folha) {
            $folha->poloFull = Polo::where('id', $folha->polo_id)->first();
        }

        return $folha;
    }

    public function send(Request $request)
    {


        if ($request->hasFile('pdf')) {
            $pdf = $request->file('pdf');
            $email = $request->input('email');
            // $pdfContent = file_get_contents($odf->getRealPath()); // Get PDF content as a string

            try {
                $pdfPath = 'faturas/factura_' . $request->name . '.pdf';

                Storage::put($pdfPath, file_get_contents($pdf));

                $fullPath = storage_path('app/public/' . $pdfPath);



                Mail::send([], [], function ($message) use ($request, $fullPath) {
                    $message->from($request->from, $request->empresa)
                        ->to($request->email)
                        ->subject('Sua Fatura de Vencimento')
                        ->attach($fullPath, [
                            'as' => 'fatura.pdf',
                            'mime' => 'application/pdf',
                        ]);
                });
                Storage::delete($pdfPath);

                return response()->json(['message' => 'PDF sent successfully!'], 200);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(), // Detailed error trace
                    'request' => $request->all(),
                    'files' => $request->files->all()
                ], 500);
            }
        } else {
            return response()->json(['error' => $request->all()], 400);
        }
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {

        $folha = FolhaSalarial::create([
            'empresa_id' => $request->empresa_id,
            'ano_id' => $request->ano_id,
            'polo_id' => $request->polo_id,
            'vinculo_id' => $request->vinculo_id,
            'mes' => $request->mes,
            'funcionarios' => $request->funcionarios,
            'departamentos' => $request->departamentos,
            'subsidios' => $request->subsidios,
            'premios' => $request->premios,
            'totais' => $request->totais,
            'status' => 'aberto',
        ]);
        $lista = FolhaSalarial::where('empresa_id', $request->empresa_id)
            ->where('ano_id', $request->ano_id)
            ->get();

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
                'lista' => $items->map(function ($item) {
                    $item->departamentosFull = collect($item->departamentos)->map(function ($item) {
                        return Departamentos::where('id', $item)->first();
                    })->values();

                    $item->poloFull = Polo::where('id', $item->polo_id)->first();
                    $item->vinculoFull = VinculosLaborais::where('id', $item->vinculo_id)->first();
                    return $item;
                })
            ];
        }

        return $result;
    }

    public function edit(Request $request, $id)
    {

        $folha = FolhaSalarial::find($id);
        if (!$request->status) {
            $folha->departamentos = $request->departamentos;
            $folha->funcionarios = $request->funcionarios;
            $folha->subsidios = $request->subsidios;
            $folha->premios = $request->premios;
            $folha->totais = $request->totais;
            $folha->save();
        } else {
            $folha->status = $request->status;
            $folha->save();
        }

        $lista = FolhaSalarial::where('empresa_id', $request->empresa_id)
            ->where('ano_id', $request->ano_id)
            ->get();

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
                'lista' => $items->map(function ($item) {
                    $item->departamentosFull = collect($item->departamentos)->map(function ($item) {
                        return Departamentos::where('id', $item)->first();
                    })->values();

                    $item->poloFull = Polo::where('id', $item->polo_id)->first();
                    $item->vinculoFull = VinculosLaborais::where('id', $item->vinculo_id)->first();
                    return $item;
                })
            ];
        }

        return $result;
    }

    public function closeMonth(Request $request)
    {
        if ($request->has('folhas') && is_array($request->input('folhas'))) {
            $idsToUpdate = $request->input('folhas');

            FolhaSalarial::whereIn('id', $idsToUpdate)
                ->update(['status' => 'Mês Fechado']);
            ControlePresenca::where('empresa_id', $request->empresa_id)
                ->where('ano_id', $request->ano_id)
                ->where('mes', $request->mes)
                ->update(['status' => 'fechado']);
        }

        $lista = FolhaSalarial::where('empresa_id', $request->empresa_id)
            ->where('ano_id', $request->ano_id)
            ->get();

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
                'lista' => $items->map(function ($item) {
                    $item->departamentosFull = collect($item->departamentos)->map(function ($item) {
                        return Departamentos::where('id', $item)->first();
                    })->values();

                    $item->poloFull = Polo::where('id', $item->polo_id)->first();
                    $item->vinculoFull = VinculosLaborais::where('id', $item->vinculo_id)->first();
                    return $item;
                })
            ];
        }

        return $result;
    }


    /**
     * Display the specified resource.
     *
     * @param  \App\FolhaSalarial  $FolhaSalarial
     * @return \Illuminate\Http\Response
     */
    public function show(FolhaSalarial $FolhaSalarial)
    {
        //
    }



    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\FolhaSalarial  $FolhaSalarial
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, FolhaSalarial $FolhaSalarial)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\FolhaSalarial  $FolhaSalarial
     * @return \Illuminate\Http\Response
     */
    public function destroy(FolhaSalarial $FolhaSalarial)
    {
        //
    }
}

<?php

namespace App\Http\Controllers;

use App\Departamentos;
use App\Modelos\Empresa;
use App\Modelos\Polo;
use App\Transacao;
use Illuminate\Http\Request;

class TransacaoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $transacoes = Transacao::all();
        $transacoes = $transacoes->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            $item->departamento = Departamentos::where('id', $item->departamento_id)->first();
            $item->polo = Polo::where('id', $item->polo_id)->first();
            return $item;
        });
        return $transacoes;
    }

    public function empresaTransacoes($id)
    {
        $transacoes = Transacao::where('empresa_id', $id)->get();
        $transacoes = $transacoes->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            $item->departamento = Departamentos::where('id', $item->departamento_id)->first();
            $item->polo = Polo::where('id', $item->polo_id)->first();
            return $item;
        });
        return $transacoes;
    }

    public function store(Request $request, $id) {

        $transacao = Transacao::create([
            'descricao'=> $request->descricao,
            'empresa_id' => $id,
            'departamento_id' => $request->departamento_id,
            'polo_id' => $request->polo_id,
            'valorTotal' => $request->valorTotal,
            'debitos' => $request->debitos,
            'creditos' => $request->creditos,
            'data' => $request->data,
            'status' => 'activo',
        ]);
        $transacoes = Transacao::where('empresa_id', $id)->get();
        $transacoes = $transacoes->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            $item->departamento = Departamentos::where('id', $item->departamento_id)->first();
            $item->polo = Polo::where('id', $item->polo_id)->first();
            return $item;
        });
        return $transacoes;
    }
    public function edit(Request $request, $id){

        $transacao = Transacao::find($id);
        if (!$request->status){
            $transacao->descricao = $request->descricao;
            $transacao->departamento_id = (int) $request->departamento_id;
            $transacao->polo_id = (int) $request->polo_id;
            $transacao->valorTotal = $request->valorTotal;
            $transacao->debitos = $request->debitos;
            $transacao->creditos = $request->creditos;
            $transacao->data = $request->data;
            $transacao->save();
        }else {
            $transacao->status = $request->status;
            $transacao->save();
        }
        $transacoes = Transacao::where('empresa_id', $request->empresa_id)->get();
        $transacoes = $transacoes->map(function ($item) {
            $item->empresa = Empresa::where('id', $item->empresa_id)->first();
            $item->departamento = Departamentos::where('id', $item->departamento_id)->first();
            $item->polo = Polo::where('id', $item->polo_id)->first();
            return $item;
        });
        return $transacoes;

    }
}

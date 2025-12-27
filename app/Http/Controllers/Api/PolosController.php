<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Empresa;
use App\Models\Isencao;
use App\Models\Polo;

class PolosController extends Controller
{
    public function __construct()
    {
        $this->polo = new Polo();

    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    public function polosActivosEmpresa($id)
    {
        $polos = $this->polo->polosActivosEmpresa($id);
        return $polos;
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
        try{
            $validator = Validator::make($request->all(), [
                'empresa_id' => 'required',
                'nome_polo' => 'required',
                'localizacao' => 'required',
                'telemovel' => 'required',
                'email' => 'required|email',
             ], $messages = [
                'required' => 'Este campo é obrigatório',
                'email' => 'Formato de email incorrecto',
             ]);
            if ($validator->fails()):
                return response()->json(['errors' => $validator->errors()], 422);
            else:
                $create = $this->polo->store($request);

                if($create == 'sucesso'):
                    return response()->json([
                        "message" => "Polo registado com sucesso.",
                        "status" => 201
                    ], 201);
                endif;
                if($create == 'erro'):
                    return response()->json([
                        "message" => "Erro no registo do polo, contacte o Adminstrador",
                        "status" => 422
                    ], 422);
                endif;
                if($create == 'existe'):
                    return response()->json([
                        "message" => "Já existe um polo com essa designação!",
                        "status" => 422
                    ], 422);
                endif;
            endif;
        }
        catch (Exception $e) {
            return ['error' => $e];
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}

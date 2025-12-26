<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Modelos\Empresa;

class EmpresasController extends BaseController
{
    public function __construct()
    {
        parent::__construct(Empresa::class);
        $this->empresas = new Empresa();
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return BaseController::index();
    }

    public function empresasActivas()
    {
        $empresas = $this->empresas->empresasActivas();
        return $empresas;
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
                'regime_id' => 'required',
                'nome_empresa' => 'required|unique:empresas,nome_empresa',
                'num_contribuinte' => 'required|unique:empresas,num_contribuinte',
                'status' => 'required'
             ], $messages = [
                'required' => 'Este campo é obrigatório',
                'num_contribuinte.unique' => 'Este NIF já existe',
                'nome_empresa.unique' => 'Este nome de empresa já existe'
             ]);
            if ($validator->fails()):
                return response()->json(['errors' => $validator->errors()], 422);
            else:
                if(BaseController::store($request)):
                    return response()->json([
                        "message" => "Empresa registada com sucesso.",
                        "status" => 201
                    ], 201);
                else:
                    return response()->json([
                        "message" => "Erro no registo da empresa, contacte o Adminstrador",
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
        return BaseController::show($id);
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
        try{
            $validator = Validator::make($request->all(), [
                'nome_empresa' => 'required',
                'num_contribuinte' => 'required',
             ], $messages = [
                'required' => 'Este campo é obrigatório',
             ]);
            if ($validator->fails()):
                return response()->json(['errors' => $validator->errors()], 422);
            else:
                if(BaseController::update($request, $id)):
                    return response()->json([
                        "message" => "Dados alterados com sucesso.",
                        "status" => 201
                    ], 201);
                else:
                    return response()->json([
                        "message" => "Erro alterar os dados da empresa, contacte o Adminstrador",
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

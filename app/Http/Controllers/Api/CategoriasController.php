<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Modelos\Familia;
use App\Modelos\Categoria;

class CategoriasController extends BaseController
{
    public function __construct()
    {
        parent::__construct(Categoria::class);
        $this->categoria = new Categoria();
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

    public function categoriasActivas($id)
    {
        $categorias = $this->categoria->categoriasActivas($id);
        return $categorias;
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
                'familia_id' => 'required',
                'designacao' => 'required|unique:categorias,designacao',
                'status' => 'required'
             ], $messages = [
                'required' => 'Este campo é obrigatório',
                'unique' => 'Esta uma designação já existe'
             ]);
            if ($validator->fails()):
                return response()->json(['errors' => $validator->errors()], 422);
            else:
                if(BaseController::store($request)):
                    return response()->json([
                        "message" => "Categoria registada com sucesso.",
                        "status" => 201
                    ], 201);
                else:
                    return response()->json([
                        "message" => "Erro no registo da categoria, contacte o Adminstrador",
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
                'designacao' => 'required',
             ], $messages = [
                 'required' => 'Este campo é obrigatório',
                 'unique' => 'Esta designação já existe'
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
                        "message" => "Erro alterar os dados da categoria, contacte o Adminstrador",
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

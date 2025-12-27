<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\Familia;
use App\Models\Categoria;
use App\Models\Artigo;

class ArtigosController extends Controller
{
    public function __construct()
    {
        //$this->middleware('auth:api', ['except' => ['login']]);
        $this->artigos = new Artigo();
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $artigos = $this->artigos->artigos();
        $artigos = $artigos->getData();
        $artigos = json_decode(json_encode($artigos), true);

        $artigos = collect($artigos)->map(function ($artigo) {
            if ($artigo) {
                $artigo = (object) $artigo; // Convert array to object
                $artigo->categoriaFull = Categoria::find($artigo->categoria_id);
                $artigo->tipoArtigoFull = DB::table('tipos_artigos')->where('id', $artigo->tipo_artigo_id)->first();
                $artigo->impostoFull = DB::table('impostos')->where('id', $artigo->imposto_id)->first();
                $artigo->unidadeFull = DB::table('unidades_medida')->where('id', $artigo->unidade_id)->first();
                $artigo->isencaoFull = DB::table('isencoes')->where('id', $artigo->isencao_id)->first();
                $artigo->imagemFull = DB::table('imagens_artigos')->where('artigo_id', $artigo->id)->first();
                return $artigo;
            } else {
                return null;
            }
        });


        return $artigos;
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
        try {
            $validator = Validator::make($request->all(), [
                'categoria_id' => 'required',
                'tipo_artigo_id' => 'required',
                'unidade_id' => 'required',
                'designacao' => 'required',
                'preco_venda' => 'required',
            ], [
                'required' => 'Este campo é obrigatório',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    "message" => $validator->errors(),
                    "status" => 422
                ], 422);
            }

            $artigo = $this->artigos->store($request);

            return response()->json([
                "message" => $artigo === 'sucesso' ? "Artigo registado com sucesso" : "Erro no registo, contacte o administrador",
                "status" => $artigo === 'sucesso' ? 201 : 403
            ], $artigo === 'sucesso' ? 201 : 403);
        } catch (Exception $e) {
            return response()->json(['error' => 'Erro inesperado, consulte o administrador'], 500);
        }
    }

    public function storePreco($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'preco_venda' => 'required',
            ], [
                'required' => 'Este campo é obrigatório',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    "message" => $validator->errors(),
                    "status" => 422
                ], 422);
            }

            $preco = $this->artigos->storePreco($id, $request);

            return response()->json([
                "message" => $preco === 'sucesso' ? "Preço registado com sucesso" : "Erro no registo, contacte o administrador",
                "status" => $preco === 'sucesso' ? 201 : 403
            ], $preco === 'sucesso' ? 201 : 403);
        } catch (Exception $e) {
            return response()->json(['error' => 'Erro inesperado, consulte o administrador'], 500);
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
        $artigo = $this->artigos->getArtigo($id);
        return $artigo;
    }

    public function getPreco($id)
    {
        $preco = $this->artigos->getPreco($id);
        return $preco;
    }

    public function getPrecos($id)
    {
        $precos = $this->artigos->getPrecos($id);
        return $precos;
    }

    public function getImagem($id)
    {
        $img = $this->artigos->getImagem($id);
        return $img;
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
                'categoria_id' => 'required',
                'tipo_artigo_id' => 'required',
                'unidade_id' => 'required',
                'imposto_id' => 'required',
                'designacao' => 'required',
             ], $messages = [
                'required' => 'Este campo é obrigatório',
            ]);
            if ($validator->fails()):
                return response()->json([
                    "message" => $validator->errors(),
                    "status" => 422
                ], 422);
            else:
                $artigo = $this->artigos->updateArtigo($id, $request);
                if($artigo === 'sucesso'):
                    return response()->json([
                        "message" => "Dados do artigo alterados com sucesso",
                        "status" => 201
                    ], 201);
                else:
                    return response()->json([
                        "message" => "Erro no alterar dados do artigo, contacte o adminstrador",
                        "status" => 403
                    ], 403);
                endif;
            endif;
        }catch (Exception $e) {
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

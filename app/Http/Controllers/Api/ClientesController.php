<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Modelos\Clientes;
use App\Modelos\Contacto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class ClientesController extends BaseController
{
    protected $modelos_contato;
    public function __construct()
    {
        parent::__construct(Clientes::class);
        $this->modelos_contato = new Contacto();
        $this->modelos_clientes = new Clientes();
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // $req = 2;
        // $cliente_date = Clientes::paginate(10);
        // $_SEESION['dados_usuario'];
        $cliente_date = Clientes::all();
        return response()->json($cliente_date);
        // return BaseController::index();
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        
        try{
            $validator = Validator::make($request->all(), [
                'nif' => 'required|unique:clientes,nif',
                'nome' => 'required|min:2',
                'email' => 'required|email'
             ], $messages = [
                 'required' => 'Este campo é obrigatório',
                 'unique' => 'Este NIF já existe',
                 'email' => 'Formato de email incorrecto ex: exe@level-soft.com',
                 'min' => 'No mínimo dois(2) caracteres para este campo',
             ]);
            if ($validator->fails()):
                return response()->json([
                    "message" => $validator->errors(),
                    "status" => 422
                ], 422);
            else:
            
                $t = $this->modelos_clientes->insertGetIdCliente($request);
                if($t === 'sucesso'):
                    return response()->json([
                        "message" => "Usuario registado com sucesso",
                        "status" => 201
                    ], 201);
                else:
                    return response()->json([
                        "message" => "Erro no registo, contacte o adminstrador",
                        "status" => 403
                    ], 403);
                endif;
                return $t;
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
        try{
            $cliente_date = Clientes::
                            where('clientes.id', $id)
                            ->join('contactos', 'contactos.cliente_id', 'clientes.id')
                            ->select('clientes.*', 'contactos.telefone', 'contactos.email', 'contactos.telemovel', 'contactos.site')
                            ->first();
            return $cliente_date;
        }
        catch (Exception $e) {
            return ['error' => $e];
        }
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
        // return BaseController::update($request, $id);

        if($request->factura_eletronica == 0):
            $factura_value = NULL;
        else:
            $factura_value = 1;
        endif;
        if($request->retencao == 0):
            $retencao_value = NULL;
        else:
            $retencao_value = 1;
        endif;
        Clientes::where('id', $id)
        ->update([
            'nome' => $request->nome,
            'nif' => $request->nif,
            'pais' => $request->pais,
            'morada' => $request->morada,
            'localidade' => $request->localidade,
            'retencao' => $retencao_value,
            'factura_eletronica' => $factura_value,
            'observacoes' => $request->observacoes,
            'localizacao' => $request->localizacao,
        ]);
        Contacto::where('cliente_id', $id)
        ->update([
            'telefone' => $request->telefone,
            'telemovel' => $request->telemovel,
            'email' => $request->email,
            'site' => $request->site,
        ]);

        return response()->json([
            "message" => "Dados alterados com sucesso",
            "status" => 201
        ], 201);

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
        try{
            if(BaseController::destroy($id)):
                return response()->json([
                    "message" => "Cliente apagado com sucesso.",
                    "status" => 201
                ], 201);
            else:
                return response()->json([
                    "message" => "Erro ao apagar o cliente",
                    "status" => 422
                ], 422);
            endif;
        }
        catch (Exception $e) {
            return ['error' => $e];
        }

    }
}

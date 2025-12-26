<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class UserApiController extends Controller
{
    public function __construct()
    {
        // $this->middleware('auth:api', ['except' => ['login']]);
        $this->usuarios = new User();
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // $users = $this->usuarios->getUsers();

        $users = DB::table('users');
        if ($request->has('search') && !empty($request->search)) {
            $users->where('name', 'like', '%' . $request->search . '%');
        }

        $users = $users->paginate(16);

        $totalPages = $users->lastPage(); 


        $usersCollection = $users->getCollection()->map(function ($item) {
            $item->modulos = DB::table('modulos_users')
                ->where('user_id', $item->id)
                ->where('status', 'activo')
                ->get();

            return $item;
        });


        return response()->json([
            'data' => $usersCollection, // Paginated items
            'total_pages' => $totalPages,
            'current_page' => $users->currentPage(),
            'per_page' => $users->perPage(),
            'total' => $users->perPage(),
            'total' => $users->total(), // Total records
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
        $validator = Validator::make($request->all(), [
            'papel' => 'required',
            'nome' => 'required|min:2',
            'email' => 'required|email|unique:users,email',
        ], $messages = [
            'required' => 'Este campo é obrigatório',
            'email.unique' => 'Este email já esta em uso',
            'email' => 'Formato de email incorrecto',
            'min' => 'No mínimo dois(2) caracteres para este campo',
        ]);

        if ($validator->fails()):

            return response()->json([
                "message" => $validator->errors(),
                "status" => 422
            ], 422);

        else:

            $user = $this->usuarios->store($request);
            if ($user === 'sucesso'):
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

        endif;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user = $this->usuarios->show($id);
        return response()->json($user);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function changePassword(Request $request, $id)
    {
        $user = User::find($id);
        $user->password = Hash::make($request->input('password'));
        $user->password_changed = 'true';
        $user->save();
        return $user;
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
        $validator = Validator::make($request->all(), [
            //'papel' => 'required',
            'status' => 'required',
            'nome' => 'required|min:2',
            'email' => 'required|email',
        ], $messages = [
            'required' => 'Este campo é obrigatório',
            'email.unique' => 'Este email já esta em uso',
            'email' => 'Formato de email incorrecto',
            'min' => 'No mínimo dois(2) caracteres para este campo',
        ]);
        if ($validator->fails()):
            return response()->json([
                "message" => $validator->errors(),
                "status" => 422
            ], 422);
        else:
            $data_time = new \DateTime();
            $usuario = DB::table('users')->where('id', $id)->update([
                'name' => $request->nome,
                'email' => $request->email,
                'status' => $request->status,
                'updated_at' => $data_time,
            ]);

            $papeis = $request->input('papel', []);
            //Papeis existentes
            $papeis_associados = DB::table('model_has_roles')->where([
                ['model_id', $id]
            ])->pluck('model_has_roles.role_id')->toArray();
            // Calcula os papeis para associar e desassociar
            $papeis_para_associar = array_diff($papeis, $papeis_associados);
            $papeis_para_desassociar = array_diff($papeis_associados, $papeis);

            // Associa os novas papeis
            foreach ($papeis_para_associar as $papel):
                $verificar_se_existe = DB::table('model_has_roles')->where([
                    ['model_id', $id],
                    ['role_id', $papel],
                ])->count();
                if ($verificar_se_existe == 0):
                    DB::table('model_has_roles')->insert([
                        'model_id' => $id,
                        'model_type' => 'App\User',
                        'role_id' => $papel,
                    ]);
                endif;
            endforeach;
            // Desassociar papeis não selecionadas
            foreach ($papeis_para_desassociar as $papel):
                DB::table('model_has_roles')->where([
                    ['model_id', $id],
                    ['role_id', $papel]
                ])->delete();
            endforeach;

            return response()->json([
                "message" => "Dados alterados com sucesso",
                "status" => 201
            ], 201);
        endif;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $id_user = User::find($id);
        if ($id_user->id === Auth::user()->id):
            return response()->json([
                "message" => "Não é possível auto eliminar-se do sistema.",
                "status" => 422
            ], 422);
        else:
            User::find($id)->delete();
            return response()->json([
                "message" => "Usuario eleminado com sucesso.",
                "status" => 201
            ], 201);
        endif;
    }

    public function modulos(Request $request)
    {
        $modulos = DB::table('modulos')
            ->get();
        return $modulos;
    }

    public function editUserModulos(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $selectedModulos = $request->selectedModulos;

        DB::table('modulos_users')
            ->where('user_id', $user->id)
            ->update(['status' => 'inactivo']);
        foreach ($selectedModulos as $selected) {
            if (DB::table('modulos_users')
                ->where('user_id', $user->id)->where('modulo_id', $selected)->exists()
            ) {
                //update to activo
                DB::table('modulos_users')
                    ->where('user_id', $user->id)->where('modulo_id', $selected)
                    ->update(['status' => 'activo']);
            } else {
                DB::table('modulos_users')
                    ->insert([
                        'user_id' => $user->id,
                        'modulo_id' => $selected,
                        'status' => 'activo',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
            }
        }

        $users = DB::table('users')
            ->get();
        $users = $users->map(function ($item) {
            $item->modulos = DB::table('modulos_users')
                ->where('user_id', $item->id)
                ->where('status', 'activo')
                ->get();

            return $item;
        });

        return $users;
    }
    public function updateTipoFolha(Request $request){
        $user = User::find($request->user_id);
        $user->tipoFolha = $request->tipoFolha;
        $user->save();
        return $user;
    }
}

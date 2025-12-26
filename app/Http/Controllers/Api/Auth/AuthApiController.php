<?php

namespace App\Http\Controllers\Api\Auth;

use App\Funcionario;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthApiController extends Controller
{
    //
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['showLoginForm', 'login', 'updateUser']]);
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    // public function login()
    // {
    //     $credentials = request(['email', 'password']);
    //     if (! $token = auth()->attempt($credentials)) {
    //         // return response()->json(['error' => 'Unauthorized'], 401);
    //         return response()->json([
    //             "message" => "Senha ou email errada",
    //             "status" => 401
    //         ], 401);
    //     }
    //     // Pegar Users
    //     $user = auth()->user();
    //     $permissions = collect([]);

    //     $roles = DB::table('model_has_roles')->where('model_id', $user->id)
    //     ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
    //     ->select('roles.*')
    //     ->get();


    //     foreach($roles as $role):
    //         $permissions_role = DB::table('role_has_permissions')->where('role_id', $role->id)
    //         ->join('permissions', 'permissions.id', '=', 'role_has_permissions.permission_id')
    //         ->select('permissions.*')
    //         ->pluck('permissions.name');

    //         $permissions = $permissions->concat(collect($permissions_role));
    //     endforeach;
    //     $permissions = $this->criarArrayUnico($permissions);

    //     $user_logado_polo_count = DB::table('users_has_polos')->where([
    //         ['user_id', $user->id],
    //         ['status', 'activo'],
    //     ])->count();
    //     if($user_logado_polo_count > 0):
    //         $user_logado_polo = DB::table('users_has_polos')->where([
    //             ['user_id', $user->id],
    //             ['status', 'activo'],
    //         ])
    //         ->select('polo_id')
    //         ->first();
    //     else:
    //         $user_logado_polo = null;
    //     endif;

    //     session(['user' => $user]);

    //     $this->dados_login = [
    //         'token' => $token,
    //         'user' => $user,
    //         'roles' => $roles,
    //         'permissions' => $permissions,
    //         'user_logado_polo' => $user_logado_polo,
    //         'status' => 'success'
    //     ];
    //     return $this->respondWithToken($this->dados_login);

    // }
    public function showLoginForm()
    {
        return view('auth.login');
    }
    public function login()
    {
        $credentials = request(['email', 'password']);
        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                "message" => "Senha ou email errada",
                "status" => 401
            ], 401);
        }

        $user = auth()->user();
        $user->modulos = DB::table('modulos_users')
            ->where('user_id', $user->id)
            ->where('status', 'activo')
            ->get();

        $user->funcionario = Funcionario::with(['user', 'contrato'])->where('user_id', $user->id)->first();
        $user->modulos = collect($user->modulos)->map(function ($item) {
            $item->nome = DB::table('modulos')
                ->where('id', $item->modulo_id)
                ->first()->nome;
            $item->prefixo = DB::table('modulos')
                ->where('id', $item->modulo_id)
                ->first()->prefixo;
            return $item;
        });
        $roles = $this->getUserRoles($user);
        $permissions = $this->getUserPermissions($roles);
        $userLogadoPolo = $this->getUserPolo($user);
        $fullUserPolo = $this->getFullUserPolo($user);
        $fullUserEmpresa = $this->getFullUserEmpresa($user);
        $modulos_associados = $this->getUserModulos($user);

        session(['user' => $user]);

        $this->dados_login = [
            'token' => $token,
            'user' => $user,
            'roles' => $roles,
            'permissions' => $permissions,
            'user_logado_polo' => $userLogadoPolo,
            'full_user_polo' => $fullUserPolo,
            'full_user_empresa' => $fullUserEmpresa,
            'modulos_associados' => $modulos_associados,
            'status' => 'success'
        ];

        return $this->respondWithToken($this->dados_login);
    }

    private function getUserRoles($user)
    {
        return DB::table('model_has_roles')
            ->where('model_id', $user->id)
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->select('roles.*')
            ->get();
    }

    private function getUserPermissions($roles)
    {
        $permissions = collect([]);

        foreach ($roles as $role) {
            $permissions_role = DB::table('role_has_permissions')
                ->where('role_id', $role->id)
                ->join('permissions', 'permissions.id', '=', 'role_has_permissions.permission_id')
                ->select('permissions.*')
                ->pluck('permissions.name');

            $permissions = $permissions->concat(collect($permissions_role));
        }

        return $this->criarArrayUnico($permissions);
    }

    private function getUserPolo($user)
    {
        return DB::table('users_has_polos')
            ->where([
                ['user_id', $user->id],
                ['status', 'activo'],
            ])
            ->select('polo_id')
            ->first();
    }

    private function getFullUserPolo($user)
    {

        if (
            DB::table('users_has_polos')
                ->where([
                    ['user_id', $user->id],
                    ['status', 'activo'],
                ])
                ->exists()
        ) {
            return DB::table('polos')
                ->where('id', DB::table('users_has_polos')
                    ->where([
                        ['user_id', $user->id],
                        ['status', 'activo'],
                    ])
                    ->first()->polo_id)
                ->first();
        }

    }

    private function getFullUserEmpresa($user)
    {

        if ($user->empresa_id) {
            return DB::table('empresas')
                ->where('id', $user->empresa_id)
                ->first();
        }

    }

    private function getUserModulos($user)
    {
        $modulos = DB::table('modulos_users')->where([
            ['user_id', $user->id],
            ['modulos_users.status', 'activo']
        ])
            ->join('modulos', 'modulos.id', '=', 'modulos_users.modulo_id')
            ->select('modulos.*')
            ->get();

        return $modulos;
    }
    public function googleCallback($email, $senha)
    {

        // Configuração de cabeçalhos CORS
        // header("Access-Control-Allow-Origin:  http://localhost:4200");
        // header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        // header("Access-Control-Allow-Headers: Content-Type, X-Auth-Token, Origin, Authorization");

        $this->credentials =
            [
                'email' => $email,
                'password' => $senha
            ];
        $credentials = request(['email', 'password']);
        if (!$token = auth()->attempt($this->credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        // Pegar Users
        $user = auth()->user();
        $permissions = collect([]);

        $roles = DB::table('model_has_roles')->where('model_id', $user->id)
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->select('roles.*')
            ->get();


        foreach ($roles as $role):
            $permissions_role = DB::table('role_has_permissions')->where('role_id', $role->id)
                ->join('permissions', 'permissions.id', '=', 'role_has_permissions.permission_id')
                ->select('permissions.*')
                ->pluck('permissions.name');

            $permissions = $permissions->concat(collect($permissions_role));
        endforeach;
        $permissions = $this->criarArrayUnico($permissions);

        $this->dados_login = [
            'token' => $token,
            'user' => $user,
            'roles' => $roles,
            'permissions' => $permissions
        ];
        return $this->respondWithToken($this->dados_login);
    }

    public function criarArrayUnico($arr)
    {
        $colecaoUnica = collect($arr)->unique();
        return $colecaoUnica->all();
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return response()->json(auth()->user());
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60
        ]);
    }

    public function loginGoogle()
    {
        // return Socialite::driver('google')->redirect();
    }
    public function updateUser(Request $request, $field, $id) {

        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'error'=> 'User not found!'
            ], 404);
        }
        else if ($field == 'name'){
            $user->name = $request->input('name');
        }
        else if ($field == 'email'){
            $user->email = $request->input('email');
        }
        else if ($field == 'password'){
            $user->password = Hash::make($request->input('password'));
        }
        else if ($field == 'status'){
            $user->status = $request->input('status');
        }
        else if ($field == 'every') {
            if ($request->delete == true){
                if ($user->info['documento']){
                    Storage::disk('public')->delete('pdfs/'.$user->info['documento']);
                }
                $newInfo = json_decode($request->input('info'), true);
                $newInfo['documento'] = null;
                $user->info = $newInfo;
                $user->info = $newInfo;
                $user->name = $request->name;
                $user->email = $request->email;
                $user->show = $request->show;
                $user->save();
            }
            else if ($request->selectedDoc){
                if ($request->documento){
                    Storage::disk('public')->delete('pdfs/'.$request->documento);
                }
                $file = $request->file('selectedDoc');
                $filename = 'pdf' . time() . '.'. 'pdf';
                Storage::disk('public')->putFileAs('pdfs', $file, $filename);
                $newInfo = json_decode($request->input('info'), true);
                $newInfo['documento'] = $filename;
                $user->info = $newInfo;
                $user->name = $request->name;
                $user->email = $request->email;
                $user->show = $request->show;
                $user->save();
            }else {
                $user->update($request->all());

            }
        }
        $user->save();

        return response()->json([
            'data'=> $user,
            'has'=> $request->has('name')

        ], 200);
    }
}

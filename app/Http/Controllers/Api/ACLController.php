<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ACLController extends Controller
{
    public function __construct()
    {
        // $this->middleware('auth:api', ['except' => ['login']]);
    }

    public function roles(Request $request)
    {
        $roles = Role::all();
        return $roles;
    }

    public function role($id)
    {
        $role = Role::find($id);
        return $role;
    }

    public function storeRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
           'designacao' => 'required|unique:roles,name'
        ], $messages = [
            'required' => 'Este campo é obrigatório',
            'unique' => 'Esta designação já existe'
        ]);

        if ($validator->fails()):
            return response()->json(['errors' => $validator->errors()], 422);
        else:
            $role = Role::create([
                'name' => $request->designacao,
            ]);

            return response()->json(['message' => 'Papel Registado!'], 201);
        endif;
    }

    public function associarPermissoesStore($id, Request $request)
    {
        $permissoes = $request->input('permissoes', []);

        //Permissões existentes
        $permissoes_associadas = DB::table('role_has_permissions')->where([
            ['role_id', $id]
        ])->pluck('role_has_permissions.permission_id')->toArray();

        // Calcula as permissões para associar e desassociar
        $permissions_para_associar = array_diff($permissoes, $permissoes_associadas);
        $permissions_para_desassociar = array_diff($permissoes_associadas, $permissoes);

        // Associa as novas permissões
        foreach($permissions_para_associar as $permissao):
            $verificar_se_existe = DB::table('role_has_permissions')->where([
                ['role_id', $id],
                ['permission_id', $permissao],
            ])->count();
            if($verificar_se_existe == 0):
                DB::table('role_has_permissions')->insert([
                    'role_id' => $id,
                    'permission_id' => $permissao,
                ]);
            endif;
        endforeach;
        // Desassociar permissões não selecionadas
        foreach($permissions_para_desassociar as $permissao):
            DB::table('role_has_permissions')->where([
                ['role_id', $id],
                ['permission_id', $permissao]
            ])->delete();
        endforeach;


        // $permissoes = $request->permissoes;

        // foreach($permissoes as $permissao):
        //     $verificar_se_existe = DB::table('role_has_permissions')->where([
        //         ['role_id', $id],
        //         ['permission_id', $permissao],
        //     ])->count();
        //     if($verificar_se_existe == 0):
        //         DB::table('role_has_permissions')->insert([
        //             'role_id' => $id,
        //             'permission_id' => $permissao,
        //         ]);
        //     endif;
        // endforeach;
        return response()->json();
    }

    public function permissoesAssociadas($id)
    {
        $permissoes_associadas = DB::table('role_has_permissions')->where('role_id', $id)->get();
        return $permissoes_associadas;
    }

    public function papeisAssociados($id)
    {
        $papeisAssociados = DB::table('model_has_roles')->where('model_id', $id)->get();
        return $papeisAssociados;
    }

    public function associarPapeisStore($id, Request $request)
    {
        $papeis = $request->input('roles', []);
        //dd($papeis);
        //Papeis existentes
        $papeis_associados = DB::table('model_has_roles')->where([
            ['model_id', $id]
        ])->pluck('model_has_roles.role_id')->toArray();
        //dd($papeis_associados);
        // Calcula os papeis para associar e desassociar
        $papeis_para_associar = array_diff($papeis, $papeis_associados);
        $papeis_para_desassociar = array_diff($papeis_associados, $papeis);

        // Associa os novas papeis
        foreach($papeis_para_associar as $papel):
            $verificar_se_existe = DB::table('model_has_roles')->where([
                ['model_id', $id],
                ['role_id', $papel],
            ])->count();
            if($verificar_se_existe == 0):
                DB::table('model_has_roles')->insert([
                    'model_id' => $id,
                    'model_type' => 'App\User',
                    'role_id' => $papel,
                ]);
            endif;
        endforeach;
        // Desassociar papeis não selecionadas
        foreach($papeis_para_desassociar as $papel):
            DB::table('model_has_roles')->where([
                ['model_id', $id],
                ['role_id', $papel]
            ])->delete();
        endforeach;

        return response()->json();
    }

    public function permissions(Request $request)
    {
        $permissions = Permission::all();
        return $permissions;
    }

    public function storePermission(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'designacao' => 'required|unique:permissions,name'
         ], $messages = [
            'required' => 'Este campo é obrigatório',
            'unique' => 'Esta designação já existe'
         ]);

         if ($validator->fails()):
            return response()->json(['errors' => $validator->errors()], 422);
         else:
            $permission = Permission::create([
                'name' => $request->designacao,
            ]);

            return response()->json(['message' => 'Permissão Registada!'], 201);
        endif;
    }
}

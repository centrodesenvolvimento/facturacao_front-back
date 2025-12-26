<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
        'genero', 'data_nascimento', 'num_bi',
        'num_telemovel', 'status', 'password_changed',
        'tipoFolha'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }

    public function getUsers()
    {
        try {
            $users = DB::table('users')->get();
            return $users;
        } catch (\Throwable $th) {
            return 'Erro: '.$th;
        }
    }

    public function store($data)
    {
        // Iniciar a transação
        DB::beginTransaction();
        try {
            $data_time = new \DateTime();
            $usuario = DB::table('users')->insertGetId([
                'empresa_id' => $data->empresa_id,
                'name' => $data->nome,
                'password' => Hash::make('123'),
                'email' => $data->email,
                'status' => 'activo',
                'created_at' => $data_time,
                'updated_at' => $data_time,
            ]);
            foreach($data->papel as $key => $item):
                $papel_usuario = DB::table('model_has_roles')->insert([
                    'role_id' => $item,
                    'model_type' => 'App\User',
                    'model_id' => $usuario
                ]);
            endforeach;

            if(!is_null($data->polo_id)):
                foreach($data->polo_id as $key => $item):
                    if (is_array($item) && array_key_exists('id', $item)):
                        $polo_id = $item['id'];

                        DB::table('users_has_polos')->insert([
                            'user_id' => $usuario,
                            'polo_id' => $polo_id,
                            'status' => 'activo',
                            'created_at' => $data_time,
                            'updated_at' => $data_time
                        ]);
                    endif;
                endforeach;
            endif;

            // Commit se tudo estiver bem
            DB::commit();
            return 'sucesso';
        }catch (\Throwable $th) {
            // Desfazer a transação em caso de erro
            DB::rollback();
            // Lidar com o erro, se necessário
            return 'Erro: '.$th;
        }
    }

    public function show($id)
    {
        try {
            $user = User::where('users.id', $id)
            ->join('model_has_roles','model_has_roles.model_id', '=','users.id')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->select('users.*', 'roles.name as papel')->first();
            return $user;
        } catch (\Throwable $th) {
            return 'Erro: '.$th;
        }
    }

    // public static function destroy($id)
    // {
    //     try {
    //         $user = User::find($id);
    //         if($user->id === Auth::user()->id):
    //             return "auto_eliminação";
    //         else:
    //             User::destroy($id);
    //             return "sucesso";
    //         endif;
    //     } catch (\Throwable $th) {
    //         return 'Erro: '.$th;
    //     }
    // }


}

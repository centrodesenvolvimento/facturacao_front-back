<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Contacto extends Model
{
    //
    protected $table = 'contactos';
    protected $fillable = [
        'cliente_id',
        'tipo',
        'designacao',
        'status',
    ];
    public function registarContato($data, $id_cliente){
        $data_time = new \DateTime();
        $registar = DB::table('contactos')->insert([
            'cliente_id' => $id_cliente,
            'telefone' => $data->telefone,
            'telemovel' => $data->telemovel,
            'email' => $data->email,
            'site' => $data->site,
            'status' => 'activo',
            'created_at' => $data_time,
            'updated_at' => $data_time,
        ]);
    }
}

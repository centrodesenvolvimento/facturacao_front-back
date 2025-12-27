<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Contacto;

class Clientes extends Model
{
    //
    protected $table = 'clientes';
    protected $fillable = [
        'empresas_id',
        'tipo_entidade_id',
        'nome',
        'nif',
        'pais',
        'morada',
        'localidade',
        'retencao',
        'factura_eletronica',
        'observacoes',
        'localizacao',
        'status'
    ];
    public function insertGetIdCliente($data){
        //return $data;
        // Iniciar a transação
        DB::beginTransaction();
        try{
            if($data->factura_eletronica == 0):
                $factura_value = NULL;
            else:
               $factura_value = 1;
            endif;
            $data_time = new \DateTime();
            $id_cliente = DB::table('clientes')->insertGetId([
                'empresa_id' => 1 ,//Auth::user()->id_empresa,
                'nome' => $data->nome,
                'nif' => $data->nif,
                'pais' => $data->pais,
                'morada' => $data->morada,
                'localidade' => $data->localidade,
                'retencao' => $data->retencao,
                'factura_eletronica' => $factura_value,
                'observacoes' => $data->observacoes,
                'localizacao' => $data->localizacao,
                'status' => 'activo',
                'created_at' => $data_time,
                'updated_at' => $data_time,
            ]);
            $dados_contacto = $data->only(['tipo_contacto', 'descricao']);
            $modelContact = new Contacto();
            $modelContact->registarContato($data, $id_cliente);
            // Commit se tudo estiver bem
            DB::commit();
            return 'sucesso';
        }
        catch (\Exception $e)
        {
            // Desfazer a transação em caso de erro
            DB::rollback();
            // Lidar com o erro, se necessário
            return 'Erro'.$e;
        }



    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class Artigo extends Model
{
    protected $table = 'artigos';
    protected $fillable = [
        'polo_id',
        'categoria_id',
        'tipo_artigo_id',
        'imposto_id',
        'isencao_id',
        'designacao',
        'cod_barra',
        'descricao',
        'status'
    ];

    // protected $user_logado;

    // public function __construct()
    // {
    //     parent::__construct();
    //     $this->user_logado = session('user');
    // }

    public function artigos()
    {
        $artigos = DB::table('artigos')
        ->join('precos', 'precos.artigo_id', 'artigos.id')
        ->join('impostos', 'impostos.id', '=', 'artigos.imposto_id')
        ->select('artigos.*', 'impostos.taxa', 'precos.preco_venda')
        ->get();
        return response()->json($artigos);
    }

    public function store($request)
    {
        // Iniciar a transação
        DB::beginTransaction();
        try {
            $data_time = new \DateTime();

            // Transformar strings vazias ou "null" em valores NULL
            $data = [
                'polo_id' => $request->polo_id,
                'categoria_id' => $request->categoria_id ?: null,
                'tipo_artigo_id' => $request->tipo_artigo_id ?: null,
                'imposto_id' => $request->imposto_id ?: null,
                'isencao_id' => $request->isencao_id ?: null,
                'designacao' => $request->designacao,
                'cod_barra' => $request->cod_barra ?: null,
                'descricao' => $request->descricao ?: null,
                'status' => 'activo',
                'created_at' => $data_time,
                'updated_at' => $data_time,
            ];

            $artigo = DB::table('artigos')->insertGetId($data);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('artigos/imagens');
            }

            if ($imagePath) {
                DB::table('imagens_artigos')->insert([
                    'artigo_id' => $artigo,
                    'file' => $imagePath,
                    'status' => 'activo',
                    'created_at' => $data_time,
                    'updated_at' => $data_time,
                ]);
            }

            $preco = DB::table('precos')->insert([
                'artigo_id' => $artigo,
                'preco_venda' => $request->preco_venda,
                'valor_imposto' => $request->valor_imposto,
                'valor_final' => $request->preco_final,
                'status' => 'activo',
                'created_at' => $data_time,
                'updated_at' => $data_time,
            ]);

            // Commit se tudo estiver bem
            DB::commit();
            return 'sucesso';

        } catch (Exception $e) {
            // Desfazer a transação em caso de erro
            DB::rollback();
            throw $e;
        }
    }

    public function storePreco($id, $request)
    {
        // Iniciar a transação
        DB::beginTransaction();
        try {
            $data_time = new \DateTime();

            $artigo = DB::table('artigos')->where('id', $id)
            ->join('impostos', 'impostos.id', '=', 'artigos.imposto_id')
            ->select('impostos.taxa')
            ->first();

            $valor_imposto = ($request->preco_venda * $artigo->taxa) / 100;
            $valor_final = $request->preco_venda + $valor_imposto;

            $preco = DB::table('precos')->insert([
                'artigo_id' => $id,
                'preco_venda' => $request->preco_venda,
                'valor_imposto' => $valor_imposto,
                'valor_final' => $valor_final,
                'status' => 'activo',
                'created_at' => $data_time,
                'updated_at' => $data_time,
            ]);

            // Commit se tudo estiver bem
            DB::commit();
            return 'sucesso';

        } catch (Exception $e) {
            // Desfazer a transação em caso de erro
            DB::rollback();
            throw $e;
        }
    }

    public function getArtigo($id)
    {
        $artigo = DB::table('artigos')->where('id', $id)->first();

        return response()->json($artigo);
    }

    public function getPreco($id)
    {
        $preco = DB::table('precos')->where([
            ['artigo_id', $id],
            ['status', 'activo']
        ])->first();

        return response()->json($preco);
    }

    public function getPrecos($id)
    {
        $precos = DB::table('precos')->where([
            ['artigo_id', $id]
        ])->get();

        return response()->json($precos);
    }

    public function getImagem($id)
    {
        $img = DB::table('imagens_artigos')->where([
            ['artigo_id', $id],
            ['status', 'activo']
        ])->first();

        $path = 'storage/'.$img->file;
        $fullPath = asset($path);

        return response()->json(['file' => $fullPath]);
    }

    public function updateArtigo($id, $request)
    {
        // Iniciar a transação
        DB::beginTransaction();
        try {
            $data_time = new \DateTime();

            $artigo = DB::table('artigos')->where('id', $id)->update([
                'categoria_id' => $request->categoria_id,
                'tipo_artigo_id' => $request->tipo_artigo_id,
                'unidade_id' => $request->unidade_id,
                'imposto_id' => $request->imposto_id,
                'isencao_id' => $request->isencao_id,
                'designacao' => $request->designacao,
                'cod_barra' => $request->cod_barra,
                'descricao' => $request->descricao,
                'updated_at' => $data_time,
            ]);

            // Verificar se há imagem atual
            $img_actual = DB::table('imagens_artigos')->where([
                ['artigo_id', $id],
                ['status', 'activo'],
            ])->first();

            if ($img_actual) {
                // Atualizar imagem se houver
                $imagePath = $img_actual->file; // Manter o caminho atual se não houver nova imagem

                if ($request->hasFile('image')) {
                    // Se houver uma nova imagem, salvar o novo arquivo
                    $imagePath = $request->file('image')->store('artigos/imagens');
                }

                DB::table('imagens_artigos')->where('artigo_id', $id)->update([
                    'file' => $imagePath,
                    'updated_at' => $data_time,
                ]);
            } else {
                // Se não houver imagem, inserir nova
                if ($request->hasFile('image')) {
                    $imagePath = $request->file('image')->store('artigos/imagens');

                    DB::table('imagens_artigos')->insert([
                        'artigo_id' => $id,
                        'file' => $imagePath,
                        'status' => 'activo',
                        'created_at' => $data_time,
                        'updated_at' => $data_time,
                    ]);
                }
            }

            // Commit se tudo estiver bem
            DB::commit();
            return 'sucesso';

        }catch (\Throwable $th) {
            // Desfazer a transação em caso de erro
            DB::rollback();
            // Lidar com o erro, se necessário
            //throw $th;
            return 'Erro: '.$th;
        }
    }
}

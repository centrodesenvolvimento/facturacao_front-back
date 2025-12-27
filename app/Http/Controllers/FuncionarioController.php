<?php

namespace App\Http\Controllers;

use App\Adiantamento;
use App\Cargo;
use App\Contrato;
use App\ControlePresenca;
use App\Departamentos;
use App\Ferias;
use App\FolhaSalarial;
use App\Funcionario;
use App\Models\Polo;
use App\Nivel;
use App\Premio;
use App\SubsidioValor;
use App\TaxasIrt;
use App\TaxasSS;
use App\TipoPremio;
use App\User;
use App\VinculosLaborais;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FuncionarioController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $funcionarios = Funcionario::with(['user', 'empresa'])->orderBy('nome')->get();
        $funcionarios = $funcionarios->map(function ($item) {
            $item->contratos = Contrato::where('funcionario_id', $item->id)->with(['polo', 'departamento'])->get();
            return $item;
        });
        return $funcionarios;
    }

    public function funcionariosEmpresa(Request $request, $id)
    {
        $funcionarios = Funcionario::where('empresa_id', $id)->with(['user', 'empresa']);
        if ($request->has('search') && !empty($request->search)) {
            $funcionarios->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('departamento') && !empty($request->departamento)) {
            $funcionarios->whereHas('contrato', function ($query) use ($request) {
                $query->where('departamento_id', $request->departamento);
            });
        }
        if ($request->has('polo') && !empty($request->polo)) {
            $funcionarios->whereHas('contrato', function ($query) use ($request) {
                $query->where('polo_id', $request->polo);
            });
        }
        if ($request->has('vinculo') && !empty($request->vinculo)) {
            $funcionarios->whereHas('contrato', function ($query) use ($request) {
                $query->where('vinculo', $request->vinculo);
            });
        }
        // if ($request->has('departamento') && !empty($request->departamento)) {
        //     $funcionarios->whereHas('contratos', function ($q) use ($request) {
        //         $q->orderByDesc('created_at') // Get the latest contrato
        //           ->whereHas('departamento', function ($d) use ($request) {
        //               $d->where('nome', 'like', '%' . $request->departamento . '%');
        //           });
        //     });
        // }

        $funcionarios = $funcionarios->orderBy('nome')->paginate(16);

        $totalPages = $funcionarios->lastPage(); // Total number of pages

        $funcionariosCollection = $funcionarios->getCollection()->map(function ($item) {
            // Fetch related contratos
            $item->contratos = Contrato::where('funcionario_id', $item->id)
                ->with(['polo', 'departamento'])
                ->get();

            // Process contratos
            $item->contratos = $item->contratos->map(function ($contrato) {
                $contrato->vinculoFull = VinculosLaborais::find($contrato->vinculo);
                $contrato->salarioFull = Nivel::find($contrato->salario);
                $contrato->subsidiosFull = collect($contrato->subsidios)
                    ->map(fn($id) => SubsidioValor::find($id))->values();
                $contrato->premiosFull = collect($contrato->premios)
                    ->map(fn($id) => Premio::find($id))->values();
                return $contrato;
            });

            return $item;
        });
        return response()->json([
            'data' => $funcionariosCollection, // Paginated items
            'total_pages' => $totalPages,
            'current_page' => $funcionarios->currentPage(),
            'per_page' => $funcionarios->perPage(),
            'total' => $funcionarios->total(), // Total records
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

        $this->replaceNullStrings($request);

        // Validation Rules
        $validator = Validator::make($request->all(), [
            'designacao' => 'unique:users,name', // Check for unique name in users table
            // 'email' => 'unique:users,email', // Check for unique email in users table
            'codigoDocumento' => 'required|unique:funcionarios,codigoDocumento', // Check for unique codigoDocumento in funcionarios table
        ], [ // Custom error messages (optional, but recommended)
            'designacao.unique' => 'Já existe um funcionário com este nome.',
            // 'email.unique' => 'Já existe um funcionário com este email.',
            'codigoDocumento.unique' => 'Já existe um funcionário com este código de documento.',

        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors() // Return validation errors
            ], 422); // Use 422 Unprocessable Entity for validation errors
        }
        $user = User::create([
            'name' => $request->input('designacao'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('codigoDocumento')),
            'status' => 'activo'
        ]);
        if ($request->logo != null && $request->logo != '' && strlen($request->logo) > 10) {
            $imageData = base64_decode($request->input('logo'));
            $filename1 = 'image_' . time() . '.' . $request->extension;
            $path = Storage::put('funcionarios/imagens/' . $filename1, $imageData);
        }

        $file = $request->file('documento');
        $filename = 'pdf' . time() . '.' . 'pdf';
        $path = 'funcionarios/documentos/' . $filename;

        if ($file) {
            $file->storeAs('funcionarios/documentos', $filename);
        } else {
            $filename = null;
        }
        $funcionario = Funcionario::create([
            'user_id' => $user->id,
            'logo' => ($request->logo != null && $request->logo != '' && strlen($request->logo) > 10) ? 'funcionarios/imagens/' . $filename1 : null,
            'nome' => $request->input('designacao'),
            'agregado' => $request->input('agregado'),
            'social' => $request->input('social'),
            'genero' => $request->input('genero'),
            'estado' => $request->input('estado'),
            'nacionalidade' => $request->input('nacionalidade'),
            'nascimento' => $request->input('nascimento'),
            'municipio' => $request->input('municipio'),
            'bairro' => $request->input('bairro'),
            'morada' => $request->input('morada'),
            'telemovel' => $request->input('telemovel'),
            'telemovel1' => $request->input('telemovel1'),
            'habilitacoesA' => json_decode($request->input('habilitacoesA')),
            'habilitacoesP' => json_decode($request->input('habilitacoesP')),
            'publicacoes' => json_decode($request->input('publicacoes')),
            'tipoDocumento' => $request->input('tipoDocumento'),
            'localEmissao' => $request->input('localEmissao'),
            'empresa_id' => $request->input('empresa_id'),
            'codigoDocumento' => $request->input('codigoDocumento'),
            'dataEmissao' => $request->input('dataEmissao') != "null" ? $request->input('dataEmissao') : null,
            'dataValidade' => $request->input('dataValidade') != "null" ? $request->input('dataValidade') : null,
            'documento' => $filename ? 'funcionarios/documentos/' . $filename : null,
            'tipo' => $request->input('tipo'),
            'status' => 'activo',
        ]);

        $file = $request->file('contrato');
        if ($file) {

            $filename = 'contrato_' . time() . '.' . $file->getClientOriginalExtension();

            $path = 'funcionarios/documentos/' . $filename;

            $file->storeAs('funcionarios/documentos', $filename);
        } else {
            $filename = null;
            $path = null;
        }
        $contrato = Contrato::create([
            'funcionario_id' => $funcionario->id,
            'polo_id' => $request->input('polo'),
            'departamento_id' => $request->input('departamento'),
            'cargo' => json_decode($request->input('cargo')),
            'categoria' => $request->input('categoria'),
            'vinculo' => $request->input('vinculoLaboral'),
            'salario' => $request->input('salario'),
            'banco' => $request->input('banco'),
            'conta' => $request->input('conta'),
            'iban' => $request->input('iban'),
            'nib' => $request->input('nib'),
            'swift' => $request->input('swift'),
            'premios' => json_decode($request->input('premios')),
            'subsidios' => json_decode($request->input('subsidios')),
            'avenca' => $request->input('avenca'),
            'licensa_maternidade' => $request->input('licensa_maternidade'),
            'licensa_meses' => json_decode($request->input('licensa_meses')),
            'avenca_normal' => $request->input('avenca_normal'),
            'proporcional' => $request->input('proporcional'),
            'escalao' => $request->input('escalao'),
            'carga' => $request->input('carga'),
            'impostos_coletavel' => $request->input('coletavel'),
            'contracto' => $path,
            'dataCelebracao' => $request->input('dataCelebracao') != "null" ? $request->input('dataCelebracao') : null,
            'dataConclusao' => $request->input('dataConclusao') != "null" ? $request->input('dataConclusao') : null,
            'status' => 'activo',
        ]);
        return $funcionario;
    }

    public function storeFuncionarios(Request $request)
    {
        $names_already_exists = [];
        $emails_already_exists = [];
        $created_funcionarios = []; // To store the created funcionarios

        if ($request->has('funcionarios') && is_array($request->input('funcionarios'))) {
            $funcionariosData = $request->input('funcionarios');

            foreach ($funcionariosData as $funcionarioData) {

                // Check if name already exists
                if (User::where('name', $funcionarioData['designacao'])->exists()) {
                    $names_already_exists[] = $funcionarioData['designacao'];
                }

                // Check if email already exists
                if (User::where('email', trim($funcionarioData['email']))->exists()) {
                    $emails_already_exists[] = trim($funcionarioData['email']);
                }

                if (!User::where('name', $funcionarioData['designacao'])->exists() && !User::where('email', trim($funcionarioData['email']))->exists()) {
                    //If neither name nor email exists, create the user and funcionario
                    $user = User::create([
                        'name' => $funcionarioData['designacao'],
                        'email' => trim($funcionarioData['email']),
                        'password' => Hash::make('123123123'), // Consider making this configurable
                        'status' => 'activo',
                    ]);

                    $funcionario = Funcionario::create([
                        'user_id' => $user->id,
                        'logo' => null, // Consider handling the logo here, not in the original code
                        'nome' => $funcionarioData['designacao'],
                        'agregado' => $funcionarioData['agregado'],
                        'social' => $funcionarioData['social'],
                        'genero' => $funcionarioData['genero'],
                        'estado' => $funcionarioData['estado'],
                        'nacionalidade' => $funcionarioData['nacionalidade'],
                        'nascimento' => $funcionarioData['nascimento'],
                        'municipio' => $funcionarioData['municipio'],
                        'bairro' => $funcionarioData['bairro'],
                        'morada' => $funcionarioData['morada'],
                        'telemovel' => $funcionarioData['telemovel'],
                        'telemovel1' => $funcionarioData['telemovel1'],
                        'habilitacoesA' => isset($funcionarioData['habilitacoesA']) ? $funcionarioData['habilitacoesA'] : null,
                        'habilitacoesP' => isset($funcionarioData['habilitacoesP']) ? $funcionarioData['habilitacoesP'] : null,
                        'publicacoes' => isset($funcionarioData['publicacoes']) ? $funcionarioData['publicacoes'] : null,
                        'tipoDocumento' => $funcionarioData['tipoDocumento'],
                        'localEmissao' => $funcionarioData['localEmissao'],
                        'empresa_id' => $request->empresa_id,
                        'codigoDocumento' => $funcionarioData['codigoDocumento'],
                        'dataEmissao' => $funcionarioData['dataEmissao'],
                        'dataValidade' => $funcionarioData['dataValidade'],
                        'documento' => 'funcionarios/documentos/pdf1739966539.pdf', //  consider updating the file handling
                        'tipo' => $funcionarioData['tipo'],
                        'status' => 'activo',
                    ]);




                    $contrato = Contrato::create([
                        'funcionario_id' => $funcionario->id,
                        'polo_id' => $funcionarioData['polo'],
                        'departamento_id' => $funcionarioData['departamento'],
                        'cargo' => Cargo::where('id', $funcionarioData['cargo'])->first(),  // Fix the cargo
                        'categoria' => $funcionarioData['categoria'],
                        'vinculo' => $funcionarioData['vinculoLaboral'],
                        'salario' => $funcionarioData['salario'],
                        'banco' => $funcionarioData['banco'],
                        'conta' => $funcionarioData['conta'],
                        'iban' => $funcionarioData['iban'],
                        'nib' => $funcionarioData['nib'],
                        'swift' => $funcionarioData['swift'],
                        'premios' => isset($funcionarioData['premios']) ? $funcionarioData['premios'] : null,
                        'subsidios' => isset($funcionarioData['subsidios']) ? $funcionarioData['subsidios'] : null,
                        'avenca' => $funcionarioData['avenca'],
                        'escalao' => $funcionarioData['escalao'],
                        'licensa_maternidade' => isset($funcionarioData['licensa_maternidade']) ? $funcionarioData['licensa_maternidade'] : null,
                        'licensa_meses' => isset($funcionarioData['licensa_meses']) ? $funcionarioData['licensa_meses'] : null,
                        'carga' => $funcionarioData['carga'],
                        'impostos_coletavel' => $funcionarioData['coletavel']||"Sim",
                        'contracto' => 'funcionarios/documentos/pdf1739966539.pdf', //  consider updating the file handling
                        'dataCelebracao' => $funcionarioData['dataCelebracao'],
                        'dataConclusao' => $funcionarioData['dataConclusao'],
                        'status' => 'activo',
                    ]);
                    $created_funcionarios[] = $funcionario; // Store the created funcionario
                }
            }

            $funcionarios = Funcionario::where('empresa_id', $request->empresa_id)->with(['user', 'empresa'])
                ->orderBy('nome')
                ->get();
            $funcionarios = $funcionarios->map(function ($item) {
                $item->contratos = Contrato::where('funcionario_id', $item->id)->with(['polo', 'departamento'])->get();
                $item->contratos = collect($item->contratos)->map(function ($item) {
                    $item->vinculoFull = VinculosLaborais::where('id', $item->vinculo)->first();
                    $item->salarioFull = Nivel::where('id', $item->salario)->first();
                    $item->subsidiosFull = collect($item->subsidios)->map(function ($item) {
                        return SubsidioValor::where('id', $item)->first();
                    })->values();
                    $item->premiosFull = collect($item->premios)->map(function ($item) {
                        return Premio::where('id', $item)->first();
                    })->values();
                    return $item;
                })->values();
                return $item;
            });

            $response = [
                'message' => 'Funcionários processados.',
                'funcionarios' => $funcionarios,
                'names' => $names_already_exists,
                'emails' => $emails_already_exists,
            ];

            // Determine the response code
            $statusCode = 200; // OK, even if some failed.  201 is for FULL success
            if (count($names_already_exists) > 0 || count($emails_already_exists) > 0) {
                $statusCode = 207;  // 207 Multi-Status (RFC 4918) - used for partial success/failures
            }

            return response()->json($response, $statusCode);
        } else {
            return response()->json(['error' => 'Nenhuma lista de funcionários foi fornecida.'], 400);
        }
    }

    public function storeFuncionarios1(Request $request)
    {
        $names_already_exists = [];
        $emails_already_exists = [];
        $created_funcionarios = []; // To store the created funcionarios

        if ($request->has('funcionarios') && is_array($request->input('funcionarios'))) {
            $funcionariosData = $request->input('funcionarios');

            foreach ($funcionariosData as $funcionarioData) {

                // Check if name already exists
                if (User::where('name', $funcionarioData['designacao'])->exists()) {
                    $names_already_exists[] = $funcionarioData['designacao'];
                }

                // Check if email already exists
                if (User::where('email', trim($funcionarioData['email']))->exists()) {
                    $emails_already_exists[] = trim($funcionarioData['email']);
                }

                if (!User::where('name', $funcionarioData['designacao'])->exists() && !User::where('email', trim($funcionarioData['email']))->exists()) {
                    //If neither name nor email exists, create the user and funcionario
                    $user = User::create([
                        'name' => $funcionarioData['designacao'],
                        'email' => trim($funcionarioData['email']),
                        'password' => Hash::make('123123123'), // Consider making this configurable
                        'status' => 'activo',
                    ]);

                    $funcionario = Funcionario::create([
                        'user_id' => $user->id,
                        'logo' => null, // Consider handling the logo here, not in the original code
                        'nome' => $funcionarioData['designacao'],
                        'agregado' => $funcionarioData['agregado'],
                        'social' => $funcionarioData['social'],
                        'genero' => $funcionarioData['genero'],
                        'estado' => $funcionarioData['estado'],
                        'nacionalidade' => $funcionarioData['nacionalidade'],
                        'nascimento' => $funcionarioData['nascimento'],
                        'municipio' => $funcionarioData['municipio'],
                        'bairro' => $funcionarioData['bairro'],
                        'morada' => $funcionarioData['morada'],
                        'telemovel' => $funcionarioData['telemovel'],
                        'telemovel1' => $funcionarioData['telemovel1'],
                        'habilitacoesA' => isset($funcionarioData['habilitacoesA']) ? $funcionarioData['habilitacoesA'] : null,
                        'habilitacoesP' => isset($funcionarioData['habilitacoesP']) ? $funcionarioData['habilitacoesP'] : null,
                        'publicacoes' => isset($funcionarioData['publicacoes']) ? $funcionarioData['publicacoes'] : null,
                        'tipoDocumento' => $funcionarioData['tipoDocumento'],
                        'localEmissao' => $funcionarioData['localEmissao'],
                        'empresa_id' => $request->empresa_id,
                        'codigoDocumento' => $funcionarioData['codigoDocumento'],
                        'dataEmissao' => $funcionarioData['dataEmissao'],
                        'dataValidade' => $funcionarioData['dataValidade'],
                        'documento' => 'funcionarios/documentos/pdf1739966539.pdf', //  consider updating the file handling
                        'tipo' => $funcionarioData['tipo'],
                        'status' => 'activo',
                    ]);

                    $subsidioValorIds = collect($funcionarioData['subsidios'])->map(function ($subsidio) {
                        $existing = SubsidioValor::where('subsidio_id', $subsidio['id'])
                            ->where('valor', $subsidio['valor'])
                            ->first();

                        if ($existing) {
                            return $existing->id;
                        }
                        $newSubsidio = SubsidioValor::create([
                            'subsidio_id' => $subsidio['id'],
                            'valor' => $subsidio['valor'],
                            'valor_nao_coletavel' => 0,
                            'status' => 'activo',
                        ]);

                        return $newSubsidio->id;
                    })->toArray();

                    $premiosValorIds = collect($funcionarioData['premios'])->map(function ($premio) {
                        $existing = Premio::where('tipo_id', $premio['id'])
                            ->where('valor_fixo', $premio['valor'])
                            ->first();

                        if ($existing) {
                            return $existing->id;
                        }
                        $tipoPremio = TipoPremio::find($premio['id']);
                        $newPremio = Premio::create([
                            'tipo_id' => $premio['id'],
                            'valor_fixo' => $premio['valor'],
                            'nome' => $tipoPremio->nome . ' - ' . $premio['valor'],
                            "descricao" => ".",
                            'valor_porcentagem' => "0.00",
                            'status' => 'activo',
                        ]);

                        return $newPremio->id;
                    })->toArray();


                    $departamento_id = null;
                    if (Departamentos::where('nome', $funcionarioData['departamento'])->first()) {
                        $departamento_id = Departamentos::where('nome', $funcionarioData['departamento'])->first()->id;
                    } else {
                        $departamento = Departamentos::create([
                            'nome' => $funcionarioData['departamento'],
                            'descricao' => '.',
                            'empresa_id' => $request->empresa_id,
                            'status' => 'activo',
                            'outra_info' => null
                        ]);
                        $departamento_id = $departamento->id;
                    }

                    $cargo = null;
                    if (Cargo::where('nome', $funcionarioData['cargo'])->first()) {
                        $cargo = Cargo::where('nome', $funcionarioData['cargo'])->first();
                    } else {
                        $cargo = Cargo::create([
                            'nome' => $funcionarioData['cargo'],
                            'descricao' => '',
                            'empresa_id' => $request->empresa_id,
                            'status' => 'activo',
                            'outra_info' => null
                        ]);
                    }


                    $salario = null;
                    if (Nivel::where('valor', $funcionarioData['salario'])->first()) {
                        $salario = Nivel::where('valor', $funcionarioData['salario'])->first();
                    } else {
                        $salario = Nivel::create([
                            'nome' => '.',
                            'descricao' => '.',
                            'valor' => $funcionarioData['salario'],
                            'empresa_id' => $request->empresa_id,
                            'status' => 'activo',
                            'outra_info' => null
                        ]);
                    }

                    $contrato = Contrato::create([
                        'funcionario_id' => $funcionario->id,
                        'polo_id' => $funcionarioData['polo'],
                        'departamento_id' => $departamento_id,
                        'cargo' => $cargo,  // Fix the cargo
                        'categoria' => $funcionarioData['categoria'],
                        'vinculo' => $funcionarioData['vinculoLaboral'],
                        'salario' => $salario->id,
                        'banco' => $funcionarioData['banco'],
                        'conta' => $funcionarioData['conta'],
                        'iban' => $funcionarioData['iban'],
                        'nib' => $funcionarioData['nib'],
                        'swift' => $funcionarioData['swift'],
                        'premios' => isset($funcionarioData['premios']) ? $premiosValorIds : null,
                        'subsidios' => isset($funcionarioData['subsidios']) ? $subsidioValorIds : null,
                        //
                        'avenca_normal' => isset($funcionarioData['avenca_normal']) ? $funcionarioData['avenca_normal'] : null,
                        'proporcional' => isset($funcionarioData['proporcional']) ? $funcionarioData['proporcional'] : null,
                        'avenca' => $funcionarioData['avenca'],
                        'escalao' => $funcionarioData['escalao'],
                        'licensa_maternidade' => isset($funcionarioData['licensa_maternidade']) ? $funcionarioData['licensa_maternidade'] : null,
                        'licensa_meses' => isset($funcionarioData['licensa_meses']) ? $funcionarioData['licensa_meses'] : null,
                        'carga' => $funcionarioData['carga'],
                        'impostos_coletavel' => $funcionarioData['coletavel']||"Sim",
                        'contracto' => 'funcionarios/documentos/pdf1739966539.pdf', //  consider updating the file handling
                        'dataCelebracao' => $funcionarioData['dataCelebracao'],
                        'dataConclusao' => $funcionarioData['dataConclusao'],
                        'status' => 'activo',
                    ]);
                    $created_funcionarios[] = $funcionario; // Store the created funcionario
                }
            }

            $funcionarios = Funcionario::where('empresa_id', $request->empresa_id)->with(['user', 'empresa'])
                ->orderBy('nome')
                ->get();
            $funcionarios = $funcionarios->map(function ($item) {
                $item->contratos = Contrato::where('funcionario_id', $item->id)->with(['polo', 'departamento'])->get();
                $item->contratos = collect($item->contratos)->map(function ($item) {
                    $item->vinculoFull = VinculosLaborais::where('id', $item->vinculo)->first();
                    $item->salarioFull = Nivel::where('id', $item->salario)->first();
                    $item->subsidiosFull = collect($item->subsidios)->map(function ($item) {
                        return SubsidioValor::where('id', $item)->first();
                    })->values();
                    $item->premiosFull = collect($item->premios)->map(function ($item) {
                        return Premio::where('id', $item)->first();
                    })->values();
                    return $item;
                })->values();
                return $item;
            });

            $response = [
                'message' => 'Funcionários processados.',
                'funcionarios' => $funcionarios,
                'names' => $names_already_exists,
                'emails' => $emails_already_exists,
            ];

            // Determine the response code
            $statusCode = 200; // OK, even if some failed.  201 is for FULL success
            if (count($names_already_exists) > 0 || count($emails_already_exists) > 0) {
                $statusCode = 207;  // 207 Multi-Status (RFC 4918) - used for partial success/failures
            }

            return response()->json($response, $statusCode);
        } else {
            return response()->json(['error' => 'Nenhuma lista de funcionários foi fornecida.'], 400);
        }
    }
    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Funcionario  $funcionario
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
        $this->replaceNullStrings($request);

        $funcionario = Funcionario::find($id);
        if (!$request->status) {
            $user = User::find($funcionario->user_id);
            $user->email = $request->email;
            $user->name = $request->input('designacao');
            $user->save();

            if ($request->logo !== null && $request->logo !== '' && strlen($request->logo) > 10) {
                $imageData = base64_decode($request->input('logo'));
                $filename1 = 'image_' . time() . '.' . $request->extension;
                $path = Storage::put('funcionarios/imagens/' . $filename1, $imageData);
                $funcionario->logo = 'funcionarios/imagens/' . $filename1;
            }
            $funcionario->nome = $request->input('designacao');
            $funcionario->agregado = $request->input('agregado');
            $funcionario->social = $request->input('social');
            $funcionario->genero = $request->input('genero');
            $funcionario->estado = $request->input('estado');
            $funcionario->nacionalidade = $request->input('nacionalidade');
            $funcionario->nascimento = $request->input('nascimento');
            $funcionario->municipio = $request->input('municipio');
            $funcionario->bairro = $request->input('bairro');
            $funcionario->morada = $request->input('morada');
            $funcionario->telemovel = $request->input('telemovel') != "null" ? $request->input('telemovel') : null;
            $request->telemovel1 && $funcionario->telemovel1 = $request->input('telemovel1') != "null" ? $request->input('telemovel1') : null;
            $funcionario->habilitacoesA = json_decode($request->input('habilitacoesA'));
            $funcionario->habilitacoesP = json_decode($request->input('habilitacoesP'));
            $funcionario->publicacoes = json_decode($request->input('publicacoes'));

            $funcionario->tipoDocumento = $request->input('tipoDocumento');
            $funcionario->localEmissao = $request->input('localEmissao');
            $funcionario->codigoDocumento = $request->input('codigoDocumento');
            $funcionario->dataEmissao = $request->input('dataEmissao') != "null" ? $request->input('dataEmissao') : null;
            $funcionario->dataValidade = $request->input('dataValidade') != "null" ? $request->input('dataValidade') : null;

            if ($request->documento && $request->documento !== '') {
                $file = $request->file('documento');
                $filename = 'pdf' . time() . '.' . 'pdf';
                $path = 'funcionarios/documentos/' . $filename;
                $file->storeAs('funcionarios/documentos', $filename);
                $funcionario->documento = 'funcionarios/documentos/' . $filename;
            }
            $contrato = Contrato::find($request->contratoId);
            $contrato->polo_id = $request->input('polo');
            $contrato->departamento_id = $request->input('departamento');
            $contrato->cargo = json_decode($request->input('cargo'));
            $contrato->categoria = $request->input('categoria');
            $contrato->vinculo = $request->input('vinculoLaboral');
            $contrato->salario = $request->input('salario'); // Input from the request
            $contrato->banco = $request->input('banco'); // Input from the request
            $contrato->conta = $request->input('conta'); // Input from the request
            $contrato->iban = $request->input('iban'); // Input from the request
            $contrato->nib = $request->input('nib');
            $contrato->premios = json_decode($request->input('premios'));
            $contrato->subsidios = json_decode($request->input('subsidios'));
            $contrato->avenca = $request->input('avenca');
            $contrato->licensa_maternidade = $request->input('licensa_maternidade');
            $contrato->licensa_meses = json_decode($request->input('licensa_meses'));
            $contrato->avenca_normal = $request->input('avenca_normal');
            $contrato->proporcional = $request->input('proporcional');
            $contrato->impostos_coletavel = $request->input('coletavel');
            $contrato->escalao = $request->input('escalao');
            $contrato->carga = json_decode($request->input('carga'));

            if ($request->contrato && $request->contrato !== '') {
                $file = $request->file('contrato');
                $filename = 'contrato_' . time() . '.' . $file->getClientOriginalExtension();
                $path = 'funcionarios/documentos/' . $filename;
                $file->storeAs('funcionarios/documentos', $filename);
                $contrato->contracto = $path;
            }
            $contrato->dataCelebracao = $request->input('dataCelebracao') != "null" ? $request->input('dataCelebracao') : null;
            $contrato->dataConclusao = $request->input('dataConclusao') != "null" ? $request->input('dataConclusao') : null;
            $contrato->status = 'activo';
            $contrato->save();
            $funcionario->save();
        } else {
            $funcionario->status = $request->status;
            $funcionario->save();
            $funcionarios = Funcionario::where('empresa_id', $request->empresa_id)->with(['user', 'empresa'])->orderBy('nome')->get();
            $funcionarios = $funcionarios->map(function ($item) {
                $item->contratos = Contrato::where('funcionario_id', $item->id)->with(['polo', 'departamento'])->get();

                $item->contratos = collect($item->contratos)->map(function ($item) {
                    $item->vinculoFull = VinculosLaborais::where('id', $item->vinculo)->first();
                    $item->salarioFull = Nivel::where('id', $item->salario)->first();
                    $item->subsidiosFull = collect($item->subsidios)->map(function ($item) {
                        return SubsidioValor::where('id', $item)->first();
                    })->values();
                    $item->subsidiosFull = collect($item->premios)->map(function ($item) {
                        return Premio::where('id', $item)->first();
                    })->values();
                    return $item;
                })->values();
                return $item;
            });
            return $funcionarios;
        }
    }

    public function editDocumentacao(Request $request, $id)
    {
        $funcionario = Funcionario::find($id);
        $funcionario->tipoDocumento = $request->input('tipoDocumento');
        $funcionario->localEmissao = $request->input('localEmissao');
        $funcionario->codigoDocumento = $request->input('codigoDocumento');
        $funcionario->dataEmissao = $request->input('dataEmissao');
        $funcionario->dataValidade = $request->input('dataValidade');


        if ($request->documento && $request->documento !== '') {
            $file = $request->file('documento');
            $filename = 'pdf' . time() . '.' . 'pdf';
            $path = 'funcionarios/documentos/' . $filename;
            $file->storeAs('funcionarios/documentos', $filename);
            $funcionario->documento = 'funcionarios/documentos/' . $filename;
        }

        $funcionario->save();
        $funcionario = Funcionario::where('id', $id)->with(['user', 'empresa'])->first();
        $funcionario->contratos = Contrato::where('funcionario_id', $id)->with(['polo', 'departamento'])->get();
        return $funcionario;
    }

    public function funcionariosFolha(Request $request)
    {
        $empresaId = $request->empresa_id;
        $departamentos = $request->departamentos;
        $polo = $request->polo;
        $vinculo = $request->vinculo;
        $ano = $request->ano;
        $mes = $request->mes;
        $vinculoNome = $request->vinculoNome;
        $feriasYear = $request->feriasYear;
        $feriasMonth = $request->feriasMonth;





        $funcionariosPlaceholder = Funcionario::where('empresa_id', $empresaId)
            ->get();

        $funcionarios = $funcionariosPlaceholder
            ->filter(function ($funcionario) use ($polo, $departamentos, $vinculo) {
                $contrato = $funcionario->contrato
                    ->whereIn('polo_id', [$polo])
                    ->whereIn('departamento_id', $departamentos)
                    ->whereIn('vinculo', [$vinculo])
                    ->sortByDesc('created_at')
                    ->first();

                return $contrato !== null;
            })
            ->map(function ($funcionario) use ($polo, $departamentos) {
                $latestContrato = $funcionario->contrato
                    ->whereIn('polo_id', [$polo])
                    ->whereIn('departamento_id', $departamentos)
                    ->sortByDesc('created_at')
                    ->first();
                $latestContrato->subsidios = collect($latestContrato->subsidios)->map(function ($item) {
                    return SubsidioValor::where('id', $item)->first();
                })->values();
                $latestContrato->premios = collect($latestContrato->premios)->map(function ($item) {
                    return Premio::where('id', $item)->first();
                })->values();
                $latestContrato->vinculo = VinculosLaborais::where('id', $latestContrato->vinculo)->first();

                $latestContrato->salario = Nivel::where('id', $latestContrato->salario)->first();

                $latestContrato->departamento = Departamentos::where('id', $latestContrato->departamento_id)->first();

                $funcionario->setRelation('contrato', $latestContrato);


                return $funcionario;
            })->values();

        $presencas = ControlePresenca::where('empresa_id', $empresaId)
            ->where('ano_id', $ano)
            ->where('mes', $mes);


        if ($vinculoNome) {
            $presencas = $presencas->get();
        } else {
            $presencas = $presencas->whereIn('departamento_id', $departamentos)
                ->get();
        }



        $adiantamentos = Adiantamento::with(['funcionario'])
            ->where('ano_id', $ano)
            ->where('mes', $mes)
            ->whereHas('funcionario', function ($query) use ($empresaId) {
                $query->where('empresa_id', $empresaId);
            })->get();


        $taxasSS = TaxasSS::latest()->first();
        $taxasIRT = TaxasIrt::all();

        $funcionariosFerias = Ferias::with(['funcionario.contrato', 'funcionario.user'])
            ->whereHas('funcionario.contrato', function ($query) use ($polo, $departamentos) {
                $query->where('polo_id', $polo)
                    ->whereIn('departamento_id', $departamentos);
            })
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(meses, '$[0]')) = ?", $request->feriasMonth)
            ->where('ano_id', $feriasYear)
            ->where('status_pedido', 'aceite')
            ->get();


        return response()->json([
            'funcionarios' => $funcionarios,
            'adiantamentos' => $adiantamentos,
            'presencas' => $presencas,
            'taxaSS' => $taxasSS,
            'taxasIRT' => $taxasIRT,
            'departamentos' => $departamentos,
            'ferias' => $funcionariosFerias,
            'faltas' => []
        ]);
    }

    public function dashboard(Request $request, $id)
    {
        $polo = $request->polo;
        $ano_id = $request->ano;
        $funcionario = [];
        if ($polo) {
            $funcionarios = Funcionario::where('empresa_id', $id)
                ->with(['user', 'empresa'])
                ->orderBy('nome')
                ->get()
                ->filter(function ($funcionario) use ($polo) {
                    $contrato = $funcionario->contrato
                        ->whereIn('polo_id', [$polo])
                        ->sortByDesc('created_at')
                        ->first();
                    return $contrato !== null;
                })->values();
        } else {
            $funcionarios = Funcionario::where('empresa_id', $id)->with(['user', 'empresa'])
                ->orderBy('nome')
                ->get();
        }
        $funcionarios = $funcionarios->map(function ($item) {
            $item->contratos = Contrato::where('funcionario_id', $item->id)->with(['polo', 'departamento'])->get();
            $item->contratos = collect($item->contratos)->map(function ($item) {
                $item->vinculoFull = VinculosLaborais::where('id', $item->vinculo)->first();
                $item->salarioFull = Nivel::where('id', $item->salario)->first();
                $item->subsidiosFull = collect($item->subsidios)->map(function ($item) {
                    return SubsidioValor::where('id', $item)->first();
                })->values();
                $item->premiosFull = collect($item->premios)->map(function ($item) {
                    return Premio::where('id', $item)->first();
                })->values();
                return $item;
            })->values();
            return $item;
        });

        $list = [];
        if ($polo) {
            $listaRaw = ControlePresenca::where('empresa_id', $id)
                ->where('ano_id', $ano_id)
                ->with(['departamento'])
                ->get();

            $list = $listaRaw->map(function ($item) use ($polo) {
                $item->lista = collect($item->lista)->filter(function ($entry) use ($polo) {
                    return isset($entry['info']['contrato']['polo_id']) && $entry['info']['contrato']['polo_id'] == $polo;
                })->values();

                return $item;
            });
        } else {
            $list = ControlePresenca::where('empresa_id', $id)
                ->where('ano_id', $ano_id)
                ->with(['departamento'])
                ->get();
        }

        //adiantamentos

        $adiantamentos = [];
        if ($polo) {
            $adiantamentos = Adiantamento::with(['funcionario'])
                ->where('ano_id', $ano_id)
                ->whereHas('funcionario', function ($query) use ($id, $polo) {
                    $query->where('empresa_id', $id)
                        ->whereHas('contrato', function ($query) use ($polo) {
                            $query->where('polo_id', $polo);
                        });
                })
                ->get();
        } else {
            $adiantamentos = Adiantamento::with(['funcionario'])
                ->where('ano_id', $ano_id)
                ->whereHas('funcionario', function ($query) use ($id) {
                    $query->where('empresa_id', $id);
                })->get();
        }

        // Group by mes
        $grouped = $adiantamentos->groupBy(function ($item) {
            return $item->mes;
        });

        $adiantamentos = [];
        foreach ($grouped as $key => $items) {
            $adiantamentos[] = [
                'ano_id' => $items->first()->ano_id,
                'mes' => $items->first()->mes,
                // 'lista' => $items->pluck('mes'),
                'lista' => $items->map(function ($item) {
                    $item->contrato = Contrato::where('funcionario_id', $item->funcionario_id)->with(['departamento'])
                        ->latest()
                        ->first();
                    return $item;
                })
            ];
        }

        //folhas
        $folhas = [];
        if ($polo) {
            $folhas = FolhaSalarial::where('empresa_id', $id)
                ->where('ano_id', $request->ano)
                ->where('polo_id', $polo)
                ->get();
        } else {
            $folhas = FolhaSalarial::where('empresa_id', $id)
                ->where('ano_id', $request->ano)
                ->get();
        }
        // Group by mes
        $grouped = $folhas->groupBy(function ($item) {
            return $item->mes;
        });

        $folhas = [];
        foreach ($grouped as $key => $items) {
            $folhas[] = [
                'ano_id' => $items->first()->ano_id,
                'mes' => $items->first()->mes,
                // 'lista' => $items->pluck('mes'),
                'lista' => $items->map(function ($item) {
                    $item->departamentosFull = collect($item->departamentos)->map(function ($item) {
                        return Departamentos::where('id', $item)->first();
                    })->values();

                    $item->poloFull = Polo::where('id', $item->polo_id)->first();
                    $item->vinculoFull = VinculosLaborais::where('id', $item->vinculo_id)->first();
                    return $item;
                })
            ];
        }

        return response()->json([
            'funcionarios' => $funcionarios,
            'presencas' => $list,
            'adiantamentos' => $adiantamentos,
            'folhas' => $folhas
        ]);
    }

    protected function replaceNullStrings(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            if (is_string($value) && $value === "null") {
                $request->merge([$key => null]);
            }
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Ferias;
use App\Funcionario;
use App\Mail\SendMail;
use App\Mail\SendMailPedido;
use App\Modelos\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class FeriasController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $ferias = Ferias::all();

        return $ferias;
    }

    public function myFerias()
    {
        $ano_id = request()->query('ano');
        $funcionario_id = request()->query('funcionario');

        $lista = Ferias::where('ano_id', $ano_id)
            ->where('funcionario_id', $funcionario_id)
            ->get();
        return $lista;
    }

    public function empresaFerias($id)
    {
        $polo_id = request()->query('polo') > 0 ? request()->query('polo') : null;
        $departamento_id = request()->query('departamento') > 0 ? request()->query('departamento') : null;
        $status = request()->query('status');
        $countDepartamento = 0;
        $query = Ferias::with(['funcionario.contrato', 'funcionario.user'])
            ->whereHas('funcionario', function ($query) use ($id) {
                $query->where('empresa_id', $id);
            });

        if ($polo_id) {
            $query->whereHas('funcionario.contrato', function ($query) use ($polo_id) {
                $query->where('polo_id', $polo_id);
            });
        }
        if ($departamento_id) {
            $query->whereHas('funcionario.contrato', function ($query) use ($departamento_id) {
                $query->where('departamento_id', $departamento_id);
            });
        }



        if ($status) {
            $query->where('status_pedido', $status);
        }



        $ferias = $query->get();

        if ($polo_id && $departamento_id){
            $countDepartamento = Funcionario::with(['contrato', 'user'])
            ->whereHas('contrato', function ($query) use ($polo_id, $departamento_id) {
                $query->where('polo_id', $polo_id)
                    ->where('departamento_id', $departamento_id);
            })
            ->count();

            return response()->json([
                'ferias' => $ferias,
                'countDepartamento' => $countDepartamento
            ]);
        }
        return $ferias;

    }

    public function make(Request $request)
    {
        $admin = request()->query('admin');

        $countDepartamento = Funcionario::with(['contrato', 'user'])
            ->whereHas('contrato', function ($query) use ($request) {
                $query->where('polo_id', $request->polo)
                    ->where('departamento_id', $request->departamento);
            })
            ->count();

        $countFuncionario = Ferias::with(['funcionario.contrato', 'funcionario.user'])
            ->whereHas('funcionario.contrato', function ($query) use ($request) {
                $query->where('polo_id', $request->polo)
                    ->where('departamento_id', $request->departamento);
            })
            ->where(function ($query) use ($request) {
                foreach ($request->months as $mes) {
                    $query->orWhereJsonContains('meses', $mes);
                }
            })
            ->where('status_pedido', 'aceite')
            ->get();

        $conflictingMonths = [];

        foreach ($countFuncionario as $feria) {
            foreach ($request->months as $mes) {
                if (in_array($mes, $feria->meses)) {
                    $conflictingMonths[] = $mes;
                }
            }
        }

        $conflictingMonths = array_unique($conflictingMonths);

        if ($countDepartamento > 1 && $countFuncionario->count() + 1 > (floor($countDepartamento/2))) {
            $conflictingMonthsString = implode(', ', $conflictingMonths);
            $message = "Limite de férias atingido, para os meses: {$conflictingMonthsString}. Escolha por favor outro mês porque já tem {$countFuncionario->count()} funcionários de férias para esses meses no seu departamento. (N total de funcionário do teu departamento: {$countDepartamento}; Limite mensal de férias para o teu departamento: ". floor($countDepartamento/2) . ".";
            return response()->json([
                "message" => $message
            ], 403);
        }

        $feria = Ferias::create([
            'funcionario_id' => $request->funcionario_id,
            'ano_id' => $request->ano,
            'data_inicial' => $request->iniDate,
            'data_final' => $request->finalDate,
            'dias' => $request->days,
            'meses' => $request->months,
            'status_pedido' => $request->status,
            'status' => "activo"
        ]);

        $staff = Funcionario::with(['contrato', 'user'])
            ->whereHas('contrato', function ($query) use ($request) {
                $query->where('polo_id', $request->polo)
                    ->where('departamento_id', function ($subquery) {
                        $subquery->select('id')
                            ->from('departamentos')
                            ->where('nome', 'RECURSOS HUMANOS');
                    });
            })
            ->get();
        $staffEmails = $staff->map(function ($item) {
            return $item['user']['email'];
        });


        $data = [
            'message' => $request->message
        ];
        if ($admin){
            Mail::bcc($staffEmails)->send(new SendMailPedido($data));

        }
        return $feria;
    }

    public function aceitar(Request $request, $id)
    {


        $feria = Ferias::find($id);

        $countDepartamento = Funcionario::with(['contrato', 'user'])
            ->whereHas('contrato', function ($query) use ($request) {
                $query->where('polo_id', $request->polo)
                    ->where('departamento_id', $request->departamento);
            })
            ->count();

        $countFuncionario = Ferias::with(['funcionario.contrato', 'funcionario.user'])
            ->whereHas('funcionario.contrato', function ($query) use ($request) {
                $query->where('polo_id', $request->polo)
                    ->where('departamento_id', $request->departamento);
            })
            ->where(function ($query) use ($request) {
                foreach ($request->months as $mes) {
                    $query->orWhereJsonContains('meses', $mes);
                }
            })
            ->where('status_pedido', 'aceite')
            ->get();

        $conflictingMonths = [];

        foreach ($countFuncionario as $feria) {
            foreach ($request->months as $mes) {
                if (in_array($mes, $feria->meses)) {
                    $conflictingMonths[] = $mes;
                }
            }
        }

        $conflictingMonths = array_unique($conflictingMonths);

        if ($countFuncionario->count() + 1 > (floor($countDepartamento/2))) {
            $conflictingMonthsString = implode(', ', $conflictingMonths);
            $message = "Limite de férias atingido, para os meses: {$conflictingMonthsString}. Escolha por favor outro mês porque já tem {$countFuncionario->count()} funcionários de férias para esses meses nesse departamento. (N total de funcionário desse departamento: {$countDepartamento}; Limite mensal de férias para esse departamento: ". floor($countDepartamento/2) . ".";
            return response()->json([
                "message" => $message
            ], 403);
        }

        $feria = Ferias::find($id);
        $feria->status_pedido = 'aceite';
        $feria->save();
        $feria = Ferias::with(['funcionario.contrato', 'funcionario.user'])
            ->where('id', $id)->first();

        $data = [
            'nome' => $feria['funcionario']['nome'],
            'empresa' => Empresa::find($request->empresa_id)->nome_empresa,
            'message' => $request->message,
            'title' => 'Pedido de férias aceite',

        ];

        Mail::to($feria['funcionario']['user']['email'])->send(new SendMail($data));


        $query = Ferias::with(['funcionario.contrato', 'funcionario.user'])
            ->whereHas('funcionario', function ($query) use ($request) {
                $query->where('empresa_id', $request->empresa_id);
            })
            ->where('status_pedido', 'pendente')
            ->get();

        return $query;
    }

    public function rejeitar(Request $request, $id)
    {


        $feria = Ferias::find($id);

        $feria->status_pedido = 'rejeitado';
        $feria->obs = $request->message;
        $feria->save();
        $feria = Ferias::with(['funcionario.contrato', 'funcionario.user'])
            ->where('id', $id)->first();

        $data = [
            'nome' => $feria['funcionario']['nome'],
            'empresa' => Empresa::find($request->empresa_id)->nome_empresa,
            'message' => $request->message,
            'title' => 'Pedido de férias rejeitado',
        ];

        Mail::to($feria['funcionario']['user']['email'])->send(new SendMail($data));


        $query = Ferias::with(['funcionario.contrato', 'funcionario.user'])
            ->whereHas('funcionario', function ($query) use ($request) {
                $query->where('empresa_id', $request->empresa_id);
            })
            ->where('status_pedido', 'pendente')
            ->get();

        return $query;
    }

    public function delete(Request $request, $id)
    {


        $feria = Ferias::find($id);
        $feria->delete();
    }

    public function resubmit(Request $request, $id)
    {
        $countDepartamento = Funcionario::with(['contrato', 'user'])
            ->whereHas('contrato', function ($query) use ($request) {
                $query->where('polo_id', $request->polo)
                    ->where('departamento_id', $request->departamento);
            })
            ->count();

        $countFuncionario = Ferias::with(['funcionario.contrato', 'funcionario.user'])
            ->whereHas('funcionario.contrato', function ($query) use ($request) {
                $query->where('polo_id', $request->polo)
                    ->where('departamento_id', $request->departamento);
            })
            ->where(function ($query) use ($request) {
                foreach ($request->months as $mes) {
                    $query->orWhereJsonContains('meses', $mes);
                }
            })
            ->where('status_pedido', 'aceite')
            ->get();

        $conflictingMonths = [];

        foreach ($countFuncionario as $feria) {
            foreach ($request->months as $mes) {
                if (in_array($mes, $feria->meses)) {
                    $conflictingMonths[] = $mes;
                }
            }
        }

        $conflictingMonths = array_unique($conflictingMonths);

        if ($countDepartamento > 1 && $countFuncionario->count() + 1 > (floor($countDepartamento/2))) {
            $conflictingMonthsString = implode(', ', $conflictingMonths);
            $message = "Limite de férias atingido, para os meses: {$conflictingMonthsString}. Escolha por favor outro mês porque já tem {$countFuncionario->count()} funcionários de férias para esses meses no seu departamento. (N total de funcionário do teu departamento: {$countDepartamento}; Limite mensal de férias para o teu departamento: ". floor($countDepartamento/2) . ".";
            return response()->json([
                "message" => $message
            ], 403);
        }

        $feria = Ferias::find($id);
        $feria->ano_id = $request->ano;
        $feria->data_inicial = $request->iniDate;
        $feria->data_final = $request->finalDate;
        $feria->dias = $request->days;
        $feria->meses = $request->months;
        $feria->status_pedido = 'pendente';
        $feria->save();


        $staff = Funcionario::with(['contrato', 'user'])
            ->whereHas('contrato', function ($query) use ($request) {
                $query->where('polo_id', $request->polo)
                    ->where('departamento_id', function ($subquery) {
                        $subquery->select('id')
                            ->from('departamentos')
                            ->where('nome', 'RECURSOS HUMANOS');
                    });
            })
            ->get();
        $staffEmails = $staff->map(function ($item) {
            return $item['user']['email'];
        });


        $data = [
            'message' => $request->message
        ];
        Mail::bcc($staffEmails)->send(new SendMailPedido($data));

        return $feria;
    }
}

<?php

namespace App\Http\Controllers;

use App\Factura;
use App\Http\Controllers\Controller;
use App\Models\Artigo;
use App\Models\Categoria;
use App\Models\Clientes;
use App\Models\Polo;
use App\NotaCredito;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;


class FacturaController extends Controller
{
    public function __construct()
    {
        //$this->middleware('auth:api', ['except' => ['login']]);
        $this->artigos = new Artigo();
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        $facturas = Factura::with(['cliente', 'polo'])->orderBy('dataEmissao')->get();

        return $facturas;
    }

    public function facturasFilter(Request $request)
    {
        $facturasQuery = Factura::with(['cliente', 'polo', 'notasCredito']);
        $notasQuery = NotaCredito::with(['factura', 'cliente', 'polo']);
        $recibosQuery = Factura::with(['cliente', 'polo', 'notasCredito'])->where('tipoDocumento', 'Factura')
            ->whereNotNull('recibo_hash');

        $page = $request->input('page', 1);

        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;

            $facturasQuery->where(function ($query) use ($searchTerm) {
                $query->where('numeroDocumento', 'like', "%$searchTerm%")
                    ->orWhereHas('cliente', function ($q) use ($searchTerm) {
                        $q->where('nome', 'like', "%$searchTerm%");
                    })
                    ->orWhereHas('cliente', function ($q) use ($searchTerm) {
                        $q->where('nif', 'like', "%$searchTerm%");
                    });
            });
            $notasQuery->where(function ($query) use ($searchTerm) {
                $query->where('numeroDocumento', 'like', "%$searchTerm%")
                    ->orWhereHas('cliente', function ($q) use ($searchTerm) {
                        $q->where('nome', 'like', "%$searchTerm%");
                    })
                    ->orWhereHas('cliente', function ($q) use ($searchTerm) {
                        $q->where('nif', 'like', "%$searchTerm%");
                    });
            });
            $recibosQuery->where(function ($query) use ($searchTerm) {
                $query->where('numeroDocumento', 'like', "%$searchTerm%")
                    ->orWhereHas('cliente', function ($q) use ($searchTerm) {
                        $q->where('nome', 'like', "%$searchTerm%");
                    })
                    ->orWhereHas('cliente', function ($q) use ($searchTerm) {
                        $q->where('nif', 'like', "%$searchTerm%");
                    });
            });
        }

        if ($request->has('polo') && !empty($request->polo)) {
            $facturasQuery->where('polo_id', $request->polo);
            $notasQuery->where('polo_id', $request->polo);
            $recibosQuery->where('polo_id', $request->polo);
        }
        if ($request->has('tipo') && !empty($request->tipo)) {
            if ($request->tipo == 'Recibo') {
                $facturasQuery->where('tipoDocumento', 'Factura')
                    ->whereNotNull('recibo_hash');
                $notasQuery->where('tipoDocumento', 'Recibo');
                $recibosQuery->where('tipoDocumento', 'jlkjj');

                // ->whereNotNull('recibo_hash');
            } else if (strpos($request->tipo, 'Nota de crédito') === 0) {
                $notasQuery->where('tipoDocumento', $request->tipo);
                $facturasQuery->where('tipoDocumento', $request->tipo);
                $recibosQuery->where('tipoDocumento', 'jlkjj');
            } else {
                $facturasQuery->where('tipoDocumento', $request->tipo);
                $notasQuery->where('tipoDocumento', $request->tipo);
                $recibosQuery->where('tipoDocumento', 'jlkjj');
            }
        }
        if ($request->has('month') && $request->month !== null) {
            $month = intval($request->month);
            if ($month >= 0 && $month <= 11) {
                $facturasQuery->whereMonth('dataEmissao', $month + 1);
                $notasQuery->whereMonth('dataEmissao', $month + 1);
                $recibosQuery->whereMonth('dataEmissaoRecibo', $month + 1);
            }
        }

        if ($request->has('year') && !empty($request->year)) {
            $year = intval($request->year);
            $facturasQuery->whereYear('dataEmissao', $year);
            $notasQuery->whereYear('dataEmissao', $year);
            $recibosQuery->whereYear('dataEmissaoRecibo', $year);
        }

        if ($request->has('from') && $request->has('to') && $request->from != null && $request->to != null) {
            $fromDate = Carbon::parse($request->input('from'))->startOfDay();
            $toDate = Carbon::parse($request->input('to'))->endOfDay();

            $facturasQuery->whereBetween('dataEmissao', [$fromDate, $toDate]);
            $notasQuery->whereBetween('dataEmissao', [$fromDate, $toDate]);
            $recibosQuery->whereBetween('dataEmissaoRecibo', [$fromDate, $toDate]);
        }

        // $facturas = $facturasQuery->orderBy('dataEmissao')->paginate(16);
        $facturasSub = $facturasQuery->get();
        $notasSub = $notasQuery->get();
        $recibosSub = $recibosQuery->get();
        $recibosSub->each(function (&$item) {
            $item->isRecibo = 'true';
        });

        $combined = $facturasSub->concat($notasSub)->concat($recibosSub);

        $combined->each(function (&$item) {
            if (isset($item->isRecibo) && $item->isRecibo === 'true') {
                $item->sortDate = isset($item->dataEmissaoRecibo) ? \Carbon\Carbon::parse($item->dataEmissaoRecibo) : null;
            } else {
                $item->sortDate = isset($item->dataEmissao) ? \Carbon\Carbon::parse($item->dataEmissao) : null;
            }
        });

        // Sort by latest date first
        $sorted = $combined->sortByDesc(function ($item) {
            return $item->sortDate ?? \Carbon\Carbon::parse('0000-01-01'); // fallback for nulls
        })->values();


        $results = $sorted->slice(($page - 1) * 16, 16)->values();


        $totalItems = $sorted->count();

        // paginacao manual
        $paginator = new LengthAwarePaginator(
            $results,
            $totalItems,
            16,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        $years = Factura::when(
        filled($request->polo),
        fn ($query) => $query->where('polo_id', $request->polo)
    )
            ->selectRaw('DISTINCT YEAR(dataEmissao) as year')
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        return response()->json([
            'data' => $paginator->getCollection(),
            'total_pages' => $paginator->lastPage(),
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'available_years' => $years,
            'page' => $page
        ]);
    }
    public function getFactura(Request $request) {}

    public function facturasStats(Request $request)
    {
        $facturasQuery = Factura::with(['cliente', 'polo']);

        if ($request->has('polo') && !empty($request->polo)) {
            $facturasQuery->where('polo_id', $request->polo);
        }
        if ($request->has('tipo') && !empty($request->tipo)) {
            $facturasQuery->where('tipoDocumento', $request->tipo);
        }
        if ($request->has('month') && $request->month !== null) {
            $month = intval($request->month);
            if ($month >= 0 && $month <= 11) {
                $facturasQuery->whereMonth('dataEmissao', $month + 1);
            }
        }
        if ($request->has('year') && !empty($request->year)) {
            $year = intval($request->year);
            $facturasQuery->whereYear('dataEmissao', $year);
        }

        $facturas = $facturasQuery->get();

        $total = $facturas->count();

        $pagas = 0;
        $naoPagas = 0;
        $vencidas = 0;

        $totalValor = 0;
        $pagasValor = 0;
        $naoPagasValor = 0;
        $vencidasValor = 0;

        $now = now();

        foreach ($facturas as $factura) {
            $pagamentos = $factura->pagamentos ?? [];
            $hasPagamento = false;

            // foreach ($pagamentos as $pagamento) {
            //     $value = $pagamento ?? [];
            //     if (
            //         (!empty($value['valor']) && strlen($value['valor']) > 0) ||
            //         (!empty($value['tipoPagamento'])) ||
            //         (!empty($value['referencia']) && strlen($value['referencia']) > 0) ||
            //         (!empty($value['banco']) && strlen($value['banco']) > 0)
            //     ) {
            //         $hasPagamento = true;
            //         break;
            //     }
            // }

            if (isset($factura->dataEmissaoRecibo) || $factura->tipoDocumento == 'Factura Recibo') {
                $hasPagamento = true;
            }

            $valor = floatval($factura->totalPagar);
            $totalValor += $valor;

            if ($hasPagamento) {
                $pagas++;
                $pagasValor += $valor;
            } else {
                if (
                    $factura->tipoDocumento !== 'Factura Recibo' &&
                    !empty($factura->dataValidade) &&
                    $now->gt(\Carbon\Carbon::parse($factura->dataValidade))
                ) {
                    $vencidas++;
                    $vencidasValor += $valor;
                } else {
                    $naoPagas++;
                    $naoPagasValor += $valor;
                }
            }
        }

        return response()->json([
            'total' => $total,
            'pagas' => $pagas,
            'naoPagas' => $naoPagas,
            'vencidas' => $vencidas,
            'totalValor' => $totalValor,
            'pagasValor' => $pagasValor,
            'naoPagasValor' => $naoPagasValor,
            'vencidasValor' => $vencidasValor,
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

    public function storeNoJson($request, $numeroNota)
    {
        $currentYear = Carbon::parse($request->dataEmissao)->year;
        $currentMonth = Carbon::parse($request->dataEmissao)->month;

        $fixedLetter = 'OF';
        switch ($request->factura['tipoDocumento']) {
            case 'Factura':
                $fixedLetter = 'FA';
                break;
            case 'Factura Recibo':
                $fixedLetter = 'FR';
                break;
            case 'Factura Global':
                $fixedLetter = 'FG';
                break;
            case 'Factura Pró-Forma':
                $fixedLetter = 'PP';
                break;
            default:
                $fixedLetter = 'OF';
                break;
        }

        $polo = Polo::find($request->polo_id);

        $ano_fiscal = date('Y');


        $factura_anterior = DB::table('facturas')
            ->where([['polo_id', $request->polo_id], ['ano_fiscal', $ano_fiscal], ['tipoDocumento', $request->factura['tipoDocumento']]])
            ->latest()
            ->first();

        $factura_anterior_count = DB::table('facturas')
            ->where([['polo_id', $request->polo_id], ['ano_fiscal', $ano_fiscal], ['tipoDocumento', $request->factura['tipoDocumento']]])
            ->latest()
            ->count();

        if (isset($factura_anterior->codigo_factura)) {
            $codigo_novo = $factura_anterior->codigo_factura + 1;
        } else {
            $codigo_novo = 1;
        }
        //only if FR
        $docNumber = "{$fixedLetter} {$polo->serie}-{$ano_fiscal}/{$codigo_novo}";
        $data_actual = date('Y-m-d');
        $data_time_actual_hash = now()->toDateTimeLocalString();
        $valorFormatoPagar = number_format($request->totalPagar, 2, '.', '');
        if ($factura_anterior_count > 0) {
            $valor_hash = $data_actual . ';' . $data_time_actual_hash . ';' . $docNumber . ';' . $valorFormatoPagar . ';' . $factura_anterior->hash;
            // #ASINATURA
            // $valor_do_hash = $this->criptografia->createSign($valor_hash);
            # Pegar chave primvada
            $private_key = Storage::disk('public')->get('PrivateKey.pem');
            # Criar assinatura
            openssl_sign($valor_hash, $signature, $private_key, OPENSSL_ALGO_SHA1);
            # Valor da asinatura
            $valor_do_hash = base64_encode($signature);
        } else {
            $valor_hash = $data_actual . ';' . $data_time_actual_hash . ';' . $docNumber . ';' . $valorFormatoPagar . ';';
            #ASINATURA
            // $valor_do_hash = $this->criptografia->createSign($valor_hash);
            $private_key = Storage::disk('public')->get('PrivateKey.pem');
            # Criar assinatura
            openssl_sign($valor_hash, $signature, $private_key, OPENSSL_ALGO_SHA1);
            # Valor da asinatura
            $valor_do_hash = base64_encode($signature);
        }


        // $lastDoc = DB::table('facturas')->where('tipoDocumento', $request->tipoDocumento)
        //     ->whereYear('dataEmissao', $currentYear)
        //     ->whereMonth('dataEmissao', $currentMonth)
        //     ->orderBy('id', 'desc')
        //     ->first();

        // $pattern = '/LS (\d+)' . preg_quote($fixedLetter) . $currentYear . '\/' . $currentMonth . '/';

        // if ($lastDoc && preg_match($pattern, $lastDoc->numeroDocumento, $matches)) {
        //     $lastNumber = intval($matches[1]);
        //     $newNumber = $lastNumber + 1;
        // } else {
        //     $newNumber = 1;
        // }

        // $formattedNumber = str_pad($newNumber, 2, '0', STR_PAD_LEFT);

        // $docNumber = "LS {$formattedNumber}{$fixedLetter}{$currentYear}/{$currentMonth}";



        $factura = Factura::create([
            'polo_id'         => $request->polo_id,
            'cliente_id'      => $request->cliente_id,
            'tipoDocumento'   => $request->factura['tipoDocumento'],
            'dataEmissao'  => Carbon::now()->format('Y-m-d H:i:s'),
            'dataValidade'    => Carbon::parse($request->dataValidade)->format('Y-m-d H:i:s'),
            'obs' => '',
            'moeda' => $request->moeda,
            'totalPagar' => $request->totalPagar,
            'totalImpostos' => $request->totalImpostos,
            'totalDescontos' => $request->totalDescontos,
            'produtos' => $request->produtos,
            'pagamentos' => $request->pagamentos,
            'numeroDocumento' => $docNumber,
            'ano_fiscal' => $ano_fiscal,
            'hash' => $valor_do_hash,
            'hash_test' => $valor_hash,
            'codigo_factura' => $codigo_novo,
            'status' => $request->status ?? 'activo',

        ]);

        return $factura;
    }

    public function store(Request $request)
    {
        $currentYear = Carbon::parse($request->dataEmissao)->year;
        $currentMonth = Carbon::parse($request->dataEmissao)->month;

        $fixedLetter = 'OF';
        switch ($request->tipoDocumento) {
            case 'Factura':
                $fixedLetter = 'FA';
                break;
            case 'Factura Recibo':
                $fixedLetter = 'FR';
                break;
            case 'Factura Global':
                $fixedLetter = 'FG';
                break;
            case 'Factura Pró-Forma':
                $fixedLetter = 'PP';
                break;
            default:
                $fixedLetter = 'OF';
                break;
        }

        $polo = Polo::find($request->polo_id);

        $ano_fiscal = date('Y');


        $factura_anterior = DB::table('facturas')
            ->where([['polo_id', $request->polo_id], ['ano_fiscal', $ano_fiscal], ['tipoDocumento', $request->tipoDocumento]])
            ->latest()
            ->first();

        $factura_anterior_count = DB::table('facturas')
            ->where([['polo_id', $request->polo_id], ['ano_fiscal', $ano_fiscal], ['tipoDocumento', $request->tipoDocumento]])
            ->latest()
            ->count();

        if (isset($factura_anterior->codigo_factura)) {
            $codigo_novo = $factura_anterior->codigo_factura + 1;
        } else {
            $codigo_novo = 1;
        }
        //only if FR
        $docNumber = "{$fixedLetter} {$polo->serie}-{$ano_fiscal}/{$codigo_novo}";
        $data_actual = date('Y-m-d');
        $data_time_actual_hash = now()->toDateTimeLocalString();
        $valorFormatoPagar = number_format($request->totalPagar, 2, '.', '');
        if ($factura_anterior_count > 0) {
            $valor_hash = $data_actual . ';' . $data_time_actual_hash . ';' . $docNumber . ';' . $valorFormatoPagar . ';' . $factura_anterior->hash;
            // #ASINATURA
            // $valor_do_hash = $this->criptografia->createSign($valor_hash);
            # Pegar chave primvada
            $private_key = Storage::disk('public')->get('PrivateKey.pem');
            # Criar assinatura
            openssl_sign($valor_hash, $signature, $private_key, OPENSSL_ALGO_SHA1);
            # Valor da asinatura
            $valor_do_hash = base64_encode($signature);
        } else {
            $valor_hash = $data_actual . ';' . $data_time_actual_hash . ';' . $docNumber . ';' . $valorFormatoPagar . ';';
            #ASINATURA
            // $valor_do_hash = $this->criptografia->createSign($valor_hash);
            $private_key = Storage::disk('public')->get('PrivateKey.pem');
            # Criar assinatura
            openssl_sign($valor_hash, $signature, $private_key, OPENSSL_ALGO_SHA1);
            # Valor da asinatura
            $valor_do_hash = base64_encode($signature);
        }


        // $lastDoc = DB::table('facturas')->where('tipoDocumento', $request->tipoDocumento)
        //     ->whereYear('dataEmissao', $currentYear)
        //     ->whereMonth('dataEmissao', $currentMonth)
        //     ->orderBy('id', 'desc')
        //     ->first();

        // $pattern = '/LS (\d+)' . preg_quote($fixedLetter) . $currentYear . '\/' . $currentMonth . '/';

        // if ($lastDoc && preg_match($pattern, $lastDoc->numeroDocumento, $matches)) {
        //     $lastNumber = intval($matches[1]);
        //     $newNumber = $lastNumber + 1;
        // } else {
        //     $newNumber = 1;
        // }

        // $formattedNumber = str_pad($newNumber, 2, '0', STR_PAD_LEFT);

        // $docNumber = "LS {$formattedNumber}{$fixedLetter}{$currentYear}/{$currentMonth}";



        $factura = Factura::create([
            'polo_id'         => $request->polo_id,
            'cliente_id'      => $request->cliente_id,
            'tipoDocumento'   => $request->tipoDocumento,
            'dataEmissao'     => Carbon::now()->format('Y-m-d H:i:s'),
            'dataValidade'    => Carbon::parse($request->dataValidade)->format('Y-m-d H:i:s'),
            'obs' => $request->obs,
            'moeda' => $request->moeda,
            'totalPagar' => $request->totalPagar,
            'totalImpostos' => $request->totalImpostos,
            'totalDescontos' => $request->totalDescontos,
            'produtos' => $request->produtos,
            'pagamentos' => $request->pagamentos,
            'numeroDocumento' => $docNumber,
            'ano_fiscal' => $ano_fiscal,
            'hash' => $valor_do_hash,
            'hash_test' => $valor_hash,
            'codigo_factura' => $codigo_novo,
            'status' => $request->status ?? 'activo',

        ]);
        $facturaData = [
            'id' => $factura->id,
            'tipoDocumento' => $factura->tipoDocumento,
            'dataEmissao' => $factura->dataEmissao,
            'dataValidade' => $factura->dataValidade,
            'totalPagar' => $factura->totalPagar,
            'numeroDocumento' => $factura->numeroDocumento,

            'codigo_factura' => $factura->codigo_factura,
        ];
        $jsonData = json_encode($facturaData);
        $encodedData = urlencode(base64_encode($jsonData));

        $invoiceUrl = 'localhost:4200/documentos/validar?data=' . $encodedData;


        $qrCodeBinary = QrCode::format('svg')->size(200)->generate($invoiceUrl);

$qrCodeBase64 = 'data:image/svg+xml;base64,' . base64_encode(string: $qrCodeBinary);

        $factura->qr_code = $qrCodeBase64;
        $filePath = storage_path('app/public/test_qr.svg');
        file_put_contents($filePath, $qrCodeBinary);

        $factura->qr_code = $qrCodeBase64;

        $factura->save();

        return response()->json($factura);
    }

    public function storeNota(Request $request)
    {
        $existingNota = NotaCredito::where('tipodocumento', $request->tipoDocumento)
            ->where('factura_id', $request->factura_id)
            ->first();

        if ($existingNota) {
            return response()->json([
                'erro' => 'Já tem uma ' . $request->tipoDocumento . ' para a factura informada.'
            ], 400);
        }

        $currentYear = Carbon::parse($request->dataEmissao)->year;
        $currentMonth = Carbon::parse($request->dataEmissao)->month;

        $fixedLetter = 'OF';
        switch ($request->tipoDocumento) {
            case 'Nota de crédito (anulação)':
                $fixedLetter = 'NC';
                break;
            case 'Nota de crédito (retificação)':
                $fixedLetter = 'NCR';
                break;
            default:
                $fixedLetter = 'ON';
                break;
        }

        $polo = Polo::find($request->polo_id);

        $ano_fiscal = date('Y');


        $factura_anterior = DB::table('nota_creditos')
            ->where([['polo_id', $request->polo_id], ['ano_fiscal', $ano_fiscal], ['tipoDocumento', $request->tipoDocumento]])
            ->latest()
            ->first();

        $factura_anterior_count = DB::table('nota_creditos')
            ->where([['polo_id', $request->polo_id], ['ano_fiscal', $ano_fiscal], ['tipoDocumento', $request->tipoDocumento]])
            ->latest()
            ->count();

        if (isset($factura_anterior->codigo_factura)) {
            $codigo_novo = $factura_anterior->codigo_factura + 1;
        } else {
            $codigo_novo = 1;
        }
        //only if FR
        $docNumber = "{$fixedLetter} {$polo->serie}-{$ano_fiscal}/{$codigo_novo}";
        $data_actual = date('Y-m-d');
        $data_time_actual_hash = now()->toDateTimeLocalString();
        $valorFormatoPagar = number_format($request->totalPagar, 2, '.', '');
        if ($factura_anterior_count > 0) {
            $valor_hash = $data_actual . ';' . $data_time_actual_hash . ';' . $docNumber . ';' . $valorFormatoPagar . ';' . $factura_anterior->hash;
            // #ASINATURA
            // $valor_do_hash = $this->criptografia->createSign($valor_hash);
            # Pegar chave primvada
            $private_key = Storage::disk('public')->get('PrivateKey.pem');
            # Criar assinatura
            openssl_sign($valor_hash, $signature, $private_key, OPENSSL_ALGO_SHA1);
            # Valor da asinatura
            $valor_do_hash = base64_encode($signature);
        } else {
            $valor_hash = $data_actual . ';' . $data_time_actual_hash . ';' . $docNumber . ';' . $valorFormatoPagar . ';';
            #ASINATURA
            // $valor_do_hash = $this->criptografia->createSign($valor_hash);
            $private_key = Storage::disk('public')->get('PrivateKey.pem');
            # Criar assinatura
            openssl_sign($valor_hash, $signature, $private_key, OPENSSL_ALGO_SHA1);
            # Valor da asinatura
            $valor_do_hash = base64_encode($signature);
        }


        // $lastDoc = DB::table('facturas')->where('tipoDocumento', $request->tipoDocumento)
        //     ->whereYear('dataEmissao', $currentYear)
        //     ->whereMonth('dataEmissao', $currentMonth)
        //     ->orderBy('id', 'desc')
        //     ->first();

        // $pattern = '/LS (\d+)' . preg_quote($fixedLetter) . $currentYear . '\/' . $currentMonth . '/';

        // if ($lastDoc && preg_match($pattern, $lastDoc->numeroDocumento, $matches)) {
        //     $lastNumber = intval($matches[1]);
        //     $newNumber = $lastNumber + 1;
        // } else {
        //     $newNumber = 1;
        // }

        // $formattedNumber = str_pad($newNumber, 2, '0', STR_PAD_LEFT);

        // $docNumber = "LS {$formattedNumber}{$fixedLetter}{$currentYear}/{$currentMonth}";



        $nota = NotaCredito::create([
            'factura_id' => $request->factura_id,
            'polo_id'         => $request->polo_id,
            'cliente_id'      => $request->cliente_id,
            'tipoDocumento'   => $request->tipoDocumento,
            'dataEmissao'     => Carbon::now(),
            'dataValidade'    => Carbon::parse($request->dataValidade)->format('Y-m-d H:i:s'),
            'obs' => $request->obs,
            'moeda' => $request->moeda,
            'totalPagar' => $request->totalPagar,
            'totalImpostos' => $request->totalImpostos,
            'totalDescontos' => $request->totalDescontos,
            'produtos' => $request->produtos,
            'pagamentos' => $request->pagamentos,
            'numeroDocumento' => $docNumber,
            'ano_fiscal' => $ano_fiscal,
            'hash' => $valor_do_hash,
            'hash_test' => $valor_hash,
            'codigo_factura' => $codigo_novo,
            'status' => $request->status ?? 'activo',

        ]);

        //pegar factura a ser referenciada
        $nota->load('factura');
        return response()->json($nota);
    }

    public function storeNotaRetificacao(Request $request)
    {
        $existingNota = NotaCredito::where('tipodocumento', $request->tipoDocumento)
            ->where('factura_id', $request->factura_id)
            ->first();

        if ($existingNota) {
            return response()->json([
                'erro' => 'Já tem uma ' . $request->tipoDocumento . ' para a factura informada.'
            ], 400);
        }

        $currentYear = Carbon::parse($request->dataEmissao)->year;
        $currentMonth = Carbon::parse($request->dataEmissao)->month;

        $fixedLetter = 'OF';
        switch ($request->tipoDocumento) {
            case 'Nota de crédito (anulação)':
                $fixedLetter = 'NC';
                break;
            case 'Nota de crédito (retificação)':
                $fixedLetter = 'NCR';
                break;
            default:
                $fixedLetter = 'ON';
                break;
        }

        $polo = Polo::find($request->polo_id);

        $ano_fiscal = date('Y');


        $factura_anterior = DB::table('nota_creditos')
            ->where([['polo_id', $request->polo_id], ['ano_fiscal', $ano_fiscal], ['tipoDocumento', $request->tipoDocumento]])
            ->latest()
            ->first();

        $factura_anterior_count = DB::table('nota_creditos')
            ->where([['polo_id', $request->polo_id], ['ano_fiscal', $ano_fiscal], ['tipoDocumento', $request->tipoDocumento]])
            ->latest()
            ->count();

        if (isset($factura_anterior->codigo_factura)) {
            $codigo_novo = $factura_anterior->codigo_factura + 1;
        } else {
            $codigo_novo = 1;
        }
        //only if FR
        $docNumber = "{$fixedLetter} {$polo->serie}-{$ano_fiscal}/{$codigo_novo}";
        $data_actual = date('Y-m-d');
        $data_time_actual_hash = now()->toDateTimeLocalString();
        $valorFormatoPagar = number_format($request->totalPagar, 2, '.', '');
        if ($factura_anterior_count > 0) {
            $valor_hash = $data_actual . ';' . $data_time_actual_hash . ';' . $docNumber . ';' . $valorFormatoPagar . ';' . $factura_anterior->hash;
            // #ASINATURA
            // $valor_do_hash = $this->criptografia->createSign($valor_hash);
            # Pegar chave primvada
            $private_key = Storage::disk('public')->get('PrivateKey.pem');
            # Criar assinatura
            openssl_sign($valor_hash, $signature, $private_key, OPENSSL_ALGO_SHA1);
            # Valor da asinatura
            $valor_do_hash = base64_encode($signature);
        } else {
            $valor_hash = $data_actual . ';' . $data_time_actual_hash . ';' . $docNumber . ';' . $valorFormatoPagar . ';';
            #ASINATURA
            // $valor_do_hash = $this->criptografia->createSign($valor_hash);
            $private_key = Storage::disk('public')->get('PrivateKey.pem');
            # Criar assinatura
            openssl_sign($valor_hash, $signature, $private_key, OPENSSL_ALGO_SHA1);
            # Valor da asinatura
            $valor_do_hash = base64_encode($signature);
        }


        // $lastDoc = DB::table('facturas')->where('tipoDocumento', $request->tipoDocumento)
        //     ->whereYear('dataEmissao', $currentYear)
        //     ->whereMonth('dataEmissao', $currentMonth)
        //     ->orderBy('id', 'desc')
        //     ->first();

        // $pattern = '/LS (\d+)' . preg_quote($fixedLetter) . $currentYear . '\/' . $currentMonth . '/';

        // if ($lastDoc && preg_match($pattern, $lastDoc->numeroDocumento, $matches)) {
        //     $lastNumber = intval($matches[1]);
        //     $newNumber = $lastNumber + 1;
        // } else {
        //     $newNumber = 1;
        // }

        // $formattedNumber = str_pad($newNumber, 2, '0', STR_PAD_LEFT);

        // $docNumber = "LS {$formattedNumber}{$fixedLetter}{$currentYear}/{$currentMonth}";



        $nota = NotaCredito::create([
            'factura_id' => $request->factura_id,
            'polo_id'         => $request->polo_id,
            'cliente_id'      => $request->cliente_id,
            'tipoDocumento'   => $request->tipoDocumento,
            'dataEmissao'     => Carbon::now(),
            'dataValidade'    => Carbon::parse($request->dataValidade)->format('Y-m-d H:i:s'),
            'obs' => $request->obs,
            'moeda' => $request->moeda,
            'totalPagar' => $request->factura['totalPagar'],
            'totalImpostos' => $request->factura['totalImpostos'],
            'totalDescontos' => $request->factura['totalDescontos'],
            'produtos' => $request->factura['produtos'],
            'pagamentos' => $request->pagamentos,
            'numeroDocumento' => $docNumber,
            'ano_fiscal' => $ano_fiscal,
            'hash' => $valor_do_hash,
            'hash_test' => $valor_hash,
            'codigo_factura' => $codigo_novo,
            'status' => $request->status ?? 'activo',

        ]);

        //pegar factura a ser referenciada
        $nota->load('factura');
        $factura = $this->storeNoJson($request, $nota->numeroDocumento);
        return response()->json([
            'nota' => $nota,
            'factura' => $factura
        ]);
    }


    /**
     * Display the specified resource.
     *
     * @param  \App\Factura  $factura
     * @return \Illuminate\Http\Response
     */
    public function show(Factura $factura)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Factura  $factura
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
        $factura = Factura::find($id);

        if ($request->has('recibo') && !isset($factura->dataEmissaoRecibo)) {
            $currentYear = Carbon::parse($request->dataEmissao)->year;
            $currentMonth = Carbon::parse($request->dataEmissao)->month;
            $fixedLetter = 'RE';
            $polo = Polo::find($request->polo_id);
            $ano_fiscal = date('Y');


            $factura_anterior = DB::table('facturas')
                ->where([['polo_id', $request->polo_id], ['ano_fiscal', $ano_fiscal], ['tipoDocumento', $request->tipoDocumento]])
                ->whereNotNull('recibo_hash')
                ->whereNotNull('dataEmissaoRecibo')
                ->orderBy('dataEmissaoRecibo', 'desc')
                ->first();

            $factura_anterior_count = DB::table('facturas')
                ->where([['polo_id', $request->polo_id], ['ano_fiscal', $ano_fiscal], ['tipoDocumento', $request->tipoDocumento]])
                ->whereNotNull('recibo_hash')
                ->latest()
                ->count();

            if (isset($factura_anterior->codigo_recibo)) {
                $codigo_novo = $factura_anterior->codigo_recibo + 1;
            } else {
                $codigo_novo = 1;
            }
            //only if FR
            $docNumber = "{$fixedLetter} {$polo->serie}-{$ano_fiscal}/{$codigo_novo}";
            $data_actual = date('Y-m-d');
            $data_time_actual_hash = now()->toDateTimeLocalString();
            $valorFormatoPagar = number_format($request->totalPagar, 2, '.', '');
            if ($factura_anterior_count > 0) {
                $valor_hash = $data_actual . ';' . $data_time_actual_hash . ';' . $docNumber . ';' . $valorFormatoPagar . ';' . $factura_anterior->hash;
                // #ASINATURA
                // $valor_do_hash = $this->criptografia->createSign($valor_hash);
                # Pegar chave primvada
                $private_key = Storage::disk('public')->get('PrivateKey.pem');
                # Criar assinatura
                openssl_sign($valor_hash, $signature, $private_key, OPENSSL_ALGO_SHA1);
                # Valor da asinatura
                $valor_do_hash = base64_encode($signature);
            } else {
                $valor_hash = $data_actual . ';' . $data_time_actual_hash . ';' . $docNumber . ';' . $valorFormatoPagar . ';';
                #ASINATURA
                // $valor_do_hash = $this->criptografia->createSign($valor_hash);
                $private_key = Storage::disk('public')->get('PrivateKey.pem');
                # Criar assinatura
                openssl_sign($valor_hash, $signature, $private_key, OPENSSL_ALGO_SHA1);
                # Valor da asinatura
                $valor_do_hash = base64_encode($signature);
            }
            $facturaData = [
                'id' => $factura->id,
                'tipoDocumento' => 'Recibo',
                'dataEmissao' => Carbon::now()->format('Y-m-d H:i:s'),
                'numeroDocumento' => $docNumber,
                'pagamentos' => $request->pagamentos,
            ];
            $jsonData = json_encode($facturaData);
            $encodedData = urlencode(base64_encode($jsonData));

            $invoiceUrl = 'localhost:4200/documentos/validar?data=' . $encodedData;


            $qrCodeBinary = QrCode::format('svg')->size(200)->generate($invoiceUrl);

$qrCodeBase64 = 'data:image/svg+xml;base64,' . base64_encode($qrCodeBinary);


            $factura->update([
                'obs'             => $request->obs,
                'pagamentos'      => $request->pagamentos,
                'recibo_hash' => $valor_do_hash,
                'recibo_hash_test' => $valor_hash,
                'codigo_recibo' => $codigo_novo,
                'numeroRecibo' => $docNumber,
                'qr_code_recibo' => $qrCodeBase64,
                'dataEmissaoRecibo' => Carbon::now()->format('Y-m-d H:i:s'),

            ]);
        } else {
            $factura->update([
                'obs'             => $request->obs,
                'pagamentos'      => $request->pagamentos,

            ]);
        }



        return response()->json($factura);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Factura  $factura
     * @return \Illuminate\Http\Response
     */


    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Factura  $factura
     * @return \Illuminate\Http\Response
     */
    public function destroy(Factura $factura)
    {
        //
    }

    public function searchSaft(Request $request)
    {
        $facturasQuery = Factura::with(['cliente', 'polo', 'notasCredito']);
        $notasQuery = NotaCredito::with(['factura', 'cliente', 'polo']);

        if ($request->has('polo') && !empty($request->polo)) {
            $facturasQuery->where('polo_id', $request->polo);
            $notasQuery->where('polo_id', $request->polo);
        }
        if ($request->has('from') && $request->has('to') && $request->from != null && $request->to != null) {
            $fromDate = Carbon::parse($request->input('from'))->startOfDay();
            $toDate = Carbon::parse($request->input('to'))->endOfDay();

            $facturasQuery->whereBetween('dataEmissao', [$fromDate, $toDate]);
            $notasQuery->whereBetween('dataEmissao', [$fromDate, $toDate]);
        }
        $facturas = $facturasQuery->get();
        $notas = $notasQuery->get();

        $mergedResults = $facturas->merge($notas);

        // agora clientes
        $clientes = Clientes::where('empresa_id', $request->empresa)->get();

        $taxas = DB::table('impostos')->get();
        $isencoes = DB::table('isencoes')->get();

        $artigos = $this->artigos->artigos();
        $artigos = $artigos->getData();
        $artigos = json_decode(json_encode($artigos), true);

        $artigos = collect($artigos)->map(function ($artigo) {
            if ($artigo) {
                $artigo = (object) $artigo; // Convert array to object
                $artigo->categoriaFull = Categoria::find($artigo->categoria_id);
                $artigo->tipoArtigoFull = DB::table('tipos_artigos')->where('id', $artigo->tipo_artigo_id)->first();
                $artigo->impostoFull = DB::table('impostos')->where('id', $artigo->imposto_id)->first();
                $artigo->unidadeFull = DB::table('unidades_medida')->where('id', $artigo->unidade_id)->first();
                $artigo->isencaoFull = DB::table('isencoes')->where('id', $artigo->isencao_id)->first();
                $artigo->imagemFull = DB::table('imagens_artigos')->where('artigo_id', $artigo->id)->first();
                return $artigo;
            } else {
                return null;
            }
        });


        return response()->json([
            'clientes' => $clientes,
            'documentos' => $mergedResults,
            'taxas' => $taxas,
            'isencoes' => $isencoes,
            'produtos' => $artigos
        ]);
    }
}

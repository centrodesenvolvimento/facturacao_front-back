<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Factura;
use App\Modelos\Polo;
use App\Modelos\Clientes;

class NotaCredito extends Model
{
    protected $table = 'nota_creditos';

    protected $fillable = [
        'polo_id',
        'cliente_id',
        'factura_id',
        'tipoDocumento',
        'dataEmissao',
        'dataValidade',
        'obs',
        'moeda',
        'totalPagar',
        'totalImpostos',
        'totalDescontos',
        'produtos',
        'pagamentos',
        'numeroDocumento',
        'hash',
        'hash_test',
        'ano_fiscal',
        'codigo_factura',
        
        'status',
    ];

    protected $casts = [
        'produtos'       => 'json',
        'pagamentos'     => 'json',
    ];

    public function cliente()
    {
        return $this->belongsTo(Clientes::class);
    }

    public function polo()
    {
        return $this->belongsTo(Polo::class);
    }

    public function factura()
    {
        return $this->belongsTo(Factura::class);
    }
}

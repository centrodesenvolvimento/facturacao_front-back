<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Models\Polo;
use App\Models\Clientes;


class Factura extends Model
{
    protected $table = 'facturas';

    protected $fillable = [
        'polo_id',
        'cliente_id',
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
        'recibo_hash',
        'recibo_hash_test',
        'ano_fiscal',
        'codigo_factura',
        'codigo_recibo',
        'numeroRecibo',
        'dataEmissaoRecibo',
        'status',
        'qr_code',
        'qr_code_recibo'
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

    public function notasCredito()
    {
        return $this->hasMany(NotaCredito::class, 'factura_id', 'id');
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RegimesController extends Controller
{

    public function todosRegimes(){
        $regimes = DB::table('regimes')
        ->get();
        return $regimes;
    }
}

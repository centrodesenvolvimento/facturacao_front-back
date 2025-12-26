<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BaseController extends Controller
{
    protected $model;

    public function __construct($model)
    {
        $this->model = $model;
    }

    public function index()
    {
        return $this->model::all();
    }

    public function store(Request $request)
    {
        try{
            $create = $this->model::create($request->all());
            if($create):
                return true;
            else:
                return false;
            endif;

        }catch (Exception $e) {
            return ['error' => $e];
        }

    }
    public function storeGetID(Request $request)
    {
        try{
            $create = $this->model::insertGetId($request->all());
            if($create):
                return $create;
            else:
                return false;
            endif;

        }catch (Exception $e) {
            return ['error' => $e];
        }

    }
    public function show($id)
    {
        return $this->model::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $record = $this->model::findOrFail($id);
        $record->update($request->all());
        return $record;
    }

    public function destroy($id)
    {
        try{
            $record = $this->model::findOrFail($id);
            if($record->delete()):
                return ['result' => true];
            else:
                return ['result' => false];
            endif;
        } catch (Exception $e) {
            return ['error' => $e];
        }

    }
}

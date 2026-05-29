<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        if ($perPage == -1) {
            $perPage = Role::count();
        }

        return Inertia::render('Roles/Index', [
            'roles' => Role::with('permissions')->paginate($perPage)->withQueryString(),
            'permissions' => Permission::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => $validated['name']]);

        if (! empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        session()->put('success', 'Rol creado exitosamente.');

        return redirect()->back();
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,'.$role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update(['name' => $validated['name']]);

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        } else {
            $role->syncPermissions([]);
        }

        session()->put('success', 'Rol actualizado exitosamente.');

        return redirect()->back();
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'admin') {
            session()->put('error', 'No se puede eliminar el rol de administrador.');

            return redirect()->back();
        }

        $role->delete();

        session()->put('success', 'Rol eliminado exitosamente.');

        return redirect()->back();
    }
}

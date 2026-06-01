<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AccessControlController extends Controller
{
    private function authorizeAccess(): void
    {
        if (! auth()->user()->isAdminOrGerente()) {
            abort(403, 'No tienes permiso para gestionar el control de acceso.');
        }
    }

    public function index(Request $request)
    {
        $this->authorizeAccess();
        $perPage = $request->input('per_page', 10);
        $perPageRoles = $request->input('per_page_roles', 10);

        if ($perPage == -1) {
            $perPage = User::count();
        }
        if ($perPageRoles == -1) {
            $perPageRoles = Role::count();
        }

        return Inertia::render('AccessControl/Index', [
            'users' => User::with('roles')->withTrashed()->paginate($perPage)->withQueryString(),
            'roles' => Role::paginate($perPageRoles)->withQueryString(),
            'allRoles' => Role::all(),
        ]);
    }

    // ==================== USERS ====================

    public function storeUser(Request $request)
    {
        $this->authorizeAccess();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_+=\[\]{}|;:,.<>?])[A-Za-z\d@$!%*?&\-_+=\[\]{}|;:,.<>?]{8,}$/',
            ],
            'password_confirmation' => 'required|same:password',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'role' => 'nullable|string|exists:roles,name',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,name',
        ], [
            'password.regex' => 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.',
            'password_confirmation.same' => 'Las contraseñas no coinciden.',
        ]);

        $userData = [
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ];

        if ($request->hasFile('profile_photo')) {
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $userData['profile_photo_path'] = $path;
        }

        $user = User::create($userData);

        $rolesToAssign = [];
        if (! empty($validated['role'])) {
            $rolesToAssign[] = $validated['role'];
        }
        if (! empty($validated['roles'])) {
            $rolesToAssign = array_merge($rolesToAssign, $validated['roles']);
        }
        if (! empty($rolesToAssign)) {
            $user->syncRoles(array_unique($rolesToAssign));
        }

        session()->put('success', 'Usuario creado exitosamente.');

        return redirect()->back();
    }

    public function updateUser(Request $request, User $user)
    {
        $this->authorizeAccess();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,'.$user->id,
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8',
            'password_confirmation' => 'nullable|required_with:password|same:password',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'role' => 'nullable|string|exists:roles,name',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,name',
        ], [
            'password_confirmation.same' => 'Las contraseñas no coinciden.',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $updateData['profile_photo_path'] = $path;
        }

        $user->update($updateData);

        $rolesToAssign = [];
        if (! empty($validated['role'])) {
            $rolesToAssign[] = $validated['role'];
        }
        if (! empty($validated['roles'])) {
            $rolesToAssign = array_merge($rolesToAssign, $validated['roles']);
        }
        if (! empty($rolesToAssign)) {
            $user->syncRoles(array_unique($rolesToAssign));
        } else {
            $user->syncRoles([]);
        }

        session()->put('success', 'Usuario actualizado exitosamente.');

        return redirect()->back();
    }

    public function destroyUser(User $user)
    {
        $this->authorizeAccess();
        if ($user->id === auth()->id()) {
            session()->put('error', 'No puedes eliminar tu propio usuario.');

            return redirect()->back();
        }

        $user->update(['is_active' => false]);
        $user->delete();

        session()->put('success', 'Usuario deshabilitado exitosamente.');

        return redirect()->back();
    }

    // ==================== ROLES ====================

    public function storeRole(Request $request)
    {
        $this->authorizeAccess();
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
        ]);

        $role = Role::create(['name' => $validated['name']]);

        session()->put('success', 'Rol creado exitosamente.');

        return redirect()->back();
    }

    public function updateRole(Request $request, Role $role)
    {
        $this->authorizeAccess();
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,'.$role->id,
        ]);

        $role->update(['name' => $validated['name']]);

        session()->put('success', 'Rol actualizado exitosamente.');

        return redirect()->back();
    }

    public function destroyRole(Role $role)
    {
        $this->authorizeAccess();
        if ($role->name === 'admin') {
            session()->put('error', 'No se puede eliminar el rol de administrador.');

            return redirect()->back();
        }

        $role->delete();

        session()->put('success', 'Rol eliminado exitosamente.');

        return redirect()->back();
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SettingsController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        return inertia('Settings/Index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'theme' => $user->theme,
            ],
            'theme' => $user->theme ?? 'light',
            'mcp_token' => $user->mcp_token ?? null,
            'mcp_token_created_at' => $user->mcp_token_created_at ?? null,
        ]);
    }

    public function updateTheme(Request $request)
    {
        $request->validate([
            'theme' => ['required', 'in:dark,light'],
        ]);

        Auth::user()->update(['theme' => $request->theme]);

        return response()->json(['success' => true, 'theme' => $request->theme]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_+=\[\]{}|;:,.<>?])[A-Za-z\d@$!%*?&\-_+=\[\]{}|;:,.<>?]{8,}$/',
                'confirmed',
            ],
        ], [
            'password.regex' => 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.',
        ]);

        Auth::user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['success' => true, 'message' => 'Contraseña actualizada correctamente']);
    }

    public function generateMcpToken(Request $request)
    {
        $token = Str::random(64);

        Auth::user()->update([
            'mcp_token' => hash('sha256', $token),
            'mcp_token_created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'token' => $token,
            'message' => 'Token generado correctamente. Guarda este token ya que no se mostrará nuevamente.',
        ]);
    }

    public function revokeMcpToken(Request $request)
    {
        Auth::user()->update([
            'mcp_token' => null,
            'mcp_token_created_at' => null,
        ]);

        return response()->json(['success' => true, 'message' => 'Token revocado correctamente']);
    }
}

<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $loginValue = $this->login;
        $password = $this->password;
        $remember = $this->boolean('remember');

        // Si parece email, intentar primero por email
        if (filter_var($loginValue, FILTER_VALIDATE_EMAIL)) {
            if (Auth::attempt(['email' => $loginValue, 'password' => $password, 'is_active' => true], $remember)) {
                RateLimiter::clear($this->throttleKey());

                return;
            }
        }

        // Intentar por username
        if (Auth::attempt(['username' => $loginValue, 'password' => $password, 'is_active' => true], $remember)) {
            RateLimiter::clear($this->throttleKey());

            return;
        }

        // Intentar por name (búsqueda exacta)
        if (Auth::attempt(['name' => $loginValue, 'password' => $password, 'is_active' => true], $remember)) {
            RateLimiter::clear($this->throttleKey());

            return;
        }

        // Si todos fallan
        RateLimiter::hit($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => trans('auth.failed'),
        ]);
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('login')).'|'.$this->ip());
    }
}

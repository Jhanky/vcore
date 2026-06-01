<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>500 - Error del Servidor | Energy 4.0</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen flex items-center justify-center p-6" style="background-color: #000000; font-family: 'Inter', sans-serif;">
    <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class="animate-fade-in">
            <h1 class="text-8xl font-bold mb-4" style="font-family: 'Space Grotesk', sans-serif; color: #548F4B;">500</h1>
            <h2 class="text-3xl font-bold mb-6" style="font-family: 'Space Grotesk', sans-serif; color: #F8FAFC;">Sobrecarga en el Sistema</h2>
            <p class="text-lg mb-8 leading-relaxed" style="color: #A0AEB8;">
                Una tormenta solar ha interferido con nuestros servidores.
                Estamos trabajando para restablecer la conexión y estabilizar la red.
                Por favor, inténtalo de nuevo en unos momentos.
            </p>
            <div class="flex flex-wrap gap-4">
                <a href="/dashboard"
                   class="inline-flex items-center px-8 py-4 font-bold rounded-2xl hover:scale-105 transition-all"
                   style="background-color: #548F4B; color: #000000; box-shadow: 0 0 20px rgba(84,143,75,0.3);">
                    Volver al Panel
                </a>
                <button onclick="window.location.reload()"
                        class="inline-flex items-center px-8 py-4 font-bold rounded-2xl hover:scale-105 transition-all"
                        style="border: 2px solid #548F4B; color: #548F4B;">
                    Reintentar Conexión
                </button>
            </div>
        </div>

        <div class="relative group flex justify-center">
            <svg viewBox="0 0 200 200" class="w-64 h-64 transition-transform duration-500 group-hover:scale-105">
                <defs>
                    <radialGradient id="glow500" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:#548F4B;stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:#548F4B;stop-opacity:0" />
                    </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="80" fill="url(#glow500)" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#548F4B" stroke-width="3" opacity="0.4" stroke-dasharray="10 5" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="#548F4B" stroke-width="2" opacity="0.3" />
                <text x="100" y="108" text-anchor="middle" fill="#548F4B" font-size="28" font-weight="bold" font-family="Space Grotesk">500</text>
                <path d="M60 140 L100 110 L140 140" stroke="#548F4B" stroke-width="3" fill="none" opacity="0.5" />
                <circle cx="50" cy="60" r="5" fill="#548F4B" opacity="0.5" />
                <circle cx="150" cy="50" r="7" fill="#548F4B" opacity="0.4" />
            </svg>
        </div>
    </div>

    <script>
        (function() {
            function applyTheme() {
                var theme = localStorage.getItem('theme');
                var body = document.body;
                if (theme === 'light') {
                    body.style.backgroundColor = '#F8FAFC';
                    body.querySelectorAll('h2').forEach(function(el) { el.style.color = '#0F172A'; });
                    body.querySelectorAll('p').forEach(function(el) { el.style.color = '#475569'; });
                } else {
                    body.style.backgroundColor = '#000000';
                    body.querySelectorAll('h2').forEach(function(el) { el.style.color = '#F8FAFC'; });
                    body.querySelectorAll('p').forEach(function(el) { el.style.color = '#A0AEB8'; });
                }
            }
            applyTheme();
            setInterval(applyTheme, 500);
            window.addEventListener('storage', function(e) { if (e.key === 'theme') applyTheme(); });
        })();
    </script>
</body>
</html>

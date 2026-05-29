<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Página no encontrada | Energy 4.0</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen flex items-center justify-center p-6" style="background-color: #0F172A; font-family: 'Inter', sans-serif;">
    <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        <div class="animate-fade-in">
            <h1 class="font-outfit text-8xl font-bold mb-4" style="color: #FBBF24;">404</h1>
            <h2 class="text-3xl font-outfit font-bold mb-6" style="color: #F8FAFC;">Eclipse Total de Contenido</h2>
            <p class="text-lg mb-8 leading-relaxed" style="color: #94A3B8;">
                Parece que la página que buscas se ha movido fuera de la órbita de nuestro sistema.
                Incluso la energía solar más potente no puede iluminar lo que no existe.
            </p>
            <a href="/"
               class="inline-flex items-center px-8 py-4 font-bold rounded-2xl hover:scale-105 transition-all"
               style="background-color: #FBBF24; color: #0F172A; box-shadow: 0 0 20px rgba(251,191,36,0.3);">
                Regresar al Panel
            </a>
        </div>

        <div class="relative group flex justify-center">
            <svg viewBox="0 0 200 200" class="w-64 h-64 transition-transform duration-700 group-hover:scale-105">
                <defs>
                    <radialGradient id="glow404" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:#FBBF24;stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:#FBBF24;stop-opacity:0" />
                    </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="80" fill="url(#glow404)" />
                <circle cx="100" cy="100" r="50" fill="none" stroke="#FBBF24" stroke-width="2" opacity="0.5" />
                <circle cx="100" cy="100" r="35" fill="none" stroke="#FBBF24" stroke-width="2" opacity="0.3" />
                <text x="100" y="108" text-anchor="middle" fill="#FBBF24" font-size="32" font-weight="bold" font-family="Outfit">404</text>
                <circle cx="140" cy="60" r="8" fill="#FBBF24" opacity="0.6" />
                <circle cx="50" cy="140" r="5" fill="#FBBF24" opacity="0.4" />
                <circle cx="160" cy="130" r="4" fill="#FBBF24" opacity="0.3" />
            </svg>
        </div>
    </div>

    <script>
        (function() {
            function applyTheme() {
                var theme = localStorage.getItem('theme');
                var body = document.body;
                if (theme === 'light') {
                    body.style.backgroundColor = '#F1F5F9';
                    body.querySelectorAll('h2, p').forEach(function(el) {
                        el.style.color = el.tagName === 'H2' ? '#0F172A' : '#475569';
                    });
                } else {
                    body.style.backgroundColor = '#0F172A';
                    body.querySelectorAll('h2, p').forEach(function(el) {
                        el.style.color = el.tagName === 'H2' ? '#F8FAFC' : '#94A3B8';
                    });
                }
            }
            applyTheme();
            setInterval(applyTheme, 500);
            window.addEventListener('storage', function(e) { if (e.key === 'theme') applyTheme(); });
        })();
    </script>
</body>
</html>
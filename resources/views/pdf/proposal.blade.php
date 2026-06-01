<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Propuesta {{ $refCode }}</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <style>
        /* ── Core Configuration ──────────────────────────── */
        :root {
            --verde-osc: #558c4a;
            --lima: #bdd641;
            --verde-med: #7cba52;
            --fondo: #fcfff8;
            --lima-claro: #a8cd45;
            --gris: #CCCCCC;
            --gris-text: #595959;
            --negro: #000000;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
        }

        body {
            font-family: 'Inter', 'Segoe UI', Roboto, Arial, sans-serif;
            font-size: 10pt;
            color: var(--negro);
            line-height: 1.25; /* Required by instructions */
            background-color: #fff;
        }

        @page {
            size: letter portrait;
            margin: 0;
        }

        .page {
            width: 215.9mm;
            height: 279.4mm;
            padding: 15mm 15mm 20mm 15mm;
            position: relative;
            overflow: hidden;
            page-break-after: always;
            background: #fff;
        }

        .page:last-child {
            page-break-after: auto;
        }

        /* ── Header & Footer ────────────────────────────── */
        .header {
            position: absolute;
            top: 3mm;
            left: 15mm;
            right: 15mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            border-bottom: 3px double var(--lima);
        }

        .header-logo img {
            height: 65px;
            width: auto;
        }

        .header-ref {
            font-size: 8pt;
            color: var(--gris-text);
            text-transform: uppercase;
            font-weight: 400;
        }

        .footer {
            position: absolute;
            bottom: 15mm;
            left: 15mm;
            right: 15mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 8px;
            border-top: 3px double var(--lima);
            font-size: 8pt;
            color: var(--gris-text);
        }

        /* ── Typography & Headings ──────────────────────── */
        h1, h2, h3 {
            color: var(--negro);
            font-weight: 700;
        }

        .sec-head {
            font-size: 13pt;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--negro);
            border-bottom: 2px solid var(--lima);
            padding-bottom: 4px;
            margin: 25px 0 15px 0;
            display: block;
        }

        p {
            margin-bottom: 12px;
        }

        strong {
            font-weight: 700;
        }

        /* ── Tables ────────────────────────────────────── */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th {
            background-color: var(--verde-osc);
            color: #fff;
            font-weight: 600;
            text-align: left;
            padding: 10px 12px;
            font-size: 9pt;
        }

        td {
            padding: 8px 12px;
            border: 1px solid var(--gris);
            vertical-align: top;
            font-size: 9pt;
        }

        /* ── Indicators (Cards) ─────────────────────────── */
        .indicators-grid {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }

        .indicator-card {
            flex: 1;
            background-color: var(--verde-osc);
            padding: 20px 10px;
            text-align: center;
            border-radius: 8px;
            min-width: 0;
        }

        .indicator-value {
            font-size: 18pt;
            font-weight: 700;
            color: #fff;
            display: block;
        }

        .indicator-label {
            font-size: 8pt;
            color: var(--lima-claro);
            margin-top: 4px;
            display: block;
            text-transform: uppercase;
        }

        /* ── Specific Elements ─────────────────────────── */
        .cover-content {
            text-align: center;
            margin-top: 50mm;
        }

        .cover-title {
            font-size: 24pt;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .cover-subtitle {
            font-size: 16pt;
            color: var(--lima);
            margin-bottom: 40px;
        }

        .cover-data-table {
            width: 70%;
            margin: 0 auto;
        }

        .cover-data-table td {
            text-align: left;
            padding: 12px;
        }

        .cover-data-table .label {
            font-weight: 700;
            width: 40%;
            background-color: #f9f9f9;
        }

        .value-box {
            background-color: var(--verde-osc);
            color: #fff;
            padding: 25px;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 0;
        }

        .value-label {
            font-size: 12pt;
            font-weight: 600;
        }

        .value-amount {
            font-size: 22pt;
            font-weight: 700;
            text-align: right;
        }

        .value-sub {
            font-size: 9pt;
            color: var(--lima-claro);
            display: block;
        }

        .bullet-list {
            list-style: none;
            margin-bottom: 20px;
        }

        .bullet-list li {
            position: relative;
            padding-left: 20px;
            margin-bottom: 8px;
        }

        .bullet-list li::before {
            content: "•";
            color: var(--lima);
            font-weight: bold;
            position: absolute;
            left: 0;
            font-size: 14pt;
            line-height: 1;
        }

        .design-img-placeholder {
            width: 100%;
            height: 300px;
            background-color: #f0f4f0;
            border: 2px dashed var(--gris);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
            border-radius: 12px;
        }

        .firma-section {
            margin-top: 40px;
        }

        .firma-name {
            font-size: 18pt;
            font-weight: 700;
            color: var(--lima);
            margin-bottom: 2px;
        }

        .firma-title {
            font-weight: 400;
            color: var(--gris-text);
        }

        .thanks-msg {
            text-align: center;
            margin-top: 60px;
            padding: 20px;
            border-top: 1px solid var(--lima);
        }

        .thanks-msg h2 {
            color: var(--lima);
            font-size: 14pt;
            margin-bottom: 5px;
        }

        /* ── Utility Classes ────────────────────────────── */
        .mt-40 { margin-top: 40px; }
        .text-center { text-align: center; }
        .w-full { width: 100%; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .gap-4 { gap: 1rem; }
        .content-area { margin-top: 15mm; }
    </style>
</head>
<body>

    @php
        $logoData = '';
        $logoSrc = '';
        foreach (['png' => 'image/png', 'webp' => 'image/webp'] as $ext => $mime) {
            $path = public_path("images/logo_energy.{$ext}");
            if (file_exists($path)) {
                $logoData = base64_encode(file_get_contents($path));
                $logoSrc = "data:{$mime};base64,{$logoData}";
                break;
            }
        }
        $companyPhone = '305 819 1216';
        $companyWebsite = 'energy4cero.com';
        $companyName = 'ENERGY 4.0 S.A.S.';
        $signerName = 'Tomás Mojica';
        $proposalVersion = $quotation->updated_at ? $quotation->updated_at->format('Ymd') : date('Ymd');
    @endphp

    {{-- ══════════════════════════════════════════════════════
         PAGE 1 — PORTADA
    ══════════════════════════════════════════════════════════ --}}
    <div class="page">
        <header class="header">
            <div class="header-logo">
                @if($logoData)
                    <img src="{{ $logoSrc }}" alt="Energy 4.0">
                @else
                    <span style="font-weight: 800; color: var(--verde-osc); font-size: 18pt;">ENERGY 4.0</span>
                @endif
            </div>
            <div class="header-ref">
                PROPUESTA TÉCNICA-ECONÓMICA · {{ $refCode }}
            </div>
        </header>

        <div class="cover-content">
            <h1 class="cover-title">PROPUESTA TÉCNICA-ECONÓMICA</h1>
            <p class="cover-subtitle">Sistema Fotovoltaico Interconectado {{ number_format($panelKwp, 2, ',', '.') }} kWp</p>

            <table class="cover-data-table">
                <tr><td class="label">Proyecto</td><td>{{ strtoupper($quotation->project_name) }}</td></tr>
                <tr><td class="label">Cliente</td><td>{{ $client->name ?? 'N/A' }}</td></tr>
                <tr><td class="label">Ubicación</td><td>{{ $client->city ?? 'Colombia' }}{{ $client->state ? ', ' . $client->state : '' }}</td></tr>
                <tr><td class="label">Fecha</td><td>{{ \Carbon\Carbon::parse($quotation->issue_date ?? now())->translatedFormat('d \d\e F \d\e Y') }}</td></tr>
                <tr><td class="label">Versión</td><td>{{ $proposalVersion }}</td></tr>
            </table>

            <div style="margin-top: 60px; font-size: 11pt; color: var(--gris-text);">
                Contacto: Tel. {{ $companyPhone }} · <strong>{{ $companyWebsite }}</strong>
            </div>
        </div>

        <footer class="footer">
            <div>{{ $companyWebsite }} · Tel: {{ $companyPhone }}</div>
            <div>Pág. 1 / 7</div>
        </footer>
    </div>


    {{-- ══════════════════════════════════════════════════════
         PAGE 2 — EXPERIENCIA + OBJETIVO + GENERACIÓN
    ══════════════════════════════════════════════════════════ --}}
    <div class="page">
        <header class="header">
            <div class="header-logo">
                @if($logoData)
                    <img src="{{ $logoSrc }}" alt="Energy 4.0">
                @else
                    <span style="font-weight: 800; color: var(--verde-osc); font-size: 18pt;">ENERGY 4.0</span>
                @endif
            </div>
            <div class="header-ref">PROPUESTA TÉCNICA-ECONÓMICA · {{ $refCode }}</div>
        </header>

        <div class="content-area">
            <div class="sec-head">1. NUESTRA EXPERIENCIA</div>
            <p>
                <strong>ENERGY 4.0 S.A.S.</strong> es una empresa líder en el sector energético colombiano, especializada en la transición hacia fuentes renovables. Transformamos el consumo de energía en ahorro tangible y sostenibilidad ambiental para los sectores residencial, comercial e industrial.
            </p>
            <ul class="bullet-list">
                <li>Más de 50 proyectos instalados con éxito a nivel nacional.</li>
                <li>Equipo de ingenieros certificados bajo normatividad RETIE.</li>
                <li>Alianzas con los mejores fabricantes de tecnología solar (Tier 1).</li>
                <li>Monitoreo inteligente y soporte técnico especializado.</li>
            </ul>

            <div class="sec-head">2. OBJETIVO DE LA PROPUESTA</div>
            <p>
                Implementar un sistema de generación fotovoltaica interconectado a la red de <strong>{{ number_format($panelKwp, 2, ',', '.') }} kWp</strong>, diseñado para maximizar el ahorro económico y reducir la dependencia de la red eléctrica convencional para el proyecto <strong>{{ $quotation->project_name }}</strong>.
            </p>

            <div class="sec-head">3. GENERACIÓN Y AHORRO ESTIMADO</div>
            
            <div class="indicators-grid">
                <div class="indicator-card">
                    <span class="indicator-value">{{ number_format($annualKwh, 0, ',', '.') }}</span>
                    <span class="indicator-label">kWh / año est.</span>
                </div>
                <div class="indicator-card">
                    <span class="indicator-value">{{ number_format($panelKwp, 2, ',', '.') }}</span>
                    <span class="indicator-label">Pot. instalada (kWp)</span>
                </div>
                <div class="indicator-card">
                    <span class="indicator-value">{{ number_format($monthlyKwh, 0, ',', '.') }}</span>
                    <span class="indicator-label">kWh prom./mes</span>
                </div>
                <div class="indicator-card">
                    <span class="indicator-value">${{ number_format($annualSavings / 1000000, 1, ',', '.') }}M</span>
                    <span class="indicator-label">Ahorro anual est.</span>
                </div>
            </div>

            <p style="font-size: 8pt; font-style: italic; color: var(--gris-text); margin-top: 10px;">
                *Cálculos basados en condiciones estándar: 4.5 HSP, PR 0.80 y tarifa de $1.000 COP/kWh. 
                Los valores reales pueden variar según la irradiancia real del sitio y hábitos de consumo.
            </p>
        </div>

        <footer class="footer">
            <div>{{ $companyWebsite }} · Tel: {{ $companyPhone }}</div>
            <div>Pág. 2 / 7</div>
        </footer>
    </div>


    {{-- ══════════════════════════════════════════════════════
         PAGE 3 — COMPONENTES DEL SISTEMA
    ══════════════════════════════════════════════════════════ --}}
    <div class="page">
        <header class="header">
            <div class="header-logo">
                @if($logoData)
                    <img src="{{ $logoSrc }}" alt="Energy 4.0">
                @else
                    <span style="font-weight: 800; color: var(--verde-osc); font-size: 18pt;">ENERGY 4.0</span>
                @endif
            </div>
            <div class="header-ref">PROPUESTA TÉCNICA-ECONÓMICA · {{ $refCode }}</div>
        </header>

        <div class="content-area">
            <div class="sec-head">4. COMPONENTES DEL SISTEMA</div>
            <p>Utilizamos tecnología de punta con certificaciones internacionales para asegurar la máxima vida útil de su inversión.</p>

            <table>
                <thead>
                    <tr>
                        <th style="width: 30%;">Ítem incluido</th>
                        <th style="width: 10%; text-align: center;">Cant.</th>
                        <th style="width: 60%;">Descripción Técnica</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($components as $c)
                    <tr>
                        <td style="font-weight: 700;">{{ $c['item'] }}</td>
                        <td style="text-align: center;">{{ $c['quantity'] }}</td>
                        <td style="color: var(--gris-text); font-size: 8.5pt;">{{ $c['description'] }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <p style="font-size: 8pt; font-style: italic; color: var(--gris-text);">
                *Sujeto a disponibilidad de inventario. En caso de agotado, se suministrará un equipo de iguales o superiores especificaciones técnicas.
            </p>
        </div>

        <footer class="footer">
            <div>{{ $companyWebsite }} · Tel: {{ $companyPhone }}</div>
            <div>Pág. 3 / 7</div>
        </footer>
    </div>


    {{-- ══════════════════════════════════════════════════════
         PAGE 4 — VALOR E INVERSIÓN
    ══════════════════════════════════════════════════════════ --}}
    <div class="page">
        <header class="header">
            <div class="header-logo">
                @if($logoData)
                    <img src="{{ $logoSrc }}" alt="Energy 4.0">
                @else
                    <span style="font-weight: 800; color: var(--verde-osc); font-size: 18pt;">ENERGY 4.0</span>
                @endif
            </div>
            <div class="header-ref">PROPUESTA TÉCNICA-ECONÓMICA · {{ $refCode }}</div>
        </header>

        <div class="content-area">
            <div class="sec-head">5. INVERSIÓN DEL PROYECTO</div>
            
            <div class="value-box">
                <div>
                    <span class="value-label">INVERSIÓN TOTAL LLAVE EN MANO</span>
                    <div style="font-size: 8pt; margin-top: 5px; opacity: 0.9;">
                        Incluye equipos, ingeniería, trámites, instalación y puesta en marcha.
                    </div>
                </div>
                <div>
                    <span class="value-amount">${{ number_format($quotation->total_value, 0, ',', '.') }}</span>
                    <span class="value-sub">COP · IVA INCLUIDO</span>
                </div>
            </div>

            <div class="sec-head" style="margin-top: 40px;">6. PLAN DE PAGOS</div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 8%; text-align: center;">#</th>
                        <th>Hito de Pago</th>
                        <th style="width: 15%; text-align: center;">%</th>
                        <th style="width: 25%; text-align: right;">Valor (COP)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($paymentPlan as $idx => $pay)
                    <tr>
                        <td style="text-align: center; font-weight: 600;">{{ $idx + 1 }}</td>
                        <td>{{ $pay['label'] }}</td>
                        <td style="text-align: center;">{{ intval($pay['pct'] * 100) }}%</td>
                        <td style="text-align: right; font-weight: 700;">${{ number_format($pay['value'], 0, ',', '.') }}</td>
                    </tr>
                    @endforeach
                    <tr style="background-color: var(--fondo); font-weight: 700;">
                        <td colspan="2" style="text-align: right; border-right: none;">TOTAL PROYECTO</td>
                        <td style="text-align: center; border-left: none; border-right: none;">100%</td>
                        <td style="text-align: right; border-left: none;">${{ number_format($quotation->total_value, 0, ',', '.') }}</td>
                    </tr>
                </tbody>
            </table>

            <p style="font-size: 8pt; font-style: italic; color: var(--gris-text);">
                *Los pagos se realizarán mediante transferencia bancaria a la cuenta de {{ $companyName }}.
            </p>
        </div>

        <footer class="footer">
            <div>{{ $companyWebsite }} · Tel: {{ $companyPhone }}</div>
            <div>Pág. 4 / 7</div>
        </footer>
    </div>


    {{-- ══════════════════════════════════════════════════════
         PAGE 5 — PROYECCIÓN FINANCIERA
    ══════════════════════════════════════════════════════════ --}}
    <div class="page">
        <header class="header">
            <div class="header-logo">
                @if($logoData)
                    <img src="{{ $logoSrc }}" alt="Energy 4.0">
                @else
                    <span style="font-weight: 800; color: var(--verde-osc); font-size: 18pt;">ENERGY 4.0</span>
                @endif
            </div>
            <div class="header-ref">PROPUESTA TÉCNICA-ECONÓMICA · {{ $refCode }}</div>
        </header>

        <div class="content-area">
            <div class="sec-head">7. PROYECCIÓN FINANCIERA (20 AÑOS)</div>
            <p>Análisis del retorno de inversión y ahorro acumulado a largo plazo.</p>

            <div class="indicators-grid">
                <div class="indicator-card">
                    <span class="indicator-value">~{{ $projection['paybackYears'] ?? '—' }}</span>
                    <span class="indicator-label">Años Payback est.</span>
                </div>
                <div class="indicator-card">
                    <span class="indicator-value">${{ number_format($projection['savings10'] / 1000000, 1, ',', '.') }}M</span>
                    <span class="indicator-label">Ahorro 10 años</span>
                </div>
                <div class="indicator-card">
                    <span class="indicator-value">${{ number_format($projection['savings20'] / 1000000, 1, ',', '.') }}M</span>
                    <span class="indicator-label">Ahorro 20 años</span>
                </div>
                <div class="indicator-card">
                    <span class="indicator-value">{{ number_format($projection['roi20'], 0) }}%</span>
                    <span class="indicator-label">ROI 20 años</span>
                </div>
            </div>

            <table style="margin-top: 20px; font-size: 8pt;">
                <thead>
                    <tr>
                        <th style="width: 10%; text-align: center;">Año</th>
                        <th>Producción (kWh)</th>
                        <th>Ahorro Anual</th>
                        <th>Ahorro Acumulado</th>
                        <th>ROI (%)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($projection['rows'] as $row)
                        @if($row['isHighlight'] || $row['isPayback'])
                        <tr style="{{ $row['isPayback'] ? 'background-color: var(--fondo);' : '' }}">
                            <td style="text-align: center; font-weight: 600;">{{ $row['year'] }}</td>
                            <td>{{ number_format($row['production'], 0, ',', '.') }}</td>
                            <td>${{ number_format($row['savings'], 0, ',', '.') }}</td>
                            <td style="font-weight: 700;">${{ number_format($row['cumSavings'], 0, ',', '.') }}</td>
                            <td style="color: {{ $row['roi'] >= 0 ? 'var(--verde-osc)' : 'red' }}; font-weight: 700;">
                                {{ $row['roi'] }}% @if($row['isPayback']) (PAYBACK) @endif
                            </td>
                        </tr>
                        @endif
                    @endforeach
                </tbody>
            </table>
        </div>

        <footer class="footer">
            <div>{{ $companyWebsite }} · Tel: {{ $companyPhone }}</div>
            <div>Pág. 5 / 7</div>
        </footer>
    </div>


    {{-- ══════════════════════════════════════════════════════
         PAGE 6 — DISEÑO PRELIMINAR
    ══════════════════════════════════════════════════════════ --}}
    <div class="page">
        <header class="header">
            <div class="header-logo">
                @if($logoData)
                    <img src="{{ $logoSrc }}" alt="Energy 4.0">
                @else
                    <span style="font-weight: 800; color: var(--verde-osc); font-size: 18pt;">ENERGY 4.0</span>
                @endif
            </div>
            <div class="header-ref">PROPUESTA TÉCNICA-ECONÓMICA · {{ $refCode }}</div>
        </header>

        <div class="content-area">
            <div class="sec-head">8. DISEÑO PRELIMINAR Y DISTRIBUCIÓN</div>
            
            @php
                $panelPowerW = count($panels) > 0 ? ($panels[0]->snapshot_specs['power'] ?? '') : '';
                $clientNameDisplay = $client->name ?? $quotation->project_name;
            @endphp
            
            <p>
                Se proyecta la instalación de <strong>{{ $panelCount }} módulos solares de {{ $panelPowerW }}W</strong>, con una distribución optimizada para maximizar la captación solar y facilitar labores de mantenimiento.
            </p>

            @if($designImage)
                <div style="margin-top: 20px; text-align: center;">
                    <div style="font-weight: 600; color: var(--gris-text); margin-bottom: 10px;">VISTA AÉREA PRELIMINAR</div>
                    <img src="{{ $designImage }}" alt="Diseño fotovoltaico" style="width: 100%; max-height: 320px; object-fit: contain; border-radius: 12px;">
                </div>
            @else
            <div class="design-img-placeholder">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style="margin-bottom: 10px;">
                    <rect x="5" y="25" width="50" height="30" rx="2" fill="#bdd641" opacity="0.6"/>
                    <rect x="8" y="28" width="14" height="24" rx="1" fill="#558c4a" opacity="0.4"/>
                    <rect x="24" y="28" width="14" height="24" rx="1" fill="#558c4a" opacity="0.4"/>
                    <rect x="40" y="28" width="14" height="24" rx="1" fill="#558c4a" opacity="0.4"/>
                    <polygon points="30,2 3,28 57,28" fill="#558c4a" opacity="0.3"/>
                    <line x1="18" y1="52" x2="18" y2="58" stroke="#CCCCCC" stroke-width="1.5"/>
                    <line x1="44" y1="52" x2="44" y2="58" stroke="#CCCCCC" stroke-width="1.5"/>
                    <line x1="30" y1="10" x2="30" y2="16" stroke="#7cba52" stroke-width="2" stroke-linecap="round"/>
                    <line x1="30" y1="10" x2="35" y2="13" stroke="#7cba52" stroke-width="2" stroke-linecap="round"/>
                    <line x1="30" y1="10" x2="25" y2="13" stroke="#7cba52" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="30" cy="10" r="3" fill="#bdd641"/>
                </svg>
                <div style="font-weight: 600; color: var(--gris-text);">VISTA AÉREA PRELIMINAR</div>
                <div style="font-size: 8pt; color: var(--gris);">[Inserte aquí imagen satelital con distribución de paneles]</div>
            </div>
            @endif

            <div style="margin-top: 30px;">
                <ul class="bullet-list">
                    <li><strong>Área estimada:</strong> El sistema requiere aproximadamente {{ number_format($panelCount * 2.2, 1) }} m² de área libre en cubierta.</li>
                    <li><strong>Orientación:</strong> Se priorizará la orientación Norte/Sur según la inclinación natural del techo para optimizar el rendimiento.</li>
                    <li><strong>Estructura:</strong> Sistema de montaje en aluminio anodizado de alta resistencia contra corrosión y vientos.</li>
                </ul>
            </div>
            
            <p style="font-size: 8pt; font-style: italic; color: var(--gris-text); margin-top: 20px;">
                *Las dimensiones y distribución final están sujetas a verificación técnica en sitio y planos estructurales.
            </p>
        </div>

        <footer class="footer">
            <div>{{ $companyWebsite }} · Tel: {{ $companyPhone }}</div>
            <div>Pág. 6 / 7</div>
        </footer>
    </div>


    {{-- ══════════════════════════════════════════════════════
         PAGE 7 — EXCLUSIONES Y CIERRE
    ══════════════════════════════════════════════════════════ --}}
    <div class="page">
        <header class="header">
            <div class="header-logo">
                @if($logoData)
                    <img src="{{ $logoSrc }}" alt="Energy 4.0">
                @else
                    <span style="font-weight: 800; color: var(--verde-osc); font-size: 18pt;">ENERGY 4.0</span>
                @endif
            </div>
            <div class="header-ref">PROPUESTA TÉCNICA-ECONÓMICA · {{ $refCode }}</div>
        </header>

        <div class="content-area">
            <div class="sec-head">9. EXCLUSIONES</div>
            <ul class="bullet-list">
                <li>Obras civiles mayores o refuerzos estructurales de cubierta.</li>
                <li>Adecuaciones eléctricas internas previas al punto de conexión.</li>
                <li>Poda o tala de árboles que generen sombreado.</li>
                <li>Trámites ante el operador de red no especificados en la oferta.</li>
                <li>Mantenimiento preventivo posterior al primer año de operación.</li>
            </ul>

            <div class="sec-head" style="margin-top: 40px;">10. CIERRE Y ACEPTACIÓN</div>
            <p>
                Agradecemos su interés en nuestras soluciones energéticas. Estamos listos para acompañarlo en este importante paso hacia la sostenibilidad y la eficiencia energética.
            </p>

            <div class="firma-section">
                <p>Cordialmente,</p>
                <div style="margin-top: 30px;">
                    <div class="firma-name">{{ $signerName }}</div>
                    <div class="firma-title">Asesor Comercial — {{ $companyName }}</div>
                    <div style="font-size: 9pt; color: var(--gris-text);">Tel: {{ $companyPhone }}</div>
                </div>
            </div>

            <div class="thanks-msg">
                <h2>Gracias por confiar en {{ $companyName }}</h2>
                <p>Juntos estamos construyendo el futuro de la energía en Colombia.</p>
            </div>
        </div>

        <footer class="footer">
            <div>{{ $companyWebsite }} · Tel: {{ $companyPhone }}</div>
            <div>Pág. 7 / 7</div>
        </footer>
    </div>

</body>
</html>

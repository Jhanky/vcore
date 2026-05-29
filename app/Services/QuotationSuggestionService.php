<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QuotationSuggestionService
{
    private string $apiKey;

    private string $baseUrl;

    private string $model;

    public function __construct()
    {
        $this->apiKey = config('ai.providers.openrouter.key') ?: env('OPENROUTER_API_KEY');
        $this->baseUrl = config('ai.providers.openrouter.url') ?: env('OPENROUTER_URL', 'https://openrouter.ai/api/v1');
        $this->model = config('ai.providers.openrouter.model') ?: env('OPENROUTER_MODEL', 'tencent/hy3-preview:free');
    }

    public function analyzeSystem(array $data): array
    {
        $systemType = $data['system_type'] ?? 'On-grid';
        $powerKwp = floatval($data['power_kwp'] ?? 0);
        $panels = $data['panels'] ?? [];
        $inverters = $data['inverters'] ?? [];
        $batteries = $data['batteries'] ?? [];
        $clientConsumption = floatval($data['client_consumption'] ?? 0);
        $clientLocation = $data['client_location'] ?? 'Colombia';
        $monthlyBill = floatval($data['monthly_bill'] ?? 0);

        $metrics = $this->calculateMetrics($panels, $inverters, $batteries, $clientConsumption);

        $prompt = $this->buildSmartPrompt($systemType, $powerKwp, $panels, $inverters, $batteries, $clientConsumption, $clientLocation, $monthlyBill, $metrics);

        $aiResponse = $this->callAi($prompt);

        if ($aiResponse['success']) {
            return [
                'analysis' => $aiResponse['content'],
                'metrics' => $metrics,
                'offline' => false,
            ];
        }

        return [
            'analysis' => $this->generateOfflineAnalysis($systemType, $powerKwp, $metrics),
            'metrics' => $metrics,
            'offline' => true,
            'error' => $aiResponse['error'] ?? null,
        ];
    }

    public function suggestOptimalSystem(array $clientData): array
    {
        $consumption = floatval($clientData['energy_consumption_kwh'] ?? 0);
        $location = $clientData['city'] ?? $clientData['state'] ?? 'Colombia';
        $monthlyBudget = floatval($clientData['monthly_bill_amount'] ?? 0);
        $hasFinancing = boolval($clientData['requires_financing'] ?? false);
        $networkType = $clientData['network_type'] ?? 'monofasico';

        $prompt = $this->buildSuggestionPrompt($consumption, $location, $monthlyBudget, $hasFinancing, $networkType);

        $aiResponse = $this->callAi($prompt);

        if ($aiResponse['success']) {
            return [
                'suggestion' => $aiResponse['content'],
                'basic_data' => [
                    'recommended_power_kwp' => $this->calculateRecommendedPower($consumption),
                    'estimated_coverage' => $this->estimateCoverage($consumption),
                    'estimated_savings' => $this->estimateSavings($monthlyBudget),
                ],
                'offline' => false,
            ];
        }

        return [
            'suggestion' => $this->generateBasicSuggestion($consumption, $monthlyBudget, $hasFinancing),
            'basic_data' => [
                'recommended_power_kwp' => $this->calculateRecommendedPower($consumption),
                'estimated_coverage' => $this->estimateCoverage($consumption),
                'estimated_savings' => $this->estimateSavings($monthlyBudget),
            ],
            'offline' => true,
        ];
    }

    private function calculateMetrics(array $panels, array $inverters, array $batteries, float $clientConsumption): array
    {
        $totalPanelKw = 0;
        $totalInvKw = 0;
        $totalBatteryCapacity = 0;

        foreach ($panels as $p) {
            $qty = intval($p['qty'] ?? 0);
            $power = floatval($p['power'] ?? 0);
            $totalPanelKw += ($qty * $power) / 1000;
        }

        foreach ($inverters as $inv) {
            $qty = intval($inv['qty'] ?? 0);
            $power = floatval($inv['power'] ?? 0);
            $totalInvKw += $qty * $power;
        }

        foreach ($batteries as $bat) {
            $qty = intval($bat['qty'] ?? 0);
            $capacity = floatval($bat['capacity'] ?? 0);
            $voltage = floatval($bat['voltage'] ?? 0);
            $totalBatteryCapacity += ($qty * $capacity * $voltage) / 1000;
        }

        $ratio = $totalInvKw > 0 ? $totalPanelKw / $totalInvKw : 0;
        $annualProduction = $totalPanelKw * SolarConstants::HSP * SolarConstants::DAYS_PER_YEAR * SolarConstants::PERFORMANCE_RATIO;
        $monthlyProduction = $annualProduction / 12;
        $coverage = $clientConsumption > 0 ? ($monthlyProduction / $clientConsumption) * 100 : null;
        $estimatedSavings = $monthlyProduction * SolarConstants::TARIFF_COP;

        return [
            'total_panel_kw' => round($totalPanelKw, 2),
            'total_inverter_kw' => round($totalInvKw, 1),
            'total_battery_kwh' => round($totalBatteryCapacity, 1),
            'dc_ac_ratio' => round($ratio, 2),
            'annual_production_kwh' => round($annualProduction, 0),
            'monthly_production_kwh' => round($monthlyProduction, 0),
            'daily_production_kwh' => round($annualProduction / 365, 0),
            'coverage_percent' => $coverage !== null ? round($coverage, 1) : null,
            'estimated_savings_monthly_cop' => round($estimatedSavings, 0),
            'system_status' => $this->evaluateSystemStatus($ratio, $coverage),
        ];
    }

    private function evaluateSystemStatus(float $ratio, ?float $coverage): string
    {
        if ($ratio >= 1.0 && $ratio <= 1.3) {
            if ($coverage && $coverage >= 100) {
                return 'optimal';
            }

            return 'good';
        }
        if ($ratio < 1.0) {
            return 'underdimensioned';
        }

        return 'overdimensioned';
    }

    private function buildSmartPrompt(string $systemType, float $powerKwp, array $panels, array $inverters, array $batteries, float $clientConsumption, string $location, float $monthlyBill, array $metrics): string
    {
        $prompt = "Eres un ingeniero solar certificado con 15 años de experiencia diseñando sistemas fotovoltaicos en {$location}. ".
                  "Tu rol es asesorar al vendedor de equipos solares con análisis detallados y prácticos.\n\n";

        $prompt .= "## 📊 Datos del Proyecto\n";
        $prompt .= "- **Tipo de sistema:** {$systemType}\n";
        $prompt .= "- **Potencia objetivo:** {$powerKwp} kWp\n";
        $prompt .= "- **Ubicación:** {$location}\n";
        if ($clientConsumption > 0) {
            $prompt .= "- **Consumo mensual actual:** {$clientConsumption} kWh/mes\n";
        }
        if ($monthlyBill > 0) {
            $prompt .= '- **Factura mensual actual:** $'.number_format($monthlyBill, 0, ',', '.')." COP\n";
        }

        $prompt .= "\n## 🔧 Componentes Seleccionados\n";
        $prompt .= "**Paneles:**\n";
        foreach ($panels as $i => $p) {
            $qty = intval($p['qty'] ?? 0);
            $power = floatval($p['power'] ?? 0);
            $brand = $p['brand'] ?? 'N/A';
            $model = $p['model'] ?? '';
            if ($qty > 0) {
                $kwp = round(($qty * $power) / 1000, 2);
                $prompt .= "{$i}. {$qty}x {$brand} {$model} - {$power}W c/u ({$kwp} kWp total)\n";
            }
        }

        $prompt .= "\n**Inversores:**\n";
        foreach ($inverters as $i => $inv) {
            $qty = intval($inv['qty'] ?? 0);
            $power = floatval($inv['power'] ?? 0);
            $brand = $inv['brand'] ?? 'N/A';
            $model = $inv['model'] ?? '';
            if ($qty > 0) {
                $prompt .= "{$i}. {$qty}x {$brand} {$model} - {$power}kW c/u\n";
            }
        }

        if (count($batteries) > 0) {
            $prompt .= "\n**Baterías:**\n";
            foreach ($batteries as $i => $bat) {
                $qty = intval($bat['qty'] ?? 0);
                $capacity = floatval($bat['capacity'] ?? 0);
                $voltage = floatval($bat['voltage'] ?? 0);
                if ($qty > 0) {
                    $kwh = round(($qty * $capacity * $voltage) / 1000, 1);
                    $prompt .= "{$i}. {$qty}x Batería {$capacity}Ah @ {$voltage}V ({$kwh} kWh total)\n";
                }
            }
        }

        $prompt .= "\n## 📈 Métricas del Sistema\n";
        $prompt .= "- **Potencia instalada:** {$metrics['total_panel_kw']} kWp\n";
        $prompt .= "- **Capacidad inversor:** {$metrics['total_inverter_kw']} kW\n";
        $prompt .= "- **Ratio DC/AC:** {$metrics['dc_ac_ratio']}\n";
        $prompt .= "- **Producción anual estimada:** {$metrics['annual_production_kwh']} kWh/año\n";
        $prompt .= "- **Producción mensual estimada:** {$metrics['monthly_production_kwh']} kWh/mes\n";
        if ($metrics['coverage_percent']) {
            $prompt .= "- **Cobertura de consumo:** {$metrics['coverage_percent']}%\n";
        }
        $prompt .= '- **Ahorro mensual estimado:** $'.number_format($metrics['estimated_savings_monthly_cop'], 0, ',', '.')." COP\n";

        $prompt .= "\n## 🎯 Tu Tarea\n";
        $prompt .= "Analiza en español de forma CONCISA y PRÁCTICA:\n\n";
        $prompt .= "1. **Dimensionamiento** - Ratio DC/AC óptimo? Hay riesgo de daño?\n";
        $prompt .= "2. **Cobertura** - % del consumo que cubre el sistema\n";
        $prompt .= "3. **Financiero** - ROI y payback estimado en años\n";
        $prompt .= "4. **Recomendaciones** - Cambios técnicos si hay problemas\n";
        $prompt .= "5. **Extras** - Financiamiento si aplica, productos complementarios\n\n";
        $prompt .= 'Usa emojis sparingly. Max 300 palabras. Ve directo al punto.';

        return $prompt;
    }

    private function buildSuggestionPrompt(float $consumption, string $location, float $monthlyBudget, bool $hasFinancing, string $networkType): string
    {
        $recommendedPower = $this->calculateRecommendedPower($consumption);
        $estimatedCoverage = $this->estimateCoverage($consumption);
        $estimatedSavings = $this->estimateSavings($monthlyBudget);

        $prompt = "Eres un asesor solar experto para el mercado colombiano. Un cliente potencial necesita una cotización inicial.\n\n";

        $prompt .= "## 📋 Datos del Cliente\n";
        $prompt .= "- **Consumo mensual:** {$consumption} kWh/mes\n";
        $prompt .= "- **Ubicación:** {$location}\n";
        $prompt .= '- **Factura mensual:** $'.number_format($monthlyBudget, 0, ',', '.')." COP\n";
        $prompt .= "- **Tipo de red:** {$networkType}\n";
        $prompt .= '- **¿Requiere financiamiento:** '.($hasFinancing ? 'Sí' : 'No')."\n\n";

        $prompt .= "## 📊 Cálculos Automáticos\n";
        $prompt .= "- **Potencia sugerida:** {$recommendedPower} kWp\n";
        $prompt .= "- **Cobertura estimada:** {$estimatedCoverage}%\n";
        $prompt .= '- **Ahorro mensual estimado:** $'.number_format($estimatedSavings, 0, ',', '.')." COP\n\n";

        $prompt .= "## 🎯 Tu Respuesta\n";
        $prompt .= "Con base en los datos, proporciona:\n\n";
        $prompt .= "1. **Tipo de sistema recomendado** (On-grid, Off-grid, Híbrido) y por qué\n";
        $prompt .= "2. **Potencia óptima en kWp** para cubrir al menos 80% del consumo\n";
        $prompt .= "3. **Rango de presupuesto estimado** (COP) para el sistema completo\n";
        $prompt .= "4. **Tiempo de payback estimado** en años\n";
        $prompt .= "5. **Recomendación de financiamiento** si aplica\n";
        $prompt .= "6. **Próximo paso** - ¿Qué información adicional necesitas?\n\n";
        $prompt .= 'Sé helpful y orienta al vendedor sobre la mejor opción para este cliente.';

        return $prompt;
    }

    private function callAi(string $prompt): array
    {
        if (empty($this->apiKey)) {
            return [
                'success' => false,
                'error' => 'No hay API key configurada para OpenRouter',
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(120)->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => "Eres ingeniero solar colombiano. Solo da la respuesta, sin razonamiento previo. Máximo 100 palabras.\n\n".$prompt,
                    ],
                ],
                'temperature' => 0.1,
                'max_tokens' => 300,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $message = $data['choices'][0]['message'] ?? [];
                $content = $message['content'] ?? '';

                if (empty($content) && isset($message['reasoning_details'][0]['text'])) {
                    $content = $message['reasoning_details'][0]['text'];
                }

                return [
                    'success' => ! empty($content),
                    'content' => $content,
                ];
            }

            return [
                'success' => false,
                'error' => 'Error de API: '.$response->status().' - '.$response->body(),
            ];
        } catch (\Exception $e) {
            Log::error('MiniMax AI Error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    private function calculateRecommendedPower(float $consumptionKwh): float
    {
        if ($consumptionKwh <= 0) {
            return 5.0;
        }

        return round(($consumptionKwh / (SolarConstants::HSP * SolarConstants::DAYS_PER_MONTH * SolarConstants::PERFORMANCE_RATIO)) * 1.1, 1);
    }

    private function estimateCoverage(float $consumptionKwh): float
    {
        if ($consumptionKwh <= 0) {
            return 100;
        }
        $power = $this->calculateRecommendedPower($consumptionKwh);
        $production = $power * SolarConstants::HSP * SolarConstants::DAYS_PER_MONTH * SolarConstants::PERFORMANCE_RATIO;

        return min(120, round(($production / $consumptionKwh) * 100, 1));
    }

    private function estimateSavings(float $monthlyBill): float
    {
        return $monthlyBill * 0.85;
    }

    private function generateOfflineAnalysis(string $systemType, float $powerKwp, array $metrics): string
    {
        $analysis = "## 📊 Análisis del Sistema Solar\n\n";

        $analysis .= "### ⚡ Características Principales\n";
        $analysis .= "- **Tipo de sistema:** {$systemType}\n";
        $analysis .= "- **Potencia objetivo:** {$powerKwp} kWp\n";
        $analysis .= "- **Potencia instalada:** {$metrics['total_panel_kw']} kWp\n";
        $analysis .= "- **Capacidad inversor:** {$metrics['total_inverter_kw']} kW\n";
        $analysis .= "- **Ratio DC/AC:** {$metrics['dc_ac_ratio']}\n\n";

        $analysis .= "### 🌞 Producción Estimada\n";
        $analysis .= "- **Anual:** {$metrics['annual_production_kwh']} kWh/año\n";
        $analysis .= "- **Mensual:** {$metrics['monthly_production_kwh']} kWh/mes\n";
        $analysis .= "- **Diaria:** {$metrics['daily_production_kwh']} kWh/día\n\n";

        if ($metrics['coverage_percent']) {
            $analysis .= "### 📈 Cobertura de Consumo\n";
            $analysis .= "- **Cobertura:** {$metrics['coverage_percent']}%\n";
            $analysis .= $metrics['coverage_percent'] >= 100
                ? "- **✅ El sistema cubre el 100% del consumo**\n\n"
                : "- **⚠️ Cobertura parcial: considera aumentar paneles**\n\n";
        }

        $analysis .= "### 🔍 Evaluación del Dimensionamiento\n";
        $ratio = $metrics['dc_ac_ratio'];
        if ($ratio >= 1.0 && $ratio <= 1.3) {
            $analysis .= "**✅ Óptimo:** El ratio DC/AC está en el rango ideal (1.0 - 1.3).\n\n";
        } elseif ($ratio < 1.0) {
            $analysis .= "**⚠️ Subdimensionado:** El inversor podría no aprovechar todo el potencial.\n\n";
        } else {
            $analysis .= "**⚠️ Sobredimensionado:** Existe riesgo de limitación de potencia.\n\n";
        }

        $analysis .= "### 💡 Recomendaciones\n";
        if ($ratio > 1.5) {
            $analysis .= "- ⚠️ **Reducir paneles** o usar inversor de mayor potencia\n";
        }
        if ($ratio < 0.8) {
            $analysis .= "- ⚠️ **Considerar más paneles** o inversor de menor potencia\n";
        }
        if ($metrics['coverage_percent'] && $metrics['coverage_percent'] < 80) {
            $analysis .= "- ⚠️ **Cobertura baja:** Agregar más paneles\n";
        }

        $analysis .= "\n---\n*⚠️ Análisis automático sin IA activa. Configura MINIMAX_API_KEY para obtener análisis más detallados.*";

        return $analysis;
    }

    private function generateBasicSuggestion(float $consumption, float $monthlyBudget, bool $hasFinancing): string
    {
        $power = $this->calculateRecommendedPower($consumption);
        $coverage = $this->estimateCoverage($consumption);
        $savings = $this->estimateSavings($monthlyBudget);

        $systemType = $hasFinancing ? 'Híbrido' : 'On-grid';
        $budgetMin = round($power * 4500000);
        $budgetMax = round($power * 6000000);

        $suggestion = "## ☀️ Sugerencia de Sistema Solar\n\n";
        $suggestion .= "### 📊 Resumen\n";
        $suggestion .= "- **Potencia recomendada:** {$power} kWp\n";
        $suggestion .= "- **Tipo de sistema:** {$systemType}\n";
        $suggestion .= "- **Cobertura estimada:** {$coverage}%\n";
        $suggestion .= '- **Ahorro mensual estimado:** $'.number_format($savings, 0, ',', '.')." COP\n\n";

        $suggestion .= "### 💰 Rango de Presupuesto\n";
        $suggestion .= '- **Sistema completo:** $'.number_format($budgetMin, 0, ',', '.').' - $'.number_format($budgetMax, 0, ',', '.')." COP\n\n";

        $suggestion .= "### ⏱️ Tiempo de Payback\n";
        $suggestion .= '- **Estimado:** '.round($budgetMin / ($savings * 12), 1)." años\n\n";

        if ($hasFinancing) {
            $suggestion .= "### 💳 Financiamiento\n";
            $suggestion .= "- Sistema híbrido recomendado por requerir financiamiento\n";
            $suggestion .= "- Permite almacenamiento en baterías\n\n";
        }

        $suggestion .= "---\n*⚠️ Sugerencia automática. Configura MINIMAX_API_KEY para análisis personalizado.*";

        return $suggestion;
    }
}

<?php

namespace Database\Seeders;

use App\Models\ProjectState;
use App\Models\ProjectStateField;
use Illuminate\Database\Seeder;

class ProjectStateFieldSeeder extends Seeder
{
    public function run(): void
    {
        $statesData = [
            'BORRADOR' => [
                ['field_type' => 'text', 'field_name' => 'datos_basicos', 'label' => 'Datos básicos del proyecto', 'is_required' => false, 'display_order' => 1],
                ['field_type' => 'text', 'field_name' => 'datos_cliente', 'label' => 'Datos del cliente', 'is_required' => false, 'display_order' => 2],
            ],
            'SOL_FACTIBILIDAD' => [
                ['field_type' => 'file', 'field_name' => 'formulario_solicitud', 'label' => 'Formulario solicitud de factibilidad', 'is_required' => true, 'display_order' => 1, 'accepted_types' => 'pdf,jpg,jpeg,png,doc,docx'],
                ['field_type' => 'file', 'field_name' => 'certificado_libertad', 'label' => 'Certificado de libertad y tradición', 'is_required' => true, 'display_order' => 2, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'plano_localizacion', 'label' => 'Plano de localización del predio', 'is_required' => true, 'display_order' => 3, 'accepted_types' => 'pdf,dwg,jpg,jpeg,png'],
                ['field_type' => 'file', 'field_name' => 'documento_identidad', 'label' => 'Documento de identidad / RUT', 'is_required' => true, 'display_order' => 4, 'accepted_types' => 'pdf'],
                ['field_type' => 'text', 'field_name' => 'nic_existente', 'label' => 'NIC existente (si aplica)', 'is_required' => false, 'display_order' => 5],
            ],
            'FACT_APROBADA' => [
                ['field_type' => 'file', 'field_name' => 'carta_factibilidad', 'label' => 'Carta de factibilidad del operador', 'is_required' => true, 'display_order' => 1, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'condiciones_tecnicas', 'label' => 'Condiciones técnicas y comerciales', 'is_required' => true, 'display_order' => 2, 'accepted_types' => 'pdf'],
            ],
            'DISEÑO_ELECTRICO' => [
                ['field_type' => 'file', 'field_name' => 'planos_electricos', 'label' => 'Planos eléctricos unifilares y de detalle', 'is_required' => true, 'display_order' => 1, 'accepted_types' => 'pdf,dwg'],
                ['field_type' => 'file', 'field_name' => 'memorias_calculo', 'label' => 'Memorias de cálculo', 'is_required' => true, 'display_order' => 2, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'calculo_puesta_tierra', 'label' => 'Cálculo de sistema de puesta a tierra', 'is_required' => true, 'display_order' => 3, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'fichas_equipos', 'label' => 'Fichas técnicas de equipos principales', 'is_required' => true, 'display_order' => 4, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'certificados_producto', 'label' => 'Certificados de producto', 'is_required' => true, 'display_order' => 5, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'soporte_ingeniero', 'label' => 'Soporte de ingeniero diseñador', 'is_required' => true, 'display_order' => 6, 'accepted_types' => 'pdf'],
            ],
            'DISEÑO_CONFORME' => [
                ['field_type' => 'file', 'field_name' => 'dictamen_conformidad', 'label' => 'Dictamen de conformidad de diseño', 'is_required' => true, 'display_order' => 1, 'accepted_types' => 'pdf'],
            ],
            'CONSTRUCCION' => [
                ['field_type' => 'file', 'field_name' => 'notificacion_inicio', 'label' => 'Notificación de inicio de obra', 'is_required' => false, 'display_order' => 1, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'registro_fotografico', 'label' => 'Registro fotográfico de avance', 'is_required' => false, 'display_order' => 2, 'accepted_types' => 'jpg,jpeg,png,pdf'],
                ['field_type' => 'file', 'field_name' => 'actas_visitas', 'label' => 'Actas de visitas o seguimiento (si aplica)', 'is_required' => false, 'display_order' => 3, 'accepted_types' => 'pdf'],
            ],
            'OBRA_TERMINADA' => [
                ['field_type' => 'file', 'field_name' => 'certificacion_retie', 'label' => 'Certificación RETIE', 'is_required' => true, 'display_order' => 1, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'protocolos_pruebas', 'label' => 'Protocolos de pruebas eléctricas', 'is_required' => true, 'display_order' => 2, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'protocolos_medida', 'label' => 'Protocolos de sistema de medida', 'is_required' => true, 'display_order' => 3, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'planos_asbuilt', 'label' => 'Planos as built', 'is_required' => true, 'display_order' => 4, 'accepted_types' => 'pdf,dwg'],
            ],
            'CONEXION_APROBADA' => [
                ['field_type' => 'file', 'field_name' => 'solicitud_conexion', 'label' => 'Solicitud formal de conexión', 'is_required' => true, 'display_order' => 1, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'soporte_suelo', 'label' => 'Soporte uso de suelo / POT', 'is_required' => false, 'display_order' => 2, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'licencia_ambiental', 'label' => 'Licencia ambiental o no requerimiento', 'is_required' => false, 'display_order' => 3, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'poliza_rc', 'label' => 'Póliza de responsabilidad civil (si aplica)', 'is_required' => false, 'display_order' => 4, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'carta_aprobacion', 'label' => 'Carta de aprobación de conexión', 'is_required' => true, 'display_order' => 5, 'accepted_types' => 'pdf'],
            ],
            'ENERGIZADO' => [
                ['field_type' => 'file', 'field_name' => 'acta_puesta_servicio', 'label' => 'Acta de puesta en servicio', 'is_required' => true, 'display_order' => 1, 'accepted_types' => 'pdf'],
                ['field_type' => 'file', 'field_name' => 'contrato_conexion', 'label' => 'Contrato de conexión/uso de red', 'is_required' => false, 'display_order' => 2, 'accepted_types' => 'pdf'],
                ['field_type' => 'text', 'field_name' => 'nic_suministro', 'label' => 'NIC o código de suministro', 'is_required' => true, 'display_order' => 3],
            ],
            'OPERACION_RED' => [
                ['field_type' => 'file', 'field_name' => 'reportes_generacion', 'label' => 'Reportes de generación', 'is_required' => false, 'display_order' => 1, 'accepted_types' => 'pdf,xls,xlsx'],
                ['field_type' => 'file', 'field_name' => 'evidencia_mantenimientos', 'label' => 'Evidencia de mantenimientos', 'is_required' => false, 'display_order' => 2, 'accepted_types' => 'pdf,jpg,jpeg,png'],
            ],
        ];

        foreach ($statesData as $stateCode => $fields) {
            $state = ProjectState::where('code', $stateCode)->first();

            if (! $state) {
                continue;
            }

            foreach ($fields as $field) {
                ProjectStateField::updateOrCreate(
                    [
                        'state_id' => $state->id,
                        'field_name' => $field['field_name'],
                    ],
                    $field
                );
            }
        }
    }
}

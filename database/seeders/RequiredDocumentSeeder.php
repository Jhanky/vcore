<?php

namespace Database\Seeders;

use App\Models\RequiredDocument;
use Illuminate\Database\Seeder;

class RequiredDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $documents = [
            ['flow_type' => 'OPERATOR', 'state' => 'BORRADOR', 'name' => 'Datos básicos del proyecto', 'description' => 'Nombre, ubicación y capacidad estimada de la planta.', 'is_required' => false, 'display_order' => 1],
            ['flow_type' => 'OPERATOR', 'state' => 'BORRADOR', 'name' => 'Datos del cliente', 'description' => 'Nombre, identificación y datos de contacto del cliente/promotor.', 'is_required' => false, 'display_order' => 2],

            ['flow_type' => 'OPERATOR', 'state' => 'SOL_FACTIBILIDAD', 'name' => 'Formulario solicitud de factibilidad', 'description' => 'Formato oficial del operador de red diligenciado y firmado.', 'is_required' => true, 'display_order' => 1],
            ['flow_type' => 'OPERATOR', 'state' => 'SOL_FACTIBILIDAD', 'name' => 'Certificado de libertad y tradición', 'description' => 'Certificado del predio no mayor a 30 días.', 'is_required' => true, 'display_order' => 2],
            ['flow_type' => 'OPERATOR', 'state' => 'SOL_FACTIBILIDAD', 'name' => 'Plano de localización del predio', 'description' => 'Plano con coordenadas geográficas de la ubicación del proyecto.', 'is_required' => true, 'display_order' => 3],
            ['flow_type' => 'OPERATOR', 'state' => 'SOL_FACTIBILIDAD', 'name' => 'Documento de identidad / RUT', 'description' => 'Cédula o RUT del solicitante o representante legal.', 'is_required' => true, 'display_order' => 4],
            ['flow_type' => 'OPERATOR', 'state' => 'SOL_FACTIBILIDAD', 'name' => 'NIC existente (si aplica)', 'description' => 'Número de cuenta/NIC si ya existe servicio de energía en el predio.', 'is_required' => false, 'display_order' => 5],

            ['flow_type' => 'OPERATOR', 'state' => 'FACT_APROBADA', 'name' => 'Carta de factibilidad del operador', 'description' => 'Concepto de factibilidad emitido por el operador de red.', 'is_required' => true, 'display_order' => 1],
            ['flow_type' => 'OPERATOR', 'state' => 'FACT_APROBADA', 'name' => 'Condiciones técnicas y comerciales', 'description' => 'Documento con las condiciones de conexión y uso de red.', 'is_required' => true, 'display_order' => 2],

            ['flow_type' => 'OPERATOR', 'state' => 'DISEÑO_ELECTRICO', 'name' => 'Planos eléctricos unifilares y de detalle', 'description' => 'Esquemas de la planta y del punto de conexión.', 'is_required' => true, 'display_order' => 1],
            ['flow_type' => 'OPERATOR', 'state' => 'DISEÑO_ELECTRICO', 'name' => 'Memorias de cálculo', 'description' => 'Cálculos de conductores, caídas de tensión, cortocircuito y protecciones.', 'is_required' => true, 'display_order' => 2],
            ['flow_type' => 'OPERATOR', 'state' => 'DISEÑO_ELECTRICO', 'name' => 'Cálculo de sistema de puesta a tierra', 'description' => 'Diseño y cálculo del sistema de puesta a tierra de la instalación.', 'is_required' => true, 'display_order' => 3],
            ['flow_type' => 'OPERATOR', 'state' => 'DISEÑO_ELECTRICO', 'name' => 'Fichas técnicas de equipos principales', 'description' => 'Paneles, inversores, estructuras y protecciones con certificaciones.', 'is_required' => true, 'display_order' => 4],
            ['flow_type' => 'OPERATOR', 'state' => 'DISEÑO_ELECTRICO', 'name' => 'Certificados de producto', 'description' => 'Certificados de conformidad RETIE/IEC de los equipos usados.', 'is_required' => true, 'display_order' => 5],
            ['flow_type' => 'OPERATOR', 'state' => 'DISEÑO_ELECTRICO', 'name' => 'Soporte de ingeniero diseñador', 'description' => 'Matrícula profesional y datos del responsable del diseño.', 'is_required' => true, 'display_order' => 6],

            ['flow_type' => 'OPERATOR', 'state' => 'DISEÑO_CONFORME', 'name' => 'Dictamen de conformidad de diseño', 'description' => 'Aprobación del diseño emitida por el operador.', 'is_required' => true, 'display_order' => 1],

            ['flow_type' => 'OPERATOR', 'state' => 'CONSTRUCCION', 'name' => 'Notificación de inicio de obra', 'description' => 'Comunicación de inicio de construcción enviada al operador.', 'is_required' => false, 'display_order' => 1],
            ['flow_type' => 'OPERATOR', 'state' => 'CONSTRUCCION', 'name' => 'Registro fotográfico de avance', 'description' => 'Imágenes de la obra en sus diferentes etapas.', 'is_required' => false, 'display_order' => 2],
            ['flow_type' => 'OPERATOR', 'state' => 'CONSTRUCCION', 'name' => 'Actas de visitas o seguimiento (si aplica)', 'description' => 'Actas de inspecciones realizadas durante la construcción.', 'is_required' => false, 'display_order' => 3],

            ['flow_type' => 'OPERATOR', 'state' => 'OBRA_TERMINADA', 'name' => 'Certificación RETIE', 'description' => 'Dictamen de inspección RETIE de la instalación.', 'is_required' => true, 'display_order' => 1],
            ['flow_type' => 'OPERATOR', 'state' => 'OBRA_TERMINADA', 'name' => 'Protocolos de pruebas eléctricas', 'description' => 'Resultados de pruebas de continuidad, aislamiento, protecciones, etc.', 'is_required' => true, 'display_order' => 2],
            ['flow_type' => 'OPERATOR', 'state' => 'OBRA_TERMINADA', 'name' => 'Protocolos de sistema de medida', 'description' => 'Protocolos de medidor y equipos asociados.', 'is_required' => true, 'display_order' => 3],
            ['flow_type' => 'OPERATOR', 'state' => 'OBRA_TERMINADA', 'name' => 'Planos as built', 'description' => 'Planos actualizados de cómo quedó construida la instalación.', 'is_required' => true, 'display_order' => 4],

            ['flow_type' => 'OPERATOR', 'state' => 'CONEXION_APROBADA', 'name' => 'Solicitud formal de conexión', 'description' => 'Formato de solicitud de conexión según CREG/operador.', 'is_required' => true, 'display_order' => 1],
            ['flow_type' => 'OPERATOR', 'state' => 'CONEXION_APROBADA', 'name' => 'Soporte uso de suelo / POT', 'description' => 'Documento que acredita cumplimiento de normas urbanísticas (si aplica).', 'is_required' => false, 'display_order' => 2],
            ['flow_type' => 'OPERATOR', 'state' => 'CONEXION_APROBADA', 'name' => 'Licencia ambiental o no requerimiento', 'description' => 'Licencia o certificación de que no se requiere (según proyecto).', 'is_required' => false, 'display_order' => 3],
            ['flow_type' => 'OPERATOR', 'state' => 'CONEXION_APROBADA', 'name' => 'Póliza de responsabilidad civil (si aplica)', 'description' => 'Seguro exigido por el operador para la conexión.', 'is_required' => false, 'display_order' => 4],
            ['flow_type' => 'OPERATOR', 'state' => 'CONEXION_APROBADA', 'name' => 'Carta de aprobación de conexión', 'description' => 'Comunicación oficial del operador aprobando la conexión.', 'is_required' => true, 'display_order' => 5],

            ['flow_type' => 'OPERATOR', 'state' => 'ENERGIZADO', 'name' => 'Acta de puesta en servicio', 'description' => 'Acta de energización firmada por el operador y el cliente.', 'is_required' => true, 'display_order' => 1],
            ['flow_type' => 'OPERATOR', 'state' => 'ENERGIZADO', 'name' => 'Contrato de conexión/uso de red', 'description' => 'Contrato firmado con el operador de red.', 'is_required' => false, 'display_order' => 2],
            ['flow_type' => 'OPERATOR', 'state' => 'ENERGIZADO', 'name' => 'NIC o código de suministro', 'description' => 'Número de cuenta/NIC definitivo asignado al proyecto.', 'is_required' => true, 'display_order' => 3],

            ['flow_type' => 'OPERATOR', 'state' => 'OPERACION_RED', 'name' => 'Reportes de generación', 'description' => 'Reportes periódicos de energía generada.', 'is_required' => false, 'display_order' => 1],
            ['flow_type' => 'OPERATOR', 'state' => 'OPERACION_RED', 'name' => 'Evidencia de mantenimientos', 'description' => 'Soportes de mantenimientos preventivos/correctivos.', 'is_required' => false, 'display_order' => 2],

            ['flow_type' => 'UPME', 'state' => 'UPME', 'name' => 'Solicitud/registro UPME', 'description' => 'Copia de la solicitud o formulario de registro presentado a UPME.', 'is_required' => false, 'display_order' => 1],
            ['flow_type' => 'UPME', 'state' => 'UPME', 'name' => 'Evidencia respuesta UPME', 'description' => 'Resolución, comunicación o concepto emitido por UPME.', 'is_required' => false, 'display_order' => 2],
        ];

        foreach ($documents as $document) {
            RequiredDocument::updateOrCreate(
                ['flow_type' => $document['flow_type'], 'state' => $document['state'], 'name' => $document['name']],
                $document
            );
        }
    }
}

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CleanBusinessTables extends Command
{
    protected $signature = 'db:clean-business';

    protected $description = 'Limpia todos los registros de las tablas de negocio (clients, projects, quotations, etc.)';

    public function handle(): int
    {
        $this->info('Limpiando tablas de negocio...');

        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        $tables = [
            'clients',
            'projects',
            'quotations',
            'quotation_items',
            'quotation_products',
            'quotation_status_histories',
            'project_notes',
            'project_documents',
            'project_technical_specs',
            'project_state_history',
            'project_upme_details',
            'milestones',
            'cost_centers',
            'client_contacts',
            'client_interactions',
            'client_types',
            'panels',
            'inverters',
            'batteries',
            'project_states',
            'required_documents',
            'project_state_fields',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
                $this->line("  - {$table} truncada");
            }
        }

        // Tablas pivot
        $pivotTables = [
            'client_type_client',
            'project_state_field_project',
        ];

        foreach ($pivotTables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
                $this->line("  - {$table} truncada");
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS = 1');

        $this->info('Tablas limpiadas correctamente.');

        return Command::SUCCESS;
    }
}

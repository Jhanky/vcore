<?php

use App\Http\Controllers\AccessControlController;
use App\Http\Controllers\AireSeguimientoController;
use App\Http\Controllers\BatteryController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ClientInteractionController;
use App\Http\Controllers\ClientTypeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InverterController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\PanelController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectUpmeController;
use App\Http\Controllers\ProposalController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplyController;
use App\Http\Controllers\TicketController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/theme', [SettingsController::class, 'updateTheme'])->name('settings.theme');
    Route::post('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');
    Route::post('/settings/mcp-token/generate', [SettingsController::class, 'generateMcpToken'])->name('settings.mcp-token.generate');
    Route::post('/settings/mcp-token/revoke', [SettingsController::class, 'revokeMcpToken'])->name('settings.mcp-token.revoke');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Access Control (Users + Roles unified)
    Route::get('/access-control', [AccessControlController::class, 'index'])->name('access-control.index');
    Route::post('/access-control/users', [AccessControlController::class, 'storeUser'])->name('access-control.users.store');
    Route::put('/access-control/users/{user}', [AccessControlController::class, 'updateUser'])->name('access-control.users.update');
    Route::delete('/access-control/users/{user}', [AccessControlController::class, 'destroyUser'])->name('access-control.users.destroy');
    Route::post('/access-control/roles', [AccessControlController::class, 'storeRole'])->name('access-control.roles.store');
    Route::put('/access-control/roles/{role}', [AccessControlController::class, 'updateRole'])->name('access-control.roles.update');
    Route::delete('/access-control/roles/{role}', [AccessControlController::class, 'destroyRole'])->name('access-control.roles.destroy');

    Route::resource('client-types', ClientTypeController::class)->except(['create', 'show', 'edit']);
    Route::delete('clients/destroy-multiple', [ClientController::class, 'destroyMultiple'])->name('clients.destroy-multiple');
    Route::resource('clients', ClientController::class)->except(['destroy']);
    Route::delete('clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');
    Route::post('clients/{client}/interactions', [ClientInteractionController::class, 'store'])->name('client-interactions.store');

    Route::resource('quotations', QuotationController::class);
    Route::patch('quotations/{quotation}/status', [QuotationController::class, 'updateStatus'])->name('quotations.updateStatus');
    Route::post('quotations/analyze', [QuotationController::class, 'analyzeSupplies'])->name('quotations.analyze');
    Route::post('quotations/suggest', [QuotationController::class, 'suggestSystem'])->name('quotations.suggest');
    Route::get('quotations/{quotation}/pdf', [QuotationController::class, 'generatePdf'])->name('quotations.pdf');
    Route::post('quotations/{quotation}/design-image', [QuotationController::class, 'uploadDesignImage'])->name('quotations.design-image');

    Route::resource('projects', ProjectController::class);
    Route::patch('projects/{project}/status', [ProjectController::class, 'changeStatus'])->name('projects.changeStatus');
    Route::post('projects/{project}/notes', [ProjectController::class, 'addNote'])->name('projects.notes');
    Route::post('projects/{project}/documents', [ProjectController::class, 'uploadDocument'])->name('projects.documents');
    Route::get('projects/{project}/documents/{document}/download', [ProjectController::class, 'downloadDocument'])->name('projects.documents.download');
    Route::delete('projects/{project}/documents/{document}', [ProjectController::class, 'deleteDocument'])->name('projects.documents.destroy');
    Route::get('projects/{project}/history', [ProjectController::class, 'history'])->name('projects.history');
    Route::get('projects/{project}/requirements', [ProjectController::class, 'requirements'])->name('projects.requirements');
    Route::get('projects/states', [ProjectController::class, 'states'])->name('projects.states');
    Route::get('projects/statistics', [ProjectController::class, 'statistics'])->name('projects.statistics');
    Route::post('projects/{project}/milestones', [ProjectController::class, 'storeMilestone'])->name('projects.milestones.store');
    Route::patch('projects/{project}/milestones/{milestone}', [ProjectController::class, 'updateMilestone'])->name('projects.milestones.update');
    Route::post('projects/{project}/milestones/{milestone}/complete', [ProjectController::class, 'completeMilestone'])->name('projects.milestones.complete');
    Route::get('projects/{project}/upme', [ProjectUpmeController::class, 'show'])->name('projects.upme.show');
    Route::put('projects/{project}/upme', [ProjectUpmeController::class, 'update'])->name('projects.upme.update');
    Route::get('projects/{project}/notes/{note}/download', [ProjectController::class, 'downloadNote'])->name('projects.notes.download');
    Route::get('projects/{project}/history/{history}/download', [ProjectController::class, 'downloadTransition'])->name('projects.history.download');
    Route::get('projects/{project}/states/{state}/fields', [ProjectController::class, 'getStateFields'])->name('projects.states.fields');
    Route::post('projects/{project}/transition-evidence', [ProjectController::class, 'uploadTransitionEvidence'])->name('projects.transition-evidence.upload');
    Route::delete('projects/{project}/transition-evidence/{evidence}', [ProjectController::class, 'deleteTransitionEvidence'])->name('projects.transition-evidence.delete');
    Route::get('projects/{project}/transition-evidence', [ProjectController::class, 'getTransitionEvidences'])->name('projects.transition-evidence.index');
    Route::get('projects/{project}/field-values', [ProjectController::class, 'getFieldValues'])->name('projects.field-values');
    Route::post('projects/{project}/field-values', [ProjectController::class, 'saveFieldValues'])->name('projects.field-values.save');
    Route::post('projects/{project}/field-documents', [ProjectController::class, 'uploadFieldDocument'])->name('projects.field-documents');
    Route::get('projects/{project}/documents-tab', [ProjectController::class, 'getDocumentsTab'])->name('projects.documents-tab');

    // Seguimiento Air-e
    Route::get('aire-seguimiento', [AireSeguimientoController::class, 'index'])->name('aire-seguimiento.index');
    Route::get('aire-seguimiento/create', [AireSeguimientoController::class, 'create'])->name('aire-seguimiento.create');
    Route::post('aire-seguimiento', [AireSeguimientoController::class, 'store'])->name('aire-seguimiento.store');
    Route::get('aire-seguimiento/{seguimiento}', [AireSeguimientoController::class, 'show'])->name('aire-seguimiento.show');
    Route::put('aire-seguimiento/{seguimiento}', [AireSeguimientoController::class, 'update'])->name('aire-seguimiento.update');
    Route::patch('aire-seguimiento/{seguimiento}/stage', [AireSeguimientoController::class, 'updateStage'])->name('aire-seguimiento.stage');
    Route::post('aire-seguimiento/{seguimiento}/documents', [AireSeguimientoController::class, 'uploadDocument'])->name('aire-seguimiento.documents');
    Route::post('aire-seguimiento/check-nic', [AireSeguimientoController::class, 'checkNic'])->name('aire-seguimiento.check-nic');
    Route::post('aire-seguimiento/{seguimiento}/duplicate', [AireSeguimientoController::class, 'duplicate'])->name('aire-seguimiento.duplicate');
    Route::delete('aire-seguimiento/{seguimiento}', [AireSeguimientoController::class, 'destroy'])->name('aire-seguimiento.destroy');

    Route::get('supplies', [SupplyController::class, 'index'])->name('supplies.index');

    Route::resource('panels', PanelController::class)->except(['index', 'show']);
    Route::resource('inverters', InverterController::class)->except(['index', 'show']);
    Route::resource('batteries', BatteryController::class)->except(['index', 'show']);
    Route::resource('proposals', ProposalController::class);

    // Proveedores
    Route::get('/suppliers/list', [SupplierController::class, 'list'])->name('suppliers.list');
    Route::resource('suppliers', SupplierController::class)->except(['show', 'edit', 'create']);

    // Equipos del proyecto
    Route::post('projects/{project}/equipment/import', [ProjectController::class, 'importEquipment'])->name('projects.equipment.import');
    Route::put('projects/{project}/equipment/{equipment}', [ProjectController::class, 'updateEquipment'])->name('projects.equipment.update');
    Route::delete('projects/{project}/equipment/{equipment}', [ProjectController::class, 'deleteEquipment'])->name('projects.equipment.destroy');
    Route::post('projects/{project}/equipment/{equipment}/serials', [ProjectController::class, 'storeSerials'])->name('projects.equipment.serials.store');
    Route::delete('projects/{project}/equipment/{equipment}/serials/{serial}', [ProjectController::class, 'deleteSerial'])->name('projects.equipment.serials.destroy');

    // Inventario
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('/inventory/{inventoryItem}', [InventoryController::class, 'show'])->name('inventory.show');
    Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::put('/inventory/{inventoryItem}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('/inventory/{inventoryItem}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    Route::patch('/inventory/{inventoryItem}/stock', [InventoryController::class, 'adjustStock'])->name('inventory.adjust-stock');
    Route::patch('/inventory/{inventoryItem}/location', [InventoryController::class, 'changeLocation'])->name('inventory.change-location');
    Route::get('/inventory/{inventoryItem}/movements', [InventoryController::class, 'movements'])->name('inventory.movements');

    // Mantenimientos
    Route::get('/maintenances', [MaintenanceController::class, 'index'])->name('maintenances.index');
    Route::get('/maintenances/{maintenance}', [MaintenanceController::class, 'show'])->name('maintenances.show');
    Route::post('/maintenances', [MaintenanceController::class, 'store'])->name('maintenances.store');
    Route::put('/maintenances/{maintenance}', [MaintenanceController::class, 'update'])->name('maintenances.update');
    Route::patch('/maintenances/{maintenance}/start', [MaintenanceController::class, 'startMaintenance'])->name('maintenances.start');
    Route::patch('/maintenances/{maintenance}/complete', [MaintenanceController::class, 'completeMaintenance'])->name('maintenances.complete');
    Route::patch('/maintenances/{maintenance}/cancel', [MaintenanceController::class, 'cancelMaintenance'])->name('maintenances.cancel');

    // Tickets
    Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
    Route::post('/tickets', [TicketController::class, 'store'])->name('tickets.store');
    Route::put('/tickets/{ticket}', [TicketController::class, 'update'])->name('tickets.update');
    Route::patch('/tickets/{ticket}/assign', [TicketController::class, 'assign'])->name('tickets.assign');
    Route::post('/tickets/{ticket}/comments', [TicketController::class, 'addComment'])->name('tickets.comments');
    Route::patch('/tickets/{ticket}/resolve', [TicketController::class, 'resolve'])->name('tickets.resolve');
    Route::patch('/tickets/{ticket}/close', [TicketController::class, 'close'])->name('tickets.close');
    Route::get('/tickets/attachments/{attachment}/download', [TicketController::class, 'downloadAttachment'])->name('tickets.attachments.download');
    Route::get('/tickets/attachments/{attachment}/serve', [TicketController::class, 'serveAttachment'])->name('tickets.attachments.serve');
});

require __DIR__.'/auth.php';

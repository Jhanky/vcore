<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\Project;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = InventoryItem::with('project');

        if (! empty($filters['type'])) {
            $query->byType($filters['type']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['location_type'])) {
            $query->where('location_type', $filters['location_type']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['low_stock'])) {
            $query->lowStock();
        }

        return $query->orderBy('type')->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data, User $user): InventoryItem
    {
        return DB::transaction(function () use ($data, $user) {
            $data = $this->sanitize($data);

            $item = InventoryItem::create($data);

            $this->recordMovement(
                $item,
                'in',
                $data['quantity'],
                0,
                $data['quantity'],
                $user,
                'Ingreso inicial'
            );

            return $item;
        });
    }

    public function update(InventoryItem $item, array $data): InventoryItem
    {
        $data = $this->sanitize($data);
        $item->update($data);

        return $item->fresh();
    }

    public function delete(InventoryItem $item): void
    {
        $item->delete();
    }

    public function adjustStock(InventoryItem $item, float $newQuantity, User $user, ?string $notes = null): InventoryItem
    {
        return DB::transaction(function () use ($item, $newQuantity, $user, $notes) {
            $previous = $item->quantity;
            $diff = $newQuantity - $previous;
            $type = $diff >= 0 ? 'in' : 'out';

            $item->update(['quantity' => $newQuantity]);

            $this->recordMovement(
                $item,
                'adjustment',
                abs($diff),
                $previous,
                $newQuantity,
                $user,
                $notes ?? "Ajuste manual: {$previous} → {$newQuantity}"
            );

            return $item->fresh();
        });
    }

    public function transferToProject(InventoryItem $item, Project $project, float $quantity, User $user, ?string $notes = null): InventoryItem
    {
        return DB::transaction(function () use ($item, $project, $quantity, $user, $notes) {
            $previous = $item->quantity;
            $newQuantity = $previous - $quantity;

            if ($newQuantity < 0) {
                throw new \InvalidArgumentException('Cantidad insuficiente en inventario.');
            }

            $item->update([
                'quantity' => $newQuantity,
                'location_type' => 'project',
                'project_id' => $project->id,
            ]);

            $this->recordMovement(
                $item,
                'transfer',
                $quantity,
                $previous,
                $newQuantity,
                $user,
                $notes ?? "Transferido a proyecto {$project->code}",
                'project',
                $project->id
            );

            return $item->fresh();
        });
    }

    public function transferToWarehouse(InventoryItem $item, ?string $warehouseLocation, float $quantity, User $user, ?string $notes = null): InventoryItem
    {
        return DB::transaction(function () use ($item, $warehouseLocation, $quantity, $user, $notes) {
            $previous = $item->quantity;

            $data = [
                'location_type' => 'warehouse',
                'warehouse_location' => $warehouseLocation,
            ];

            if ($quantity !== $previous) {
                $newQuantity = $previous + $quantity;
                $data['quantity'] = $newQuantity;
            } else {
                $newQuantity = $previous;
            }

            $item->update($data);

            $this->recordMovement(
                $item,
                'transfer',
                $quantity,
                $previous,
                $newQuantity,
                $user,
                $notes ?? ($warehouseLocation ? "Devuelto a {$warehouseLocation}" : 'Devuelto a bodega'),
                'project',
                $item->project_id
            );

            return $item->fresh();
        });
    }

    private function recordMovement(
        InventoryItem $item,
        string $type,
        float $quantity,
        float $previousQuantity,
        float $newQuantity,
        User $user,
        ?string $notes = null,
        ?string $referenceType = null,
        ?int $referenceId = null,
    ): InventoryMovement {
        return InventoryMovement::create([
            'inventory_item_id' => $item->id,
            'type' => $type,
            'quantity' => $quantity,
            'previous_quantity' => $previousQuantity,
            'new_quantity' => $newQuantity,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'notes' => $notes,
            'user_id' => $user->id,
        ]);
    }

    private function sanitize(array $data): array
    {
        return array_map(fn ($v) => $v === '' ? null : $v, $data);
    }
}

import type { LucideIcon } from 'lucide-react';
import type { User } from '@/types';

export interface Client {
    id: number;
    name: string;
    email?: string;
}

export interface ProjectState {
    id: number;
    name: string;
    color: string;
    slug?: string;
}

export interface MilestoneType {
    id: number;
    name: string;
    color?: string;
}

export interface Milestone {
    id: number;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
    planned_date?: string;
    actual_date?: string;
    requires_verification?: boolean;
    milestone_type?: MilestoneType;
    responsible?: { id: number; name: string };
}

export interface Quotation {
    id: number;
    code: string;
    project_name: string;
    total_value: number;
    power_kwp: number;
}

export interface Supplier {
    id: number;
    name: string;
    nit?: string;
    contact_name?: string;
    phone?: string;
}

export interface EquipmentSerial {
    id: number;
    serial_number: string;
}

export interface Equipment {
    id: number;
    product_type: 'panel' | 'inverter' | 'battery';
    brand?: string;
    model?: string;
    quantity: number;
    supplier?: Supplier;
    supplier_id?: number;
    serials?: EquipmentSerial[];
}

export interface UpmeDetail {
    upme_registration_number?: string;
    registration_date?: string;
    generation_capacity_kw?: number;
    system_type?: string;
    connection_type?: string;
    grid_integration_date?: string;
    status?: string;
    notes?: string;
}

export interface StateHistory {
    id: number;
    project_id: number;
    from_state?: ProjectState;
    to_state?: ProjectState;
    reason?: string;
    notes?: string;
    file_path?: string;
    original_filename?: string;
    started_at: string;
    duration_days?: number;
    changed_by?: { id: number; name: string };
}

export interface Note {
    id: number;
    project_id: number;
    content: string;
    file_path?: string;
    original_filename?: string;
    created_at: string;
    created_by?: { id: number; name: string };
}

export interface Project {
    id: number;
    name: string;
    code: string;
    description?: string;
    installation_address?: string;
    coordinates?: string;
    start_date?: string;
    estimated_end_date?: string;
    actual_end_date?: string;
    contracted_value_cop?: number;
    total_cost_cop?: number;
    priority?: string;
    current_state: ProjectState;
    client?: Client;
    project_manager?: { id: number; name: string };
    technical_leader?: { id: number; name: string };
    quotation?: Quotation;
    notes?: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment[];
    milestones?: Milestone[];
    state_history?: StateHistory[];
    notes_data?: Note[];
    upme_detail?: UpmeDetail;
}

export interface TabDefinition {
    id: string;
    label: string;
    icon: LucideIcon;
}

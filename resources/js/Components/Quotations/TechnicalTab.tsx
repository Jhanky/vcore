import { FileText, Sun, Cpu, Battery, Wrench, Zap, Activity, TrendingUp, Info, Box, Wallet } from 'lucide-react';

interface TechnicalTabProps {
  localData: any;
  setLocalData: any;
  editingInfo: boolean;
  setEditingInfo: any;
  editingCell: any;
  setEditingCell: any;
  handleChange: any;
  openProductModal: any;
  openAddProductModal: any;
  catalogPanels: any;
  catalogInverters: any;
  catalogBatteries: any;
  quotation: any;
  overdimensioning: any;
  specs: any;
}

export default function TechnicalTab(props: TechnicalTabProps) {
  return (
    <div className="space-y-6">
      {/* Información General */}
      <p className="text-sm text-[var(--text-secondary)]">Contenido técnico...</p>
    </div>
  );
}

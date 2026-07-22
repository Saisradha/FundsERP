import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Printer, Download, Building2, CheckCircle2 } from 'lucide-react';

interface ChallanReceiptModalProps {
  open: boolean;
  onClose: () => void;
  challan: any;
}

export const ChallanReceiptModal: React.FC<ChallanReceiptModalProps> = ({
  open,
  onClose,
  challan,
}) => {
  if (!challan) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalAmount = (challan.items || []).reduce(
    (sum: number, item: any) => sum + (item.quantity * item.unitPrice),
    0
  );

  return (
    <Modal open={open} onClose={onClose} title="Delivery Challan Receipt" subtitle="DOCUMENT PREVIEW" size="lg">
      <div className="space-y-6">
        {/* Printable Area */}
        <div id="printable-challan" className="p-6 rounded-2xl border space-y-6" style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}>
          {/* Top Header */}
          <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight" style={{ color: 'var(--color-text)' }}>
                  ERPFLOW LOGISTICS & SUPPLY
                </h3>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Official Warehouse Delivery Challan & Dispatch Slip
                </p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs font-mono font-semibold" style={{ color: 'var(--color-primary)' }}>
                {challan.challanNumber}
              </div>
              <Badge variant={challan.status === 'DELIVERED' ? 'success' : 'info'}>
                {challan.status}
              </Badge>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl border space-y-1" style={{
              backgroundColor: 'var(--color-input)',
              borderColor: 'var(--color-border)',
            }}>
              <span className="font-mono text-[10px] uppercase font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                CUSTOMER / DISPATCH RECIPIENT
              </span>
              <div className="font-bold" style={{ color: 'var(--color-text)' }}>
                {challan.customer?.name || 'Standard Client'}
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                {challan.customer?.businessName || 'Business Unit'}
              </div>
              <div style={{ color: 'var(--color-text-tertiary)' }}>
                {challan.customer?.mobile || 'N/A'} • {challan.customer?.email || 'N/A'}
              </div>
            </div>

            <div className="p-3 rounded-xl border space-y-1" style={{
              backgroundColor: 'var(--color-input)',
              borderColor: 'var(--color-border)',
            }}>
              <span className="font-mono text-[10px] uppercase font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                DISPATCH DETAILS
              </span>
              <div style={{ color: 'var(--color-text)' }}>
                Date: <span className="font-mono font-semibold">{new Date(challan.dispatchDate || challan.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                Created By: <span className="font-semibold">{challan.creator?.name || 'System Dispatcher'}</span>
              </div>
              <div style={{ color: 'var(--color-text-tertiary)' }}>
                Total Items: {challan.items?.length || 0} Line Items
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th className="text-right">Qty Dispatched</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Total ($)</th>
                </tr>
              </thead>
              <tbody>
                {(challan.items || []).map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {item.product?.name || 'Product'}
                    </td>
                    <td className="font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      {item.product?.sku || 'SKU'}
                    </td>
                    <td className="text-right font-mono font-bold" style={{ color: 'var(--color-primary)' }}>
                      {item.quantity}
                    </td>
                    <td className="text-right font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                      ${item.unitPrice?.toFixed(2)}
                    </td>
                    <td className="text-right font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                      ${(item.quantity * item.unitPrice)?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl border" style={{
            backgroundColor: 'var(--color-primary-light)',
            borderColor: 'var(--color-info-border)',
          }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                Dispatched & Logged to Inventory Audit Stream
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase block" style={{ color: 'var(--color-text-tertiary)' }}>
                TOTAL DISPATCH VALUE
              </span>
              <span className="text-lg font-bold font-mono" style={{ color: 'var(--color-primary)' }}>
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Delivery Note
          </Button>
        </div>
      </div>
    </Modal>
  );
};

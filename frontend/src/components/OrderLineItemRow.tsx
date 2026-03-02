import { useState } from 'react';
import type { ReplenishmentOrderLineItem, Contract340B } from '../types';
import { VendorPortalLink } from './VendorPortalLink';

interface OrderLineItemRowProps {
  item: ReplenishmentOrderLineItem;
  contracts: Contract340B[];
  onUpdate: (updatedItem: ReplenishmentOrderLineItem) => void;
  onRemove: () => void;
}

export function OrderLineItemRow({ item, contracts, onUpdate, onRemove }: OrderLineItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);

  const contract = contracts.find(c => c.id === item.contract_340b_id);
  const unitCost = item.estimated_cost_usd / item.quantity;
  const totalCost = unitCost * quantity;

  const handleSave = () => {
    onUpdate({ ...item, quantity, estimated_cost_usd: totalCost });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setQuantity(item.quantity);
    setIsEditing(false);
  };

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900">{item.medication_name}</div>
        <div className="text-sm text-slate-500">{item.ndc_code}</div>
      </td>
      <td className="px-4 py-3 text-center">
        {isEditing ? (
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 px-2 py-1 border border-slate-300 rounded text-center"
            autoFocus
          />
        ) : (
          <span className="text-slate-900">{item.quantity}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <div className="font-medium text-slate-700">{item.contract_number}</div>
          {contract && (
            <VendorPortalLink
              vendorName={contract.vendor_name}
              portalUrl={contract.vendor_portal_url}
            />
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right text-slate-900">
        ${unitCost.toFixed(2)}
      </td>
      <td className="px-4 py-3 text-right font-medium text-slate-900">
        ${totalCost.toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Save"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                title="Cancel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit quantity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={onRemove}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Remove item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

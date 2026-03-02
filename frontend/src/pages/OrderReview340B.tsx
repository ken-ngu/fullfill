import { useState, useEffect } from 'react';
import type { ReplenishmentOrder, ReplenishmentOrderLineItem, Contract340B } from '../types';
import { updateOrderLineItems, approveOrder, cancelOrder } from '../api/client';
import { CountdownTimer } from '../components/CountdownTimer';
import { OrderLineItemRow } from '../components/OrderLineItemRow';

interface OrderReview340BProps {
  orderId: string;
  onNavigate: (page: string) => void;
}

export function OrderReview340B({ orderId, onNavigate }: OrderReview340BProps) {
  const [order, setOrder] = useState<ReplenishmentOrder | null>(null);
  const [lineItems, setLineItems] = useState<ReplenishmentOrderLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Mock contracts data
  const contracts: Contract340B[] = [
    {
      id: 'contract-001',
      contract_number: '340B-2024-001',
      vendor_name: 'Cardinal Health',
      vendor_portal_url: 'https://www.cardinalhealth.com',
      is_active: true,
    },
    {
      id: 'contract-002',
      contract_number: '340B-2024-002',
      vendor_name: 'McKesson',
      vendor_portal_url: 'https://www.mckesson.com',
      is_active: true,
    },
  ];

  useEffect(() => {
    // Ensure page starts at top on mobile
    window.scrollTo(0, 0);

    const loadOrder = async () => {
      try {
        // For mock data, use the get340BDashboard to get today's order
        const { get340BDashboard } = await import('../api/client');
        const dashboard = await get340BDashboard('org-001');

        if (dashboard.today_order && dashboard.today_order.id === orderId) {
          setOrder(dashboard.today_order);
          setLineItems(dashboard.today_order.line_items);
        }
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleUpdateLineItem = (index: number, updatedItem: ReplenishmentOrderLineItem) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = updatedItem;
    setLineItems(newLineItems);
  };

  const handleRemoveLineItem = (index: number) => {
    const newLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(newLineItems);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await updateOrderLineItems(orderId, lineItems);
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this order? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      await approveOrder(orderId);
      alert('Order approved successfully!');
      onNavigate('admin340b');
    } catch (error) {
      console.error('Failed to approve order:', error);
      alert('Failed to approve order');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setSaving(true);
    try {
      await cancelOrder(orderId, cancelReason);
      alert('Order cancelled successfully');
      onNavigate('admin340b');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order');
    } finally {
      setSaving(false);
      setShowCancelModal(false);
    }
  };

  const calculateTotals = () => {
    const totalCost = lineItems.reduce((sum, item) => sum + item.estimated_cost_usd, 0);
    const totalSavings = totalCost * 3.29; // Mock 340B savings multiplier
    return { totalCost, totalSavings };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Order not found</p>
          <button
            onClick={() => onNavigate('admin340b')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { totalCost, totalSavings } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => onNavigate('admin340b')}
                className="flex items-center text-slate-600 hover:text-slate-900 mb-2"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-slate-900">Review Order</h1>
              <p className="text-slate-600 mt-1">
                {new Date(order.order_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <CountdownTimer cutoffTime={order.cutoff_time} orderDate={order.order_date} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Total Items</div>
            <div className="text-3xl font-bold text-slate-900">{lineItems.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Estimated Cost</div>
            <div className="text-3xl font-bold text-slate-900">${totalCost.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 rounded-2xl shadow-lg p-6 border border-green-200">
            <div className="text-sm text-green-700 mb-1">340B Savings</div>
            <div className="text-3xl font-bold text-green-700">${totalSavings.toLocaleString()}</div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Order Line Items</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Medication</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Contract / Vendor</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Unit Cost</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Total</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      No items in this order
                    </td>
                  </tr>
                ) : (
                  lineItems.map((item, index) => (
                    <OrderLineItemRow
                      key={index}
                      item={item}
                      contracts={contracts}
                      onUpdate={(updatedItem) => handleUpdateLineItem(index, updatedItem)}
                      onRemove={() => handleRemoveLineItem(index)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex-1 py-4 bg-slate-600 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleApprove}
            disabled={saving || lineItems.length === 0}
            className="flex-1 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Approving...' : 'Approve & Submit Order'}
          </button>
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={saving}
            className="flex-1 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel Order
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Cancel Order</h3>
            <p className="text-slate-600 mb-4">
              Please provide a reason for cancelling this order:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
              placeholder="Enter cancellation reason..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim() || saving}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

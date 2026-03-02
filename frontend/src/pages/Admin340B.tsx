import { useState, useEffect } from 'react';
import type { DashboardSummary, ReplenishmentOrder } from '../types';
import { get340BDashboard } from '../api/client';
import { CountdownTimer } from '../components/CountdownTimer';

interface Admin340BProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function Admin340B({ onNavigate }: Admin340BProps) {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure page starts at top on mobile
    window.scrollTo(0, 0);

    // Load dashboard data
    const loadDashboard = async () => {
      try {
        const data = await get340BDashboard('org-001');
        setDashboard(data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getStatusBadge = (status: ReplenishmentOrder['status']) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-700',
      pending_review: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      submitted: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };

    const labels = {
      draft: 'Draft',
      pending_review: 'Pending Review',
      approved: 'Approved',
      submitted: 'Submitted',
      cancelled: 'Cancelled',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">340B Replenishment Dashboard</h1>
              <p className="text-slate-600 mt-1">{dashboard.organization.name}</p>
            </div>
            <button
              onClick={() => onNavigate('search')}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Today's Pending Order Card */}
        {dashboard.today_order && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-slate-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Today's Order</h2>
                <p className="text-slate-600">
                  {new Date(dashboard.today_order.order_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {getStatusBadge(dashboard.today_order.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-sm text-slate-600 mb-1">Total Items</div>
                <div className="text-3xl font-bold text-slate-900">
                  {dashboard.today_order.total_items}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-sm text-slate-600 mb-1">Estimated Cost</div>
                <div className="text-3xl font-bold text-slate-900">
                  ${dashboard.today_order.estimated_cost_usd.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-sm text-green-700 mb-1">340B Savings</div>
                <div className="text-3xl font-bold text-green-700">
                  ${dashboard.today_order.estimated_340b_savings_usd.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl mb-6">
              <CountdownTimer
                cutoffTime={dashboard.today_order.cutoff_time}
                orderDate={dashboard.today_order.order_date}
              />
              <div className="text-sm text-slate-600">
                Cutoff time: {dashboard.today_order.cutoff_time}
              </div>
            </div>

            <button
              onClick={() => onNavigate('order-review', { orderId: dashboard.today_order?.id })}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Review & Modify Order
            </button>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Orders</h2>

          {dashboard.recent_orders.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No recent orders</p>
          ) : (
            <div className="space-y-4">
              {dashboard.recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => onNavigate('order-review', { orderId: order.id })}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-slate-900">
                        {new Date(order.order_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-sm text-slate-600">
                      {order.total_items} items • ${order.estimated_cost_usd.toLocaleString()} • Saved $
                      {order.estimated_340b_savings_usd.toLocaleString()}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Timeline */}
        <div className="mt-8 bg-white rounded-3xl shadow-lg p-8 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Development Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-700">Phase 1-5: Consumer features (diagnosis search, GoodRx pricing)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-700">Phase 6-8: Multi-tenant foundation & 340B backend</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-slate-700 font-semibold">Phase 9: 340B Admin Dashboard Frontend (Current)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
              <span className="text-slate-500">Phase 10: Testing & validation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

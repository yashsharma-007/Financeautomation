import React, { useState, useEffect } from 'react';
import { FileCheck, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { itcMismatchStorage, StoredITCMismatch } from '../../utils/localStorage';

const ITCReconciliation = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mismatches, setMismatches] = useState<StoredITCMismatch[]>([]);

  useEffect(() => {
    // Load stored mismatches
    const stored = itcMismatchStorage.getAll();
    setMismatches(stored.length > 0 ? stored : [
      {
        id: '1',
        supplier: "ABC Enterprises",
        invoiceNo: "INV-2024-001",
        amount: 25000,
        issue: "GSTR-1 amount mismatch",
        status: "pending",
        date: new Date().toISOString()
      },
      {
        id: '2',
        supplier: "XYZ Trading",
        invoiceNo: "INV-2024-015",
        amount: 18500,
        issue: "Invoice not found in GSTR-1",
        status: "resolved",
        date: new Date().toISOString()
      }
    ]);
  }, []);

  const refreshReconciliation = () => {
    setIsRefreshing(true);
    // Simulate API call to fetch new mismatches
    setTimeout(() => {
      const newMismatch: StoredITCMismatch = {
        id: Math.random().toString(36).substr(2, 9),
        supplier: "New Supplier Ltd",
        invoiceNo: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        amount: Math.floor(Math.random() * 50000),
        issue: "Tax amount calculation mismatch",
        status: "pending",
        date: new Date().toISOString()
      };
      
      itcMismatchStorage.add(newMismatch);
      setMismatches(prev => [...prev, newMismatch]);
      setIsRefreshing(false);
    }, 1500);
  };

  const toggleStatus = (id: string) => {
    const updatedMismatches = mismatches.map(mismatch => {
      if (mismatch.id === id) {
        const newStatus = mismatch.status === 'pending' ? 'resolved' : 'pending';
        itcMismatchStorage.update(id, { status: newStatus });
        return { ...mismatch, status: newStatus };
      }
      return mismatch;
    });
    setMismatches(updatedMismatches);
  };

  return (
    <div className="dashboard-card animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileCheck className="h-6 w-6 text-green-500" />
          <h2 className="text-xl font-semibold text-gray-800">ITC Reconciliation</h2>
        </div>
        <button 
          className="button-secondary flex items-center space-x-2"
          onClick={refreshReconciliation}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {mismatches.map((mismatch) => (
          <div 
            key={mismatch.id} 
            className={`border rounded-lg p-4 transition-all duration-200 ${
              mismatch.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {mismatch.status === 'pending' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{mismatch.supplier}</h3>
                  <p className="text-sm text-gray-600">Invoice: {mismatch.invoiceNo}</p>
                  <p className="text-sm text-gray-600">Amount: ₹{mismatch.amount.toLocaleString()}</p>
                  <p className={`text-sm mt-1 ${
                    mismatch.status === 'pending' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {mismatch.status === 'pending' ? mismatch.issue : 'Issue Resolved'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(mismatch.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleStatus(mismatch.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  mismatch.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {mismatch.status === 'pending' ? 'Mark Resolved' : 'Reopen Issue'}
              </button>
            </div>
          </div>
        ))}

        {mismatches.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No mismatches found. All invoices are reconciled.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ITCReconciliation;
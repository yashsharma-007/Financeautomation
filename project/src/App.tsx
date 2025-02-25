import React from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import TaxEstimator from './components/dashboard/TaxEstimator';
import ITCReconciliation from './components/dashboard/ITCReconciliation';
import TaxDeductionSuggestions from './components/dashboard/TaxDeductionSuggestions';
import FilingWorkflow from './components/dashboard/FilingWorkflow';
import ComplianceChecker from './components/dashboard/ComplianceChecker';
import GSTUpdates from './components/dashboard/GSTUpdates';
import Analytics from './components/dashboard/Analytics';
import InvoiceUploader from './components/dashboard/InvoiceUploader';

function App() {
  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        {/* Top Section - Analytics & Tax Estimator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Analytics />
          </div>
          <TaxEstimator />
        </div>

        {/* Middle Section - Invoice & ITC Reconciliation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InvoiceUploader />
          <ITCReconciliation />
        </div>

        {/* Bottom Section - Compliance & Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TaxDeductionSuggestions />
          <FilingWorkflow />
          <ComplianceChecker />
        </div>

        {/* Footer Section - Updates */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <GSTUpdates />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default App;

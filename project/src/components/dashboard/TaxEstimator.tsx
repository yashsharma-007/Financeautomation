import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { taxEstimateStorage, StoredTaxEstimate } from '../../utils/localStorage';

const TaxEstimator = () => {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [gstLiability, setGstLiability] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [previousEstimates, setPreviousEstimates] = useState<StoredTaxEstimate[]>([]);

  useEffect(() => {
    // Load previous estimates
    const stored = taxEstimateStorage.getAll();
    setPreviousEstimates(stored);
  }, []);

  const calculateTax = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const totalIncome = parseFloat(income) || 0;
      const totalExpenses = parseFloat(expenses) || 0;
      const estimatedGST = (totalIncome - totalExpenses) * 0.18;
      const finalGST = Math.max(0, estimatedGST);
      
      setGstLiability(finalGST);

      // Store the calculation
      const newEstimate: StoredTaxEstimate = {
        id: Math.random().toString(36).substr(2, 9),
        income: totalIncome,
        expenses: totalExpenses,
        gstLiability: finalGST,
        date: new Date().toISOString()
      };

      taxEstimateStorage.add(newEstimate);
      setPreviousEstimates(prev => [...prev, newEstimate]);
      
      setIsCalculating(false);
    }, 800);
  };

  return (
    <div className="dashboard-card animate-slide-in">
      <div className="flex items-center space-x-2 mb-6">
        <Calculator className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800">Tax Estimator</h2>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Income
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="input-field pl-8"
                placeholder="Enter total income"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Expenses
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="input-field pl-8"
                placeholder="Enter total expenses"
              />
            </div>
          </div>
        </div>

        <button
          onClick={calculateTax}
          disabled={isCalculating}
          className="button-primary w-full flex items-center justify-center space-x-2"
        >
          {isCalculating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>Calculate GST Liability</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {gstLiability !== null && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-fade-in">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Estimated GST Liability</h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-blue-700">₹{gstLiability.toFixed(2)}</span>
              <span className="ml-2 text-sm text-blue-600">for current period</span>
            </div>
            <p className="mt-2 text-sm text-blue-600">
              This is an estimate based on your inputs. Actual liability may vary.
            </p>
          </div>
        )}

        {previousEstimates.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Previous Estimates</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {previousEstimates.slice().reverse().map((estimate) => (
                <div key={estimate.id} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="flex justify-between">
                    <span>₹{estimate.gstLiability.toFixed(2)}</span>
                    <span className="text-gray-500">
                      {new Date(estimate.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxEstimator;
import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { complianceStorage, StoredComplianceIssue } from '../../utils/localStorage';

const ComplianceChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [errors, setErrors] = useState<StoredComplianceIssue[]>([]);

  useEffect(() => {
    // Load stored compliance issues
    const stored = complianceStorage.getAll();
    setErrors(stored.length > 0 ? stored : [
      {
        id: "1",
        type: "Critical",
        message: "Missing GSTIN in 3 invoices",
        affected: "INV-2024-001, INV-2024-002, INV-2024-003",
        details: "GSTIN is mandatory for B2B invoices exceeding ₹50,000",
        date: new Date().toISOString(),
        status: "open"
      },
      {
        id: "2",
        type: "Warning",
        message: "Tax calculation mismatch",
        affected: "INV-2024-015 (Difference: ₹150)",
        details: "The calculated tax amount doesn't match with the reported tax",
        date: new Date().toISOString(),
        status: "open"
      }
    ]);
  }, []);

  const runComplianceCheck = () => {
    setIsChecking(true);
    // Simulate API call
    setTimeout(() => {
      const newIssue: StoredComplianceIssue = {
        id: Math.random().toString(36).substr(2, 9),
        type: Math.random() > 0.5 ? "Critical" : "Warning",
        message: "New compliance issue detected",
        affected: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        details: "Automated compliance check detected a potential issue",
        date: new Date().toISOString(),
        status: "open"
      };
      
      complianceStorage.add(newIssue);
      setErrors(prev => [...prev, newIssue]);
      setIsChecking(false);
      setLastChecked(new Date().toLocaleString());
    }, 2000);
  };

  const toggleIssueStatus = (id: string) => {
    const updatedErrors = errors.map(error => {
      if (error.id === id) {
        const newStatus = error.status === 'open' ? 'resolved' : 'open';
        complianceStorage.update(id, { status: newStatus });
        return { ...error, status: newStatus };
      }
      return error;
    });
    setErrors(updatedErrors);
  };

  const activeIssues = errors.filter(error => error.status === 'open');
  const resolvedIssues = errors.filter(error => error.status === 'resolved');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-red-500" />
          <h2 className="text-xl font-semibold">Compliance Checker</h2>
        </div>
        {lastChecked && (
          <span className="text-xs text-gray-500">
            Last checked: {lastChecked}
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {activeIssues.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Active Issues</h3>
            {activeIssues.map((error) => (
              <div 
                key={error.id} 
                className={`border rounded-lg p-4 mb-3 ${
                  error.type === "Critical" ? "bg-red-50" : "bg-yellow-50"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className={`h-5 w-5 ${
                    error.type === "Critical" ? "text-red-500" : "text-yellow-500"
                  } mt-1`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{error.type}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        error.type === "Critical" 
                          ? "bg-red-100 text-red-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {error.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{error.message}</p>
                    <p className="text-sm text-gray-500 mt-1">Affected: {error.affected}</p>
                    <p className="text-sm text-gray-600 mt-2 bg-white bg-opacity-50 p-2 rounded">
                      {error.details}
                    </p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(error.date).toLocaleDateString()}
                      </span>
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => toggleIssueStatus(error.id)}
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {resolvedIssues.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Resolved Issues</h3>
            <div className="space-y-2">
              {resolvedIssues.map((issue) => (
                <div key={issue.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">{issue.message}</span>
                    </div>
                    <button
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => toggleIssueStatus(issue.id)}
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button 
          className={`w-full mt-4 py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${
            isChecking 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          onClick={runComplianceCheck}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Checking Compliance...</span>
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              <span>Run Compliance Check</span>
            </>
          )}
        </button>

        {errors.length === 0 && (
          <div className="flex items-center justify-center space-x-2 text-green-600 mt-4">
            <CheckCircle className="h-5 w-5" />
            <span>All compliance checks passed!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceChecker;
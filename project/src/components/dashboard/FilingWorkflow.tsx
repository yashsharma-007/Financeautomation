import React, { useState } from 'react';
import { CheckCircle, Circle, ArrowRight, AlertTriangle } from 'lucide-react';

const FilingWorkflow = () => {
  const [steps, setSteps] = useState([
    {
      id: 1,
      title: "Invoice Reconciliation",
      description: "Match purchase and sales invoices",
      completed: true,
      canProceed: true
    },
    {
      id: 2,
      title: "GSTR-1 Preparation",
      description: "Prepare outward supply details",
      completed: true,
      canProceed: true
    },
    {
      id: 3,
      title: "GSTR-3B Preparation",
      description: "Complete monthly return",
      completed: false,
      canProceed: true
    },
    {
      id: 4,
      title: "Payment",
      description: "Complete tax payment",
      completed: false,
      canProceed: false
    }
  ]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);

  const handleContinueFiling = () => {
    if (currentStep < steps.length) {
      setShowConfirmation(true);
    }
  };

  const confirmStep = () => {
    setSteps(steps.map((step, index) => {
      if (index === currentStep) {
        return { ...step, completed: true };
      }
      if (index === currentStep + 1) {
        return { ...step, canProceed: true };
      }
      return step;
    }));
    setCurrentStep(currentStep + 1);
    setShowConfirmation(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Filing Assistant</h2>
        <div className="text-sm text-gray-500">
          Due Date: <span className="text-red-600 font-medium">March 20, 2024</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${
              step.completed ? 'bg-green-50' : 
              index === currentStep ? 'bg-blue-50' :
              'bg-gray-50'
            }`}
          >
            {step.completed ? (
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
            ) : (
              <Circle className={`h-6 w-6 ${
                index === currentStep ? 'text-blue-500' : 'text-gray-300'
              } mt-1`} />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{step.title}</h3>
                {index === currentStep && step.canProceed && (
                  <span className="text-xs text-blue-600 font-medium">Current Step</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
        
        <button 
          className={`w-full mt-6 py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${
            steps[currentStep]?.canProceed
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleContinueFiling}
          disabled={!steps[currentStep]?.canProceed}
        >
          <span>Continue Filing</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 text-yellow-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Confirm Action</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to mark "{steps[currentStep].title}" as complete? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={confirmStep}
              >
                Confirm
              </button>
              <button
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilingWorkflow;
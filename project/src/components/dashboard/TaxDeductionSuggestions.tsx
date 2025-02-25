import React from 'react';
import { Lightbulb } from 'lucide-react';

const TaxDeductionSuggestions = () => {
  const suggestions = [
    {
      id: 1,
      title: "Claim Input Tax Credit",
      description: "You have ₹15,000 unclaimed ITC from last month's purchases",
      impact: "Potential Savings: ₹15,000",
    },
    {
      id: 2,
      title: "Optimize Export Documentation",
      description: "Complete LUT filing for zero-rated supplies",
      impact: "Avoid unnecessary GST payment",
    },
    {
      id: 3,
      title: "Review Reverse Charge Entries",
      description: "3 transactions need RCM verification",
      impact: "Ensure compliance and avoid penalties",
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Lightbulb className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-semibold">Smart Tax Deduction Suggestions</h2>
      </div>
      
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
            <h3 className="font-medium text-blue-600">{suggestion.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
            <p className="text-sm font-medium text-green-600 mt-2">{suggestion.impact}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxDeductionSuggestions;
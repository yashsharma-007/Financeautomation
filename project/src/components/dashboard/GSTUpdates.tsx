import React from 'react';
import { Bell, Calendar } from 'lucide-react';

const GSTUpdates = () => {
  const updates = [
    {
      id: 1,
      type: "Deadline",
      title: "GSTR-1 Filing Due",
      date: "March 11, 2024",
      description: "Monthly return for February 2024",
    },
    {
      id: 2,
      type: "News",
      title: "New GST Circular Released",
      date: "March 5, 2024",
      description: "Changes in e-invoicing threshold from April 2024",
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="h-6 w-6 text-purple-500" />
          <h2 className="text-xl font-semibold">GST Updates & Notifications</h2>
        </div>
      </div>
      
      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    update.type === "Deadline" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {update.type}
                  </span>
                  <span className="text-sm text-gray-500">{update.date}</span>
                </div>
                <h3 className="font-medium text-gray-900 mt-2">{update.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{update.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GSTUpdates;
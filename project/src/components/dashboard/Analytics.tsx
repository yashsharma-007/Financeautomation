import React from 'react';
import { BarChart, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, RefreshCw } from 'lucide-react';

const Analytics = () => {
  const stats = [
    {
      title: "Total Tax Liability",
      value: "₹1,25,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "indigo"
    },
    {
      title: "Input Tax Credit",
      value: "₹85,000",
      change: "-5.2%",
      trend: "down",
      icon: CreditCard,
      color: "emerald"
    },
    {
      title: "Pending Refunds",
      value: "₹15,000",
      change: "0%",
      trend: "neutral",
      icon: RefreshCw,
      color: "amber"
    }
  ];

  return (
    <div className="dashboard-card animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart className="h-6 w-6 text-indigo-500" />
          <h2 className="text-xl font-semibold text-gray-800">GST Analytics</h2>
        </div>
        <button className="button-secondary">
          <span className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm hover:shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <div className={`ml-2 flex items-center text-sm ${
                    stat.trend === "up" ? "text-green-600" : 
                    stat.trend === "down" ? "text-red-600" : 
                    "text-gray-500"
                  }`}>
                    {stat.trend === "up" ? <ArrowUpRight className="h-4 w-4" /> :
                     stat.trend === "down" ? <ArrowDownRight className="h-4 w-4" /> :
                     <TrendingUp className="h-4 w-4" />}
                    <span className="ml-1">{stat.change}</span>
                  </div>
                </div>
              </div>
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`bg-${stat.color}-500 h-1.5 rounded-full`} 
                  style={{ width: '70%' }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
import React, { useState } from 'react';
import { Menu, Bell, User, Home, FileText, Calculator, Settings, HelpCircle, X, LogOut } from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, text: "GSTR-1 due in 3 days", type: "warning", time: "2 hours ago" },
    { id: 2, text: "New tax circular released", type: "info", time: "5 hours ago" },
    { id: 3, text: "ITC mismatch detected", type: "error", time: "1 day ago" },
  ];

  const menuItems = [
    { icon: Home, text: "Dashboard" },
    { icon: FileText, text: "Returns" },
    { icon: Calculator, text: "Calculator" },
    { icon: Settings, text: "Settings" },
    { icon: HelpCircle, text: "Help" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">GST Assistant</h1>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map(({ icon: Icon, text }) => (
            <button
              key={text}
              onClick={() => {
                setActiveSection(text);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center space-x-3 w-full p-3 rounded-lg ${activeSection === text ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{text}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-20 flex justify-between items-center p-4">
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-gray-500" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="h-6 w-6 text-gray-500" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border py-2 z-30">
                  <div className="px-4 py-2 border-b text-gray-900 font-semibold">Notifications</div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(({ id, text, type, time }) => (
                      <div key={id} className="px-4 py-3 hover:bg-gray-50 flex items-start space-x-2">
                        <span className={`h-2 w-2 mt-2 rounded-full ${type === 'warning' ? 'bg-yellow-400' : type === 'error' ? 'bg-red-400' : 'bg-blue-400'}`} />
                        <div>
                          <p className="text-sm text-gray-800">{text}</p>
                          <p className="text-xs text-gray-500 mt-1">{time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t">
                    <button className="text-sm text-indigo-600 font-medium">View all notifications</button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setShowProfile(!showProfile)} className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border py-2 z-30">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Your Profile</button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Settings</button>
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Section */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">{activeSection}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
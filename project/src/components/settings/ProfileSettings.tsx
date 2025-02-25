import React, { useState, useEffect } from 'react';
import { userStorage, UserProfile } from '../../utils/localStorage';
import { User, Mail, Save, AlertCircle } from 'lucide-react';

const ProfileSettings = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const currentUser = userStorage.getCurrentUser();
    if (currentUser) {
      setProfile(currentUser);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    if (profile) {
      try {
        userStorage.updateProfile(profile.id, profile);
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    }

    setIsSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (!profile) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <input
            type="text"
            className="mt-1 block w-full bg-gray-100 cursor-not-allowed sm:text-sm border-gray-300 rounded-md"
            value={profile.role}
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Member Since</label>
          <input
            type="text"
            className="mt-1 block w-full bg-gray-100 cursor-not-allowed sm:text-sm border-gray-300 rounded-md"
            value={new Date(profile.createdAt).toLocaleDateString()}
            disabled
          />
        </div>

        {message.text && (
          <div className={`flex items-center text-sm ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            <AlertCircle className="h-5 w-5 mr-2" />
            {message.text}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
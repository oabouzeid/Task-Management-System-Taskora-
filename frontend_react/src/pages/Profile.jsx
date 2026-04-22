import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { apiClient } from '../apiClient';
import { useToast } from '../ToastContext';
import { User, Mail, Lock, Shield, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.patch(`/users/${user._id}`, profileData);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast('Failed to update profile', 'danger');
      }
    } catch (err) {
      showToast('Connection error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showToast('Passwords do not match', 'warning');
    }
    setLoading(true);
    try {
      const response = await apiClient.patch(`/users/${user._id}/password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.ok) {
        showToast('Password updated successfully!', 'success');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to update password', 'danger');
      }
    } catch (err) {
      showToast('Connection error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to PERMANENTLY delete your account? This action cannot be undone.')) return;
    try {
      const response = await apiClient.delete(`/users/${user._id}`);
      if (response.ok) {
        showToast('Account deleted. Goodbye!', 'info');
        logout();
      }
    } catch (err) {
      showToast('Error deleting account', 'danger');
    }
  };

  if (!user) return null;

  return (
    <div className="container py-5 fade-in">
      <button className="btn btn-link text-muted mb-4 p-0 d-flex align-items-center gap-2 text-decoration-none" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-5 overflow-hidden">
            <div className="bg-primary py-5 text-center">
              <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm" style={{ width: 80, height: 80 }}>
                <span className="h2 mb-0 text-white fw-bold">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div className="card-body text-center pt-4">
              <h4 className="fw-bold mb-1">{user.name}</h4>
              <p className="text-muted small mb-4">{user.email}</p>
              <div className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-normal">
                {user.role === 'admin' ? 'System Administrator' : 'Project Member'}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-5 mt-4 border-danger border-opacity-10">
             <div className="card-body p-4 text-center">
                <h6 className="text-danger fw-bold mb-3 d-flex align-items-center justify-content-center gap-2">
                   <Shield size={18}/> Danger Zone
                </h6>
                <p className="small text-muted mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="btn btn-outline-danger rounded-pill px-4 w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleDeleteAccount}>
                   <Trash2 size={16}/> Delete Account
                </button>
             </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-5 mb-4">
            <div className="card-body p-4 p-md-5">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <User size={20} className="text-primary" /> Profile Settings
              </h5>
              <form onSubmit={handleUpdateProfile}>
                <div className="row g-3">
                  <div className="col-md-6">
                     <label className="form-label small fw-bold">Full Name</label>
                     <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0 rounded-start-4"><User size={16}/></span>
                        <input 
                          type="text" 
                          className="form-control rounded-end-4 py-2 border-start-0" 
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          required
                        />
                     </div>
                  </div>
                  <div className="col-md-6">
                     <label className="form-label small fw-bold">Email Address</label>
                     <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0 rounded-start-4"><Mail size={16}/></span>
                        <input 
                          type="email" 
                          className="form-control rounded-end-4 py-2 border-start-0" 
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          required
                        />
                     </div>
                  </div>
                </div>
                <div className="mt-4 text-end">
                  <button type="submit" className="btn btn-primary px-5 rounded-pill fw-bold" disabled={loading}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-5">
            <div className="card-body p-4 p-md-5">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <Lock size={20} className="text-primary" /> Change Password
              </h5>
              <form onSubmit={handleUpdatePassword}>
                <div className="row g-3">
                  <div className="col-12">
                     <label className="form-label small fw-bold">Current Password</label>
                     <input 
                        type="password" 
                        className="form-control rounded-4 py-2" 
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                        required
                     />
                  </div>
                  <div className="col-md-6">
                     <label className="form-label small fw-bold">New Password</label>
                     <input 
                        type="password" 
                        className="form-control rounded-4 py-2" 
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        required
                     />
                  </div>
                  <div className="col-md-6">
                     <label className="form-label small fw-bold">Confirm New Password</label>
                     <input 
                        type="password" 
                        className="form-control rounded-4 py-2" 
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        required
                     />
                  </div>
                </div>
                <div className="mt-4 text-end">
                  <button type="submit" className="btn btn-primary px-5 rounded-pill fw-bold" disabled={loading}>
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .input-group-text { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      `}</style>
    </div>
  );
};

export default Profile;

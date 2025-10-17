import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FaUsers, 
  FaFileAlt, 
  FaDollarSign, 
  FaCalendarCheck,
  FaCheck,
  FaTimes,
  FaEye,
  FaTrash,
  FaUserShield,
  FaPlus,
  FaEdit,
  FaTags
} from 'react-icons/fa';
import { API_CONFIG, STORAGE_KEYS, ROUTES } from '../constants';
import { getLocalStorageItem } from '../utils/localStorage';
import { useAuth } from '../hooks/useAuth';
import type { ServiceCategory, ServiceCategoryFormData } from '../types';
import { serviceCategoryApi } from '../api/serviceCategory';

interface DashboardStats {
  users: {
    total: number;
    clients: number;
    companions: number;
  };
  pendingApplications: number;
  bookings: {
    total: number;
    avgRating: number;
  };
  earnings: {
    total: number;
    commission: number;
  };
}

interface Application {
  id: number;
  user_id: number;
  name: string;
  email: string;
  profile_photo_url: string;
  government_id_url: string;
  date_of_birth: string;
  government_id_number: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'users' | 'earnings' | 'categories'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [categoryFormData, setCategoryFormData] = useState<ServiceCategoryFormData>({ 
    name: '', 
    description: '', 
    basePrice: 0, 
    isActive: true 
  });

  useEffect(() => {
    // Check if user exists
    if (!user) {
      // User not logged in, redirect to home
      navigate(ROUTES.HOME);
      return;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate(ROUTES.HOME);
      return;
    }

    // Only fetch data if user is admin
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = getLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);

      // If no token, don't make API calls
      if (!token) {
        console.log('⚠️ No auth token found, skipping data fetch');
        setIsLoading(false);
        return;
      }

      // Fetch dashboard stats
      const statsResponse = await axios.get(`${API_CONFIG.BASE_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsResponse.data.data);

      // Fetch pending applications
      const appsResponse = await axios.get(`${API_CONFIG.BASE_URL}/admin/applications?status=pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(appsResponse.data.data);

      // Fetch users
      const usersResponse = await axios.get(`${API_CONFIG.BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersResponse.data.data);

      // Fetch categories
      const categoriesData = await serviceCategoryApi.getAllCategories();
      setCategories(categoriesData);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      
      // Don't show error toast if it's a 401 (user will be redirected by axios interceptor)
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: number) => {
    try {
      const token = getLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      await axios.put(
        `${API_CONFIG.BASE_URL}/admin/applications/${applicationId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Application approved successfully!');
      fetchDashboardData();
      setSelectedApplication(null);
    } catch (error: any) {
      console.error('Error approving application:', error);
      toast.error(error.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const token = getLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      await axios.put(
        `${API_CONFIG.BASE_URL}/admin/applications/${applicationId}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Application rejected');
      fetchDashboardData();
      setSelectedApplication(null);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      toast.error(error.response?.data?.message || 'Failed to reject application');
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = getLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      await axios.delete(`${API_CONFIG.BASE_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('User deleted successfully');
      fetchDashboardData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryFormData.name || categoryFormData.basePrice <= 0) {
      toast.error('Please provide a valid name and base price');
      return;
    }

    try {
      await serviceCategoryApi.createCategory(categoryFormData);
      toast.success('Service category created successfully!');
      fetchDashboardData();
      closeModal();
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    if (!categoryFormData.name || categoryFormData.basePrice <= 0) {
      toast.error('Please provide a valid name and base price');
      return;
    }

    try {
      await serviceCategoryApi.updateCategory(selectedCategory.id, categoryFormData);
      toast.success('Service category updated successfully!');
      fetchDashboardData();
      closeModal();
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete category "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await serviceCategoryApi.deleteCategory(categoryId);
      toast.success('Service category deleted successfully');
      fetchDashboardData();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const openCreateModal = () => {
    setCategoryFormData({ name: '', description: '', basePrice: 0, isActive: true });
    setShowCategoryModal(true);
    setSelectedCategory(null);
  };

  const openEditModal = (category: ServiceCategory) => {
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      basePrice: category.base_price,
      isActive: category.is_active,
    });
    setShowCategoryModal(true);
    setSelectedCategory(category);
  };

  const closeModal = () => {
    setCategoryFormData({ name: '', description: '', basePrice: 0, isActive: true });
    setShowCategoryModal(false);
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="flex items-center gap-3 mb-8 p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
            <FaUserShield className="text-white text-2xl" />
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary-100 text-primary-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaCalendarCheck />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'applications'
                  ? 'bg-primary-100 text-primary-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaFileAlt />
              <span>Applications</span>
              {applications.length > 0 && (
                <span className="ml-auto bg-error-500 text-white text-xs px-2 py-1 rounded-full">
                  {applications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-primary-100 text-primary-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaUsers />
              <span>Users</span>
            </button>

            <button
              onClick={() => setActiveTab('earnings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'earnings'
                  ? 'bg-primary-100 text-primary-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaDollarSign />
              <span>Earnings</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'categories'
                  ? 'bg-primary-100 text-primary-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaTags />
              <span>Service Categories</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600 mb-8">Overview of your MeetAndGo platform</p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-medium">Total Users</h3>
                    <FaUsers className="text-primary-500 text-2xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.users.total}</p>
                  <p className="text-sm text-gray-500">{stats.users.clients} clients, {stats.users.companions} companions</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-medium">Pending Applications</h3>
                    <FaFileAlt className="text-primary-500 text-2xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.pendingApplications}</p>
                  <p className="text-sm text-gray-500">Requires review</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-medium">Total Earnings</h3>
                    <FaDollarSign className="text-primary-500 text-2xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">${stats.earnings.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Platform commission</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-medium">Total Bookings</h3>
                    <FaCalendarCheck className="text-primary-500 text-2xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.bookings.total}</p>
                  <p className="text-sm text-gray-500">{stats.bookings.avgRating} avg rating</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Applications</h3>
                  <p className="text-gray-600 mb-4">{applications.length} applications waiting for review</p>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all"
                  >
                    Review Applications
                  </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">User Management</h3>
                  <p className="text-gray-600 mb-4">Manage {stats.users.total} registered users</p>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all"
                  >
                    Manage Users
                  </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Earnings Report</h3>
                  <p className="text-gray-600 mb-4">View detailed earnings and payments</p>
                  <button
                    onClick={() => setActiveTab('earnings')}
                    className="w-full border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all"
                  >
                    View Earnings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Companion Applications</h1>

              {applications.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm text-center">
                  <FaFileAlt className="text-gray-300 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Applications</h3>
                  <p className="text-gray-600">All applications have been reviewed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <img
                            src={app.profile_photo_url ? `${API_CONFIG.BASE_URL.replace('/api', '')}${app.profile_photo_url}` : 'https://via.placeholder.com/100'}
                            alt={app.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                            <p className="text-gray-600">{app.email}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Applied: {new Date(app.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              DOB: {new Date(app.date_of_birth).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors flex items-center gap-2"
                          >
                            <FaEye /> View
                          </button>
                          <button
                            onClick={() => handleApproveApplication(app.id)}
                            className="px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors flex items-center gap-2"
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setRejectionReason('');
                            }}
                            className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors flex items-center gap-2"
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Application Detail Modal */}
              {selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                      <button
                        onClick={() => {
                          setSelectedApplication(null);
                          setRejectionReason('');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes size={24} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-700">Personal Information</h3>
                        <p className="text-gray-900">Name: {selectedApplication.name}</p>
                        <p className="text-gray-900">Email: {selectedApplication.email}</p>
                        <p className="text-gray-900">Date of Birth: {new Date(selectedApplication.date_of_birth).toLocaleDateString()}</p>
                        <p className="text-gray-900">Government ID: {selectedApplication.government_id_number}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Profile Photo</h3>
                        <img
                          src={`${API_CONFIG.BASE_URL.replace('/api', '')}${selectedApplication.profile_photo_url}`}
                          alt="Profile"
                          className="w-48 h-48 rounded-lg object-cover"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Government ID</h3>
                        <img
                          src={`${API_CONFIG.BASE_URL.replace('/api', '')}${selectedApplication.government_id_url}`}
                          alt="Government ID"
                          className="w-full max-w-md rounded-lg"
                        />
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="font-semibold text-gray-700 mb-3">Rejection Reason (if rejecting)</h3>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                          placeholder="Enter reason for rejection..."
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => handleApproveApplication(selectedApplication.id)}
                          className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaCheck /> Approve Application
                        </button>
                        <button
                          onClick={() => handleRejectApplication(selectedApplication.id)}
                          className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaTimes /> Reject Application
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'companion' ? 'bg-pink-100 text-pink-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                              <FaTrash /> Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Earnings Report</h1>

              <div className="bg-white p-12 rounded-xl shadow-sm text-center">
                <FaDollarSign className="text-gray-300 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Earnings Dashboard Coming Soon</h3>
                <p className="text-gray-600">Detailed earnings and payment reports will be available here</p>
              </div>
            </div>
          )}

          {/* Service Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Service Categories</h1>
                <button
                  onClick={openCreateModal}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 px-6 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all flex items-center gap-2"
                >
                  <FaPlus /> Create New Category
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm text-center">
                  <FaTags className="text-gray-300 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Service Categories</h3>
                  <p className="text-gray-600 mb-4">Create your first service category to get started</p>
                  <button
                    onClick={openCreateModal}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 px-6 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all inline-flex items-center gap-2"
                  >
                    <FaPlus /> Create Category
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-md truncate">
                              {category.description || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${category.base_price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              category.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {category.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(category)}
                                className="text-accent-600 hover:text-accent-800 flex items-center gap-1"
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                className="text-red-600 hover:text-red-800 flex items-center gap-1"
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Category Modal */}
          {showCategoryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory ? 'Edit Service Category' : 'Create Service Category'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Dinner Date"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter a description for this category..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price ($/hour) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={categoryFormData.basePrice}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, basePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      placeholder="35.00"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={categoryFormData.isActive}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={selectedCategory ? handleUpdateCategory : handleCreateCategory}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-colors"
                    >
                      {selectedCategory ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;


/**
 * Bookings Manager Component
 * Allows companions to view and manage their bookings
 */

import { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaUser, FaMapMarkerAlt, FaComments, FaCheck, FaTimes, FaEye, FaDollarSign, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { bookingApi } from '../../api/booking';
import type { Booking } from '../../types';

interface BookingsManagerProps {
  className?: string;
}

const BookingsManager = ({ className = '' }: BookingsManagerProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'approvals'>('all');
  const [expandedWeekdays, setExpandedWeekdays] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (filter === 'approvals') {
      fetchPendingApprovals();
    } else {
      fetchBookings();
    }
  }, [filter]);

  // Initialize expanded weekdays based on bookings
  useEffect(() => {
    if (filter === 'all' && bookings.length > 0) {
      const weekdaysWithBookings = new Set<string>();
      bookings.forEach(booking => {
        const bookingDate = booking.bookingDate;
        if (bookingDate) {
          const date = new Date(bookingDate);
          if (!isNaN(date.getTime())) {
            const weekdayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            weekdaysWithBookings.add(weekdayName);
          }
        }
      });
      setExpandedWeekdays(weekdaysWithBookings);
    }
  }, [bookings, filter]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const params = filter === 'all' ? {} : { status: filter };
      console.log('📚 Fetching companion bookings with params:', params);
      const bookingsData = await bookingApi.getBookings(params);
      console.log('📊 Received bookings:', bookingsData);
      setBookings(bookingsData);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      setIsLoadingApprovals(true);
      const approvalsData = await bookingApi.getPendingBookingsForCompanion();
      setPendingApprovals(approvalsData);
    } catch (error: any) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      await bookingApi.updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status} successfully`);
      fetchBookings(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleApproveBooking = async (bookingId: number) => {
    try {
      await bookingApi.approveBooking(bookingId);
      toast.success('Booking approved successfully');
      fetchPendingApprovals(); // Refresh the list
    } catch (error: any) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    try {
      await bookingApi.rejectBooking(bookingId);
      toast.success('Booking rejected');
      fetchPendingApprovals(); // Refresh the list
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
      no_show: { color: 'bg-gray-100 text-gray-800', label: 'No Show' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    const statusConfig = {
      unpaid: { color: 'bg-gray-100 text-gray-800', label: 'Unpaid' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { color: 'bg-blue-100 text-blue-800', label: 'Refunded' }
    };

    const config = statusConfig[paymentStatus as keyof typeof statusConfig] || statusConfig.unpaid;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    // Handle null, undefined, or empty date
    if (!dateString) {
      return 'Date not available';
    }

    // Try to parse the date
    const parsedDate = new Date(dateString);

    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
      return 'Date not available';
    }

    // Format valid date
    return parsedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    // Handle null, undefined, or empty time
    if (!timeString || !timeString.includes(':')) {
      return 'Time not available';
    }

    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);

      // Validate the parsed values
      if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return 'Time not available';
      }

      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return 'Time not available';
    }
  };

  const canUpdateStatus = (currentStatus: string, newStatus: string) => {
    const validTransitions: { [key: string]: string[] } = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled', 'no_show'],
      cancelled: [],
      completed: [],
      no_show: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  // Group bookings by day of week for weekly view
  const groupBookingsByWeekday = (bookings: Booking[]) => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped: { [key: string]: Booking[] } = {};

    // Initialize all weekdays with empty arrays
    weekdays.forEach(day => {
      grouped[day] = [];
    });

    // Add a special group for invalid dates
    grouped['Unknown'] = [];

    // Group bookings by their weekday
    bookings.forEach(booking => {
      const bookingDate = booking.bookingDate;
      if (!bookingDate) {
        grouped['Unknown'].push(booking);
        return;
      }

      const date = new Date(bookingDate);
      if (isNaN(date.getTime())) {
        grouped['Unknown'].push(booking);
        return;
      }

      const weekdayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      if (grouped[weekdayName]) {
        grouped[weekdayName].push(booking);
      }
    });

    // Sort bookings within each day by date and time (newest first)
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        // Handle invalid dates
        const aBookingDate = a.bookingDate;
        const bBookingDate = b.bookingDate;
        if (!aBookingDate || !bBookingDate) return 0;

        const aStartTime = a.startTime || '00:00';
        const bStartTime = b.startTime || '00:00';
        const dateA = new Date(aBookingDate + ' ' + aStartTime);
        const dateB = new Date(bBookingDate + ' ' + bStartTime);

        // If either date is invalid, maintain current order
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;

        return dateB.getTime() - dateA.getTime();
      });
    });

    return grouped;
  };

  const getWeekdayIcon = (weekday: string) => {
    const icons: { [key: string]: string } = {
      'Monday': '🗓️',
      'Tuesday': '📅',
      'Wednesday': '📆',
      'Thursday': '🗒️',
      'Friday': '📋',
      'Saturday': '🎯',
      'Sunday': '🌟'
    };
    return icons[weekday] || '📅';
  };

  const toggleWeekdayExpansion = (weekday: string) => {
    setExpandedWeekdays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekday)) {
        newSet.delete(weekday);
      } else {
        newSet.add(weekday);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaCalendar className="w-6 h-6 text-[#312E81]" />
          <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
        </div>
        
        <div className="flex gap-2">
          {(['approvals', 'all', 'pending', 'confirmed', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-[#312E81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'approvals'
                ? 'Pending Approvals'
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filter === 'approvals' ? (
        // Pending Approvals View
        isLoadingApprovals ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#312E81]" />
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending approvals</h3>
            <p className="text-gray-600">
              You don't have any bookings waiting for your approval.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map(booking => (
              <div key={booking.id} className="border-2 border-orange-200 bg-orange-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <FaUser className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.clientName || 'Unknown Client'}</h3>
                      <p className="text-sm text-gray-600">{booking.clientEmail || 'No email'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Awaiting Approval
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendar className="w-4 h-4" />
                    <span>{formatDate(booking.bookingDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaClock className="w-4 h-4" />
                    <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                  </div>
                  {(booking.meetingLocation) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="w-4 h-4" />
                      <span>{booking.meetingLocation}</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">${(booking.totalAmount || 0).toFixed(2)}</span>
                    <span className="ml-1">({booking.durationHours || 0}h)</span>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="mb-4 p-3 bg-white rounded-lg">
                    <div className="flex items-start gap-2">
                      <FaComments className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Special Requests:</p>
                        <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Approval/Rejection Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveBooking(booking.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <FaCheck className="w-4 h-4" />
                    Approve Booking
                  </button>
                  <button
                    onClick={() => handleRejectBooking(booking.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <FaTimes className="w-4 h-4" />
                    Reject Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? "You don't have any bookings yet. Set your availability to start receiving bookings!"
              : `No ${filter} bookings found`
            }
          </p>
        </div>
      ) : filter === 'all' ? (
        // Weekly view for 'All' tab
        <div className="space-y-6">
          {(() => {
            const groupedBookings = groupBookingsByWeekday(bookings);
            const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

            return weekdays.map(weekday => {
              const weekdayBookings = groupedBookings[weekday];
              const isExpanded = expandedWeekdays.has(weekday);
              const hasBookings = weekdayBookings.length > 0;

              return (
                <div key={weekday} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-[#f9f8ff] to-blue-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{weekday}</h3>
                      </div>
                      <span className={`px-2 py-1 ${hasBookings ? 'bg-white' : 'bg-gray-100'} rounded-full text-xs font-medium text-gray-600`}>
                        {weekdayBookings.length} booking{weekdayBookings.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {hasBookings && (
                  <div className="divide-y divide-gray-100">
                    {groupedBookings[weekday].map(booking => (
                      <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#312E81] to-[#312E81] flex items-center justify-center">
                              <FaUser className="text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{booking.clientName}</h3>
                              <p className="text-sm text-gray-600">{booking.clientEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(booking.status)}
                            {getPaymentStatusBadge(booking.paymentStatus)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaCalendar className="w-4 h-4" />
                            <span>{formatDate(booking.bookingDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaClock className="w-4 h-4" />
                            <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                          </div>
                          {(booking.meetingLocation) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaMapMarkerAlt className="w-4 h-4" />
                              <span>{booking.meetingLocation}</span>
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">${(booking.totalAmount || 0).toFixed(2)}</span>
                            <span className="ml-1">({booking.durationHours || 0}h)</span>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="mb-4 p-3 bg-white rounded-lg">
                            <div className="flex items-start gap-2">
                              <FaComments className="w-4 h-4 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">Special Requests:</p>
                                <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Transfer Information (for completed bookings) */}
                        {booking.status === 'completed' && booking.transferStatus && (
                          <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <FaDollarSign className="w-4 h-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-green-800">Payout Information:</p>
                                <p className="text-sm text-green-700">
                                  {booking.transferStatus === 'completed'
                                    ? `Transfer completed! Platform fee: $${booking.platformFeeAmount?.toFixed(2) || '0.00'}, Amount received: $${((booking.totalAmount || 0) - (booking.platformFeeAmount || 0)).toFixed(2)}`
                                    : booking.transferStatus === 'failed'
                                    ? 'Transfer failed. Please contact support.'
                                    : 'Transfer is being processed...'
                                  }
                                </p>
                                {booking.transferId && (
                                  <p className="text-xs text-green-600 mt-1">Transfer ID: {booking.transferId}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                              >
                                <FaCheck className="w-3 h-3" />
                                Confirm
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                              >
                                <FaTimes className="w-3 h-3" />
                                Cancel
                              </button>
                            </>
                          )}

                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              <FaCheck className="w-3 h-3" />
                              Mark Complete
                            </button>
                          )}

                          <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            <FaEye className="w-3 h-3" />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      ) : (
        // Chronological view for other tabs (Pending, Confirmed, Completed)
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#312E81] to-[#312E81] flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{booking.clientName}</h3>
                    <p className="text-sm text-gray-600">{booking.clientEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(booking.status)}
                  {getPaymentStatusBadge(booking.paymentStatus)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCalendar className="w-4 h-4" />
                  <span>{formatDate(booking.bookingDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaClock className="w-4 h-4" />
                  <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                </div>
                {booking.meetingLocation && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaMapMarkerAlt className="w-4 h-4" />
                    <span>{booking.meetingLocation}</span>
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">${(booking.totalAmount || 0).toFixed(2)}</span>
                  <span className="ml-1">({booking.durationHours || 0}h)</span>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FaComments className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Special Requests:</p>
                      <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transfer Information (for completed bookings) */}
              {booking.status === 'completed' && booking.transferStatus && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FaDollarSign className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Payout Information:</p>
                      <p className="text-sm text-green-700">
                        {booking.transferStatus === 'completed'
                          ? `Transfer completed! Platform fee: $${booking.platformFeeAmount?.toFixed(2) || '0.00'}, Amount received: $${((booking.totalAmount || 0) - (booking.platformFeeAmount || 0)).toFixed(2)}`
                          : booking.transferStatus === 'failed'
                          ? 'Transfer failed. Please contact support.'
                          : 'Transfer is being processed...'
                        }
                      </p>
                      {booking.transferId && (
                        <p className="text-xs text-green-600 mt-1">Transfer ID: {booking.transferId}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      <FaCheck className="w-3 h-3" />
                      Confirm
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      <FaTimes className="w-3 h-3" />
                      Cancel
                    </button>
                  </>
                )}

                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => updateBookingStatus(booking.id, 'completed')}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <FaCheck className="w-3 h-3" />
                    Mark Complete
                  </button>
                )}

                <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  <FaEye className="w-3 h-3" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsManager;


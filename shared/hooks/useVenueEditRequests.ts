'use client';

import { useState, useEffect, useCallback } from 'react';
import { VenueEditRequestStatus } from '../../types/age-restriction.types';

interface VenueEditRequest {
  id: string;
  venueId: string;
  requesterId: string;
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  proposedChanges: Record<string, any>;
  status: VenueEditRequestStatus;
  reviewedById?: string;
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rejectionReason?: string;
  createdAt: Date;
  reviewedAt?: Date;
  expiresAt: Date;
}

interface UseVenueEditRequestsOptions {
  venueId: string;
  refreshInterval?: number;
  includeExpired?: boolean;
}

export function useVenueEditRequests({ 
  venueId, 
  refreshInterval = 30000, // 30 seconds
  includeExpired = false 
}: UseVenueEditRequestsOptions) {
  const [editRequests, setEditRequests] = useState<VenueEditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEditRequests = useCallback(async () => {
    try {
      const url = new URL(`/api/venues/${venueId}/edit-requests`, window.location.origin);
      if (!includeExpired) {
        url.searchParams.set('status', 'PENDING');
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch edit requests: ${response.statusText}`);
      }
      
      const data = await response.json();
      setEditRequests(data.map((request: any) => ({
        ...request,
        createdAt: new Date(request.createdAt),
        reviewedAt: request.reviewedAt ? new Date(request.reviewedAt) : undefined,
        expiresAt: new Date(request.expiresAt)
      })));
      setError(null);
    } catch (error: any) {
      console.error('Error fetching venue edit requests:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [venueId, includeExpired]);

  const createEditRequest = useCallback(async (
    requesterId: string,
    proposedChanges: Record<string, any>
  ): Promise<VenueEditRequest> => {
    const response = await fetch(`/api/venues/${venueId}/edit-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requesterId,
        proposedChanges
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create edit request');
    }

    const data = await response.json();
    const newRequest = {
      ...data,
      createdAt: new Date(data.createdAt),
      reviewedAt: data.reviewedAt ? new Date(data.reviewedAt) : undefined,
      expiresAt: new Date(data.expiresAt)
    };
    
    // Refresh the list
    fetchEditRequests();
    
    return newRequest;
  }, [venueId, fetchEditRequests]);

  const approveEditRequest = useCallback(async (
    requestId: string,
    reviewedById: string,
    approveChanges = true
  ) => {
    const response = await fetch(`/api/venues/${venueId}/edit-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: VenueEditRequestStatus.APPROVED,
        reviewedById,
        approveChanges
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to approve edit request');
    }

    // Refresh the list
    fetchEditRequests();
  }, [venueId, fetchEditRequests]);

  const rejectEditRequest = useCallback(async (
    requestId: string,
    reviewedById: string,
    rejectionReason: string
  ) => {
    const response = await fetch(`/api/venues/${venueId}/edit-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: VenueEditRequestStatus.REJECTED,
        reviewedById,
        rejectionReason
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reject edit request');
    }

    // Refresh the list
    fetchEditRequests();
  }, [venueId, fetchEditRequests]);

  const cancelEditRequest = useCallback(async (
    requestId: string,
    requesterId: string
  ) => {
    const response = await fetch(
      `/api/venues/${venueId}/edit-requests/${requestId}?requesterId=${requesterId}`, 
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cancel edit request');
    }

    // Refresh the list
    fetchEditRequests();
  }, [venueId, fetchEditRequests]);

  const transferOwnership = useCallback(async (
    currentOwnerId: string,
    newOwnerId: string,
    reason?: string
  ) => {
    const response = await fetch(`/api/venues/${venueId}/ownership`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentOwnerId,
        newOwnerId,
        reason
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to transfer ownership');
    }

    const data = await response.json();
    return data.venue;
  }, [venueId]);

  const claimOwnership = useCallback(async (
    requesterId: string,
    reason?: string
  ) => {
    const response = await fetch(`/api/venues/${venueId}/ownership`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requesterId,
        reason
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to claim ownership');
    }

    const data = await response.json();
    return data.venue;
  }, [venueId]);

  // Fetch initial data
  useEffect(() => {
    fetchEditRequests();
  }, [fetchEditRequests]);

  // Auto-refresh
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(fetchEditRequests, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchEditRequests, refreshInterval]);

  // Helper functions
  const pendingRequests = editRequests.filter(r => r.status === VenueEditRequestStatus.PENDING);
  const expiredRequests = editRequests.filter(r => r.status === VenueEditRequestStatus.EXPIRED);
  const approvedRequests = editRequests.filter(r => r.status === VenueEditRequestStatus.APPROVED);
  const rejectedRequests = editRequests.filter(r => r.status === VenueEditRequestStatus.REJECTED);

  return {
    editRequests,
    pendingRequests,
    expiredRequests,
    approvedRequests,
    rejectedRequests,
    loading,
    error,
    refetch: fetchEditRequests,
    createEditRequest,
    approveEditRequest,
    rejectEditRequest,
    cancelEditRequest,
    transferOwnership,
    claimOwnership
  };
}

// Helper hook for checking if a user can request ownership
export function useCanRequestOwnership(venueId: string, userId: string) {
  const [canRequest, setCanRequest] = useState(false);
  const [expiredRequestCount, setExpiredRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await fetch(
          `/api/venues/${venueId}/edit-requests?status=EXPIRED`
        );
        
        if (response.ok) {
          const requests = await response.json();
          const userExpiredRequests = requests.filter(
            (r: any) => r.requesterId === userId
          );
          
          setExpiredRequestCount(userExpiredRequests.length);
          setCanRequest(userExpiredRequests.length >= 3);
        }
      } catch (error) {
        console.error('Error checking ownership eligibility:', error);
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [venueId, userId]);

  return { canRequest, expiredRequestCount, loading };
}
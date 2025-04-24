import { Resume } from '@/components/ui/resume/types';
import { fetchApi } from '@/lib/api';
import { useEffect, useState } from 'react';

interface UseCachedResumesReturn {
  resumes: Resume[];
  loading: boolean;
  error: string | null;
  selectedResumeId: string | null;
  setSelectedResumeId: (id: string | null) => void;
  invalidateCache: () => void;
}

// Global cache for resumes across components
const resumeCache: {
  userId: string | null;
  resumes: Resume[];
  timestamp: number;
} = {
  userId: null,
  resumes: [],
  timestamp: 0,
};

export const useResumeCache = (
  userId: string | null,
  initialResumeId?: string,
  authToken?: string
): UseCachedResumesReturn => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(initialResumeId || null);

  const invalidateCache = () => {
    resumeCache.userId = null;
    resumeCache.resumes = [];
    resumeCache.timestamp = 0;
  };

  useEffect(() => {
    const fetchResumes = async () => {
      if (!userId || !authToken) {
        return;
      }

      // If cache is valid (less than 5 minutes old) and for same user, use it
      const now = Date.now();
      const cacheAge = now - resumeCache.timestamp;
      const isCacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes
      const isSameUser = resumeCache.userId === userId;
      
      if (isCacheValid && isSameUser && resumeCache.resumes.length > 0) {
        console.log("Using cached resumes");
        setResumes(resumeCache.resumes);
        if (!selectedResumeId && resumeCache.resumes.length > 0) {
          setSelectedResumeId(resumeCache.resumes[0].resume_id);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchApi<{ resumes: Resume[] }>(`/resume/get-resumes?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response?.resumes?.length > 0) {
          // Update cache
          resumeCache.userId = userId;
          resumeCache.resumes = response.resumes;
          resumeCache.timestamp = now;
          
          // Update state
          setResumes(response.resumes);
          if (!selectedResumeId && response.resumes.length > 0) {
            setSelectedResumeId(response.resumes[0].resume_id);
          }
        } else {
          setResumes([]);
        }
      } catch (err) {
        console.error("Error fetching resumes:", err);
        setError("Failed to fetch resumes.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [userId, authToken, selectedResumeId]);

  return {
    resumes,
    loading,
    error,
    selectedResumeId,
    setSelectedResumeId,
    invalidateCache
  };
}; 
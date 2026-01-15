const API_BASE_URL = import.meta.env.VITE_API_URL

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (import.meta.env.DEV) {
    const savedHeaders = localStorage.getItem('cf-headers')
    if (savedHeaders) {
      const cfHeaders = JSON.parse(savedHeaders)
      // Only include the development-relevant headers
      if (cfHeaders['CF-Access-Client-Id']) {
        headers['CF-Access-Client-Id'] = cfHeaders['CF-Access-Client-Id']
      }
      if (cfHeaders['X-Dev-Name']) {
        headers['X-Dev-Name'] = cfHeaders['X-Dev-Name']
      }
    }
  }
  
  const config = {
    headers,
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'Request failed',
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Network error occurred', 0, { error: error.message })
  }
}

export const auth = async () => {
  return apiRequest('/api/reviewer/auth', {
    method: 'POST',
  })
}

export const getProgress = async (scholarshipId) => {
  return apiRequest(`/api/reviewer/progress/${scholarshipId}`)
}

export const getPhase1Applications = async (scholarshipId) => {
  return apiRequest(`/api/reviewer/phase1/applications/${scholarshipId}`)
}

export const submitPhase1Decision = async (applicationId, decision, comments) => {
  return apiRequest(`/api/reviewer/phase1/${applicationId}`, {
    method: 'POST',
    body: JSON.stringify({ decision, comments }),
  })
}

export const getReviewers = async () => {
  return apiRequest('/api/admin/reviewers')
}

export const createReviewer = async (reviewerData) => {
  return apiRequest('/api/admin/reviewers', {
    method: 'POST',
    body: JSON.stringify(reviewerData),
  })
}

export const updateReviewer = async (reviewerId, reviewerData) => {
  return apiRequest(`/api/admin/reviewers/${reviewerId}`, {
    method: 'PUT',
    body: JSON.stringify(reviewerData),
  })
}

export const deleteReviewer = async (reviewerId) => {
  return apiRequest(`/api/admin/reviewers/${reviewerId}`, {
    method: 'DELETE',
  })
}

export const getActiveScholarships = async () => {
  return apiRequest('/api/reviewer/scholarships')
}

export const getScholarships = async () => {
  return apiRequest('/api/admin/scholarships')
}

export const createScholarship = async (scholarshipData) => {
  return apiRequest('/api/admin/scholarships', {
    method: 'POST',
    body: JSON.stringify(scholarshipData),
  })
}

export const updateScholarship = async (scholarshipId, scholarshipData) => {
  return apiRequest(`/api/admin/scholarships/${scholarshipId}`, {
    method: 'PUT',
    body: JSON.stringify(scholarshipData),
  })
}

export const deleteScholarship = async (scholarshipId) => {
  return apiRequest(`/api/admin/scholarships/${scholarshipId}`, {
    method: 'DELETE',
  })
}

export const getApplicationsForScholarship = async (scholarshipId) => {
  return apiRequest(`/api/reviewer/applications/${scholarshipId}`)
}

export const getApplicationDetails = async (applicationId) => {
  return apiRequest(`/api/reviewer/application/${applicationId}`)
}

export const submitReview = async (applicationId, reviewData) => {
  return apiRequest(`/api/reviewer/review/${applicationId}`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  })
}

export default {
  auth,
  getProgress,
  getPhase1Applications,
  submitPhase1Decision,
  getReviewers,
  createReviewer,
  updateReviewer,
  deleteReviewer,
  getActiveScholarships,
  getScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  getApplicationsForScholarship,
  getApplicationDetails,
  submitReview,
}
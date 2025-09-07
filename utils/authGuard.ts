// Simple authentication guard to prevent unnecessary API calls

export const isAuthenticated = (userProfile: any): boolean => {
  return userProfile && userProfile.id;
};

export const skipIfNotAuthenticated = (userProfile: any, callback: () => void): void => {
  if (isAuthenticated(userProfile)) {
    callback();
  } else {
    console.log('🔒 Skipping API call - user not authenticated');
  }
};

export const safeApiCall = async <T>(
  userProfile: any, 
  apiCall: () => Promise<T>, 
  fallback?: T
): Promise<T | undefined> => {
  if (!isAuthenticated(userProfile)) {
    console.log('🔒 Skipping API call - user not authenticated');
    return fallback;
  }
  
  try {
    return await apiCall();
  } catch (error) {
    console.error('❌ API call failed:', error);
    return fallback;
  }
};

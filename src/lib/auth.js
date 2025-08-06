// Mock authentication utilities
// Replace with Supabase auth functions later

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('mockUser');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mockUser');
  }
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Role hierarchy: admin > manager > employee
  const roleHierarchy = {
    'employee': 1,
    'manager': 2,
    'admin': 3
  };
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

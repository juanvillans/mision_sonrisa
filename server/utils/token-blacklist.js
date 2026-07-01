  // Simple in-memory token blacklist
  // For production, consider using Redis or another persistent store
  const blacklistedTokens = new Set();

  export const tokenBlacklist = {
    add: (token) => {
      blacklistedTokens.add(token);
    },
    
    has: (token) => {
      return blacklistedTokens.has(token);
    },

    // Optional: method to clean expired tokens
    removeExpired: () => {
      // Implementation depends on how you store expiry info
    }
  };
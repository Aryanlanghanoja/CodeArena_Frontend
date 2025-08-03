import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock user data
const mockUser = {
  id: 1,
  name: "Alex Thompson",
  username: "alexthomps",
  email: "alex.thompson@university.edu",
  enrollmentNo: "20CS001",
  profilePhoto: "/api/placeholder/150/150",
  university: "Tech University",
  rating: 1847,
  rank: "Expert",
  problemsSolved: 245,
  totalSubmissions: 478,
  acceptanceRate: 51.3,
  badges: [
    { name: "100 Days Streak", icon: "🔥", description: "Solved problems for 100 consecutive days" },
    { name: "Speed Demon", icon: "⚡", description: "Solved 10 problems in under 5 minutes each" },
    { name: "Contest Winner", icon: "🏆", description: "Won first place in a monthly contest" },
    { name: "Problem Setter", icon: "✍️", description: "Created problems for the platform" }
  ],
  skills: {
    "Dynamic Programming": 85,
    "Graph Theory": 78,
    "Data Structures": 92,
    "Algorithms": 88,
    "Mathematics": 65,
    "String Processing": 76
  },
  activityData: generateActivityData(),
  ratingHistory: generateRatingHistory(),
  submissionStats: {
    easy: { solved: 98, total: 150 },
    medium: { solved: 127, total: 300 },
    hard: { solved: 20, total: 100 }
  }
};

function generateActivityData() {
  const data = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const count = Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0;
    data.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }
  return data;
}

function generateRatingHistory() {
  const data = [];
  let rating = 1200;
  
  for (let i = 0; i < 20; i++) {
    const change = (Math.random() - 0.5) * 100;
    rating = Math.max(800, Math.min(2400, rating + change));
    data.push({
      contest: `Contest ${i + 1}`,
      rating: Math.round(rating),
      date: new Date(Date.now() - (20 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  return data;
}

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem('codeArenaUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const login = (credentials) => {
    // Mock login - in real app, this would validate against backend
    const userData = { ...mockUser, ...credentials };
    setUser(userData);
    localStorage.setItem('codeArenaUser', JSON.stringify(userData));
    return true;
  };

  const register = (userData) => {
    // Mock registration
    const newUser = { ...mockUser, ...userData, id: Date.now() };
    setUser(newUser);
    localStorage.setItem('codeArenaUser', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('codeArenaUser');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
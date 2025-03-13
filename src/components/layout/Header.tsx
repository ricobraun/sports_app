import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target as Cricket, LogOut, User, Bell, Menu, X } from 'lucide-react';
import Button from '../ui/Button';
import InstallPWA from '../InstallPWA';
import { useAppStore } from '../../store';
import Badge from '../ui/Badge';

const Header: React.FC = () => {
  const { currentUser, logout, notifications = [] } = useAppStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadNotifications = notifications?.filter(n => !n.read) || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Cricket className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">CrickPredict</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex ml-8 space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link to="/pricing" className="text-gray-700 hover:text-blue-600 font-medium">
                Pricing
              </Link>
              <Link to="/tournaments" className="text-gray-700 hover:text-blue-600 font-medium">
                Tournaments
              </Link>
              <Link to="/leaderboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Leaderboard
              </Link>
              <InstallPWA />
            </nav>
          </div>
          
          {currentUser ? (
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications && notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}
                          >
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-2">
                {currentUser.profilePicture ? (
                  <img 
                    src={currentUser.profilePicture} 
                    alt={currentUser.name} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-gray-500" />
                )}
                <Link to="/profile" className="text-sm font-medium hover:text-blue-600">
                  {currentUser.name}
                </Link>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm">Login</Button>
            </Link>
          )}
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 space-y-3">
            <Link 
              to="/" 
              className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/pricing" 
              className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/tournaments" 
              className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tournaments
            </Link>
            <Link 
              to="/leaderboard" 
              className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreatePoolPage from './pages/CreatePoolPage';
import PoolDetailsPage from './pages/PoolDetailsPage';
import ManagePoolPage from './pages/ManagePoolPage';
import PricingPage from './pages/PricingPage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailsPage from './pages/TournamentDetailsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { currentUser } = useAppStore();

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {currentUser && <Header />}
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/" 
              element={
                currentUser ? <HomePage /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/pricing" 
              element={<PricingPage />}
            />
            <Route 
              path="/tournaments" 
              element={
                currentUser ? <TournamentsPage /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/tournaments/:tournamentId" 
              element={
                currentUser ? <TournamentDetailsPage /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                currentUser ? <LeaderboardPage /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/profile" 
              element={
                currentUser ? <ProfilePage /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/create-pool" 
              element={
                currentUser ? <CreatePoolPage /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/pools/:poolId" 
              element={
                currentUser ? <PoolDetailsPage /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/pools/:poolId/manage" 
              element={
                currentUser ? <ManagePoolPage /> : <Navigate to="/login" />
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        {currentUser && <Footer />}
      </div>
    </Router>
  );
}

export default App;
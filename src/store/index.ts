import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, Pool, Bet, Tournament, Match, Notification } from '../types';
import { generateInviteCode } from '../lib/utils';
import { signOut } from '../lib/auth';

interface AppState {
  currentUser: User | null;
  users: User[];
  pools: Pool[];
  tournaments: Tournament[];
  matches: Match[];
  notifications: Notification[];
  
  // Auth actions
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  
  // Pool actions
  createPool: (name: string, tournamentId: number) => Pool;
  joinPool: (inviteCode: string) => boolean;
  
  // Bet actions
  placeBet: (poolId: string, matchId: number, prediction: 'team1' | 'team2' | 'draw', confidence?: number) => void;
  
  // Data actions
  setTournaments: (tournaments: Tournament[]) => void;
  setMatches: (matches: Match[]) => void;
  updateMatchResults: (match: Match) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  
  // Helper methods
  getUserPools: () => Pool[];
  getPoolById: (id: string) => Pool | undefined;
  getMatchById: (id: number) => Match | undefined;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      pools: [],
      tournaments: [],
      matches: [],
      notifications: [],
      
      setCurrentUser: (user) => {
        set({ currentUser: user });
      },
      
      logout: async () => {
        await signOut();
        set({ currentUser: null, notifications: [] });
      },
      
      createPool: (name, tournamentId) => {
        const user = get().currentUser;
        if (!user) throw new Error('User not logged in');
        
        const tournament = get().tournaments.find(t => t.id === tournamentId);
        
        const newPool: Pool = {
          id: uuidv4(),
          name,
          adminId: user.id,
          tournamentId,
          createdAt: new Date().toISOString(),
          inviteCode: generateInviteCode(),
          format: tournament?.format,
          isPublic: false,
          members: [{
            userId: user.id,
            userName: user.name,
            points: 0,
            bets: [],
            joinedAt: new Date().toISOString(),
            rank: 1
          }]
        };
        
        set(state => ({
          pools: [...state.pools, newPool]
        }));
        
        // Add notification
        get().addNotification({
          userId: user.id,
          message: `You created a new pool: ${name}`,
          type: 'pool_invite',
          read: false,
          relatedId: newPool.id
        });
        
        return newPool;
      },
      
      joinPool: (inviteCode) => {
        const user = get().currentUser;
        if (!user) throw new Error('User not logged in');
        
        const poolIndex = get().pools.findIndex(p => p.inviteCode === inviteCode);
        if (poolIndex === -1) return false;
        
        // Check if user is already a member
        if (get().pools[poolIndex].members.some(m => m.userId === user.id)) {
          return true;
        }
        
        set(state => {
          const updatedPools = [...state.pools];
          updatedPools[poolIndex].members.push({
            userId: user.id,
            userName: user.name,
            points: 0,
            bets: [],
            joinedAt: new Date().toISOString(),
            rank: updatedPools[poolIndex].members.length + 1
          });
          
          return { pools: updatedPools };
        });
        
        // Add notification
        get().addNotification({
          userId: user.id,
          message: `You joined the pool: ${get().pools[poolIndex].name}`,
          type: 'pool_invite',
          read: false,
          relatedId: get().pools[poolIndex].id
        });
        
        // Notify pool admin
        const pool = get().pools[poolIndex];
        get().addNotification({
          userId: pool.adminId,
          message: `${user.name} joined your pool: ${pool.name}`,
          type: 'pool_invite',
          read: false,
          relatedId: pool.id
        });
        
        return true;
      },
      
      placeBet: (poolId, matchId, prediction, confidence = 100) => {
        const user = get().currentUser;
        if (!user) throw new Error('User not logged in');
        
        const poolIndex = get().pools.findIndex(p => p.id === poolId);
        if (poolIndex === -1) return;
        
        const memberIndex = get().pools[poolIndex].members.findIndex(m => m.userId === user.id);
        if (memberIndex === -1) return;
        
        // Check if match exists and is upcoming
        const match = get().matches.find(m => m.id === matchId);
        if (!match || match.status !== 'upcoming') return;
        
        // Check if user already bet on this match
        const existingBetIndex = get().pools[poolIndex].members[memberIndex].bets.findIndex(b => b.matchId === matchId);
        
        set(state => {
          const updatedPools = [...state.pools];
          const newBet: Bet = {
            id: uuidv4(),
            matchId,
            userId: user.id,
            prediction,
            points: 0,
            createdAt: new Date().toISOString(),
            settled: false,
            confidence: confidence // Use the provided confidence level
          };
          
          if (existingBetIndex !== -1) {
            // Update existing bet
            updatedPools[poolIndex].members[memberIndex].bets[existingBetIndex] = newBet;
          } else {
            // Add new bet
            updatedPools[poolIndex].members[memberIndex].bets.push(newBet);
          }
          
          // Update user's total predictions
          const updatedUsers = [...state.users];
          const userIndex = updatedUsers.findIndex(u => u.id === user.id);
          if (userIndex !== -1) {
            updatedUsers[userIndex].totalPredictions = (updatedUsers[userIndex].totalPredictions || 0) + 1;
          }
          
          return { 
            pools: updatedPools,
            users: updatedUsers
          };
        });
        
        // Add notification
        get().addNotification({
          userId: user.id,
          message: `You placed a bet on ${match.name}`,
          type: 'bet_result',
          read: false,
          relatedId: match.id.toString()
        });
      },
      
      setTournaments: (tournaments) => {
        set({ tournaments });
      },
      
      setMatches: (matches) => {
        set(state => {
          // Filter out any duplicates by ID
          const existingMatchIds = new Set(state.matches.map(m => m.id));
          const newMatches = matches.filter(m => !existingMatchIds.has(m.id));
          
          return {
            matches: [...state.matches, ...newMatches]
          };
        });
      },
      
      updateMatchResults: (updatedMatch) => {
        set(state => {
          // Update match
          const updatedMatches = state.matches.map(match => 
            match.id === updatedMatch.id ? updatedMatch : match
          );
          
          // If match is completed, settle bets
          if (updatedMatch.status === 'completed' && updatedMatch.result) {
            const updatedPools = state.pools.map(pool => {
              // Only update pools for this tournament
              const match = state.matches.find(m => m.id === updatedMatch.id);
              if (!match) return pool;
              
              return {
                ...pool,
                members: pool.members.map(member => {
                  const updatedBets = member.bets.map(bet => {
                    if (bet.matchId === updatedMatch.id && !bet.settled) {
                      // Determine if bet was correct
                      let points = 0;
                      let isCorrect = false;
                      
                      if (
                        (bet.prediction === 'team1' && updatedMatch.result?.winner === updatedMatch.team1.id) ||
                        (bet.prediction === 'team2' && updatedMatch.result?.winner === updatedMatch.team2.id) ||
                        (bet.prediction === 'draw' && updatedMatch.result?.winner === 0)
                      ) {
                        // Calculate points based on confidence level
                        const confidenceMultiplier = (bet.confidence || 100) / 100;
                        points = Math.round(10 * confidenceMultiplier); // Base points * confidence multiplier
                        isCorrect = true;
                        
                        // Add notification for correct prediction
                        get().addNotification({
                          userId: member.userId,
                          message: `Your prediction for ${updatedMatch.name} was correct! You earned ${points} points.`,
                          type: 'bet_result',
                          read: false,
                          relatedId: updatedMatch.id.toString()
                        });
                      } else {
                        // Add notification for incorrect prediction
                        get().addNotification({
                          userId: member.userId,
                          message: `Your prediction for ${updatedMatch.name} was incorrect.`,
                          type: 'bet_result',
                          read: false,
                          relatedId: updatedMatch.id.toString()
                        });
                      }
                      
                      // Update user's correct predictions count
                      if (isCorrect) {
                        const updatedUsers = [...state.users];
                        const userIndex = updatedUsers.findIndex(u => u.id === member.userId);
                        if (userIndex !== -1) {
                          updatedUsers[userIndex].correctPredictions = (updatedUsers[userIndex].correctPredictions || 0) + 1;
                          set({ users: updatedUsers });
                        }
                      }
                      
                      return {
                        ...bet,
                        points,
                        settled: true
                      };
                    }
                    return bet;
                  });
                  
                  // Calculate total points
                  const totalPoints = updatedBets.reduce((sum, bet) => sum + bet.points, 0);
                  
                  return {
                    ...member,
                    bets: updatedBets,
                    points: totalPoints
                  };
                })
              };
            });
            
            // Update rankings in each pool
            const poolsWithRankings = updatedPools.map(pool => {
              const sortedMembers = [...pool.members].sort((a, b) => b.points - a.points);
              
              return {
                ...pool,
                members: sortedMembers.map((member, index) => ({
                  ...member,
                  previousRank: member.rank || index + 1,
                  rank: index + 1
                }))
              };
            });
            
            return { matches: updatedMatches, pools: poolsWithRankings };
          }
          
          return { matches: updatedMatches };
        });
      },
      
      addNotification: (notification) => {
        set(state => ({
          notifications: [
            ...state.notifications,
            {
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              ...notification
            }
          ]
        }));
      },
      
      markNotificationAsRead: (notificationId) => {
        set(state => ({
          notifications: state.notifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true } 
              : notification
          )
        }));
      },
      
      getUserPools: () => {
        const user = get().currentUser;
        if (!user) return [];
        
        return get().pools.filter(pool => 
          pool.members.some(member => member.userId === user.id)
        );
      },
      
      getPoolById: (id) => {
        return get().pools.find(pool => pool.id === id);
      },
      
      getMatchById: (id) => {
        return get().matches.find(match => match.id === id);
      }
    }),
    {
      name: 'cricket-betting-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
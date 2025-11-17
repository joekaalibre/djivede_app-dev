import React, { useState, useEffect } from 'react';
import { 
  BarChart2, TrendingUp, Users, Clock,
  Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import AnimatedSection from './AnimatedSection';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalInteractions: number;
  averageSessionDuration: number;
  dailyStats: {
    date: string;
    interactions: number;
    users: number;
  }[];
  popularPages: {
    page_url: string;
    view_count: number;
  }[];
  userSegments: {
    name: string;
    count: number;
  }[];
}

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalInteractions: 0,
    averageSessionDuration: 0,
    dailyStats: [],
    popularPages: [],
    userSegments: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7),
    end: new Date()
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact' });

      // Fetch active users (users with interactions in the last 30 days)
      const { count: activeUsers } = await supabase
        .from('user_interactions')
        .select('user_id', { count: 'exact', distinct: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch total interactions
      const { count: totalInteractions } = await supabase
        .from('user_interactions')
        .select('*', { count: 'exact' });

      // Fetch popular pages using proper aggregation
      const { data: pageViews } = await supabase
        .rpc('get_page_views')
        .limit(5);

      // Fetch daily stats
      const dailyStats = [];
      for (let i = 0; i < 7; i++) {
        const date = subDays(new Date(), i);
        const start = startOfDay(date).toISOString();
        const end = endOfDay(date).toISOString();

        const { count: interactions } = await supabase
          .from('user_interactions')
          .select('*', { count: 'exact' })
          .gte('created_at', start)
          .lte('created_at', end);

        const { count: users } = await supabase
          .from('user_interactions')
          .select('user_id', { count: 'exact', distinct: true })
          .gte('created_at', start)
          .lte('created_at', end);

        dailyStats.unshift({
          date: format(date, 'yyyy-MM-dd'),
          interactions: interactions || 0,
          users: users || 0
        });
      }

      setAnalyticsData({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalInteractions: totalInteractions || 0,
        averageSessionDuration: 0,
        dailyStats,
        popularPages: pageViews?.map(pv => ({
          page_url: pv.page_url,
          view_count: pv.view_count
        })) || [],
        userSegments: [
          { name: 'Nouveaux visiteurs', count: Math.floor(totalUsers * 0.3) },
          { name: 'Visiteurs réguliers', count: Math.floor(totalUsers * 0.5) },
          { name: 'Très actifs', count: Math.floor(totalUsers * 0.2) }
        ]
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousRange = () => {
    setDateRange(prev => ({
      start: subDays(prev.start, 7),
      end: subDays(prev.end, 7)
    }));
  };

  const handleNextRange = () => {
    const today = new Date();
    if (dateRange.end < today) {
      setDateRange(prev => ({
        start: subDays(prev.start, -7),
        end: subDays(prev.end, -7)
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coaching-primary"></div>
      </div>
    );
  }

  return (
    <AnimatedSection>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytiques</h2>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
            </select>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousRange}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">
                {format(dateRange.start, 'PP', { locale: fr })} - {format(dateRange.end, 'PP', { locale: fr })}
              </span>
              <button
                onClick={handleNextRange}
                className="p-2 rounded-lg hover:bg-gray-100"
                disabled={dateRange.end >= new Date()}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Utilisateurs</h3>
              <Users className="w-6 h-6 text-coaching-primary" />
            </div>
            <p className="text-3xl font-bold text-coaching-primary">
              {analyticsData.totalUsers}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Utilisateurs Actifs</h3>
              <TrendingUp className="w-6 h-6 text-coaching-primary" />
            </div>
            <p className="text-3xl font-bold text-coaching-primary">
              {analyticsData.activeUsers}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Interactions</h3>
              <BarChart2 className="w-6 h-6 text-coaching-primary" />
            </div>
            <p className="text-3xl font-bold text-coaching-primary">
              {analyticsData.totalInteractions}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Durée moyenne</h3>
              <Clock className="w-6 h-6 text-coaching-primary" />
            </div>
            <p className="text-3xl font-bold text-coaching-primary">
              {Math.round(analyticsData.averageSessionDuration / 60)} min
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Interactions quotidiennes</h3>
            <div className="h-64">
              {/* Implement chart here */}
              <div className="h-full flex items-end space-x-2">
                {analyticsData.dailyStats.map((stat) => (
                  <div key={stat.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-coaching-primary/20 rounded-t"
                      style={{ height: `${(stat.interactions / Math.max(...analyticsData.dailyStats.map(s => s.interactions))) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-2">
                      {format(new Date(stat.date), 'E', { locale: fr })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Pages populaires</h3>
            <div className="space-y-4">
              {analyticsData.popularPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{page.page_url}</span>
                  <span className="text-sm font-medium">{page.view_count} vues</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Segments */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Segments d'utilisateurs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analyticsData.userSegments.map((segment, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">{segment.name}</h4>
                <p className="text-2xl font-bold text-coaching-primary">{segment.count}</p>
                <p className="text-sm text-gray-500">
                  {Math.round((segment.count / analyticsData.totalUsers) * 100)}% du total
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default AnalyticsPage;
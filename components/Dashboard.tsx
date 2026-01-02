import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Movie } from '../types';
import { Film, Globe, MapPin, Search, ThumbsUp, Users, Calendar, TrendingUp, MessageCircle } from 'lucide-react';

interface DashboardProps {
  movies: Movie[];
}

const COLORS = ['#a855f7', '#ec4899', '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6', '#10b981'];
const SENTIMENT_COLORS = {
  positive: '#10b981', // Emerald 500
  mixed: '#eab308',    // Yellow 500
  neutral: '#9ca3af',  // Gray 400
  negative: '#ef4444'  // Red 500
};

const Dashboard: React.FC<DashboardProps> = ({ movies }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterGenre, setFilterGenre] = React.useState('All');

  // Stats Processing
  const stats = useMemo(() => {
    const genreCount: Record<string, number> = {};
    const countryCount: Record<string, number> = {};
    const recommenderCount: Record<string, number> = {};
    const decadeCount: Record<string, number> = {};
    const sentimentCount = { positive: 0, mixed: 0, neutral: 0, negative: 0 };

    movies.forEach(movie => {
      // Genres
      movie.genres.forEach(g => {
        const cleanG = g.trim();
        genreCount[cleanG] = (genreCount[cleanG] || 0) + 1;
      });
      // Country
      const cleanC = movie.country.trim();
      countryCount[cleanC] = (countryCount[cleanC] || 0) + 1;
      // Recommender
      if (movie.recommender && movie.recommender !== 'Unknown' && movie.recommender !== 'null') {
         recommenderCount[movie.recommender] = (recommenderCount[movie.recommender] || 0) + 1;
      }
      // Decade
      if (movie.year) {
        const decade = Math.floor(movie.year / 10) * 10;
        const decadeLabel = `${decade}s`;
        decadeCount[decadeLabel] = (decadeCount[decadeLabel] || 0) + 1;
      }
      // Sentiment
      if (movie.sentiment && sentimentCount.hasOwnProperty(movie.sentiment)) {
        sentimentCount[movie.sentiment]++;
      }
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    const topCountries = Object.entries(countryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
    
    const topRecommenders = Object.entries(recommenderCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    const decades = Object.entries(decadeCount)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([name, value]) => ({ name, value }));

    const sentiments = Object.entries(sentimentCount)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    const mostDiscussed = [...movies]
      .sort((a, b) => (b.mentionCount || 1) - (a.mentionCount || 1))
      .slice(0, 3)
      .filter(m => (m.mentionCount || 1) > 1);

    return { topGenres, topCountries, topRecommenders, decades, sentiments, mostDiscussed, genreCount };
  }, [movies]);

  // Filtering
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          movie.director?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === 'All' || movie.genres.some(g => g.includes(filterGenre));
    return matchesSearch && matchesGenre;
  });

  const uniqueGenres = ['All', ...Array.from(new Set(movies.flatMap(m => m.genres))).sort()];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total Movies</p>
            <p className="text-2xl font-bold text-zinc-100">{movies.length}</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-pink-500/20 text-pink-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Top Recommender</p>
            <p className="text-2xl font-bold text-zinc-100 truncate max-w-[120px]">
              {stats.topRecommenders[0]?.name || '-'}
            </p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Top Origin</p>
            <p className="text-2xl font-bold text-zinc-100 truncate max-w-[120px]">
              {stats.topCountries[0]?.name || '-'}
            </p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Positive Vibe</p>
            <p className="text-2xl font-bold text-zinc-100">
               {Math.round((stats.sentiments.find(s => s.name === 'positive')?.value || 0) / movies.length * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* 2. Most Discussed Highlight (if any) */}
      {stats.mostDiscussed.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Most Discussed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.mostDiscussed.map((movie, idx) => (
              <div key={idx} className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 p-5 rounded-xl hover:border-orange-500/50 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-white group-hover:text-orange-400 transition-colors">{movie.title}</h4>
                  <span className="flex items-center gap-1 text-xs font-bold bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full">
                    <MessageCircle className="w-3 h-3" /> {movie.mentionCount}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{movie.summary}</p>
                <div className="flex gap-2">
                  {movie.genres.slice(0, 2).map((g, i) => (
                    <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">{g}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Deep Dive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Genre Distribution (Large) */}
        <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Film className="w-4 h-4" /> Genre Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topGenres} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#52525b" fontSize={11} />
                <YAxis dataKey="name" type="category" width={80} stroke="#a1a1aa" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: '#27272a'}}
                />
                <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Recommenders */}
        <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Users className="w-4 h-4" /> Top Recommenders
          </h3>
          <div className="h-64">
             {stats.topRecommenders.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topRecommenders} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis type="number" stroke="#52525b" fontSize={11} />
                    <YAxis dataKey="name" type="category" width={80} stroke="#a1a1aa" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} 
                      itemStyle={{ color: '#fff' }}
                      cursor={{fill: '#27272a'}}
                    />
                    <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                  No recommender data found.
                </div>
             )}
          </div>
        </div>

        {/* Decade Distribution */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Movies by Decade
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.decades}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} />
                <YAxis stroke="#52525b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} 
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4" /> Sentiment Analysis
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.sentiments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.sentiments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS] || '#71717a'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. Detailed Movie List Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl shadow-black/20">
        <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-900/50">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-500" /> 
            Movie Library
          </h3>
          
          <div className="flex gap-4 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Filter by title or director..." 
              className="w-full md:w-64 bg-zinc-800 border-zinc-700 text-zinc-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select 
              className="bg-zinc-800 border-zinc-700 text-zinc-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm appearance-none cursor-pointer"
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
            >
              {uniqueGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/30 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Genre</th>
                <th className="px-6 py-4 font-medium">Year</th>
                <th className="px-6 py-4 font-medium">Recommender</th>
                <th className="px-6 py-4 font-medium text-right">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredMovies.map((movie, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-200 text-base group-hover:text-purple-300 transition-colors">
                      {movie.title}
                      {(movie.mentionCount || 1) > 1 && (
                         <span className="ml-2 text-[10px] bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-full border border-zinc-600">
                           x{movie.mentionCount}
                         </span>
                      )}
                    </div>
                    <div className="text-zinc-500 text-xs mt-1 truncate max-w-md">{movie.summary}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.slice(0, 2).map((g, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs border border-zinc-700">
                          {g}
                        </span>
                      ))}
                      {movie.genres.length > 2 && <span className="text-zinc-500 text-xs self-center">+{movie.genres.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{movie.year || '-'}</td>
                  <td className="px-6 py-4">
                     {movie.recommender && movie.recommender !== 'Unknown' && movie.recommender !== 'null' ? (
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {movie.recommender.charAt(0).toUpperCase()}
                         </div>
                         <span className="text-zinc-300">{movie.recommender}</span>
                       </div>
                     ) : (
                       <span className="text-zinc-600 italic">Unknown</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium border inline-block min-w-[70px] text-center
                      ${movie.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                      ${movie.sentiment === 'negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                      ${movie.sentiment === 'neutral' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' : ''}
                      ${movie.sentiment === 'mixed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                      ${!movie.sentiment ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : ''}
                    `}>
                      {movie.sentiment || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredMovies.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-20" />
                      <p>No movies found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
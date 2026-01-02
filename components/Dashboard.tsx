import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Movie } from '../types';
import { Film, Globe, MapPin, Search } from 'lucide-react';

interface DashboardProps {
  movies: Movie[];
}

const COLORS = ['#a855f7', '#ec4899', '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6', '#10b981'];

const Dashboard: React.FC<DashboardProps> = ({ movies }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterGenre, setFilterGenre] = React.useState('All');

  // Stats Processing
  const stats = useMemo(() => {
    const genreCount: Record<string, number> = {};
    const countryCount: Record<string, number> = {};
    const languageCount: Record<string, number> = {};

    movies.forEach(movie => {
      // Genres
      movie.genres.forEach(g => {
        const cleanG = g.trim();
        genreCount[cleanG] = (genreCount[cleanG] || 0) + 1;
      });
      // Country
      const cleanC = movie.country.trim();
      countryCount[cleanC] = (countryCount[cleanC] || 0) + 1;
      // Language
      const cleanL = movie.language.trim();
      languageCount[cleanL] = (languageCount[cleanL] || 0) + 1;
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    const topCountries = Object.entries(countryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    return { topGenres, topCountries, genreCount };
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
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Total Movies</p>
            <p className="text-3xl font-bold text-zinc-100">{movies.length}</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-pink-500/20 text-pink-400 rounded-lg">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Top Genre</p>
            <p className="text-2xl font-bold text-zinc-100 truncate max-w-[150px]">
              {stats.topGenres[0]?.name || 'N/A'}
            </p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Top Country</p>
            <p className="text-2xl font-bold text-zinc-100 truncate max-w-[150px]">
              {stats.topCountries[0]?.name || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-zinc-200 mb-6">Genre Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topGenres} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" stroke="#71717a" />
                <YAxis dataKey="name" type="category" width={100} stroke="#a1a1aa" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: '#27272a'}}
                />
                <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-zinc-200 mb-6">Country of Origin</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.topCountries}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.topCountries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Movie List Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-semibold text-zinc-100">Discovered Movies</h3>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search titles..." 
                className="w-full bg-zinc-800 border-zinc-700 text-zinc-200 pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
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
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Genre</th>
                <th className="px-6 py-4 font-medium">Year</th>
                <th className="px-6 py-4 font-medium">Language</th>
                <th className="px-6 py-4 font-medium">Recommender</th>
                <th className="px-6 py-4 font-medium text-right">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredMovies.map((movie, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-200 text-base">{movie.title}</div>
                    <div className="text-zinc-500 text-xs mt-1 truncate max-w-xs">{movie.summary}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.slice(0, 2).map((g, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                          {g}
                        </span>
                      ))}
                      {movie.genres.length > 2 && <span className="text-zinc-500 text-xs">+{movie.genres.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{movie.year || '-'}</td>
                  <td className="px-6 py-4 text-zinc-400">{movie.language}</td>
                  <td className="px-6 py-4">
                     {movie.recommender ? (
                       <span className="text-purple-400 font-medium">{movie.recommender}</span>
                     ) : (
                       <span className="text-zinc-600 italic">Unknown</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium border
                      ${movie.sentiment === 'positive' ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}
                      ${movie.sentiment === 'negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                      ${movie.sentiment === 'neutral' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : ''}
                      ${movie.sentiment === 'mixed' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : ''}
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
                    No movies found matching your filters.
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

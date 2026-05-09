import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Copy, Clock, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [mode, setMode] = useState('pincode'); 
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }, [history]);

  const addToHistory = (searchQuery, resultType) => {
    const newItem = { query: searchQuery, type: resultType, time: new Date().toISOString() };
    setHistory(prev => {
      const filtered = prev.filter(item => item.query !== searchQuery);
      return [newItem, ...filtered].slice(0, 5);
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      let res;
      if (mode === 'pincode') {
        if (!/^\d{6}$/.test(query)) {
          setError('Please enter a valid 6-digit pincode.');
          setLoading(false);
          return;
        }
        res = await axios.get(`${API_BASE}/pincode/${query}`);
        setResults([res.data]);
        addToHistory(query, 'pincode');
      } else {
        res = await axios.get(`${API_BASE}/area/${query}`);
        setResults(res.data);
        addToHistory(query, 'area');
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('No results found.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        
       
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600 sm:text-4xl">
            Bangalore Pincode Explorer
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Find Bangalore pincodes and area names instantly
          </p>
        </div>

       
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-6">
          
         
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 py-3 text-center font-medium text-sm transition-colors duration-200 ${
                mode === 'pincode'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => { setMode('pincode'); setQuery(''); setError(''); setResults([]); }}
            >
              Search by Pincode
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium text-sm transition-colors duration-200 ${
                mode === 'area'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => { setMode('area'); setQuery(''); setError(''); setResults([]); }}
            >
              Search by Area
            </button>
          </div>

        
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors">
              <div className="pl-4 text-gray-400">
                <Search size={20} />
              </div>
              <input
                type={mode === 'pincode' ? 'number' : 'text'}
                className="w-full py-3 px-4 outline-none text-gray-700"
                placeholder={mode === 'pincode' ? 'Enter 6-digit pincode (e.g. 560034)' : 'Enter area name (e.g. Koramangala)'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </form>

         
          {error && (
            <div className="mt-4 flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}
        </div>

        
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Results ({results.length})</h2>
            {results.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{item.area}</h3>
                    <p className="text-gray-500 font-medium">Pincode: {item.pincode}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(item.pincode)}
                  className="flex items-center text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50"
                  title="Copy Pincode"
                >
                  <Copy size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State / Initial State */}
        {!loading && results.length === 0 && !error && query === '' && (
           <div className="text-center text-gray-400 mt-10">
             <MapPin size={48} className="mx-auto mb-4 opacity-50" />
             <p>Enter a search term to see results</p>
           </div>
        )}

        {/* Search History */}
        {history.length > 0 && !loading && results.length === 0 && !error && (
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center text-gray-600 mb-4 font-semibold">
              <Clock size={18} className="mr-2" />
              <h3>Recent Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMode(h.type);
                    setQuery(h.query);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  {h.query}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  Search, 
  Bell, 
  User,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

function App() {
  const [stats, setStats] = useState({ totalUsers: 0, totalWords: 0 })

  useEffect(() => {
    // Basic fetch example (will work once backend is running and CORS allows)
    fetch('http://localhost:1337/api/v1/dashboard/analytics/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching admin stats:', err))
  }, [])

  const data = [
    { name: 'Mon', words: 400, users: 240 },
    { name: 'Tue', words: 300, users: 139 },
    { name: 'Wed', words: 200, users: 980 },
    { name: 'Thu', words: 278, users: 390 },
    { name: 'Fri', words: 189, users: 480 },
    { name: 'Sat', words: 239, users: 380 },
    { name: 'Sun', words: 349, users: 430 },
  ]

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans w-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            L
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LexiAdmin</span>
        </div>
        
        <nav className="space-y-1">
          <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-indigo-600/10 text-indigo-400 font-medium transition-all">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all">
            <Users size={20} /> User Management
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all">
            <BookOpen size={20} /> Word Library
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all">
            <Settings size={20} /> System Config
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
               <User size={24} className="text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Admin Master</p>
              <p className="text-xs text-slate-500">Super User</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white">Overview</h1>
            <p className="text-slate-500 text-sm">Welcome back to LexiNote Dashboard</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search analytics..." 
                className="bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
              />
            </div>
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-800"></span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Users', value: stats.totalUsers || '2,543', change: '+12%', icon: Users, color: 'text-indigo-500' },
            { label: 'Total Words', value: stats.totalWords || '18,201', change: '+5%', icon: BookOpen, color: 'text-emerald-500' },
            { label: 'Active Sessions', value: '432', change: '-2%', icon: Activity, color: 'text-orange-500' },
            { label: 'New Words Today', value: '89', change: '+24%', icon: ArrowUpRight, color: 'text-rose-500' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-slate-800 group-hover:bg-slate-700 transition-all ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <span className={`text-xs font-medium flex items-center gap-1 ${item.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.change} {item.change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">{item.label}</h3>
              <p className="text-3xl font-bold text-white mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-white">Usage Growth</h2>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs text-slate-400"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Words</span>
                <span className="flex items-center gap-1 text-xs text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Users</span>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="words" stroke="#6366f1" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="users" stroke="#94a3b8" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between group">
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-2">LexiNote Stats</h2>
              <p className="text-indigo-100 text-sm opacity-80">Platform has reached 10k downloads this month! Keep it up team.</p>
            </div>
            <div className="mt-8 relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/20">
               <div className="flex items-center gap-2 text-sm font-semibold">
                  <Activity size={18} /> Live Update
               </div>
               <span className="text-xs bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full font-bold">STABLE</span>
            </div>
            
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700"></div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

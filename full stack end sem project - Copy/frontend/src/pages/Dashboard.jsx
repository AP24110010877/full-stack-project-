import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search, Trash2, CalendarDays, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [lists, setLists] = useState([]);
  const [search, setSearch] = useState('');
  const [newListName, setNewListName] = useState('');
  const [activeTab, setActiveTab] = useState('my-lists'); // 'my-lists' or 'create-list'
  
  // Pre-defined suggestions for easy creation
  const suggestions = ["Weekly Shopping", "Monthly Groceries", "Party Supplies", "Weekend BBQ", "Healthy Snacks"];

  const fetchLists = useCallback(async () => {
    try {
      const res = await api.get('/lists');
      setLists(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [activeTab, fetchLists]); // Refetch when switching back

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      await api.post('/lists', { name: newListName });
      setNewListName('');
      setActiveTab('my-lists'); // automatically switch back to lists tab
      fetchLists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteList = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await api.delete(`/lists/${id}`);
        fetchLists();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredLists = lists.filter(list => list.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container relative z-10 pb-20">
      
      {/* Top Banner */}
      <div className="text-center mb-10 mt-4">
         <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">Your Grocery Hub</h1>
         <p className="text-gray-500 max-w-lg mx-auto text-lg">Organize your shopping effortlessly. Create new lists or manage your existing ones perfectly.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10">
         <div className="bg-white rounded-full p-2 shadow-sm border border-gray-100 flex gap-2 w-full max-w-md">
            <button 
              onClick={() => setActiveTab('my-lists')}
              className={`flex-1 py-3 px-6 rounded-full font-medium transition-all duration-300 ${activeTab === 'my-lists' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              My Lists
            </button>
            <button 
              onClick={() => setActiveTab('create-list')}
              className={`flex-1 py-3 px-6 rounded-full font-medium transition-all duration-300 ${activeTab === 'create-list' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Create New List
            </button>
         </div>
      </div>

      {activeTab === 'my-lists' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
            <input 
              type="text" 
              placeholder="Search your lists by name..." 
              className="w-full pl-14 py-4 text-lg rounded-full border border-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white shadow-sm placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.length === 0 ? (
              <div className="col-span-full py-16 text-center card bg-gray-50/50 border-dashed border-2 border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
                   <CalendarDays size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No lists found</h3>
                <p className="text-gray-500 mb-6">You haven't created any lists matching this search.</p>
                <button onClick={() => {setSearch(''); setActiveTab('create-list')}} className="btn-primary inline-flex items-center gap-2">
                   <Plus size={18} /> Create your first list
                </button>
              </div>
            ) : (
              filteredLists.map((list) => (
                <Link to={`/lists/${list._id}`} key={list._id} className="card group hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-light to-primary opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div>
                    <div className="flex justify-between items-start mb-2 mt-2">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 pr-4">{list.name}</h3>
                      <button 
                        onClick={(e) => handleDeleteList(list._id, e)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors absolute right-4 top-6"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CalendarDays size={14} />
                      <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
                    <span className="text-sm font-medium text-gray-500">View checklist</span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                       <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'create-list' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
           <div className="bg-gradient-to-br from-white to-primary-light/30 rounded-[2rem] p-8 sm:p-12 shadow-sm border border-primary/10 text-center relative overflow-hidden">
             
             {/* Decorative background blobs */}
             <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
             <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
             
             <div className="relative z-10">
               <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                 <Plus size={40} />
               </div>
               <h2 className="text-2xl font-bold text-gray-800 mb-2">Give your new list a name</h2>
               <p className="text-gray-500 mb-8 max-w-sm mx-auto">Type a custom name below or pick one of our smart suggestions.</p>
               
               <form onSubmit={handleCreateList} className="space-y-6">
                 <div className="relative">
                   <input 
                     type="text" 
                     placeholder="e.g., Target Run, Dinner Party..." 
                     className="w-full px-6 py-4 text-xl rounded-2xl border-2 border-gray-300 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-700 bg-white shadow-sm placeholder:text-gray-400"
                     value={newListName}
                     onChange={(e) => setNewListName(e.target.value)}
                     autoFocus
                   />
                 </div>
                 
                 <div className="flex flex-wrap items-center justify-center gap-2">
                   {suggestions.map(s => (
                     <button
                       key={s}
                       type="button"
                       onClick={() => setNewListName(s)}
                       className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-colors"
                     >
                       {s}
                     </button>
                   ))}
                 </div>

                 <button 
                   type="submit" 
                   disabled={!newListName.trim()}
                   className="btn-primary w-full py-4 text-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed transform disabled:hover:scale-100"
                 >
                   Create My List 📝
                 </button>
               </form>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}

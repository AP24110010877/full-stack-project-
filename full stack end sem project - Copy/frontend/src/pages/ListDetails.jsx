import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Plus, Download, CheckCircle, Circle, Trash2, Image as ImageIcon } from 'lucide-react';

export default function ListDetails() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All'); // All, Purchased, Not Purchased
  const [showItemModal, setShowItemModal] = useState(false);
  const [listName, setListName] = useState('Your List');
  
  // Item Form State
  const [formData, setFormData] = useState({
    name: '', category: 'Fruits', price: '', 
    quantityType: 'Kg/Gram', quantityValue: '', imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get(`/items/${id}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  const fetchListDetails = useCallback(async () => {
     try {
       const res = await api.get(`/lists/${id}`);
       setListName(res.data.name);
     } catch(err) {
       console.error(err);
     }
  }, [id]);

  useEffect(() => {
    fetchItems();
    fetchListDetails();
  }, [id, fetchItems, fetchListDetails]);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('quantityType', formData.quantityType);
    data.append('quantityValue', formData.quantityValue);
    if (imageFile) {
      data.append('imageFile', imageFile);
    } else {
      data.append('imageUrl', formData.imageUrl);
    }

    try {
      await api.post(`/items/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowItemModal(false);
      setFormData({ name: '', category: 'Fruits', price: '', quantityType: 'Kg/Gram', quantityValue: '', imageUrl: '' });
      setImageFile(null);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePurchased = async (itemId) => {
    try {
      await api.put(`/items/${itemId}`);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Delete this item?')) {
      try {
        await api.delete(`/items/${itemId}`);
        fetchItems();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get(`/lists/${id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${listName}_Grocery.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'Purchased') return item.isPurchased;
    if (filter === 'Not Purchased') return !item.isPurchased;
    return true; // All
  });

  const totalCost = items.reduce((sum, item) => sum + (item.price * item.quantityValue), 0);
  const purchasedCount = items.filter(i => i.isPurchased).length;
  const progressPercent = items.length === 0 ? 0 : Math.round((purchasedCount / items.length) * 100);

  const getImageUrl = (item) => {
    if (!item.image) return 'https://placehold.co/150?text=No+Image'; // Reliable placeholder
    if (item.image.startsWith('/')) return `http://localhost:5000${item.image}`;
    return item.image;
  };

  return (
    <div className="page-container pb-24">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to My Lists
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-800 mb-2">{listName} 🛍️</h1>
           <p className="text-gray-500 flex items-center gap-4">
              <span>{items.length} items total</span>
              <span className="font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">Total: ${totalCost.toFixed(2)}</span>
           </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleExport} className="btn-primary !bg-white !text-gray-700 !bg-none border border-gray-200 hover:!bg-gray-50 flex items-center gap-2 flex-1 md:flex-none justify-center">
            <Download size={18} /> Export
          </button>
          <button onClick={() => setShowItemModal(true)} className="btn-primary flex items-center gap-2 flex-1 md:flex-none justify-center shadow-primary/30">
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card mb-8 p-6 bg-gradient-to-r from-primary-light to-white">
         <div className="flex justify-between items-center mb-2 text-sm font-medium">
            <span className="text-gray-700">Shopping Progress</span>
            <span className="text-primary">{purchasedCount} / {items.length} bought ({progressPercent}%)</span>
         </div>
         <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
         </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Not Purchased', 'Purchased'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setFilter(tab)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-medium transition-colors border ${filter === tab ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 card flex flex-col items-center">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <ImageIcon size={48} />
             </div>
             <p className="text-gray-500 text-lg">No items found in this view.</p>
             <button onClick={() => setShowItemModal(true)} className="text-primary mt-4 font-medium hover:underline">Add your first item</button>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item._id} className={`card p-4 sm:p-5 flex items-center gap-4 group transition-all ${item.isPurchased ? 'opacity-70 bg-gray-50' : 'hover:shadow-md'}`}>
              
              <button onClick={() => handleTogglePurchased(item._id)} className="flex-shrink-0 text-primary transition-transform active:scale-95">
                {item.isPurchased ? <CheckCircle size={28} className="fill-primary/20" /> : <Circle size={28} className="text-gray-300 hover:text-primary transition-colors" />}
              </button>

              <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                 <img src={getImageUrl(item)} alt={item.name} className={`w-full h-full object-cover ${item.isPurchased ? 'grayscale opacity-80' : ''}`} />
              </div>

              <div className="flex-grow min-w-0">
                <h3 className={`text-lg font-semibold truncate ${item.isPurchased ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 sm:gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                  <span className="bg-white border border-gray-200 px-2.5 py-0.5 rounded-md text-xs font-medium">{item.category}</span>
                  <span>{item.quantityValue} {item.quantityType}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
                 <span className="font-bold text-lg text-gray-800">${(item.price * item.quantityValue).toFixed(2)}</span>
                 <button onClick={() => handleDeleteItem(item._id)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                   <Trash2 size={18} />
                 </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Add New Grocery Item</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                   <input type="text" className="input-field py-2" required
                     value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                   <select className="input-field py-2 bg-white" 
                     value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                     {['Fruits', 'Vegetables', 'Dairy', 'House Essentials', 'Others'].map(cat => <option key={cat}>{cat}</option>)}
                   </select>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                     <input type="number" step="0.01" min="0" className="input-field py-2 pl-7" required placeholder="0.00"
                       value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                   <select className="input-field py-2 bg-white" 
                     value={formData.quantityType} onChange={e => setFormData({...formData, quantityType: e.target.value})}>
                     {['Kg/Gram', 'Liter', 'Pieces'].map(type => <option key={type}>{type}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                   <input type="number" step="0.1" min="0.1" className="input-field py-2" required placeholder="1"
                     value={formData.quantityValue} onChange={e => setFormData({...formData, quantityValue: e.target.value})} />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Upload Local Image (Optional)</label>
                 <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
              </div>
              
              <div className="text-center text-sm font-medium text-gray-400">OR</div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                 <input type="url" placeholder="https://..." className="input-field py-2"
                   disabled={!!imageFile}
                   value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4 mt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 py-2.5 px-4 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary py-2.5">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

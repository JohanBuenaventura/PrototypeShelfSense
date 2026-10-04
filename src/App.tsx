import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, Camera, AlertTriangle, Settings, Bell, Search, 
  Plus, Thermometer, Activity, Upload, CheckCircle, Clock, Menu, Box,
  History, FileText, LogOut, ChevronRight, Edit, Trash2, Eye, Filter
} from 'lucide-react';

// --- MOCK DATA ---
const initialInventory = [
  { id: 1, name: 'Pork Meat', category: 'Fresh Meat', state: 'Raw', quantity: 2, unit: 'kg', location: 'Refrigerator 1', baseDays: 5, dateAdded: '2026-09-30', batch: 'PM1026' },
  { id: 2, name: 'Hotdog', category: 'Processed Meat', state: 'Processed', quantity: 15, unit: 'packs', location: 'Refrigerator 2', baseDays: 32, dateAdded: '2026-09-20', batch: 'HD223' },
  { id: 3, name: 'Chicken Breast', category: 'Fresh Meat', state: 'Raw', quantity: 5, unit: 'kg', location: 'Refrigerator 1', baseDays: 3, dateAdded: '2026-09-28', batch: 'CB1026' },
  { id: 4, name: 'Fish Fillet', category: 'Seafood', state: 'Raw', quantity: 8, unit: 'packs', location: 'Freezer 1', baseDays: 0, dateAdded: '2026-09-12', batch: 'FF109' },
  { id: 5, name: 'Bacon', category: 'Processed Meat', state: 'Processed', quantity: 4, unit: 'packs', location: 'Refrigerator 2', baseDays: 14, dateAdded: '2026-10-01', batch: 'BC991' },
  { id: 6, name: 'Beef Cubes', category: 'Fresh Meat', state: 'Raw', quantity: 3, unit: 'kg', location: 'Refrigerator 1', baseDays: 4, dateAdded: '2026-10-02', batch: 'BF102' },
  { id: 7, name: 'Chorizo', category: 'Processed Meat', state: 'Processed', quantity: 20, unit: 'packs', location: 'Refrigerator 2', baseDays: 16, dateAdded: '2026-09-25', batch: 'CH001' },
];

const mockTransactions = [
  { id: 1, date: 'Oct 2, 2026', product: 'Chicken Breast', type: 'Consumed', qty: '2 kg', user: 'Admin', remarks: 'Kitchen usage' },
  { id: 2, date: 'Oct 1, 2026', product: 'Hotdog', type: 'Added', qty: '20 packs', user: 'Staff', remarks: 'New stock' },
  { id: 3, date: 'Sep 30, 2026', product: 'Pork Meat', type: 'Added', qty: '5 kg', user: 'Admin', remarks: 'Supplier delivery' },
  { id: 4, date: 'Sep 29, 2026', product: 'Fish Fillet', type: 'Expired', qty: '1 pack', user: 'System', remarks: 'Auto-flagged' },
];

const storageLocations = [
  { id: 1, name: 'Refrigerator 1', items: 24, critical: 3, approaching: 8, type: 'Fridge' },
  { id: 2, name: 'Refrigerator 2', items: 31, critical: 2, approaching: 5, type: 'Fridge' },
  { id: 3, name: 'Freezer 1', items: 45, critical: 1, approaching: 4, type: 'Freezer' },
  { id: 4, name: 'Freezer 2', items: 28, critical: 0, approaching: 3, type: 'Freezer' },
];

export default function ShelfSenseComplete() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // IoT Simulation State
  const [fridgeTemp, setFridgeTemp] = useState(2); 
  
  // CV Scanner State
  const [scanStep, setScanStep] = useState(0);

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);

  // --- DYNAMIC EXPIRY ALGORITHM ---
  const getDynamicInventory = () => {
    return initialInventory.map(item => {
      let days = item.baseDays;
      // IoT Predictive Logic: Raw meat spoils faster if temp > 4°C
      if (item.state === 'Raw' && fridgeTemp > 4) {
        const penalty = (fridgeTemp - 4) * 0.8;
        days = Math.max(0, Math.floor(item.baseDays - penalty));
      } else {
        days = Math.floor(days); 
      }
      
      let status = 'NORMAL';
      let statusColor = 'bg-green-100 text-green-800 border-green-200';
      if (days <= 0) { status = 'EXPIRED'; statusColor = 'bg-gray-200 text-gray-800 border-gray-300'; }
      else if (days <= 7) { status = 'CRITICAL'; statusColor = 'bg-red-100 text-red-800 border-red-200'; }
      else if (days <= 30) { status = 'APPROACHING'; statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-200'; }

      return { ...item, dynamicDays: days, status, statusColor };
    });
  };

  const currentInventory = getDynamicInventory();
  
  // Metrics
  const totalItems = currentInventory.length;
  const criticalItems = currentInventory.filter(i => i.status === 'CRITICAL');
  const approachingItems = currentInventory.filter(i => i.status === 'APPROACHING');
  const expiredItems = currentInventory.filter(i => i.status === 'EXPIRED');

  // --- TAB COMPONENTS ---

  const DashboardTab = () => (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Good morning, Admin</h2>
          <p className="text-gray-500">Here's an overview of your food inventory.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setActiveTab('add')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center">
            <Plus size={18} className="mr-2"/> Add Food
          </button>
          <button onClick={() => setActiveTab('recognize')} className="px-4 py-2 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700 flex items-center shadow-sm">
            <Camera size={18} className="mr-2"/> Recognize Food
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Total Food Items</div>
          <div className="text-3xl font-bold text-gray-900">{totalItems + 121}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Expiring Soon</div>
          <div className="text-3xl font-bold text-yellow-600">{approachingItems.length + 11}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Critical</div>
          <div className="text-3xl font-bold text-red-600">{criticalItems.length + 3}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Expired</div>
          <div className="text-3xl font-bold text-gray-600">{expiredItems.length + 2}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 p-8 opacity-5">
          <Thermometer size={160} />
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <Activity className="text-blue-600" size={24}/>
          <h2 className="text-lg font-bold text-gray-900">Smart Expiry Monitoring (IoT Simulation)</h2>
        </div>
        <p className="text-gray-600 text-sm mb-6 max-w-3xl relative z-10">
          Move the slider to simulate a temperature spike in the storage units. The Predictive AI will automatically recalculate the remaining shelf life. <b>Raw</b> items will spoil faster than <b>Processed</b> items.
        </p>
        
        <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-lg border border-gray-200 relative z-10">
          <span className="font-semibold text-gray-700 w-32">Fridge Temp: {fridgeTemp}°C</span>
          <input 
            type="range" min="0" max="15" value={fridgeTemp} 
            onChange={(e) => setFridgeTemp(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className={`px-4 py-1.5 rounded text-sm font-bold shadow-sm ${fridgeTemp > 4 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            {fridgeTemp > 4 ? 'DANGER ZONE' : 'OPTIMAL'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-800">Items Requiring Attention</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">State</th>
              <th className="p-4 font-medium">Dynamic Shelf Life</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentInventory.filter(i => i.status === 'CRITICAL' || i.status === 'EXPIRED').map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">
                  {item.name} <br/>
                  <span className="text-xs text-gray-500 font-normal">{item.quantity} {item.unit}</span>
                </td>
                <td className="p-4 text-sm text-gray-600">{item.location}</td>
                <td className="p-4"><span className={`text-xs font-bold ${item.state==='Raw' ? 'text-blue-600' : 'text-purple-600'}`}>{item.state}</span></td>
                <td className="p-4 font-bold text-gray-800">{item.dynamicDays} days</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-sm font-medium text-green-600 hover:text-green-800 flex items-center">
                    <Eye size={16} className="mr-1"/> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const InventoryTab = () => (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Food Inventory</h2>
          <p className="text-gray-500">Manage and monitor all stored food products.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center">
            <Filter size={18} className="mr-2"/> Filter
          </button>
          <button onClick={() => setActiveTab('recognize')} className="px-4 py-2 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700 flex items-center shadow-sm">
            <Camera size={18} className="mr-2"/> Recognize Food
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Product / Batch</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Quantity</th>
              <th className="p-4 font-medium">Storage</th>
              <th className="p-4 font-medium">Date Received</th>
              <th className="p-4 font-medium">Days Remaining</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentInventory.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.batch}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-900">{item.category}</div>
                  <div className={`text-xs font-bold ${item.state==='Raw' ? 'text-blue-600' : 'text-purple-600'}`}>{item.state}</div>
                </td>
                <td className="p-4 text-sm">{item.quantity} {item.unit}</td>
                <td className="p-4 text-sm text-gray-600">{item.location}</td>
                <td className="p-4 text-sm text-gray-600">{item.dateAdded}</td>
                <td className="p-4">
                  <span className={`font-bold ${item.dynamicDays <= 2 ? 'text-red-600' : 'text-gray-800'}`}>
                    {item.dynamicDays} days
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 flex space-x-2">
                  <button className="p-1.5 text-gray-500 hover:text-blue-600 rounded bg-gray-100"><Edit size={16}/></button>
                  <button className="p-1.5 text-gray-500 hover:text-red-600 rounded bg-gray-100"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const RecognizeFoodTab = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Recognize Food</h2>
        <p className="text-gray-500">Use Computer Vision to identify a food item from its appearance.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Computer Vision Classifier</h3>
            <p className="text-sm text-gray-500">Position the food item inside the camera frame.</p>
          </div>
          {scanStep > 0 && (
            <button onClick={() => setScanStep(0)} className="text-sm font-medium text-blue-600 hover:underline">
              Reset Scanner
            </button>
          )}
        </div>

        <div className="p-8">
          {scanStep === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center hover:bg-gray-50 cursor-pointer" onClick={() => setScanStep(1)}>
              <Camera className="mx-auto text-gray-400 mb-4" size={56}/>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Click to Simulate Camera Capture</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">This simulates pointing a camera at raw meat. The system will identify the food and classify its state (Raw/Processed).</p>
              <div className="mt-8 flex justify-center space-x-4">
                <button className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center">
                  <Camera className="mr-2" size={18}/> Open Camera
                </button>
                <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
                  <Upload className="mr-2" size={18}/> Upload Image
                </button>
              </div>
            </div>
          )}

          {scanStep === 1 && (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-bold text-gray-800">Analyzing Food Image...</h3>
              <p className="text-gray-500 mt-2">Running structural analysis and texture detection.</p>
              {setTimeout(() => setScanStep(2), 2000) && null}
            </div>
          )}

          {scanStep === 2 && (
            <div className="space-y-8">
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="w-40 h-40 bg-gray-200 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                   <div className="w-full h-full bg-red-300 opacity-80" style={{backgroundImage: 'radial-gradient(circle, #fca5a5 20%, transparent 20%), radial-gradient(circle, #fca5a5 20%, transparent 20%)', backgroundSize: '10px 10px'}}></div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start text-green-700 mb-2">
                    <CheckCircle className="mr-2" size={20}/>
                    <span className="font-bold tracking-wide uppercase text-sm">Food Detected</span>
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 mb-4">Pork Meat</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-xs text-gray-500 uppercase font-bold">Confidence</div>
                      <div className="text-green-600 text-xl font-black">94%</div>
                    </div>
                    <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200 shadow-sm">
                      <div className="text-xs text-blue-500 uppercase font-bold">Food State</div>
                      <div className="text-blue-700 text-xl font-black">RAW</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2 uppercase font-bold">Other Possible Matches</p>
                    <div className="flex gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Beef - 4%</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Chicken - 2%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-800 mb-4">Confirm & Add Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <div className="flex"><input type="number" className="border rounded-l-lg p-2 w-full" placeholder="0"/><select className="border-y border-r rounded-r-lg bg-gray-50 p-2"><option>kg</option><option>packs</option></select></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                    <select className="border rounded-lg p-2 w-full"><option>Refrigerator 1</option><option>Freezer 1</option></select>
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button onClick={() => setScanStep(0)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                    Scan Again
                  </button>
                  <button onClick={() => setActiveTab('inventory')} className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm">
                    Confirm Food & Add to Inventory
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const StorageTab = () => (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Storage Locations</h2>
        <p className="text-gray-500">Manage your refrigerators and freezers.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {storageLocations.map(loc => (
          <div key={loc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${loc.type === 'Fridge' ? 'bg-blue-50 text-blue-600' : 'bg-cyan-50 text-cyan-600'}`}>
                <Box size={24}/>
              </div>
              <span className="text-2xl font-bold text-gray-900">{loc.items}</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{loc.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{loc.type} • {loc.items} Total Items</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-red-600 font-medium">Critical</span><span>{loc.critical}</span></div>
              <div className="flex justify-between text-sm"><span className="text-yellow-600 font-medium">Approaching</span><span>{loc.approaching}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AlertsTab = () => (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Expiry Alerts</h2>
        <p className="text-gray-500">Review food items that require attention.</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center"><AlertTriangle className="mr-2" size={20}/> Critical (1-7 Days)</h3>
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
          {criticalItems.map(item => (
            <div key={item.id} className="p-4 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
              <div>
                <h4 className="font-bold text-gray-900">{item.name} <span className="text-xs font-normal text-gray-500 ml-2">{item.quantity} {item.unit} • {item.location}</span></h4>
                <p className="text-sm text-red-600 font-medium mt-1">Expires in {item.dynamicDays} days</p>
              </div>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">View Item</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-yellow-700 mb-3 flex items-center"><Clock className="mr-2" size={20}/> Approaching Expiry (8-30 Days)</h3>
        <div className="bg-white rounded-xl border border-yellow-200 shadow-sm overflow-hidden">
          {approachingItems.map(item => (
            <div key={item.id} className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900">{item.name} <span className="text-xs font-normal text-gray-500 ml-2">{item.quantity} {item.unit} • {item.location}</span></h4>
                <p className="text-sm text-yellow-600 font-medium mt-1">Expires in {item.dynamicDays} days</p>
              </div>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">View Item</button>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><Box className="mr-2" size={20}/> Expired</h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {expiredItems.map(item => (
            <div key={item.id} className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-100">
              <div>
                <h4 className="font-bold text-gray-900 line-through opacity-70">{item.name}</h4>
                <p className="text-sm text-gray-600 font-medium mt-1">Expired {Math.abs(item.dynamicDays)} days ago</p>
              </div>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">Remove Item</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TransactionsTab = () => (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Inventory Transactions</h2>
        <p className="text-gray-500">History of added, consumed, and removed items.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Transaction</th>
              <th className="p-4 font-medium">Quantity</th>
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-600">{tx.date}</td>
                <td className="p-4 font-medium text-gray-900">{tx.product}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${tx.type==='Added'?'bg-green-100 text-green-700':tx.type==='Consumed'?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>
                    {tx.type}
                  </span>
                </td>
                <td className="p-4 text-sm font-medium">{tx.qty}</td>
                <td className="p-4 text-sm text-gray-600">{tx.user}</td>
                <td className="p-4 text-sm text-gray-500 italic">{tx.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AddFoodTab = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Add Food Item</h2>
        <p className="text-gray-500">Manually register a food item without the camera.</p>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-green-800">Want to use the camera?</h3>
          <p className="text-sm text-green-700 mt-1">Use Computer Vision to identify the food item automatically.</p>
        </div>
        <button onClick={() => setActiveTab('recognize')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-green-700 whitespace-nowrap">
          Recognize Food
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="e.g., Chicken Breast" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-white">
                <option>Fresh Meat</option><option>Processed Meat</option><option>Seafood</option><option>Vegetables</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity & Unit</label>
              <div className="flex"><input type="number" className="border rounded-l-lg p-2.5 w-full"/><select className="border-y border-r rounded-r-lg bg-gray-50 p-2.5"><option>kg</option><option>packs</option><option>pcs</option></select></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch/Lot Number</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
              <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-white">
                <option>Refrigerator 1</option><option>Refrigerator 2</option><option>Freezer 1</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-2.5" rows={3}></textarea>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" className="px-6 py-2.5 border rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
            <button type="button" onClick={() => setActiveTab('inventory')} className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm">Save Food</button>
          </div>
        </form>
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500">Configure ShelfSense parameters and AI thresholds.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-2 bg-gray-100 font-bold text-gray-900 rounded-lg">Expiry Thresholds</button>
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Notifications</button>
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Account Profile</button>
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">System Users</button>
        </div>
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Smart Expiry Config</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Normal Threshold</label>
              <input type="text" disabled value="More than 30 days" className="w-full border border-gray-300 bg-gray-50 rounded p-2 text-sm text-gray-500"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-yellow-700 mb-1">Approaching Expiry (Days)</label>
              <div className="flex items-center space-x-2">
                <input type="number" defaultValue="8" className="border rounded p-2 w-20 text-center"/> <span className="text-gray-500">to</span>
                <input type="number" defaultValue="30" className="border rounded p-2 w-20 text-center"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-red-700 mb-1">Critical Expiry (Days)</label>
              <div className="flex items-center space-x-2">
                <input type="number" defaultValue="1" className="border rounded p-2 w-20 text-center"/> <span className="text-gray-500">to</span>
                <input type="number" defaultValue="7" className="border rounded p-2 w-20 text-center"/>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Save Thresholds</button>
          </div>
        </div>
      </div>
    </div>
  );

  const ReportsTab = () => (
    <div className="max-w-4xl mx-auto space-y-6">
       <div>
        <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
        <p className="text-gray-500">Generate inventory and spoilage reports.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Generate System Report</h3>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select className="w-full border rounded-lg p-2.5">
              <option>Full Inventory Status</option>
              <option>Spoilage / Expired Items</option>
              <option>Consumption History</option>
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select className="w-full border rounded-lg p-2.5">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Generate PDF Report</button>
      </div>
    </div>
  )

  // --- RENDER ---
  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'inventory': return <InventoryTab />;
      case 'recognize': return <RecognizeFoodTab />;
      case 'alerts': return <AlertsTab />;
      case 'storage': return <StorageTab />;
      case 'transactions': return <TransactionsTab />;
      case 'reports': return <ReportsTab />;
      case 'add': return <AddFoodTab />;
      case 'settings': return <SettingsTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-20 shrink-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          {sidebarOpen && (
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0">S</div>
              <span className="font-bold text-xl tracking-tight text-gray-900 shrink-0">ShelfSense</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 shrink-0">
            <Menu size={20}/>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <nav className="px-3 space-y-1">
            <div className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-3 mt-4 ${sidebarOpen ? 'block' : 'hidden'}`}>Main</div>
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'inventory', icon: Package, label: 'Inventory' },
              { id: 'recognize', icon: Camera, label: 'Recognize Food' },
              { id: 'add', icon: Plus, label: 'Add Food' },
            ].map((nav) => (
              <button key={nav.id} onClick={() => setActiveTab(nav.id)} title={nav.label}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === nav.id ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}>
                <nav.icon size={20} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{nav.label}</span>}
              </button>
            ))}

            <div className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-3 mt-6 ${sidebarOpen ? 'block' : 'hidden'}`}>Monitor</div>
            {[
              { id: 'storage', icon: Box, label: 'Storage Locations' },
              { id: 'alerts', icon: AlertTriangle, label: 'Expiry Alerts' },
              { id: 'transactions', icon: History, label: 'Transactions' },
            ].map((nav) => (
              <button key={nav.id} onClick={() => setActiveTab(nav.id)} title={nav.label}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === nav.id ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}>
                <nav.icon size={20} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{nav.label}</span>}
              </button>
            ))}

            <div className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-3 mt-6 ${sidebarOpen ? 'block' : 'hidden'}`}>System</div>
            {[
              { id: 'reports', icon: FileText, label: 'Reports' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map((nav) => (
              <button key={nav.id} onClick={() => setActiveTab(nav.id)} title={nav.label}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === nav.id ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}>
                <nav.icon size={20} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{nav.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 shrink-0">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold shrink-0">AD</div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-gray-900 truncate">Admin User</div>
                <div className="text-xs text-gray-500 truncate">admin@shelfsense.com</div>
              </div>
            </div>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-bold transition-colors">
              <LogOut size={16}/> <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-10">
          <div className="flex items-center text-sm text-gray-500 truncate">
            <span className="hover:text-gray-800 cursor-pointer hidden sm:inline">ShelfSense</span>
            <ChevronRight size={14} className="mx-2 hidden sm:inline"/>
            <span className="font-bold text-gray-800 capitalize truncate">{activeTab.replace('-', ' ')}</span>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search inventory..." className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-green-500 w-48 lg:w-64 bg-gray-50"/>
            </div>
            <div className="relative cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell className="text-gray-500 hover:text-gray-800 transition-colors" size={20}/>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white">
                6
              </span>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="p-3 bg-gray-50 border-b font-bold text-gray-800 flex justify-between items-center">
                    Notifications
                    <span className="text-xs text-blue-600 font-normal hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 border-b hover:bg-gray-50 flex items-start space-x-3">
                      <div className="p-1.5 bg-red-100 text-red-600 rounded-full shrink-0"><AlertTriangle size={14}/></div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">Chicken Breast expires in 2 days</div>
                        <div className="text-xs text-gray-500 mt-0.5">Critical • Refrigerator 1</div>
                      </div>
                    </div>
                    <div className="p-3 border-b hover:bg-gray-50 flex items-start space-x-3">
                      <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded-full shrink-0"><Clock size={14}/></div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">Chorizo expires in 16 days</div>
                        <div className="text-xs text-gray-500 mt-0.5">Approaching • Refrigerator 2</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
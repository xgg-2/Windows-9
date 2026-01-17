import React from 'react';

const SystemInfoApp: React.FC = () => {
  const specs = [
    { label: 'Device Name', value: 'DESKTOP-WIN9PRO' },
    { label: 'Processor', value: 'Intel(R) Core(TM) i9-12900K CPU @ 3.20GHz' },
    { label: 'Installed RAM', value: '32.0 GB (31.8 GB usable)' },
    { label: 'Device ID', value: '4A78D-99F1-4421-B882-9099' },
    { label: 'Product ID', value: '00330-80000-00000-AA451' },
    { label: 'System Type', value: '64-bit operating system, x64-based processor' },
    { label: 'Pen and Touch', value: 'No pen or touch input is available for this display' },
  ];

  const windowsSpecs = [
    { label: 'Edition', value: 'Windows 9 Professional' },
    { label: 'Version', value: '25H2' },
    { label: 'Installed on', value: new Date().toLocaleDateString() },
    { label: 'OS Build', value: '22621.1' },
    { label: 'Experience', value: 'Windows Feature Experience Pack 1000.22632.1000.0' },
  ];

  return (
    <div className="h-full bg-[#f3f3f3] select-text overflow-y-auto p-6 font-sans">
        <div className="flex items-center gap-4 mb-8">
            <i className="fab fa-windows text-5xl text-blue-500"></i>
            <div>
                <h1 className="text-2xl font-light text-gray-800">About</h1>
                <p className="text-gray-500 text-sm">Your PC is monitored and protected.</p>
            </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-6">
             <h2 className="text-sm font-bold text-gray-800 mb-4 flex justify-between items-center">
                 Device specifications
                 <button className="text-blue-600 text-xs font-normal hover:underline bg-gray-50 px-2 py-1 rounded border border-gray-200" onClick={() => navigator.clipboard.writeText('Fake Specs Copied')}>Copy</button>
             </h2>
             <div className="space-y-3">
                 {specs.map((spec, i) => (
                     <div key={i} className="grid grid-cols-3 gap-2 text-xs">
                         <div className="text-gray-500">{spec.label}</div>
                         <div className="col-span-2 text-gray-800 font-medium">{spec.value}</div>
                     </div>
                 ))}
             </div>
             <div className="mt-4 pt-3 border-t border-gray-100 text-xs">
                 <a href="#" className="text-blue-600 hover:underline block mb-1">Rename this PC</a>
             </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-6">
             <h2 className="text-sm font-bold text-gray-800 mb-4 flex justify-between items-center">
                 Windows specifications
                 <button className="text-blue-600 text-xs font-normal hover:underline bg-gray-50 px-2 py-1 rounded border border-gray-200">Copy</button>
             </h2>
             <div className="space-y-3">
                 {windowsSpecs.map((spec, i) => (
                     <div key={i} className="grid grid-cols-3 gap-2 text-xs">
                         <div className="text-gray-500">{spec.label}</div>
                         <div className="col-span-2 text-gray-800 font-medium">{spec.value}</div>
                     </div>
                 ))}
             </div>
             <div className="mt-4 pt-3 border-t border-gray-100 text-xs">
                 <a href="#" className="text-blue-600 hover:underline block mb-1">Change product key or upgrade your edition of Windows</a>
                 <a href="#" className="text-blue-600 hover:underline block mb-1">Read the Microsoft Services Agreement</a>
                 <a href="#" className="text-blue-600 hover:underline block mb-1">Read the Microsoft Software License Terms</a>
             </div>
        </div>

         <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-6">
             <h2 className="text-sm font-bold text-gray-800 mb-2">Support</h2>
             <div className="text-xs space-y-2">
                 <div className="flex justify-between items-center hover:bg-gray-50 p-1 rounded cursor-pointer">
                     <span className="text-gray-700">Manufacturer</span>
                     <span className="text-blue-600">Generic PC Manufacturer</span>
                 </div>
                 <div className="flex justify-between items-center hover:bg-gray-50 p-1 rounded cursor-pointer">
                     <span className="text-gray-700">Online Support</span>
                     <span className="text-blue-600">Website</span>
                 </div>
             </div>
         </div>

         <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-6">
             <h2 className="text-sm font-bold text-gray-800 mb-2">Developer Information</h2>
             <div className="text-xs text-gray-700 font-medium">
                 The intellectual property rights of the developer who developed the system are xgg.2
             </div>
         </div>
    </div>
  );
};

export default SystemInfoApp;
// src/pages/Dashboard/components/StatCard.jsx
export const StatCard = ({ title, value, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
      <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 ${colors[color]} rounded-full opacity-10 blur-xl`}></div>
      <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{title}</p>
      <p className={`text-4xl font-bold mt-2 text-white`}>{value}</p>
    </div>
  );
};
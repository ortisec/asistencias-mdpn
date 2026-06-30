// src/pages/Dashboard/components/Charts.jsx
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TOOLTIP_STYLE = { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', color: '#f3f4f6' };

export const PuntualidadChart = ({ data }) => (
  <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
    <h2 className="text-lg font-bold text-white mb-4">Índice de Puntualidad</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={['#10b981', '#f59e0b', '#ef4444'][i]} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const RegimenChart = ({ data }) => (
  <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
    <h2 className="text-lg font-bold text-white mb-4">Empleados por Régimen</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} />
          <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: '#374151' }} contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);
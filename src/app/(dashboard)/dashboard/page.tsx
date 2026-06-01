'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, categories: 0, stock: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getAll({ limit: 100 }),
      categoryService.getAll({ limit: 100 }),
    ]).then(([prods, cats]) => {
      const totalStock = prods.data.reduce((s, p) => s + p.stock, 0);
      setStats({ products: prods.meta.total, categories: cats.meta.total, stock: totalStock });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Productos', value: stats.products, icon: '📦', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Categorías', value: stats.categories, icon: '🏷️', color: 'bg-green-50 text-green-700' },
    { label: 'Unidades en Stock', value: stats.stock, icon: '📊', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">Bienvenido, <strong>{user?.name}</strong></p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl p-6 h-28 animate-pulse bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map(card => (
            <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl ${card.color} mb-3`}>
                {card.icon}
              </div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm text-gray-500 mt-1">{card.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

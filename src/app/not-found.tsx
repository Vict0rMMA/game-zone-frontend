import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-indigo-600">404</h1>
      <h2 className="text-2xl font-semibold">Página no encontrada</h2>
      <p className="text-gray-500">La página que buscas no existe.</p>
      <Link href="/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
        Ir al inicio
      </Link>
    </div>
  );
}

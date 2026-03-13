export default function PlaceholderView({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-dashed border-gray-200">
      <h2 className="text-xl font-bold text-gray-400">{title}</h2>
      <p className="text-gray-400 text-sm mt-2 italic">Sección en desarrollo...</p>
    </div>
  );
}
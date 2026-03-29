export default function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-500">{title}</h3>
        <span className="text-xl">{icon}</span>
      </div>

      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
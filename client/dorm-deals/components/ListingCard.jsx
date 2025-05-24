export default function ListingCard({ title, price, condition, university, imageUrl }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-4 w-full">
      <img
        src={imageUrl}
        alt={title}
        className="h-40 w-full object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-blue-600 font-bold">{price} BDT</p>
      <p className="text-sm text-gray-600">Condition: {condition}</p>
      <p className="text-sm text-gray-500">📍 {university}</p>
    </div>
  );
}

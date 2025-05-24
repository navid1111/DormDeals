import ListingCard from "@/components/ListingCard";

export default function ListingsPage() {
  const mockListings = [
    {
      title: "MacBook Pro 13”",
      price: "85000",
      condition: "Like New",
      university: "IUT",
      imageUrl: "https://www.apple.com/newsroom/images/product/mac/standard/Apple_new-macbookpro-wallpaper-screen_11102020_big.jpg.large_2x.jpg",
    },
    {
      title: "Bicycle for Campus",
      price: "9000",
      condition: "Good",
      university: "DU",
      imageUrl: "https://cdn.bikedekho.com/processedimages/lectro-electric/h7/source/h767ab08cfa2e29.jpg?imwidth=400&impolicy=resize",
    },
    {
      title: "Headphones",
      price: "1200",
      condition: "Fair",
      university: "NSU",
      imageUrl: "https://images.philips.com/is/image/philipsconsumer/491e2dd5e0d1466f8ee5b0cd010451ae?wid=1400&hei=1400&$pnglarge$",
    },
    {
      title: "Engineering Math Book",
      price: "450",
      condition: "Like New",
      university: "BUET",
      imageUrl: "https://images.theconversation.com/files/45159/original/rptgtpxd-1396254731.jpg?ixlib=rb-4.1.0&q=30&auto=format&w=600&h=400&fit=crop&dpr=2",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">📋 All Listings</h1>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockListings.map((item, index) => (
            <ListingCard key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

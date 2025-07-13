import React from 'react';
import { Search, MapPin, ArrowRight, Plane } from 'lucide-react';

// --- Mock Data ---
// In a real application, you would fetch this data from an API.
const featuredDestinations = [
  {
    id: 1,
    name: 'Santorini',
    country: 'Greece',
    description: 'Iconic blue-domed churches, stunning sunsets, and volcanic beaches.',
    image: 'https://images.unsplash.com/photo-1579552686534-4905d037142b?q=80&w=2574&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Kyoto',
    country: 'Japan',
    description: 'Ancient temples, serene gardens, traditional geishas, and cherry blossoms.',
    image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Bora Bora',
    country: 'French Polynesia',
    description: 'Crystal-clear turquoise lagoons and luxurious overwater bungalows.',
    image: 'https://images.unsplash.com/photo-1506720186575-12454b3f86ff?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Amalfi Coast',
    country: 'Italy',
    description: 'Picturesque cliffside villages, stunning coastal views, and delicious cuisine.',
    image: 'https://images.unsplash.com/photo-1533105079780-52b9be4ac20c?q=80&w=2670&auto=format&fit=crop',
  },
    {
    id: 5,
    name: 'Reykjavik',
    country: 'Iceland',
    description: 'The gateway to glaciers, geysers, and the magical Northern Lights.',
    image: 'https://images.unsplash.com/photo-1500043357865-c6b88278f0a9?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 6,
    name: 'Maui',
    country: 'Hawaii, USA',
    description: 'Lush rainforests, epic waterfalls, and world-famous beaches.',
    image: 'https://images.unsplash.com/photo-1594775498847-9f5038e3a238?q=80&w=2574&auto=format&fit=crop',
  },
];

const travelTips = [
  {
    id: 1,
    title: 'Mastering the Art of Packing Light',
    excerpt: 'Discover how to fit everything you need into a carry-on and avoid baggage fees.',
    image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba73?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'A Guide to Stress-Free Airport Navigation',
    excerpt: 'From security checks to finding your gate, we’ve got you covered.',
    image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Finding the Best Local Cuisine on a Budget',
    excerpt: 'Eat like a local without breaking the bank with these simple tips.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2574&auto=format&fit=crop',
  },
];


// --- Components ---

const DestinationCard = ({ destination }) => (
  <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
    <img src={destination.image} alt={destination.name} className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-6 text-white">
      <h3 className="text-2xl font-bold">{destination.name}</h3>
      <p className="text-sm text-sky-200 flex items-center gap-1"><MapPin size={14} /> {destination.country}</p>
      <p className="mt-2 text-sm opacity-90">{destination.description}</p>
      <button className="mt-4 flex items-center gap-2 text-sm font-semibold text-sky-300 group-hover:text-white transition-colors">
        Explore <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
);

const TipCard = ({ tip }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <img className="h-48 w-full object-cover" src={tip.image} alt={tip.title} />
        <div className="p-6 flex flex-col flex-grow">
            <h4 className="font-bold text-lg text-gray-800">{tip.title}</h4>
            <p className="mt-2 text-gray-600 text-sm flex-grow">{tip.excerpt}</p>
            <a href="#" className="mt-4 text-sky-600 hover:text-sky-800 font-semibold text-sm self-start">
                Read More &rarr;
            </a>
        </div>
    </div>
);


export default function TravelGuide() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredDestinations = featuredDestinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-sky-50 min-h-screen font-sans">
      {/* Hero Section */}
      <header className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2831&auto=format&fit=crop" 
          alt="Plane wing over clouds" 
          className="w-full h-full object-cover"
        />
        <div className="relative z-20 text-center p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Discover Your Next Adventure
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-sky-100">
            Let NimbusFly guide you to the world's most breathtaking destinations.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Destinations Section */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Featured Destinations</h2>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-full focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map(dest => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
          {filteredDestinations.length === 0 && (
            <div className="text-center py-16 col-span-full">
                <p className="text-gray-500">No destinations found. Try a different search!</p>
            </div>
          )}
        </section>

        {/* Travel Tips Section */}
        <section className="mt-20">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">Travel Smarter</h2>
                <p className="mt-2 text-gray-600 max-w-xl mx-auto">
                    Expert advice and tips to make your journey smoother from start to finish.
                </p>
            </div>
            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {travelTips.map(tip => (
                    <TipCard key={tip.id} tip={tip} />
                ))}
            </div>
        </section>
      </main>

      <footer className="bg-white mt-16">
        <div className="container mx-auto px-8 py-6 text-center text-gray-500 text-sm">
            <Plane className="mx-auto mb-2 text-sky-500" />
            <p>&copy; {new Date().getFullYear()} NimbusFly. Your journey begins here.</p>
        </div>
      </footer>
    </div>
  );
}

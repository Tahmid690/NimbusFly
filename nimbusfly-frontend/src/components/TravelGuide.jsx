import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Star, Search, Heart, Clock, Camera, Plane, Sun, Cloud, Thermometer, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';

const TravelGuide = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [favorites, setFavorites] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const destinations = [
        {
            id: 11,
            name: 'Norwegian Fjords, Norway',
            images: [
                '/norway1.jpg',
                'norway2.jpg',
                'norway3.jpg'
            ],
            category: 'nature',
            rating: 4.9,
            duration: '7-10 days',
            price: '$1,800',
            description: 'Experience the dramatic beauty of towering cliffs, cascading waterfalls, and serene waters in Norway\'s magnificent fjords.',
            highlights: ['Geirangerfjord', 'Nærøyfjord', 'Preikestolen (Pulpit Rock)', 'Kjeragbolten', 'Bergen', 'Flåm Railway'],
            bestTime: 'May - September',
            weather: '10°C - 20°C',
            tags: ['Nature', 'Scenic', 'Hiking', 'Cruising', 'Adventure'],
            activities: ['Fjord Cruises', 'Hiking', 'Kayaking', 'Scenic Train Rides', 'Fishing'],
            cuisine: ['Smoked Salmon', 'Reindeer', 'Brown Cheese', 'Aquavit'],
            transportation: ['Ferry', 'Bus', 'Train', 'Car'],
            budget: { low: '$100/day', mid: '$200/day', high: '$400/day' }
        },
        {
            id: 1,
            name: 'Paris, France',
            images: [
                'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&h=600&fit=crop'
            ],
            category: 'culture',
            rating: 4.8,
            
            duration: '5-7 days',
            price: '$1,200',
            description: 'The City of Light offers romance, art, and culinary excellence with world-class museums, charming cafes, and iconic landmarks.',
            highlights: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Champs-Élysées', 'Montmartre', 'Notre-Dame'],
            bestTime: 'April - October',
            weather: '18°C - 25°C',
            tags: ['Romance', 'Culture', 'Art', 'Food', 'History'],
            activities: ['City Walking Tours', 'Seine River Cruises', 'Museum Visits', 'Café Culture', 'Shopping'],
            cuisine: ['French Pastries', 'Wine Tasting', 'Michelin Dining', 'Street Food'],
            transportation: ['Metro', 'Bike Sharing', 'Walking', 'Taxi'],
            budget: { low: '$80/day', mid: '$150/day', high: '$300/day' }
        },
        {
            id: 2,
            name: 'Tokyo, Japan',
            images: [
                'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop'
                
            ],
            category: 'culture',
            rating: 4.9,
            duration: '7-10 days',
            price: '$1,800',
            description: 'Where ancient traditions meet cutting-edge technology in a mesmerizing blend of old and new.',
            highlights: ['Mount Fuji', 'Senso-ji Temple', 'Shibuya Crossing', 'Tokyo Skytree', 'Tsukiji Market', 'Harajuku'],
            bestTime: 'March - May, September - November',
            weather: '15°C - 28°C',
            tags: ['Technology', 'Culture', 'Food', 'Adventure', 'Tradition'],
            activities: ['Temple Visits', 'Sushi Making', 'Karaoke', 'Shopping', 'Cherry Blossom Viewing'],
            cuisine: ['Sushi', 'Ramen', 'Tempura', 'Wagyu Beef'],
            transportation: ['JR Pass', 'Subway', 'Bullet Train', 'Taxi'],
            budget: { low: '$100/day', mid: '$200/day', high: '$400/day' }
        },
        {
            id: 3,
            name: 'Bali, Indonesia',
            images: [
                'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'
            ],
            category: 'beach',
            rating: 4.7,
            duration: '5-8 days',
            price: '$800',
            description: 'Tropical paradise with stunning beaches, rich culture, and spiritual experiences.',
            highlights: ['Uluwatu Temple', 'Rice Terraces', 'Seminyak Beach', 'Ubud Monkey Forest', 'Tanah Lot', 'Kintamani'],
            bestTime: 'April - October',
            weather: '26°C - 32°C',
            tags: ['Beach', 'Relaxation', 'Culture', 'Nature', 'Spirituality'],
            activities: ['Beach Relaxation', 'Yoga Retreats', 'Volcano Hiking', 'Spa Treatments', 'Surfing'],
            cuisine: ['Nasi Goreng', 'Satay', 'Rendang', 'Tropical Fruits'],
            transportation: ['Scooter', 'Private Driver', 'Taxi', 'Walking'],
            budget: { low: '$30/day', mid: '$60/day', high: '$150/day' }
        },
        {
            id: 4,
            name: 'Swiss Alps',
            images: [
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1554906651-d4775c6e1111?w=800&h=600&fit=crop'
            ],
            category: 'adventure',
            rating: 4.6,
            duration: '6-9 days',
            price: '$2,200',
            description: 'Breathtaking mountain landscapes and world-class adventure activities.',
            highlights: ['Matterhorn', 'Jungfraujoch', 'Lake Geneva', 'Glacier Express', 'Zermatt', 'Interlaken'],
            bestTime: 'December - March, June - September',
            weather: '5°C - 20°C',
            tags: ['Adventure', 'Nature', 'Skiing', 'Hiking', 'Scenic'],
            activities: ['Mountain Hiking', 'Skiing', 'Cable Car Rides', 'Lake Cruises', 'Photography'],
            cuisine: ['Fondue', 'Raclette', 'Swiss Chocolate', 'Mountain Cuisine'],
            transportation: ['Swiss Pass', 'Cable Cars', 'Mountain Railways', 'Hiking'],
            budget: { low: '$120/day', mid: '$250/day', high: '$500/day' }
        },
        {
            id: 5,
            name: 'New York City',
            images: [
                'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=800&h=600&fit=crop'
            ],
            category: 'urban',
            rating: 4.5,
            duration: '4-6 days',
            price: '$1,500',
            description: 'The city that never sleeps with endless possibilities and iconic landmarks.',
            highlights: ['Times Square', 'Central Park', 'Statue of Liberty', 'Brooklyn Bridge', 'Empire State', 'High Line'],
            bestTime: 'April - June, September - November',
            weather: '10°C - 26°C',
            tags: ['Urban', 'Culture', 'Shopping', 'Entertainment', 'Architecture'],
            activities: ['Broadway Shows', 'Museum Visits', 'Rooftop Dining', 'Street Art Tours', 'Shopping'],
            cuisine: ['Pizza', 'Bagels', 'Delis', 'Fine Dining'],
            transportation: ['Subway', 'Taxi', 'Uber', 'Walking'],
            budget: { low: '$100/day', mid: '$200/day', high: '$400/day' }
        },
        {
            id: 6,
            name: 'Santorini, Greece',
            images: [
                'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop'
            ],
            category: 'beach',
            rating: 4.8,
            duration: '4-6 days',
            price: '$1,100',
            description: 'Iconic white-washed buildings and stunning sunsets over the Aegean Sea.',
            highlights: ['Oia Village', 'Red Beach', 'Ancient Akrotiri', 'Volcano Tours', 'Fira', 'Wine Tasting'],
            bestTime: 'April - October',
            weather: '20°C - 30°C',
            tags: ['Romance', 'Beach', 'History', 'Photography', 'Sunset'],
            activities: ['Sunset Watching', 'Wine Tours', 'Boat Trips', 'Beach Hopping', 'Photography'],
            cuisine: ['Seafood', 'Greek Salad', 'Moussaka', 'Local Wines'],
            transportation: ['ATV', 'Bus', 'Taxi', 'Walking'],
            budget: { low: '$70/day', mid: '$140/day', high: '$300/day' }
        },
        {
            id: 7,
            name: 'Rome, Italy',
            images: [
                'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1552832230-c0197ce5d86d?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1531572754719-cdc634c034a5?w=800&h=600&fit=crop'
            ],
            category: 'culture',
            rating: 4.7,
            duration: '5-7 days',
            price: '$1,300',
            description: 'The Eternal City, a treasure trove of ancient history, stunning art, and delectable cuisine.',
            highlights: ['Colosseum', 'Roman Forum', 'Vatican City', 'Trevi Fountain', 'Pantheon', 'Spanish Steps'],
            bestTime: 'April - June, September - October',
            weather: '18°C - 28°C',
            tags: ['History', 'Culture', 'Food', 'Art', 'Ancient'],
            activities: ['Historical Site Tours', 'Food Tours', 'Art Gallery Visits', 'Piazza Hopping', 'Gelato Tasting'],
            cuisine: ['Pasta', 'Pizza', 'Gelato', 'Espresso', 'Roman-Jewish Cuisine'],
            transportation: ['Metro', 'Bus', 'Walking', 'Taxi'],
            budget: { low: '$90/day', mid: '$180/day', high: '$350/day' }
        },
        {
            id: 8,
            name: 'Kyoto, Japan',
            images: [
                'https://images.unsplash.com/photo-1550993993-3d0277334751?q=80&w=800&h=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'https://images.unsplash.com/photo-1563456383661-82fe33830c33?q=80&w=800&h=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'https://images.unsplash.com/photo-1557984855-900257008a9f?q=80&w=800&h=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            ],
            category: 'culture',
            rating: 4.9,
            duration: '4-6 days',
            price: '$1,500',
            description: 'The heart of traditional Japan, with ancient temples, beautiful gardens, and geisha districts.',
            highlights: ['Fushimi Inari-taisha', 'Kinkaku-ji', 'Arashiyama Bamboo Grove', 'Gion District', 'Kiyomizu-dera'],
            bestTime: 'March - May, September - November',
            weather: '10°C - 25°C',
            tags: ['Tradition', 'Culture', 'History', 'Nature', 'Serenity'],
            activities: ['Temple Visits', 'Tea Ceremonies', 'Kimono Rentals', 'Garden Strolls', 'Geisha Spotting'],
            cuisine: ['Kaiseki', 'Matcha', 'Tofu Dishes', 'Sake'],
            transportation: ['Bus', 'Subway', 'Walking', 'Taxi'],
            budget: { low: '$80/day', mid: '$160/day', high: '$320/day' }
        },
        {
            id: 9,
            name: 'Machu Picchu, Peru',
            images: [
                'https://images.unsplash.com/photo-1536254477651-7f9a2f71f6c7?q=80&w=800&h=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'https://images.unsplash.com/photo-1572970591079-5e76a6f0d7e6?q=80&w=800&h=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'https://images.unsplash.com/photo-1526466981881-2ac269a8433d?q=80&w=800&h=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            ],
            category: 'adventure',
            rating: 4.9,
            duration: '7-10 days',
            price: '$2,000',
            description: 'An ancient Inca citadel nestled high in the Andes Mountains, offering stunning views and historical mystique.',
            highlights: ['Inca Trail', 'Sun Gate', 'Huayna Picchu', 'Temple of the Sun', 'Llama Encounters'],
            bestTime: 'May - September',
            weather: '10°C - 20°C',
            tags: ['Adventure', 'History', 'Nature', 'Hiking', 'Archaeology'],
            activities: ['Trekking', 'Guided Tours', 'Photography', 'Wildlife Spotting'],
            cuisine: ['Ceviche', 'Lomo Saltado', 'Pisco Sour', 'Quinoa'],
            transportation: ['Train', 'Bus', 'Hiking'],
            budget: { low: '$70/day', mid: '$150/day', high: '$300/day' }
        },
        {
            id: 10,
            name: 'Cairo, Egypt',
            images: [
                'https://images.unsplash.com/photo-1601760561198-d3e5245961d6?q=80&w=800&h=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'https://images.unsplash.com/photo-1594951460517-c4e9081e7d0f?q=80&w=800&h=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'https://images.unsplash.com/photo-1563234907-7d88bc4878a0?q=80&w=800&h=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            ],
            category: 'culture',
            rating: 4.6,
            duration: '5-7 days',
            price: '$1,000',
            description: 'A bustling city where ancient wonders meet modern life, home to the Great Pyramids and vibrant souks.',
            highlights: ['Pyramids of Giza', 'Sphinx', 'Khan el-Khalili', 'Egyptian Museum', 'Nile River'],
            bestTime: 'October - April',
            weather: '15°C - 28°C',
            tags: ['History', 'Culture', 'Ancient', 'Desert', 'Adventure'],
            activities: ['Pyramid Tours', 'Nile Cruises', 'Bazaar Shopping', 'Museum Visits', 'Camel Rides'],
            cuisine: ['Koshary', 'Falafel', 'Shawarma', 'Ful Medames'],
            transportation: ['Taxi', 'Uber', 'Metro', 'Felouka (Nile)'],
            budget: { low: '$50/day', mid: '$100/day', high: '$200/day' }
        }
        
    ];

    const categories = [
        { id: 'all', name: 'All Destinations', icon: '🌍', gradient: 'from-purple-500 to-pink-500' },
        { id: 'culture', name: 'Cultural', icon: '🏛️', gradient: 'from-orange-500 to-red-500' },
        { id: 'beach', name: 'Beach', icon: '🏖️', gradient: 'from-cyan-500 to-blue-500' },
        { id: 'adventure', name: 'Adventure', icon: '🏔️', gradient: 'from-green-500 to-emerald-500' },
        { id: 'urban', name: 'Urban', icon: '🏙️', gradient: 'from-gray-500 to-slate-600' }
    ];

    const filteredDestinations = destinations.filter(dest => {
        const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dest.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || dest.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleFavorite = (id) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(id)) {
            newFavorites.delete(id);
        } else {
            newFavorites.add(id);
        }
        setFavorites(newFavorites);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
    };

    const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const openDestinationModal = (destination) => {
        setSelectedDestination(destination);
        setCurrentImageIndex(0);
    };

    const closeModal = () => {
        setSelectedDestination(null);
    };

    const nextImage = () => {
        if (selectedDestination) {
            setCurrentImageIndex((prev) =>
                prev === selectedDestination.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (selectedDestination) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? selectedDestination.images.length - 1 : prev - 1
            );
        }
    };

    return (
        <div >
            <Navbar page_name={"Travel Guide"}> </Navbar>
            <div
                className="relative min-h-screen bg-cover bg-center bg-fixed "
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80')" }}
                onMouseMove={handleMouseMove}
            >
                {/* Semi-transparent overlay for readability */}
                <div className="absolute inset-0 bg-black/50"></div>

                {/* All content goes into this relative container to sit on top of the background */}
                <div className="relative z-10">
                    {/* Hero Section */}
                    <div className="relative text-white py-24 overflow-hidden ">
                        {/* This SVG pattern adds a subtle texture over the background */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <div className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full backdrop-blur-sm mb-8 transform hover:scale-105 transition-transform duration-300">
                                    <Plane className="w-6 h-6 mr-3 animate-bounce" />
                                    <span className="text-lg font-medium">NimbusFly Travel Guides</span>
                                </div>
                                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
                                    Discover Your Next
                                    <span className="block bg-gradient-to-r from-cyan-400 via-cyan-400 to-cyan-400 bg-clip-text text-transparent">
                                        Adventure
                                    </span>
                                </h1>
                                <p className="text-2xl text-sky-100 max-w-4xl mx-auto mb-12 leading-relaxed">
                                    Immerse yourself in curated travel experiences from around the world.
                                    Find inspiration, explore destinations, and create unforgettable memories.
                                </p>

                                {/* --- Clean Glassmorphic Search Bar --- */}
                                <div className="max-w-3xl mx-auto">

                                    <div className="relative flex items-center w-full bg-black/20 backdrop-blur-lg rounded-full p-2 border border-white/25 shadow-xl">
                                        <Search className="w-6 h-6 text-white/80 ml-4 flex-shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="Search destinations, experiences, or dream locations..."
                                            value={searchQuery}
                                            onChange={handleSearch}
                                            className="flex-1 bg-transparent text-white placeholder-white/70 px-4 py-3 text-lg focus:outline-none"
                                        />

                                        {/*
      The button is now styled to be part of the glass bar, with a hover
      effect that makes it stand out as the primary action.
    */}
                                        <button className="flex-shrink-0 bg-white/90 text-slate-800 px-7 py-3 rounded-full font-bold text-lg hover:bg-white transition-colors duration-300 transform hover:scale-105">
                                            Explore
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Enhanced Destinations Grid */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 ">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl animate-pulse">
                                        <div className="h-80 bg-slate-300"></div>
                                        <div className="p-8">
                                            <div className="h-6 bg-slate-300 rounded-full mb-4"></div>
                                            <div className="h-4 bg-slate-300 rounded-full w-3/4 mb-6"></div>
                                            <div className="h-4 bg-slate-300 rounded-full w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {filteredDestinations.map((destination, index) => (
                                    <div
                                        key={destination.id}
                                        onClick={() => openDestinationModal(destination)}
                                        className="group relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:scale-105 cursor-pointer"
                                        style={{ animationDelay: `${index * 150}ms` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <div className="relative h-80 overflow-hidden">
                                            <img
                                                src={destination.images[0]}
                                                alt={destination.name}
                                                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(destination.id);
                                                }}
                                                className="absolute top-6 right-6 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 transform hover:scale-110 group-hover:rotate-12"
                                            >
                                                <Heart
                                                    className={`w-6 h-6 transition-all duration-300 ${favorites.has(destination.id)
                                                            ? 'fill-red-500 text-red-500 animate-pulse'
                                                            : 'text-white hover:text-red-300'
                                                        }`}
                                                />
                                            </button>

                                            <div className="absolute top-6 left-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                                {destination.price}
                                            </div>

                                            <div className="absolute bottom-6 left-6 flex items-center text-white bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-2" />
                                                <span className="font-bold">{destination.rating}</span>
                                            </div>

                                            <div className="absolute bottom-6 right-6 flex items-center text-white bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                                                <Thermometer className="w-4 h-4 mr-2" />
                                                <span className="text-sm font-medium">{destination.weather}</span>
                                            </div>
                                        </div>

                                        <div className="p-8">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-sky-600 transition-colors duration-300">
                                                    {destination.name}
                                                </h3>
                                                <div className="flex items-center text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span className="text-sm font-medium">{destination.duration}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{destination.description}</p>

                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {destination.tags.slice(0, 4).map((tag, tagIndex) => (
                                                    <span
                                                        key={tagIndex}
                                                        className="px-4 py-2 bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 rounded-full text-sm font-medium hover:from-sky-200 hover:to-blue-200 transition-all duration-300 transform hover:scale-105"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center text-gray-500 mb-6 bg-gray-50 px-4 py-2 rounded-xl">
                                                <Calendar className="w-5 h-5 mr-3 text-sky-500" />
                                                <span className="font-medium">Best time: {destination.bestTime}</span>
                                            </div>

                                            <div className="mb-8">
                                                <h4 className="text-lg font-bold text-gray-900 mb-4">Top Highlights</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {destination.highlights.slice(0, 4).map((highlight, hIndex) => (
                                                        <div key={hIndex} className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg hover:bg-sky-50 transition-colors duration-300">
                                                            <MapPin className="w-4 h-4 mr-2 text-sky-500" />
                                                            <span className="font-medium">{highlight}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <button className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group">
                                                <span className="flex items-center justify-center">
                                                    <Eye className="w-5 h-5 mr-2" />
                                                    View Complete Guide
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {filteredDestinations.length === 0 && !isLoading && (
                            <div className="text-center py-32 bg-white/80 backdrop-blur-sm rounded-3xl">
                                <div className="text-8xl mb-8 animate-bounce">🔍</div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">No destinations found</h3>
                                <p className="text-xl text-gray-600">Try adjusting your search or filters to discover amazing places</p>
                            </div>
                        )}
                    </div>

                    {/* Destination Modal */}
                    {selectedDestination && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center p-4 animate-fadeIn">
                            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[70vh] overflow-y-auto shadow-3xl">
                                <div className="relative">
                                    <button
                                        onClick={closeModal}
                                        className="absolute top-6 right-6 z-10 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                    <div className="relative h-96 overflow-hidden">
                                        <img
                                            src={selectedDestination.images[currentImageIndex]}
                                            alt={selectedDestination.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                        <button
                                            onClick={prevImage}
                                            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                            {selectedDestination.images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="absolute bottom-6 left-6 text-white">
                                            <h2 className="text-4xl font-bold mb-2">{selectedDestination.name}</h2>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center">
                                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                                                    <span className="font-semibold">{selectedDestination.rating}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-5 h-5 mr-1" />
                                                    <span>{selectedDestination.duration}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Thermometer className="w-5 h-5 mr-1" />
                                                    <span>{selectedDestination.weather}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2">
                                                <div className="mb-8">
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">About This Destination</h3>
                                                    <p className="text-lg text-gray-600 leading-relaxed">{selectedDestination.description}</p>
                                                </div>
                                                <div className="mb-8">
                                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Experience Tags</h4>
                                                    <div className="flex flex-wrap gap-3">
                                                        {selectedDestination.tags.map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-4 py-2 bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 rounded-full font-medium hover:from-sky-200 hover:to-blue-200 transition-all duration-300 transform hover:scale-105"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mb-8">
                                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Must-See Highlights</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {selectedDestination.highlights.map((highlight, index) => (
                                                            <div key={index} className="flex items-center p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl hover:from-sky-100 hover:to-blue-100 transition-all duration-300">
                                                                <MapPin className="w-5 h-5 mr-3 text-sky-600" />
                                                                <span className="font-medium text-gray-800">{highlight}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mb-8">
                                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Popular Activities</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {selectedDestination.activities.map((activity, index) => (
                                                            <div key={index} className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl hover:from-emerald-100 hover:to-green-100 transition-all duration-300">
                                                                <Camera className="w-5 h-5 mr-3 text-emerald-600" />
                                                                <span className="font-medium text-gray-800">{activity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mb-8">
                                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Local Cuisine</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {selectedDestination.cuisine.map((food, index) => (
                                                            <div key={index} className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl text-center hover:from-orange-100 hover:to-red-100 transition-all duration-300 transform hover:scale-105">
                                                                <span className="font-medium text-gray-800">{food}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="lg:col-span-1">
                                                <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 mb-6 border border-sky-100">
                                                    <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Info</h4>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Duration</span>
                                                            <span className="font-semibold text-gray-900">{selectedDestination.duration}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Best Time</span>
                                                            <span className="font-semibold text-gray-900">{selectedDestination.bestTime}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Weather</span>
                                                            <span className="font-semibold text-gray-900">{selectedDestination.weather}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">From</span>
                                                            <span className="font-bold text-sky-600 text-lg">{selectedDestination.price}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 mb-6 border border-emerald-100">
                                                    <h4 className="text-lg font-bold text-gray-900 mb-4">Budget Guide</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Budget</span>
                                                            <span className="font-semibold text-emerald-600">{selectedDestination.budget.low}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Mid-Range</span>
                                                            <span className="font-semibold text-yellow-600">{selectedDestination.budget.mid}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Luxury</span>
                                                            <span className="font-semibold text-red-600">{selectedDestination.budget.high}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TravelGuide;
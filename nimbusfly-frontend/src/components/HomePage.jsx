function HomePage() {


    return (
        <div className="min-h-screen bg-gradient-to-tr from-blue-800 via-blue-500 to-blue-200 pl-30 pr-30">
            <header className="p-6">
                <nav className="top-0 w-full z-10 p-6">
                    <div className="flex justify-between items-center">

                        {/* Left - Logo */}
                        <div>
                            <h1 className="font-nunito text-white text-2xl font-bold">
                                NimbusFly
                            </h1>
                        </div>

                        {/* Right - Menu Items */}
                        <div className="flex items-center space-x-8">
                            <a href="#" className="text-white hover:text-blue-200 font-nunito">Home</a>
                            <a href="#" className="text-white hover:text-blue-200 font-nunito">Flights</a>
                            <a href="#" className="text-white hover:text-blue-200 font-nunito">About</a>
                            <a href="#" className="text-white hover:text-blue-200 font-nunito">Contact</a>

                            {/* Login/Register Buttons */}
                            <button className="text-white border border-white px-4 py-2 rounded hover:bg-white hover:text-blue-500 transition-colors">
                                Login
                            </button>
                            <button className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100 transition-colors font-medium">
                                Register
                            </button>
                        </div>

                    </div>
                </nav>
            </header>


            {/* Hero Section */}
            <main className="flex items-center justify-center min-h-screen">
                <div className="text-center text-white">
                    <h2 className="font-inter text-5xl font-bold mb-4">
                        Find Your Perfect Flight
                    </h2>
                    <p className="text-xl mb-8">
                        Search and book flights with ease
                    </p>

                    {/* Flight Search Form will go here */}
                    <div className="bg-gray-100 rounded-2xl shadow-neumorphism p-8">
                        <p className="text-gray-800">Search form coming next...</p>
                    </div>
                </div>
            </main>

        </div>
    )
}

export default HomePage

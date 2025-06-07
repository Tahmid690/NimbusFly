import { useState, useEffect } from 'react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState('Home');

    useEffect(() => {

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'About Us', href: '#about' },
        { name: 'Travel Guide', href: '#guide' },
        { name: 'Contact', href: '#contact' }
    ];

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50'
        : 'bg-transparent shadow-none border-b border-transparent'
}`}>
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center space-x-4 group cursor-pointer">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <img
                                    src="/logo (1).png"
                                    alt="NimbusFly Logo"
                                    className="h-12 w-auto relative z-10 transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-2xl font-nunito font-bold transition-all duration-300 
                                    ${isScrolled ?
                                        'text-transparent bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text  group-hover:from-teal-700 group-hover:via-cyan-700 group-hover:to-blue-700 ':
                                        'text-white '
                                    } `}>
                                    NimbusFly
                                </span>
                                <span className={`${isScrolled ?
                                    'text-xs text-gray-500 font-medium -mt-1':
                                    'text-xs text-gray-200 font-medium -mt-1'
                                }`}
                                >
                                    Fly Beyond Limits
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <a 
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setActiveLink(link.name)}
                                    className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 group ${
                                        activeLink === link.name 
                                            ? (!isScrolled ? 'text-white hover:text-blue-700' : 'text-blue-600') 
                                            : (!isScrolled ? 'text-white hover:text-blue-700' : 'text-gray-700 hover:text-blue-700')
                                    }`}
                                >
                                    {link.name}
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ${
                                        activeLink === link.name ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`}></span>
                                    <div className="absolute inset-0 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                                </a>
                            ))}
                            
                            <div className="flex items-center space-x-3">
                                <button className="relative overflow-hidden px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-blue-300/50" >
                                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                                    <span className="relative flex items-center space-x-2">
                                        <span>Get Started</span>
                                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>

                        
                    </div>
                </div>

               
            </nav>

        </>
    );
}

export default Navbar;
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './Authnication/AuthContext';

const Navbar = ({flg}) => {
    const [isScrolled, setIsScrolled] = useState(flg);
    const [activeLink, setActiveLink] = useState('Home');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled((window.scrollY > 20) || flg);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'About Us', href: '#about' },
        { name: 'Travel Guide', href: '#guide' },
        { name: 'Contact', href: '#contact' }
    ];




    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50'
                : 'bg-transparent shadow-none border-b border-transparent'
                }`}>
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center space-x-4 group cursor-pointer">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <img
                                    src="/lgp.png"
                                    alt="NimbusFly Logo"
                                    className="h-12 w-auto relative z-10 transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-3xl font-nunito font-bold transition-all duration-300 
                                    ${isScrolled ?
                                        'text-blue-700 group-hover:text-blue-800' :
                                        'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-blue-100'
                                    } `}>
                                    NimbusFly
                                </span>
                                <span className={`${isScrolled ?
                                    'text-xs text-blue-600 font-medium -mt-1' :
                                    'text-xs text-blue-100 font-medium -mt-1'
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
                                    className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 group ${activeLink === link.name
                                        ? (!isScrolled ? 'text-white hover:text-blue-700' : 'text-blue-600')
                                        : (!isScrolled ? 'text-white hover:text-blue-700' : 'text-gray-700 hover:text-blue-700')
                                        }`}
                                >
                                    {link.name}
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ${activeLink === link.name ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}></span>
                                    <div className="absolute inset-0 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                                </a>
                            ))}

                            <div className="flex items-center space-x-3">
                                {isAuthenticated ? (
                                    <div className="relative user-menu-container">
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className={`flex items-center space-x-3 px-4 py-2 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ${
                                                isScrolled 
                                                    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white' 
                                                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                                            }`}
                                        >
                                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-bold">
                                                    {user.first_name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            {user?.first_name && <span className="hidden md:block">{user.first_name}</span>}
                                            <svg className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        
                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            setShowUserMenu(false);
                                                            // Navigate to profile page
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span>My Profile</span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowUserMenu(false);
                                                            // Navigate to bookings page
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        <span>My Bookings</span>
                                                    </button>
                                                    <hr className="my-1 border-gray-100" />
                                                    <button
                                                        onClick={() => {
                                                            logout();
                                                            setShowUserMenu(false);
                                                            navigate('/');
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        <span>Sign Out</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link to='/login'>
                                        <button className={`relative overflow-hidden px-8 py-3 font-bold text-sm rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group focus:outline-none ${
                                            isScrolled 
                                                ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white focus:ring-4 focus:ring-blue-300/50' 
                                                : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 focus:ring-4 focus:ring-white/20'
                                        }`}
                                        >
                                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                                            <span className="relative flex items-center space-x-2">
                                                <span>Get Started</span>
                                            </span>
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>


                    </div>
                </div>


            </nav>

        </>
    );
}

export default Navbar;
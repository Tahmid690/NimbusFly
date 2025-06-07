
import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
// import {LoginForm} from "./LoginForm"

const LoginOverlay = ({ overlay, setOverlay }) => {
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setOverlay(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
        >
            <div className="grid grid-cols-2 bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative h-180">

                <button
                    onClick={() => setOverlay(false)}
                    className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                >
                    <X size={20} className="text-gray-600" />
                </button>

                <div
                    className="bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden"
                    style={{
                        backgroundImage: ` url('/sv3.jpg')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <div className="absolute inset-0 flex items-end justify-items-end p-8">
                        <div className="align-text-bottom text-white">
                            <h3 className="text-3xl font-bold mb-4 align-bottom text-shadow-lg" >
                                Welcome Back, Explorer!
                            </h3>
                            <p className="text-lg opacity-90 leading-relaxed ">
                                Let’s get you closer to the skies.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 flex flex-col justify-center">
                    
                </div>

                


            </div>
        </div>
    );
};

export default LoginOverlay;
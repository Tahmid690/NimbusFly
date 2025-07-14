import React from 'react';
import { Plane, Users, Database, Code, Award, BookOpen } from 'lucide-react';
import Navbar from './Navbar';

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Md. Tahmid Hossain",
      id: "2205009",
      role: "Full Stack Developer",
      image: "/api/placeholder/150/150",
      skills: ["React", "Node.js", "PostgreSQL"]
    },
    {
      name: "Khandker Tanvir Hossen",
      id: "2205013",
      role: "Full Stack Developer", 
      image: "/api/placeholder/150/150",
      skills: ["Database Design", "Backend Development", "Frontend"]
    }
  ];

  const techStack = [
    { name: "PostgreSQL", icon: Database, color: "text-blue-600" },
    { name: "React.js", icon: Code, color: "text-sky-500" },
    { name: "Node.js", icon: Code, color: "text-green-600" },
    { name: "TailwindCSS", icon: Code, color: "text-cyan-500" }
  ];

  return (
    <>
    <Navbar page_name={"About Us"}></Navbar>
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-400 to-blue-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-20"></div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-white rounded-full opacity-15"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>
        
        <div className="relative container mx-auto px-6 py-20 mt-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white bg-opacity-20 p-4 rounded-full backdrop-blur-sm">
                {/* <Plane size={48} className="text-white" /> */}
                <img
                                    src="/lgp.png"
                                    alt="NimbusFly Logo"
                                    className="h-12 w-auto relative z-10 transition-transform duration-300 group-hover:scale-105"
                                />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">About NimbusFly</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Your comprehensive airplane ticket management solution, crafted with precision and innovation
            </p>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-sky-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Project Overview</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-sky-100 p-3 rounded-full">
                    <BookOpen className="text-sky-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Course Information</h3>
                    <p className="text-gray-600">Database Sessional (CSE 216)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Supervision</h3>
                    <h1 className="text-gray-600"><big><b>Faria Binte Awal</b></big></h1>
                    <p className="text-gray-600">Adjunct Lecturer</p>
                    <p className="text-gray-600">Computer Science and Engineering</p>
                    <p className="text-gray-600">Bangladesh University of Engineering and Technology</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Award className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Project Type</h3>
                    <p className="text-gray-600">Term Project</p>
                    {/* <p className="text-gray-600"><b>NimbusFly</b></p> */}
                    <p className="text-gray-600">Airplane Ticket Management System</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-3">Mission Statement</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To create an efficient, user-friendly airplane ticket management system that streamlines 
                    the booking process while demonstrating advanced database design principles and modern web development practices.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-sky-100">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Team</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-sky-200 to-blue-300 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Users size={48} className="text-sky-700" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-lg border border-sky-200">
                      <span className="text-sm font-medium text-sky-700">{member.id}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                  
                  
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-sky-100">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Technology Stack</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techStack.map((tech, index) => (
                <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-100 group-hover:shadow-lg">
                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-3 rounded-full shadow-sm">
                        <tech.icon size={32} className={tech.color} />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800">{tech.name}</h3>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3">Why These Technologies?</h3>
                <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  Our technology stack combines the robustness of PostgreSQL for data management, 
                  the flexibility of React.js for interactive user interfaces, the reliability of Node.js 
                  for server-side operations, and the elegance of TailwindCSS for responsive design. 
                  This combination ensures a scalable, maintainable, and user-friendly application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    
      
    </div>
    </>
  );
};

export default AboutUs;
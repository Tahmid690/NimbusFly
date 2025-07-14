import React, { useState } from 'react';
import { 
  Plane, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  User, 
  MessageSquare,
  Github,
  Linkedin,
  Globe,
  Users
} from 'lucide-react';
import Navbar from './Navbar';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log('Form submitted:', formData);
    // You can add your form submission logic here
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "nimbusflyteam@gmail.com",
      description: "Send us an email anytime"
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+880 1234-567890",
      description: "Available during business hours"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "BUET, Dhaka-1205",
      description: "Computer Science & Engineering Department"
    },
    {
      icon: Clock,
      title: "Working Hours",
      content: "9:00 AM - 6:00 PM",
      description: "Sunday to Thursday"
    }
  ];

  const teamContacts = [
    {
      name: "Md. Tahmid Hossain",
      id: "2205009",
      email: "tahmid.hossain@example.com",
      role: "Full Stack Developer",
      github: "https://github.com/tahmid690",
      linkedin: "https://linkedin.com/in/tahmid"
    },
    {
      name: "Khandker Tanvir Hossen",
      id: "2205013", 
      email: "tanvir.hossen@example.com",
      role: "Full Stack Developer",
      github: "https://github.com/tanvirzihad",

      linkedin: "https://linkedin.com/in/tanvir"
    }
  ];

  return (
    <>
    <Navbar page_name={"Contact"}></Navbar>
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-400 to-blue-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-20"></div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-white rounded-full opacity-15"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>
        
        <div className="relative container mx-auto px-6 py-20 mt-15">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white bg-opacity-20 p-4 rounded-full backdrop-blur-sm">
                <Mail size={48} className="text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Have questions about NimbusFly? We'd love to hear from you. Get in touch with our team!
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl p-6 border border-sky-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="text-center">
                <div className="bg-gradient-to-br from-sky-100 to-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <info.icon className="text-sky-600" size={28} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{info.title}</h3>
                <p className="text-sky-600 font-semibold mb-2">{info.content}</p>
                <p className="text-gray-600 text-sm">{info.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-sky-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Send us a Message</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-600 rounded-full"></div>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                      placeholder="What's this about?"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                    required
                  ></textarea>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Send size={20} />
                  <span>Send Message</span>
                </button>
              </div>
            </div>

            {/* Team Contact Info */}
            <div className="space-y-8">
              {/* Project Info */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-sky-100">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Project Information</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-600 rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-sky-100 p-2 rounded-full">
                      <Globe className="text-sky-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Project</p>
                      <p className="text-gray-600">NimbusFly - Airplane Ticket Management</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Course</p>
                      <p className="text-gray-600">Database Sessional (CSE 216)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <MapPin className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Institution</p>
                      <p className="text-gray-600">Bangladesh University of Engineering and Technology</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-sky-100">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Meet the Team</h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-sky-400 to-blue-600 rounded-full"></div>
                </div>
                
                <div className="space-y-6">
                  {teamContacts.map((member, index) => (
                    <div key={index} className="border-l-4 border-sky-400 pl-6 py-4 bg-gradient-to-r from-sky-50 to-transparent rounded-r-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg">{member.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">ID: {member.id}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail size={16} />
                            <span>{member.email}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <a href={member.github} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <Github size={18} className="text-gray-600" />
                          </a>
                          <a href={member.linkedin} className="bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition-colors">
                            <Linkedin size={18} className="text-blue-600" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
    </>

  );
};

export default ContactUs;
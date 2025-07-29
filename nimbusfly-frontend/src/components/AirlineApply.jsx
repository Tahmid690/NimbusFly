import React, { useState } from 'react';
import { 
  Plane, 
  Mail, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  FileImage,
  Send,
  Building,
  Shield,
  Clock,
  Users,
  Globe,
  FileText
} from 'lucide-react';
import Navbar from './Navbar';
import { useToast } from './AdminDashboard/components/UI/Toast';

const AirlineApply = () => {
  const [selectedStep, setSelectedStep] = useState(null);
  const  toast  = useToast();

  const applicationSteps = [
    {
      id: 1,
      title: "Prepare Your Documents",
      icon: FileText,
      description: "Gather all required documents and information before starting your application.",
      details: [
        "Official airline logo in PNG format",
        "Company registration documents",
        "Airline license certificate",
        "Contact information and business details"
      ]
    },
    {
      id: 2,
      title: "Compose Application Email",
      icon: Mail,
      description: "Send your application to our official email with all required information.",
      details: [
        "Subject: Airline Application - [Your Airline Name]",
        "Include airline name in the email body",
        "Attach your airline logo (PNG format)",
        "Provide company contact details"
      ]
    },
    {
      id: 3,
      title: "Wait for Review",
      icon: Clock,
      description: "Our team will review your application and respond within 3-5 business days.",
      details: [
        "Application review process: 3-5 business days",
        "Email confirmation upon receipt",
        "Additional documents may be requested",
        "Final approval notification via email"
      ]
    }
  ];

  const requirements = [
    {
      icon: Building,
      title: "Registered Airline Company",
      description: "Must be a legally registered airline company with valid operating licenses"
    },
    {
      icon: Shield,
      title: "Valid Certifications",
      description: "Hold all necessary aviation certifications and safety compliance documents"
    },
    {
      icon: Globe,
      title: "Operational Routes",
      description: "Have established flight routes and operational aircraft fleet"
    },
    {
      icon: Users,
      title: "Customer Service",
      description: "Maintain dedicated customer service and support infrastructure"
    }
  ];

  const emailTemplate = `Subject: Airline Application - [Your Airline Name]

Dear NimbusFly Team,

We would like to apply for airline partnership with NimbusFly.

Airline Details:
- Airline Name: [Your Airline Name]
- Company Registration Number: [Registration Number]
- Contact Person: [Name]
- Phone: [Phone Number]
- Email: [Contact Email]
- Website: [Website URL]
- Operational Routes: [Brief Description]

Please find our airline logo attached as a PNG file.

We look forward to hearing from you.

Best regards,
[Your Name]
[Your Title]
[Your Airline Name]`;

  const copyToClipboard = () => {
    toast.success('Email template copied to clipboard!',1000);
    navigator.clipboard.writeText(emailTemplate);
    // alert('Email template copied to clipboard!');
    
  };

  return (
    <>
      
      <Navbar page_name={"Airline Application"} />
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
                <Plane size={48} className="text-white" />
              </div>
              <h1 className="text-5xl font-bold mb-4">Airline Application</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Join NimbusFly's network of trusted airline partners. Follow our simple application process to get started.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-16">
          {/* Application Process Steps */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Application Process</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-600 mx-auto rounded-full"></div>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Follow these simple steps to apply for airline partnership with NimbusFly
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {applicationSteps.map((step, index) => (
                <div key={step.id} className="relative">
                  {/* Connection Line */}
                  {index < applicationSteps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-sky-300 to-blue-300 z-0"></div>
                  )}
                  
                  <div 
                    className="bg-white rounded-2xl shadow-xl p-6 border border-sky-100 hover:shadow-2xl transition-all duration-300 cursor-pointer relative z-10"
                    onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                  >
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-sky-100 to-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <step.icon className="text-sky-600" size={28} />
                      </div>
                      <div className="bg-sky-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                        {step.id}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-3">{step.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                      
                      {selectedStep === step.id && (
                        <div className="mt-4 p-4 bg-sky-50 rounded-lg">
                          <ul className="text-left text-sm text-gray-600 space-y-2">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <CheckCircle size={16} className="text-sky-600 mt-0.5 flex-shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Requirements */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-sky-100">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Application Requirements</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {requirements.map((req, index) => (
                  <div key={index} className="text-center p-6 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100">
                    <div className="bg-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
                      <req.icon className="text-sky-600" size={28} />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{req.title}</h3>
                    <p className="text-gray-600 text-sm">{req.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Email Instructions */}
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Email Template */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-sky-100">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Template</h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-sky-400 to-blue-600 rounded-full"></div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{emailTemplate}</pre>
                </div>

                <button
                  onClick={copyToClipboard}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <FileText size={20} />
                  <span>Copy Email Template</span>
                </button>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                {/* Email Instructions */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-sky-100">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Email</h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-sky-400 to-blue-600 rounded-full"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-sky-50 rounded-lg">
                      <div className="bg-sky-100 p-2 rounded-full">
                        <Mail className="text-sky-600" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Send your application to:</p>
                        <p className="text-sky-600 font-mono text-lg">nimbusfly7688@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <AlertCircle className="text-yellow-600 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-gray-800 mb-2">Important Notes:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Include your airline name in the subject line</li>
                          <li>• Attach logo in PNG format only</li>
                          <li>• Provide complete contact information</li>
                          <li>• Allow 3-5 business days for review</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo Requirements */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-sky-100">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Logo Requirements</h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-sky-400 to-blue-600 rounded-full"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <FileImage className="text-sky-600" size={24} />
                      <div>
                        <p className="font-semibold text-gray-800">Format: PNG only</p>
                        <p className="text-gray-600 text-sm">High-quality PNG format required</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-600" size={24} />
                      <div>
                        <p className="font-semibold text-gray-800">Size: Minimum 200x200px</p>
                        <p className="text-gray-600 text-sm">Ensure logo is clear and readable</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Upload className="text-blue-600" size={24} />
                      <div>
                        <p className="font-semibold text-gray-800">Max file size: 5MB</p>
                        <p className="text-gray-600 text-sm">Compressed files preferred</p>
                      </div>
                    </div>
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

export default AirlineApply;
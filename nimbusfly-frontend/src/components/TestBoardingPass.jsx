import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

const TestBoardingPass = () => {
  const boardingPassRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Generate QR code on component mount
  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = 'TEST-BOOKING-NF123456';
        const qrUrl = await QRCode.toDataURL(qrData, {
          width: 80,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('QR code error:', error);
      }
    };
    generateQR();
  }, []);

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = boardingPassRef.current;
      
      if (!element) {
        throw new Error('Element not found');
      }

      console.log('Starting PDF generation...');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        foreignObjectRendering: false,
        ignoreElements: (element) => {
          // Skip elements that might cause issues
          return element.classList && element.classList.contains('skip-pdf');
        }
      });
      
      console.log('Canvas created:', canvas.width, 'x', canvas.height);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('test-boarding-pass.pdf');
      
      console.log('PDF saved successfully!');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating boarding pass: ' + error.message + '. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Test Boarding Pass Generation</h1>
        
        <button
          onClick={downloadPDF}
          disabled={isDownloading}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isDownloading ? 'Generating PDF...' : 'Download Test PDF'}
        </button>

        {/* Test Boarding Pass */}
        <div 
          ref={boardingPassRef} 
          style={{
            width: '800px',
            height: '600px',
            backgroundColor: 'white',
            padding: '32px',
            margin: '0 auto',
            border: '1px solid #e5e7eb',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            border: '2px dashed #d1d5db',
            padding: '24px'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#2563eb',
                  margin: '0'
                }}>NimbusFly</h2>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>Boarding Pass</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0'
                }}>Booking Reference</p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: '4px 0 0 0'
                }}>NF123456</p>
              </div>
            </div>

            {/* Passenger Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0'
                }}>Passenger Name</p>
                <p style={{
                  fontWeight: 'bold',
                  fontSize: '18px',
                  margin: '0'
                }}>John Doe</p>
              </div>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0'
                }}>Flight</p>
                <p style={{
                  fontWeight: 'bold',
                  fontSize: '18px',
                  margin: '0'
                }}>NF001</p>
              </div>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0'
                }}>Date</p>
                <p style={{
                  fontWeight: 'bold',
                  fontSize: '18px',
                  margin: '0'
                }}>{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Route */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0'
                }}>From</p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  margin: '0'
                }}>DAC</p>
                <p style={{
                  fontSize: '14px',
                  margin: '4px 0 0 0'
                }}>10:30 AM</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '1px',
                  backgroundColor: '#d1d5db'
                }}></div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '8px 0 0 0'
                }}>✈️</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0'
                }}>To</p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  margin: '0'
                }}>CTG</p>
                <p style={{
                  fontSize: '14px',
                  margin: '4px 0 0 0'
                }}>2:15 PM</p>
              </div>
            </div>

            {/* Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0'
                }}>Seat</p>
                <p style={{
                  fontWeight: 'bold',
                  margin: '0'
                }}>A12</p>
              </div>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0'
                }}>Gate</p>
                <p style={{
                  fontWeight: 'bold',
                  margin: '0'
                }}>B7</p>
              </div>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0'
                }}>Class</p>
                <p style={{
                  fontWeight: 'bold',
                  margin: '0'
                }}>Economy</p>
              </div>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0'
                }}>Terminal</p>
                <p style={{
                  fontWeight: 'bold',
                  margin: '0'
                }}>T1</p>
              </div>
            </div>

            {/* QR Code and Barcode */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}>
              <div>
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" style={{
                    width: '80px',
                    height: '80px'
                  }} />
                ) : (
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '12px' }}>QR</span>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '8px'
                }}>
                  {Array.from({length: 15}).map((_, i) => (
                    <div 
                      key={i} 
                      style={{
                        width: '4px',
                        backgroundColor: 'black',
                        height: `${15 + (i % 3) * 5}px`
                      }}
                    ></div>
                  ))}
                </div>
                <p style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  margin: '0'
                }}>NF123ABC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBoardingPass;

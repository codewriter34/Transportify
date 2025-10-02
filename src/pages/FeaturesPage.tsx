import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import hero1 from '../assets/hero1.png';

const FeaturesPage = () => {
  const features = [
    {
      icon: "📍",
      title: "Real-Time Tracking",
      description: "Monitor your shipments in real-time with live GPS updates and detailed location information.",
      details: [
        "Live GPS coordinates updated every 30 seconds",
        "Historical route tracking and playback",
        "Geofencing alerts for delivery zones",
        "ETA predictions with 95% accuracy",
        "Multi-language support for global operations"
      ],
      image: "/src/assets/containers.jpg",
      benefits: ["Reduce customer inquiries", "Improve delivery transparency", "Optimize route planning"]
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Get insights into your shipping patterns with comprehensive analytics and reporting tools.",
      details: [
        "Custom dashboard with key performance indicators",
        "Delivery performance metrics and trends",
        "Cost analysis and optimization suggestions",
        "Customer satisfaction tracking",
        "Automated report generation"
      ],
      image: "/src/assets/hero2.jpg",
      benefits: ["Data-driven decisions", "Cost reduction", "Performance optimization"]
    },
    {
      icon: "🔔",
      title: "Smart Notifications",
      description: "Receive instant alerts for delivery updates, delays, and important status changes.",
      details: [
        "Multi-channel notifications (SMS, Email, Push)",
        "Customizable alert preferences",
        "Automated delay notifications",
        "Delivery confirmation alerts",
        "Exception handling notifications"
      ],
      image: "/src/assets/hero3.jpg",
      benefits: ["Proactive communication", "Reduced support calls", "Better customer experience"]
    },
    {
      icon: "🌐",
      title: "Global Coverage",
      description: "Track shipments worldwide with our extensive network of carriers and logistics partners.",
      details: [
        "150+ countries and territories covered",
        "Integration with major shipping carriers",
        "Local delivery partner network",
        "Customs clearance tracking",
        "Multi-currency support"
      ],
      image: "/src/assets/hero4.webp",
      benefits: ["Global reach", "Seamless international shipping", "Local expertise"]
    },
    {
      icon: "📱",
      title: "Mobile App",
      description: "Access all features on-the-go with our intuitive mobile application for iOS and Android.",
      details: [
        "Native iOS and Android applications",
        "Offline tracking capabilities",
        "Barcode and QR code scanning",
        "Photo capture for proof of delivery",
        "Push notifications and alerts"
      ],
      image: "/src/assets/hero1.png",
      benefits: ["Always accessible", "Field team efficiency", "Real-time updates"]
    },
    {
      icon: "🔒",
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security and end-to-end encryption.",
      details: [
        "SOC 2 Type II certified infrastructure",
        "End-to-end encryption for all data",
        "Multi-factor authentication",
        "Role-based access control",
        "Audit trails and compliance reporting"
      ],
      image: "/src/assets/containers.jpg",
      benefits: ["Data protection", "Regulatory compliance", "Trust and reliability"]
    }
  ];

  const stats = [
    { number: "50M+", label: "Packages Tracked", icon: "📦" },
    { number: "150+", label: "Countries Covered", icon: "🌍" },
    { number: "99.9%", label: "Uptime Guarantee", icon: "⚡" },
    { number: "24/7", label: "Support Available", icon: "🛟" }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-16 relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={hero1}
            alt="Logistics and transportation"
            className="w-full h-full object-cover"
          />
          {/* Linear gradient overlay for text readability */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)'
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Powerful Features for
            <span className="block text-lime-400">Modern Logistics</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-100 max-w-3xl mx-auto mb-8">
            Discover the comprehensive suite of tools that make Transportify the leading choice for logistics tracking and management.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive Feature Set
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your logistics operations efficiently and effectively.
            </p>
          </div>

          <div className="space-y-20">
            {features.map((feature, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}>
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="text-6xl mb-6">{feature.icon}</div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start">
                          <span className="text-lime-500 mr-2">✓</span>
                          <span className="text-gray-600">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Benefits:</h4>
                    <div className="flex flex-wrap gap-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <span
                          key={benefitIndex}
                          className="bg-lime-100 text-lime-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className="relative">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-64 lg:h-80 object-cover rounded-2xl shadow-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Logistics?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of businesses already using Transportify to streamline their shipping operations and improve customer satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;

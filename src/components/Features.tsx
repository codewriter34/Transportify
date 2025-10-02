const Features = () => {
  const features = [
    {
      icon: "📍",
      title: "Real-Time Tracking",
      description: "Monitor your shipments in real-time with live GPS updates and detailed location information."
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Get insights into your shipping patterns with comprehensive analytics and reporting tools."
    },
    {
      icon: "🔔",
      title: "Smart Notifications",
      description: "Receive instant alerts for delivery updates, delays, and important status changes."
    },
    {
      icon: "🌐",
      title: "Global Coverage",
      description: "Track shipments worldwide with our extensive network of carriers and logistics partners."
    },
    {
      icon: "📱",
      title: "Mobile App",
      description: "Access all features on-the-go with our intuitive mobile application for iOS and Android."
    },
    {
      icon: "🔒",
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security and end-to-end encryption."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Transportify?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the powerful features that make us the leading choice for logistics tracking and management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="text-4xl mb-6 text-blue-600 group-hover:text-lime-500 group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400 opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-lime-400 opacity-10 rounded-full transform -translate-x-12 translate-y-12"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="animate-fade-in-up">
              <div className="flex flex-col md:flex-row items-center justify-center mb-4">
                <div className="text-6xl mb-4 md:mb-0 md:mr-4">📦</div>
                <div>
                  <div className="text-4xl lg:text-5xl font-bold mb-2">50M+</div>
                  <div className="text-blue-100">Packages Tracked</div>
                </div>
              </div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col md:flex-row items-center justify-center mb-4">
                <div className="text-6xl mb-4 md:mb-0 md:mr-4">🌍</div>
                <div>
                  <div className="text-4xl lg:text-5xl font-bold mb-2">150+</div>
                  <div className="text-blue-100">Countries Covered</div>
                </div>
              </div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col md:flex-row items-center justify-center mb-4">
                <div className="text-6xl mb-4 md:mb-0 md:mr-4">⚡</div>
                <div>
                  <div className="text-4xl lg:text-5xl font-bold mb-2">99.9%</div>
                  <div className="text-blue-100">Uptime Guarantee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

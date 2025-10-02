const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="animate-fade-in-left">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Revolutionizing Logistics
              <span className="block text-blue-600">Since 2020</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Transportify was born from a simple vision: to make logistics tracking 
              as transparent and reliable as checking the weather. We believe that 
              every package, every delivery, and every customer deserves real-time 
              visibility and peace of mind.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our platform combines cutting-edge technology with deep industry expertise 
              to provide comprehensive tracking solutions that scale from small businesses 
              to enterprise operations. We're not just tracking packages – we're building 
              the future of supply chain visibility.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Enterprise Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Support Available</div>
              </div>
            </div>

            <button className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Learn More About Us
            </button>
          </div>

          {/* Image */}
          <div className="animate-fade-in-right">
            <div className="relative">
              <div className="aspect-w-16 aspect-h-12 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  alt="Transportify team working on logistics"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6 animate-float">
                <div className="flex items-center space-x-4">
                  <div className="bg-lime-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">99.9% Accuracy</div>
                    <div className="text-sm text-gray-600">Tracking Precision</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-6 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Real-Time</div>
                    <div className="text-sm text-gray-600">Live Updates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  const coreValues = [
    {
      icon: "🚚",
      stat: "99%",
      description: "On-time Deliveries",
      color: "text-blue-600"
    },
    {
      icon: "📦",
      stat: "10,000+",
      description: "Shipments Tracked",
      color: "text-blue-500"
    },
    {
      icon: "🌍",
      stat: "150+",
      description: "Countries Served",
      color: "text-lime-500"
    },
    {
      icon: "⭐",
      stat: "4.9/5",
      description: "Customer Rating",
      color: "text-blue-600"
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Main About Section */}
      <section className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Side - Text Content */}
            <motion.div 
              className="order-2 lg:order-1"
              initial="initial"
              animate="animate"
              variants={staggerChildren}
            >
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1E3A8A] mb-6"
                variants={fadeInUp}
              >
                About Us
              </motion.h1>
              
              <motion.p 
                className="text-xl text-[#3B82F6] font-medium mb-8"
                variants={fadeInUp}
              >
                Delivering Excellence in Logistics Since 2020
              </motion.p>
              
              <motion.div 
                className="space-y-6 text-[#374151] text-lg leading-relaxed"
                variants={fadeInLeft}
              >
                <p>
                  Transportify is a leading logistics technology company that revolutionizes how businesses track and manage their shipments worldwide. Founded in 2020, we have built a comprehensive platform that provides real-time visibility into supply chain operations.
                </p>
                
                <p>
                  Our mission is to make logistics tracking as transparent and reliable as checking the weather. We believe that every package, every delivery, and every customer deserves real-time visibility and peace of mind throughout their shipping journey.
                </p>
                
                <p>
                  With cutting-edge technology and deep industry expertise, we provide comprehensive tracking solutions that scale from small businesses to enterprise operations. We're not just tracking packages – we're building the future of supply chain visibility.
                </p>
                
                <p>
                  Our values center around reliability, innovation, and customer satisfaction. We continuously invest in advanced technologies to ensure our clients can trust us with their most critical shipments, no matter where they're going in the world.
                </p>
              </motion.div>
              
              <motion.div 
                className="mt-10"
                variants={fadeInUp}
              >
                <button className="bg-[#84CC16] hover:bg-[#73B106] text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Track Your Shipment
                </button>
              </motion.div>
            </motion.div>

            {/* Right Side - Image */}
            <motion.div 
              className="order-1 lg:order-2"
              variants={fadeInRight}
              initial="initial"
              animate="animate"
            >
              <div className="relative">
                <img
                  src="/src/assets/hero2.jpg"
                  alt="Transportify team and logistics operations"
                  className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                
                {/* Floating Stats Card */}
                <motion.div 
                  className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#84CC16]/10 p-3 rounded-full">
                      <svg className="w-6 h-6 text-[#84CC16]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-[#1E3A8A]">Trusted by 500+ Companies</div>
                      <div className="text-sm text-[#374151]">Enterprise Solutions</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values/Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1E3A8A] mb-4">
              Our Track Record
            </h2>
            <p className="text-lg text-[#374151] max-w-2xl mx-auto">
              Numbers that speak to our commitment to excellence and reliability
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <motion.div 
                key={index}
                className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <div className={`text-3xl lg:text-4xl font-bold ${value.color} mb-2`}>
                  {value.stat}
                </div>
                <div className="text-[#374151] font-medium">{value.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-[#1E3A8A] mb-6">
                Our Mission & Vision
              </h3>
              <div className="space-y-4 text-[#374151] text-lg leading-relaxed">
                <p>
                  <strong className="text-[#1E3A8A]">Mission:</strong> To revolutionize logistics tracking by providing transparent, real-time visibility into every shipment, empowering businesses to deliver exceptional customer experiences.
                </p>
                <p>
                  <strong className="text-[#1E3A8A]">Vision:</strong> To become the global standard for supply chain visibility, making logistics tracking as intuitive and reliable as everyday digital services.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-2xl p-8 text-white">
                <div className="text-6xl mb-4">🎯</div>
                <h4 className="text-xl font-semibold mb-2">Excellence in Every Delivery</h4>
                <p className="text-blue-100">
                  Committed to providing the most reliable and innovative logistics tracking solutions in the industry.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

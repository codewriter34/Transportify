import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Journey from '../components/Journey';
import About from '../components/About';
import Faq from '../components/Faq';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Journey />
      <About />
      <Faq />
      <Contact />
      <Footer />
    </div>
  );
};

export default HomePage;

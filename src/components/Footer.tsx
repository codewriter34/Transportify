import { Link } from 'react-router-dom';
import logo from '../assets/transportify-logo.png';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <img src={logo} alt="Transportify" className="h-8 w-auto" />
          <p className="mt-4 max-w-xs text-slate-300">
            A tracking page for every shipment, with status, route, and email updates.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-lime-300">Explore</h2>
          <ul className="mt-4 space-y-2 text-slate-300">
            <li><Link to="/track" className="hover:text-white">Track a shipment</Link></li>
            <li><Link to="/features" className="hover:text-white">Features</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-lime-300">Office</h2>
          <p className="mt-4 text-slate-300">1234 Mountain View Drive</p>
          <p className="text-slate-300">Henderson, CO 80640</p>
          <p className="mt-3 text-slate-400">Monday–Friday, 9:00 AM – 6:00 PM</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">© 2026 Transportify</p>
      </div>
    </footer>
  );
};

export default Footer;

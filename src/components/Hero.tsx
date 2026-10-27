import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import heroImage from '../assets/hero1.png';

const sampleSteps = ['Picked up', 'In transit', 'Out for delivery'];

const Hero = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [trackingID, setTrackingID] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const id = trackingID.trim();
    if (!id) return;
    navigate(`/track?id=${encodeURIComponent(id)}`);
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <img src={heroImage} alt="" className="hero-photo absolute inset-0 h-full w-full object-cover object-[72%_center]" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/55 to-slate-950/25" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div>
          <motion.p
            className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-lime-300"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            Shipment tracking for your customers
          </motion.p>
          <motion.h1
            className="max-w-xl text-4xl font-bold leading-tight text-white sm:text-6xl"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            A clear page for every shipment
          </motion.h1>
          <motion.p
            className="mt-5 max-w-xl text-lg text-slate-200"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
          >
            Customers enter a tracking number and see status, route, and history. Your team keeps the record current, and status emails open that same page.
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl bg-white p-4 shadow-2xl sm:p-5"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
          >
            <label htmlFor="home-tracking" className="mb-2 block text-sm font-medium text-slate-700">
              Tracking number
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="home-tracking"
                value={trackingID}
                onChange={(event) => setTrackingID(event.target.value)}
                placeholder="Enter your tracking number"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
              <button
                type="submit"
                disabled={!trackingID.trim()}
                className="rounded-lg bg-lime-500 px-6 py-3 font-semibold text-slate-950 hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Track
              </button>
            </div>
          </motion.form>

          <motion.div
            className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span>Status and delivery date</span>
            <span>Map when coordinates are saved</span>
            <span>Shareable tracking link</span>
            <Link to="/features" className="text-lime-300 underline underline-offset-4 hover:text-lime-200">
              See the full tracking page
            </Link>
          </motion.div>
        </div>

        <motion.aside
          className="hidden rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-md lg:block"
          initial={reduce ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">Example</p>
          <h2 className="mt-2 text-2xl font-semibold">How a lookup feels</h2>
          <p className="mt-2 text-sm text-slate-200">A sample journey. Live results come from the tracking number you enter.</p>
          <ol className="mt-6 space-y-4">
            {sampleSteps.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${index === 1 ? 'bg-lime-400' : 'bg-white/50'}`} />
                <span className={index === 1 ? 'font-semibold' : 'text-slate-300'}>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 rounded-2xl bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Current example status</p>
            <p className="mt-1 text-lg font-semibold">In transit · Fort Collins</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="hero-progress h-full w-2/3 rounded-full bg-lime-400" />
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
};

export default Hero;

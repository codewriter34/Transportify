import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import aboutImage from '../assets/hero2.jpg';
import warehouse from '../assets/hero4.webp';

const points = [
  'A public page for each tracking number',
  'Status, route, map, and update history',
  'Email links that open the same shipment',
  'Sender and receiver names, without their contact details',
];

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-slate-950 px-4 pb-16 pt-32 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-300">About</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Tracking that stays easy to explain</h1>
          <p className="mt-5 text-lg text-slate-300">
            Transportify is a customer tracking site based in Henderson, Colorado. People waiting on a delivery get one page, and the team handling the shipment keeps that page current.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <img src={aboutImage} alt="Freight containers at a logistics yard" className="h-80 w-full rounded-3xl object-cover shadow-xl lg:h-[460px]" />
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="text-3xl font-bold text-slate-900">What customers receive</h2>
          <ul className="mt-6 space-y-3 text-lg text-slate-700">
            {points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-lime-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <Link to="/track" className="mt-8 inline-block rounded-lg bg-lime-500 px-6 py-3 font-semibold text-slate-950 hover:bg-lime-400">
            Track a shipment
          </Link>
        </Reveal>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <h2 className="text-3xl font-bold text-slate-900">A record your team controls</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              The page does not invent a location. It shows the origin, destination, current place, and notes that were saved for that shipment. When those details change, the next visit and the next email show the new status.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Office: 1234 Mountain View Drive, Henderson, CO 80640. Weekday hours are 9:00 AM to 6:00 PM.
            </p>
            <Link to="/contact" className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800">
              Contact the office
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <img src={warehouse} alt="Warehouse aisle" className="h-80 w-full rounded-3xl object-cover shadow-xl" />
          </Reveal>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;

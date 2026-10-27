import { Link } from 'react-router-dom';
import aboutImage from '../assets/containers.jpg';
import Reveal from './Reveal';

const About = () => {
  return (
    <section id="about" className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <img
            src={aboutImage}
            alt="Stacked freight containers"
            className="h-80 w-full rounded-3xl object-cover shadow-xl sm:h-[440px]"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-700">The service</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Built so customers stop guessing</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Transportify is the public face of a shipment. One page, one tracking number, and a history that matches what your team has recorded.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            It is meant for the person waiting on a delivery: a status they can understand, a route they can follow, and an email when that status changes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/about" className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">
              About the company
            </Link>
            <Link to="/contact" className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50">
              Talk to us
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default About;

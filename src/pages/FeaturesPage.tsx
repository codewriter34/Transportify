import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import containers from '../assets/containers.jpg';
import yard from '../assets/hero2.jpg';
import highway from '../assets/hero3.jpg';
import warehouse from '../assets/hero4.webp';

const features = [
  {
    title: 'Shipment status',
    description: 'Each lookup opens on the current status, with the time that record was last updated.',
    details: ['Pending, processing, and in transit', 'Out for delivery and delivered', 'On hold and cancelled shown separately'],
    image: containers,
  },
  {
    title: 'Route and history',
    description: 'The page lists where the shipment started, where it is, and where it is going.',
    details: ['City, state, and country', 'A map when coordinates are saved', 'Notes kept with each update'],
    image: yard,
  },
  {
    title: 'Delivery estimate',
    description: 'A delivery date sits with the package details when one has been set.',
    details: ['Estimated delivery date', 'Service type, weight, and size', 'Last updated time beside the status'],
    image: highway,
  },
  {
    title: 'Email updates',
    description: 'Status emails carry a link that opens this shipment, not a blank tracking form.',
    details: ['Sent when a shipment is created', 'Sent again when the status changes', 'The same link can be copied from the page'],
    image: warehouse,
  },
];

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-slate-950 px-4 pb-16 pt-32 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-300">Features</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">What the tracking page actually shows</h1>
          <p className="mt-5 text-lg text-slate-300">
            One shipment at a time. The page reflects the record your team has saved, including the route, the history, and the latest status.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:px-8">
        {features.map((feature, index) => (
          <Reveal key={feature.title}>
            <article className="grid items-center gap-8 lg:grid-cols-2">
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <h2 className="text-3xl font-bold text-slate-900">{feature.title}</h2>
                <p className="mt-3 text-lg text-slate-600">{feature.description}</p>
                <ul className="mt-5 space-y-2 text-slate-700">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-500" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <img
                src={feature.image}
                alt=""
                className={`h-72 w-full rounded-3xl object-cover shadow-lg ${index % 2 === 1 ? 'lg:order-1' : ''}`}
              />
            </article>
          </Reveal>
        ))}
      </section>

      <section className="bg-slate-950 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Look up a shipment</h2>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/track" className="rounded-lg bg-lime-500 px-6 py-3 font-semibold text-slate-950 hover:bg-lime-400">
            Track a shipment
          </Link>
          <Link to="/contact" className="rounded-lg border border-white/20 px-6 py-3 font-semibold hover:bg-white/10">
            Contact
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FeaturesPage;

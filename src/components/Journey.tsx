import Reveal from './Reveal';
import highway from '../assets/hero3.jpg';

const stages = ['Pending', 'Processing', 'In transit', 'Out for delivery', 'Delivered'];

const Journey = () => {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-700">The journey</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">One path from pickup to delivery</h2>
          <p className="mt-4 text-lg text-slate-600">
            The tracking page marks how far a shipment has moved. On hold and cancelled are shown on their own, so a delay is obvious.
          </p>
          <ol className="mt-8 space-y-3">
            {stages.map((stage, index) => (
              <li key={stage} className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${index < 3 ? 'bg-lime-500 text-slate-950' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}>
                  {index + 1}
                </span>
                <span className="font-medium text-slate-800">{stage}</span>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-3xl shadow-xl">
            <img src={highway} alt="Highway freight at dusk" className="h-80 w-full object-cover sm:h-[420px]" />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Journey;

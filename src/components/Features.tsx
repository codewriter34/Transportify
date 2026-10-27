import Reveal from './Reveal';

const features = [
  {
    title: 'A status customers can read',
    description: 'Pending, processing, in transit, out for delivery, delivered, on hold, or cancelled. The latest state sits at the top of the page.',
  },
  {
    title: 'Route, map, and history',
    description: 'Origin, current location, and destination are listed together. A map appears when coordinates are saved, and each update is kept in order.',
  },
  {
    title: 'Delivery date and package details',
    description: 'Estimated delivery, service type, weight, and size show when they have been entered for that shipment.',
  },
  {
    title: 'A link that can be forwarded',
    description: 'The result page can copy a direct link. Email notices use the same kind of link, so the customer lands on that shipment.',
  },
];

const Features = () => {
  return (
    <section id="features" className="bg-slate-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-300">On the tracking page</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Everything a customer needs, and nothing private</h2>
          <p className="mt-4 text-lg text-slate-300">
            Names are shown. Email addresses and phone numbers stay off the public page.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.06}>
              <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-lime-400/40">
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-300">{feature.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

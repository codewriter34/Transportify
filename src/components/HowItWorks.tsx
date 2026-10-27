import Reveal from './Reveal';

const steps = [
  {
    number: '01',
    title: 'A tracking number is issued',
    text: 'When a shipment is created, it receives an ID. The receiver can get that ID in an email.',
  },
  {
    number: '02',
    title: 'The customer opens the page',
    text: 'They type the number on this site, or follow a link that already includes it.',
  },
  {
    number: '03',
    title: 'The record is shown',
    text: 'Status, route, map, package details, and history appear from the saved shipment.',
  },
  {
    number: '04',
    title: 'Updates go out by email',
    text: 'When the status changes, the email includes a link straight back to that shipment.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-700">How it works</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">From tracking number to a page the customer can trust</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.08}>
              <article className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-lime-700">{step.number}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-slate-600">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

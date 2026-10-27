import { useState } from 'react';
import Reveal from './Reveal';

const questions = [
  {
    question: 'Where does the tracking number come from?',
    answer: 'It is created with the shipment. The email sent to the receiver includes the number and a link that opens that shipment.',
  },
  {
    question: 'What will I see after I search?',
    answer: 'Status, last update time, origin, destination, current location, package details, and the history of updates. A map appears when the shipment has coordinates.',
  },
  {
    question: 'When does the page change?',
    answer: 'It changes when the shipment record is updated. There is no separate live GPS feed running in the background.',
  },
  {
    question: 'Are contact details public?',
    answer: 'No. The public page shows the sender and receiver names. Email addresses and phone numbers are not displayed.',
  },
];

const Faq = () => {
  const [open, setOpen] = useState(0);

  return (
    <section id="questions" className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-700">Questions</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Before you look up a shipment</h2>
        </Reveal>
        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200">
          {questions.map((item, index) => {
            const expanded = open === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-900"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? -1 : index)}
                >
                  {item.question}
                  <span className="text-lime-700" aria-hidden="true">{expanded ? '–' : '+'}</span>
                </button>
                {expanded && <p className="px-5 pb-5 text-slate-600">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;

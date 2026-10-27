import { useState } from 'react';

const emptyForm = { name: '', email: '', company: '', message: '' };

const Contact = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const body = new URLSearchParams({
        'form-name': 'contact',
        name: formData.name,
        email: formData.email,
        company: formData.company,
        message: formData.message,
      });
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      setSubmitted(true);
      setFormData(emptyForm);
    } catch {
      setError('The message could not be sent. Try again in a moment.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-700">Contact</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Send a message</h2>
          <p className="mt-4 text-lg text-gray-600">
            Send a message about a shipment or about using Transportify. Messages are delivered through the site form.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            {submitted ? (
              <p className="text-gray-900 text-lg">Thanks. Your message has been sent.</p>
            ) : (
              <form
                name="contact"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <input type="hidden" name="form-name" value="contact" />
                <p hidden aria-hidden="true">
                  <label>
                    Do not fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
                  </label>
                </p>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-y"
                  />
                </div>
                {error && <p className="text-red-700 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-lime-500 hover:bg-lime-600 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  {sending ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 h-fit">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Office</h3>
            <p className="text-gray-700">1234 Mountain View Drive</p>
            <p className="text-gray-700">Henderson, CO 80640</p>
            <p className="text-gray-700 mb-6">United States</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Hours</h3>
            <dl className="space-y-2 text-gray-700">
              <div className="flex justify-between gap-4"><dt>Monday – Friday</dt><dd>9:00 AM – 6:00 PM</dd></div>
              <div className="flex justify-between gap-4"><dt>Saturday</dt><dd>10:00 AM – 4:00 PM</dd></div>
              <div className="flex justify-between gap-4"><dt>Sunday</dt><dd>Closed</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

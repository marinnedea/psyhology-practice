"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "personal" | "organisations";
type PersonalForm = { name: string; email: string; subject: string; message: string };
type OrgForm = { contactName: string; companyName: string; email: string; phone: string; companySize: string; services: string[]; message: string };

const ORG_SERVICES = [
  "Workplace Psychological Assessment",
  "Employee Psychotherapy",
  "Resilience & Wellbeing Workshops",
  "Team Building with Specialists",
  "Leadership & Executive Coaching",
  "Crisis & Critical Incident Support",
];
const COMPANY_SIZES = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "500+", label: "500+ employees" },
];
const inputCls = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";

export default function ContactPage({ contactEmail }: { contactEmail: string }) {
  const [tab, setTab] = useState<Tab>("personal");

  const [form, setForm] = useState<PersonalForm>({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [orgForm, setOrgForm] = useState<OrgForm>({ contactName: "", companyName: "", email: "", phone: "", companySize: "", services: [], message: "" });
  const [orgStatus, setOrgStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [orgError, setOrgError] = useState("");

  const [newsletter, setNewsletter] = useState("");
  const [nlStatus, setNlStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [nlMsg, setNlMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }
  function handleOrgChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
    setOrgForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }
  function toggleService(s: string) {
    setOrgForm((p) => ({ ...p, services: p.services.includes(s) ? p.services.filter((x) => x !== s) : [...p.services, s] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setStatus("loading"); setErrorMsg("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setStatus("success"); setForm({ name: "", email: "", subject: "", message: "" }); }
      else { setStatus("error"); setErrorMsg((await res.json()).error ?? "Something went wrong."); }
    } catch { setStatus("error"); setErrorMsg("Network error. Please try again."); }
  }

  async function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault(); setOrgStatus("loading"); setOrgError("");
    const body = {
      name: orgForm.contactName, email: orgForm.email,
      subject: `Organisation Enquiry — ${orgForm.companyName}`,
      message: [`Company: ${orgForm.companyName}`, `Size: ${orgForm.companySize || "Not specified"}`,
        orgForm.phone ? `Phone: ${orgForm.phone}` : null,
        orgForm.services.length ? `Services:\n${orgForm.services.map((s) => `  • ${s}`).join("\n")}` : null,
        `\n${orgForm.message}`].filter(Boolean).join("\n"),
    };
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { setOrgStatus("success"); setOrgForm({ contactName: "", companyName: "", email: "", phone: "", companySize: "", services: [], message: "" }); }
      else { setOrgStatus("error"); setOrgError((await res.json()).error ?? "Something went wrong."); }
    } catch { setOrgStatus("error"); setOrgError("Network error. Please try again."); }
  }

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault(); setNlStatus("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newsletter }) });
      if (res.ok) { setNlStatus("success"); setNlMsg("Thank you! You're now subscribed."); setNewsletter(""); }
      else { setNlStatus("error"); setNlMsg((await res.json()).error ?? "Something went wrong."); }
    } catch { setNlStatus("error"); setNlMsg("Network error. Please try again."); }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50 py-16 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you&rsquo;re an individual looking for support or an organisation
            exploring wellbeing programmes — we&rsquo;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Tab toggle */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div role="tablist" aria-label="Enquiry type" className="max-w-5xl mx-auto flex">
          <button
            role="tab"
            id="tab-personal"
            aria-selected={tab === "personal"}
            aria-controls="panel-personal"
            onClick={() => setTab("personal")}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${tab === "personal" ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Individual Enquiry
          </button>
          <button
            role="tab"
            id="tab-organisations"
            aria-selected={tab === "organisations"}
            aria-controls="panel-organisations"
            onClick={() => setTab("organisations")}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${tab === "organisations" ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            For Organisations
          </button>
        </div>
      </div>

      {/* Personal form */}
      {tab === "personal" && (
        <section role="tabpanel" id="panel-personal" aria-labelledby="tab-personal" className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-12">
            <div className="md:col-span-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              {status === "success" ? (
                <div role="status" aria-live="polite" className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Message sent!</h3>
                  <p className="text-green-700 mb-6">Thank you for reaching out. We&rsquo;ll get back to you within 1–2 business days.</p>
                  <button onClick={() => setStatus("idle")} className="text-indigo-600 hover:underline font-medium text-sm">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} aria-describedby={status === "error" ? "p-form-error" : undefined} className="space-y-5">
                  {status === "error" && <div id="p-form-error" role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{errorMsg}</div>}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="p-name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span aria-hidden="true" className="text-red-500">*</span><span className="sr-only">(required)</span></label>
                      <input id="p-name" name="name" type="text" required aria-required="true" value={form.name} onChange={handleChange} placeholder="Jane Smith" className={inputCls} />
                    </div>
                    <div>
                      <label htmlFor="p-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span aria-hidden="true" className="text-red-500">*</span><span className="sr-only">(required)</span></label>
                      <input id="p-email" name="email" type="email" required aria-required="true" value={form.email} onChange={handleChange} placeholder="jane@example.com" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="p-subject" className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <select id="p-subject" name="subject" value={form.subject} onChange={handleChange} className={inputCls}>
                      <option value="">Select a subject…</option>
                      <option>General Enquiry</option><option>Booking Help</option>
                      <option>Psychologist Registration</option><option>Technical Support</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="p-message" className="block text-sm font-medium text-gray-700 mb-1.5">Message <span aria-hidden="true" className="text-red-500">*</span><span className="sr-only">(required)</span></label>
                    <textarea id="p-message" name="message" required aria-required="true" rows={6} value={form.message} onChange={handleChange} placeholder="How can we help you?" className={`${inputCls} resize-none`} />
                  </div>
                  <button type="submit" disabled={status === "loading"} aria-busy={status === "loading"} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                    {status === "loading" ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
                <ul className="space-y-4 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div><p className="font-medium text-gray-800">Email</p><a href={`mailto:${contactEmail}`} className="hover:text-indigo-600">{contactEmail}</a></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div><p className="font-medium text-gray-800">Response Time</p><p>We aim to reply within 1–2 business days.</p></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div><p className="font-medium text-gray-800">Are you a professional?</p><Link href="/register?role=PSYCHOLOGIST" className="text-indigo-600 hover:underline">Apply to join our platform →</Link></div>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  {[["Browse Psychologists","/psychologists"],["Our Services & Pricing","/services"],["Create an Account","/register"],["About Us","/about"]].map(([l,h]) => (
                    <li key={h}><Link href={h} className="text-indigo-600 hover:underline flex items-center gap-1">→ {l}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Organisations form */}
      {tab === "organisations" && (
        <section role="tabpanel" id="panel-organisations" aria-labelledby="tab-organisations" className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-12">
            <div className="md:col-span-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Organisation Enquiry</h2>
              <p className="text-gray-500 text-sm mb-8">Tell us about your organisation and what you&rsquo;re looking for. Our team will come back with a tailored proposal within 2 business days.</p>

              {orgStatus === "success" ? (
                <div role="status" aria-live="polite" className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Enquiry received!</h3>
                  <p className="text-green-700 mb-6">Our corporate team will review your enquiry and be in touch within 2 business days.</p>
                  <button onClick={() => setOrgStatus("idle")} className="text-indigo-600 hover:underline font-medium text-sm">Submit another enquiry</button>
                </div>
              ) : (
                <form onSubmit={handleOrgSubmit} aria-describedby={orgStatus === "error" ? "o-form-error" : undefined} className="space-y-5">
                  {orgStatus === "error" && <div id="o-form-error" role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{orgError}</div>}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="o-contactName" className="block text-sm font-medium text-gray-700 mb-1.5">Contact Name <span aria-hidden="true" className="text-red-500">*</span><span className="sr-only">(required)</span></label>
                      <input id="o-contactName" name="contactName" type="text" required aria-required="true" value={orgForm.contactName} onChange={handleOrgChange} placeholder="Maria Popescu" className={inputCls} />
                    </div>
                    <div>
                      <label htmlFor="o-companyName" className="block text-sm font-medium text-gray-700 mb-1.5">Company / Organisation <span aria-hidden="true" className="text-red-500">*</span><span className="sr-only">(required)</span></label>
                      <input id="o-companyName" name="companyName" type="text" required aria-required="true" value={orgForm.companyName} onChange={handleOrgChange} placeholder="Acme Corp" className={inputCls} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="o-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span aria-hidden="true" className="text-red-500">*</span><span className="sr-only">(required)</span></label>
                      <input id="o-email" name="email" type="email" required aria-required="true" value={orgForm.email} onChange={handleOrgChange} placeholder="hr@company.com" className={inputCls} />
                    </div>
                    <div>
                      <label htmlFor="o-phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                      <input id="o-phone" name="phone" type="tel" value={orgForm.phone} onChange={handleOrgChange} placeholder="+40 700 000 000" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="o-companySize" className="block text-sm font-medium text-gray-700 mb-1.5">Company Size</label>
                    <select id="o-companySize" name="companySize" value={orgForm.companySize} onChange={handleOrgChange} className={inputCls}>
                      <option value="">Select company size…</option>
                      {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-3">Services of Interest</legend>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {ORG_SERVICES.map((s) => {
                        const checked = orgForm.services.includes(s);
                        const id = `svc-${s.replace(/\s+/g, "-").toLowerCase()}`;
                        return (
                          <label key={s} htmlFor={id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer text-sm transition-colors select-none ${checked ? "border-indigo-400 bg-indigo-50 text-indigo-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                            <div aria-hidden="true" className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                              {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={() => toggleService(s)} />
                            <span>{s}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div>
                    <label htmlFor="o-message" className="block text-sm font-medium text-gray-700 mb-1.5">Tell Us More <span aria-hidden="true" className="text-red-500">*</span><span className="sr-only">(required)</span></label>
                    <textarea id="o-message" name="message" required aria-required="true" rows={5} value={orgForm.message} onChange={handleOrgChange} placeholder="Briefly describe your organisation's needs, any specific challenges, or the outcomes you're hoping to achieve…" className={`${inputCls} resize-none`} />
                  </div>
                  <button type="submit" disabled={orgStatus === "loading"} aria-busy={orgStatus === "loading"} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                    {orgStatus === "loading" ? "Sending…" : "Send Organisation Enquiry"}
                  </button>
                </form>
              )}
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="bg-slate-900 rounded-2xl p-7 text-white">
                <h3 className="font-bold text-lg mb-3">Why work with us?</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">We design every corporate programme from scratch around your specific organisational context, team size, and goals.</p>
                <ul className="space-y-3">
                  {["Qualified, chartered psychologists","Flexible — on-site or online","Pre & post assessment reporting","Confidential & GDPR compliant","Scalable from 5 to 500+ employees"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
                <h3 className="font-bold text-gray-900 mb-2">Our corporate services</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">See the full range of organisation-focused services we offer.</p>
                <Link href="/services/organisations" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:underline">View all services →</Link>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Response time</p>
                <p className="text-gray-800 font-medium">Within 2 business days</p>
                <p className="text-gray-400 text-xs mt-1">Urgent? Email <a href={`mailto:${contactEmail}`} className="text-indigo-600 hover:underline">{contactEmail}</a></p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscribe to our newsletter</h2>
          <p className="text-gray-600 mb-8 text-sm">Get mental health tips, expert articles, and platform updates straight to your inbox.</p>
          {nlStatus === "success" ? (
            <p className="text-green-700 font-medium">{nlMsg}</p>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-3 max-w-sm mx-auto">
              <label htmlFor="nl-email" className="sr-only">Email address</label>
              <input id="nl-email" type="email" required aria-required="true" value={newsletter} onChange={(e) => setNewsletter(e.target.value)} placeholder="your@email.com" disabled={nlStatus === "loading"} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <button type="submit" disabled={nlStatus === "loading"} aria-busy={nlStatus === "loading"} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors whitespace-nowrap">
                {nlStatus === "loading" ? "…" : "Subscribe"}
              </button>
            </form>
          )}
          {nlStatus === "error" && <p role="alert" className="text-red-600 text-sm mt-3">{nlMsg}</p>}
        </div>
      </section>
    </div>
  );
}

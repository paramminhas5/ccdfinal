import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import headphones from "@/assets/headphones.svg";
import { supabase } from "@/integrations/supabase/client";

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(2000),
});

const Contact = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const hpY = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const hpRot = useTransform(scrollYProgress, [0, 1], [-10, 20]);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const parsed = ContactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error("Please fill all fields with valid info.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("contact-submit", {
        body: { ...parsed.data, website },
      });
      if (error || (data as any)?.error) throw new Error("send failed");
      toast.success("Message sent! We'll be in touch.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Something went wrong. Try again?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section ref={ref} id="contact" className="relative bg-acid-yellow py-20 md:py-20 border-b-4 border-ink overflow-hidden">
      <motion.img
        src={headphones}
        alt=""
        style={{ y: hpY, rotate: hpRot }}
        className="absolute -top-10 -right-10 w-56 md:w-80"
      />
      <div className="container relative z-10 grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
        >
          <p className="font-display text-magenta text-2xl md:text-3xl mb-4">/ CONTACT US</p>
          <h2 className="font-display text-ink text-6xl md:text-7xl mb-8 leading-none">
            SAY<br/>HELLO.
          </h2>
          <p className="text-ink/80 text-lg md:text-xl mb-6 max-w-md">
            Brand collabs, venue partnerships, press, or just to send us a cat photo. We read everything.
          </p>
          <a href="mailto:hello@catscandance.com" className="font-display text-2xl md:text-3xl text-ink underline decoration-magenta decoration-4 underline-offset-4">
            hello@catscandance.com
          </a>
        </motion.div>
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.1 }}
          className="bg-cream border-4 border-ink chunk-shadow-lg p-6 md:p-8 space-y-4"
        >
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            aria-hidden
          />
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            maxLength={100}
            className="w-full bg-cream text-ink border-4 border-ink px-4 py-3 font-medium placeholder:text-ink/40 focus:outline-none focus:bg-acid-yellow"
          />
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="your@email.com"
            maxLength={255}
            className="w-full bg-cream text-ink border-4 border-ink px-4 py-3 font-medium placeholder:text-ink/40 focus:outline-none focus:bg-acid-yellow"
          />
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="What's up?"
            maxLength={2000}
            className="w-full bg-cream text-ink border-4 border-ink px-4 py-3 font-medium placeholder:text-ink/40 focus:outline-none focus:bg-acid-yellow resize-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-ink text-cream font-display text-xl py-4 hover:bg-magenta transition-colors disabled:opacity-60"
          >
            {busy ? "SENDING…" : "SEND IT →"}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default Contact;

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import headphones from "@/assets/headphones.svg";

const Contact = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const hpY = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const hpRot = useTransform(scrollYProgress, [0, 1], [-10, 20]);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll be in touch.");
    setForm({ name: "", email: "", message: "" });
  };
  return (
    <section ref={ref} id="contact" className="relative bg-acid-yellow py-24 md:py-32 border-b-4 border-ink overflow-hidden">
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
          <h2 className="font-display text-ink text-6xl md:text-8xl mb-8 leading-none">
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
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            className="w-full bg-cream text-ink border-4 border-ink px-4 py-3 font-medium placeholder:text-ink/40 focus:outline-none focus:bg-acid-yellow"
          />
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="your@email.com"
            className="w-full bg-cream text-ink border-4 border-ink px-4 py-3 font-medium placeholder:text-ink/40 focus:outline-none focus:bg-acid-yellow"
          />
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="What's up?"
            className="w-full bg-cream text-ink border-4 border-ink px-4 py-3 font-medium placeholder:text-ink/40 focus:outline-none focus:bg-acid-yellow resize-none"
          />
          <button
            type="submit"
            className="w-full bg-ink text-cream font-display text-xl py-4 hover:bg-magenta transition-colors"
          >
            SEND IT →
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default Contact;

import { motion } from "framer-motion";
import star from "@/assets/star.png";

const Footer = () => {
  return (
    <section className="relative bg-ink text-cream py-24 md:py-32 overflow-hidden">
      <motion.img src={star} alt="" className="absolute top-10 right-10 w-16 spin-slow" />
      <motion.img src={star} alt="" className="absolute bottom-20 left-10 w-12 spin-slow" />

      <div className="container text-center">
        <p className="font-display text-acid-yellow text-2xl md:text-3xl mb-6">/ JOIN THE PARTY</p>
        <h2 className="font-display text-6xl md:text-[10rem] leading-[0.9] text-cream">
          WE'RE<br/>JUST<br/>
          <span className="text-magenta">GETTING</span><br/>
          <span className="text-acid-yellow ink-stroke">STARTED.</span>
        </h2>

        <p className="mt-10 max-w-2xl mx-auto text-lg md:text-xl text-cream/80 font-medium">
          Cats Can Dance is where commerce and culture meet. Built for the urban, digitally-native generation. Powered by community. Loved by pets.
        </p>

        <a
          href="mailto:hello@catscandance.com"
          className="inline-block mt-10 bg-acid-yellow text-ink font-display text-2xl md:text-3xl px-10 py-5 border-4 border-cream rounded-full chunk-shadow-lg hover:-translate-y-1 transition-transform"
        >
          GET IN TOUCH →
        </a>

        <p className="mt-16 text-cream/50 text-sm font-medium">© Cats Can Dance — so can you.</p>
      </div>
    </section>
  );
};

export default Footer;

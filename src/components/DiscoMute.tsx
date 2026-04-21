import { useDiscoAudio } from "@/hooks/useDiscoAudio";
import { useDisco } from "@/contexts/DiscoContext";

const DiscoMute = () => {
  const { disco } = useDisco();
  const { muted, setMuted, available } = useDiscoAudio();
  if (!available || !disco) return null;
  return (
    <button
      type="button"
      onClick={() => setMuted((m) => !m)}
      aria-label={muted ? "Unmute disco audio" : "Mute disco audio"}
      title={muted ? "Unmute" : "Mute"}
      className={`w-11 h-11 grid place-items-center border-4 border-ink chunk-shadow text-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform ${
        muted ? "bg-cream text-ink" : "bg-lime text-ink"
      }`}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
};

export default DiscoMute;

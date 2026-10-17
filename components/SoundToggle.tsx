"use client";
import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundOn, setSoundOn, playCoin } from "@/lib/retention";

/** I11 — download-sound toggle (default OFF). Plays a preview clink when enabling. */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(isSoundOn()); }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    setSoundOn(next);
    if (next) playCoin();
  }

  return (
    <button className="btn-icon" onClick={toggle}
      aria-label={on ? "Turn download sound off" : "Turn download sound on"}
      title={on ? "Download sound: on" : "Download sound: off"}>
      {on ? <Volume2 size={18} strokeWidth={1.5} /> : <VolumeX size={18} strokeWidth={1.5} />}
    </button>
  );
}

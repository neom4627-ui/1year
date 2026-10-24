"use client";

import { useEffect, useState } from "react";
import { paint } from "../../lib/fx";
import Envelopes from "./Envelopes";
import MemoryVault from "./MemoryVault";
import Constellation from "./Constellation";
import FutureLetters from "./FutureLetters";
import Quiz from "./Quiz";
import BucketList from "./BucketList";
import Capsule from "./Capsule";
import AudioDiary from "./AudioDiary";
import Privacy from "./Privacy";

/* Our Universe — the part you come back to.

   Kept separate from the fourteen-page story on purpose. The story is
   read once, in order, on the 25th. This is a place, and places have
   tabs, not page numbers.
*/

const TABS = [
  { id: "envelopes", label: "Open when", theme: 2, blurb: "Little envelopes for different kinds of day." },
  { id: "memories", label: "Memories", theme: 10, blurb: "Both of your versions of the same afternoon." },
  { id: "sky", label: "Our sky", theme: 13, blurb: "Every memory is a star. It grows as you do." },
  { id: "letters", label: "Future letters", theme: 5, blurb: "Sealed until a date you choose." },
  { id: "quiz", label: "Do we know us", theme: 7, blurb: "Answer blind. Nothing opens until you both have." },
  { id: "bucket", label: "Someday", theme: 8, blurb: "Small things. Tick them off. Add the photo after." },
  { id: "capsule", label: "Time capsule", theme: 12, blurb: "Three questions, sealed for a year." },
  { id: "voice", label: "Voice notes", theme: 6, blurb: "Twenty seconds keeps what writing loses." },
  { id: "settings", label: "Settings", theme: 4, blurb: "Where everything goes, and how to take it back." },
];

export default function Hub({ onBackToStory }) {
  const [tab, setTab] = useState("envelopes");
  const active = TABS.find((t) => t.id === tab) || TABS[0];

  useEffect(() => {
    paint(active.theme);
  }, [active.theme]);

  return (
    <section className="stage hubstage">
      <div className="wrap wide stack g28">
        <div className="stack g8 center">
          <p className="eyebrow">Our universe</p>
          <h2>{active.label}</h2>
          <p className="body mx center" style={{ maxWidth: "42ch" }}>
            {active.blurb}
          </p>
        </div>

        <nav className="tabs" aria-label="Our universe">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={"tab" + (t.id === tab ? " on" : "")}
              aria-current={t.id === tab}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="hubbody">
          {tab === "envelopes" && <Envelopes />}
          {tab === "memories" && <MemoryVault />}
          {tab === "sky" && <Constellation />}
          {tab === "letters" && <FutureLetters />}
          {tab === "quiz" && <Quiz />}
          {tab === "bucket" && <BucketList />}
          {tab === "capsule" && <Capsule />}
          {tab === "voice" && <AudioDiary />}
          {tab === "settings" && <Privacy />}
        </div>

        <div className="row c">
          <button className="btn ghost" type="button" onClick={onBackToStory}>
            ← Back to our story
          </button>
        </div>
      </div>
    </section>
  );
}

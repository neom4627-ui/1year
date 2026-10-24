"use client";

import { useState } from "react";
import { STORY } from "../story";
import { burst } from "../../lib/fx";
import Photo from "./Photo";

/* Open when…

   No server, no storage, no setup — this is your writing, shipped with
   the app. Which is exactly why it's the best feature here: it works on
   day one and it's the page she'll return to on a bad Tuesday in March.
*/
export default function Envelopes() {
  const [open, setOpen] = useState(null);
  const [torn, setTorn] = useState([]);

  const openOne = (i) => {
    if (open === i) {
      setOpen(null);
      return;
    }
    setOpen(i);
    if (!torn.includes(i)) {
      setTorn((t) => [...t, i]);
      burst(26);
    }
  };

  return (
    <div className="envgrid">
      {STORY.envelopes.map((e, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={"env" + (isOpen ? " open" : "") + (torn.includes(i) ? " torn" : "")}>
            <button
              type="button"
              className="envflap"
              onClick={() => openOne(i)}
              aria-expanded={isOpen}
            >
              <span className="envwax">{torn.includes(i) ? "♡" : "♥"}</span>
              <span className="envlabel">Open {e.label}</span>
              <span className="envhint">{isOpen ? "close" : "tap to open"}</span>
            </button>

            {isOpen && (
              <div className="envbody">
                <p className="envnote">{e.note}</p>
                {e.photo && (
                  <div style={{ maxWidth: 260, marginTop: 14 }}>
                    <Photo src={e.photo} tilt={i % 2 ? 1.3 : -1.3} />
                  </div>
                )}
                {e.audio && (
                  <audio controls src={e.audio} style={{ width: "100%", marginTop: 14 }}>
                    Your browser can&apos;t play this.
                  </audio>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

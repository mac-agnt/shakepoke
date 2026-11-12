import { useState } from "react";
import { ORG } from "./model";

/* Official white logo on the blue chip; a clean SP mark if it cannot load. */
export default function ShakaMark() {
  const [failed, setFailed] = useState(false);
  if (failed) return <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: ".02em", color: "#ffffff" }}>SP</span>;
  return <img src={ORG.logo} alt="Shaka Poké" referrerPolicy="no-referrer" onError={() => setFailed(true)} style={{ width: "30px", height: "30px", objectFit: "contain", display: "block" }} />;
}

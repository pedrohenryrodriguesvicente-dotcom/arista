"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Registro único de plugins (sólo en cliente). ScrollTrigger queda listo
// para las secciones que se implementarán más adelante (líneas dibujadas
// al hacer scroll); SplitText se usa para el reveal por líneas del hero.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export { gsap, ScrollTrigger, SplitText };

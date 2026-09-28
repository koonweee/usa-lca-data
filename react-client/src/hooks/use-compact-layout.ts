import { useEffect, useState } from "react";
// Keep in sync with Tailwind xl and the compact shell media query.
// Below 1280px the table cannot fit its columns plus page gutters.
export function useCompactLayout() {
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 1279px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1279px)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return mobile;
}

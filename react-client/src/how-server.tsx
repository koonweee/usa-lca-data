import { renderToString } from "react-dom/server";
import HowPage from "@/features/how/page";

export function render() {
  return renderToString(<HowPage />);
}

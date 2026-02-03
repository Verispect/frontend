import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verispect | Inspection & Evidence Automation" },
    {
      name: "description",
      content:
        "Lightweight inspection and evidence automation for housing providers, maintenance teams, and cleaning contractors. Try demo or join the waitlist.",
    },
  ];
}

export default function Home() {
  return <Welcome />;
}

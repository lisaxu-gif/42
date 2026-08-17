import { createFileRoute } from "@tanstack/react-router";
import Case01Demo from "../../app/Case01Demo";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <Case01Demo />;
}

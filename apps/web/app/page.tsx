import { redirect } from "next/navigation";

export const metadata = {
  title: "SDMPS",
  description: "Space Debris Mapping and Prediction System operator console."
};

export default function HomePage() {
  redirect("/operations/live");
}

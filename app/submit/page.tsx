import { redirect } from "next/navigation";

export default function SubmitPage() {
  redirect("/about#submit");
}

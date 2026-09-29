import { redirect } from "next/navigation";
export default function ZwRedirect({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  void searchParams;
  redirect("/jobs?country=ZW");
}


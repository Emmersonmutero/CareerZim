"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { JobsBrowser } from "@/components/jobs/JobsBrowser";

export default function P() {
  const sp = useSearchParams(); const router = useRouter();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [city, setCity] = useState(sp.get("city") ?? "All");
  const [sort, setSort] = useState("match");
  const [tab, setTab] = useState(sp.get("tab") ?? "all");
  const [country, setCountry] = useState(sp.get("country") ?? "ZW");
  useEffect(() => {
    const p = new URLSearchParams(); if (q) p.set("q", q); if (city !== "All") p.set("city", city);
    if (tab !== "all") p.set("tab", tab); if (country !== "ZW") p.set("country", country);
    router.replace(`/jobs${p.toString() ? "?" + p.toString() : ""}`, { scroll: false });
  }, [q, city, tab, country, router]);
  return <JobsBrowser q={q} setQ={setQ} city={city} setCity={setCity} sort={sort} setSort={setSort} tab={tab} setTab={setTab} country={country} setCountry={setCountry} />;
}


"use client";
import { Suspense } from "react";
import P from "./p2";
export default function Page() {
  return (<Suspense fallback={<div className="skeleton h-24" />}><P /></Suspense>);
}


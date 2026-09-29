"use client";
import { Suspense } from "react";
import CvsContent from "./cvs-content";

export default function CvsPage() {
  return (
    <Suspense fallback={<div className="skeleton h-32 rounded-2xl" />}>
      <CvsContent />
    </Suspense>
  );
}


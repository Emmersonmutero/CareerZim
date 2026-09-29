"use client";
import { StoreProvider } from "@/lib/store";
import Shell from "@/components/ShellMain";
export default function DashLayout({children}:{children:React.ReactNode}){
  return <StoreProvider><Shell>{children}</Shell></StoreProvider>;
}

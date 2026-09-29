"use client";
import * as React from "react";
import { ToastProvider } from "@/components/ui/toaster";
import type { UserProfile, CVVersion, Application, CoverLetter, JobAlert, Notification } from './types';
import { load, save } from './utils';
const DEFAULT_PROFILE: UserProfile = {
  fullName:'', title:'', email:'',
  phone:'', location:'Harare', country:'Zimbabwe',
  linkedin:'', github:'', portfolio:'', summary:'',
  skills:[], softSkills:[],
  experience:[],
  education:[],
  projects:[{id:'p1',name:'Example project',description:'Describe what you built and the result.',tech:['React']}],
  certifications:[], languages:['English'],
  desiredTitles:[],
  industries:[], preferredLocations:['Harare'],
  workMode:'Hybrid', salaryExpectation:'', employmentTypes:['Full-time'],
  activelyLooking:true, careerGoal:''
};
interface Store {
  profile: UserProfile; setProfile:(p:UserProfile)=>void;
  cvs: CVVersion[]; setCvs:(c:CVVersion[])=>void;
  apps: Application[]; setApps:(a:Application[])=>void;
  letters: CoverLetter[]; setLetters:(l:CoverLetter[])=>void;
  alerts: JobAlert[]; setAlerts:(a:JobAlert[])=>void;
  notes: Notification[]; setNotes:(n:Notification[])=>void;
  saved: string[]; setSaved:(s:string[])=>void;
}
const Ctx = React.createContext<Store|null>(null);
export function StoreProvider({children}:{children:React.ReactNode}){
  const [profile,setProfileState] = React.useState<UserProfile>(DEFAULT_PROFILE);
  const [cvs,setCvsState] = React.useState<CVVersion[]>([]);
  const [apps,setAppsState] = React.useState<Application[]>([]);
  const [letters,setLettersState] = React.useState<CoverLetter[]>([]);
  const [alerts,setAlertsState] = React.useState<JobAlert[]>([]);
  const [notes,setNotesState] = React.useState<Notification[]>([]);
  const [saved,setSavedState] = React.useState<string[]>([]);
  const [ready,setReady] = React.useState(false);
  React.useEffect(()=>{
    setProfileState(load('cz_profile', DEFAULT_PROFILE));
    setCvsState(load('cz_cvs', []));
    setAppsState(load('cz_apps', []));
    setLettersState(load('cz_letters', []));
    setAlertsState(load('cz_alerts', []));
    setNotesState(load('cz_notes', [{id:'n1',title:'Welcome to CareerZim',body:'Upload your CV to get job matches for Harare and beyond.',date:new Date().toISOString().slice(0,10),read:false,kind:'info'}]));
    setSavedState(load('cz_saved', []));
    setReady(true);
  },[]);
  React.useEffect(()=>{ if(ready) save('cz_profile',profile); },[profile,ready]);
  React.useEffect(()=>{ if(ready) save('cz_cvs',cvs); },[cvs,ready]);
  React.useEffect(()=>{ if(ready) save('cz_apps',apps); },[apps,ready]);
  React.useEffect(()=>{ if(ready) save('cz_letters',letters); },[letters,ready]);
  React.useEffect(()=>{ if(ready) save('cz_alerts',alerts); },[alerts,ready]);
  React.useEffect(()=>{ if(ready) save('cz_notes',notes); },[notes,ready]);
  React.useEffect(()=>{ if(ready) save('cz_saved',saved); },[saved,ready]);
  return <Ctx.Provider value={{profile,setProfile:setProfileState,cvs,setCvs:setCvsState,apps,setApps:setAppsState,letters,setLetters:setLettersState,alerts,setAlerts:setAlertsState,notes,setNotes:setNotesState,saved,setSaved:setSavedState}}><ToastProvider>{children}</ToastProvider></Ctx.Provider>;
}
export function useStore(){
  const v = React.useContext(Ctx);
  if(!v) throw new Error('Store missing');
  return v;
}

"use client";

import React from "react";
import dynamic from "next/dynamic";

/**
 * Each simulator is its own lazily loaded chunk, so a lesson (or the simulators page) only
 * downloads the lab that is actually opened. Ids come from authored/simulators.json.
 */
const loading = () => (
  <div className="min-h-[240px] rounded-3xl border border-slate-800 bg-slate-900/60 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const MooreLaw = dynamic(() => import("./MooreLawSimulator").then((m) => m.MooreLawSimulator), { ssr: false, loading });
const AIHierarchy = dynamic(() => import("./AIHierarchySimulator").then((m) => m.AIHierarchySimulator), { ssr: false, loading });
const CryptoLab = dynamic(() => import("./CryptoLabSimulator").then((m) => m.CryptoLabSimulator), { ssr: false, loading });
const TLSHandshake = dynamic(() => import("./TLSHandshakeSimulator").then((m) => m.TLSHandshakeSimulator), { ssr: false, loading });
const MFAMatrix = dynamic(() => import("./MFAMatrixSimulator").then((m) => m.MFAMatrixSimulator), { ssr: false, loading });
const DMZArchitecture = dynamic(() => import("./DMZArchitectureSimulator").then((m) => m.DMZArchitectureSimulator), { ssr: false, loading });
const FirewallFilter = dynamic(() => import("./FirewallFilterSimulator").then((m) => m.FirewallFilterSimulator), { ssr: false, loading });
const ZeroTrust = dynamic(() => import("./ZeroTrustSimulator").then((m) => m.ZeroTrustSimulator), { ssr: false, loading });
const IncidentResponseSOC = dynamic(() => import("./IncidentResponseSOCSimulator").then((m) => m.IncidentResponseSOCSimulator), { ssr: false, loading });
const RiskMatrixLab = dynamic(() => import("./RiskMatrixLabSimulator").then((m) => m.RiskMatrixLabSimulator), { ssr: false, loading });
const WebRequestFlow = dynamic(() => import("./WebRequestFlowSimulator").then((m) => m.WebRequestFlowSimulator), { ssr: false, loading });
const CRAPDesign = dynamic(() => import("./CRAPDesignStudio").then((m) => m.CRAPDesignStudio), { ssr: false, loading });
const PDCAAndABTesting = dynamic(() => import("./PDCAAndABTestingLab").then((m) => m.PDCAAndABTestingLab), { ssr: false, loading });

const SIMULATORS: Record<string, React.ComponentType> = {
  // Chapter 1
  "moores-law-sim": MooreLaw,
  "ai-hierarchy-sim": AIHierarchy,
  // Chapter 2: Lesson 2-1
  "crypto-lab-sim": CryptoLab,
  "crypto-auth-sim": CryptoLab,
  "tls-handshake-sim": TLSHandshake,
  "mfa-matrix-lab-sim": MFAMatrix,
  // Chapter 2: Lesson 2-2
  "dmz-architecture-sim": DMZArchitecture,
  "network-defense-sim": DMZArchitecture,
  "firewall-packet-filter-sim": FirewallFilter,
  "zero-trust-battleground-sim": ZeroTrust,
  // Chapter 2: Lesson 2-3
  "incident-response-soc-sim": IncidentResponseSOC,
  "incident-response-sim": IncidentResponseSOC,
  "risk-matrix-lab-sim": RiskMatrixLab,
  // Chapter 3
  "web-request-flow-sim": WebRequestFlow,
  "http-api-inspector-sim": WebRequestFlow,
  // Chapter 4
  "crap-design-studio-sim": CRAPDesign,
  "metrics-calculator-sim": PDCAAndABTesting,
  "ab-test-lab-sim": PDCAAndABTesting,
};

export function SimulatorRenderer({ simulatorId }: { simulatorId: string }) {
  const Simulator = SIMULATORS[simulatorId];
  return Simulator ? <Simulator /> : null;
}

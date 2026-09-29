"use client";

import React from "react";
import { MooreLawSimulator } from "./MooreLawSimulator";
import { AIHierarchySimulator } from "./AIHierarchySimulator";
import { TLSHandshakeSimulator } from "./TLSHandshakeSimulator";
import { CryptoLabSimulator } from "./CryptoLabSimulator";
import { MFAMatrixSimulator } from "./MFAMatrixSimulator";
import { NetworkDefenseSimulator } from "./NetworkDefenseSimulator";
import { DMZArchitectureSimulator } from "./DMZArchitectureSimulator";
import { FirewallFilterSimulator } from "./FirewallFilterSimulator";
import { ZeroTrustSimulator } from "./ZeroTrustSimulator";
import { IncidentResponseSimulator } from "./IncidentResponseSimulator";
import { IncidentResponseSOCSimulator } from "./IncidentResponseSOCSimulator";
import { RiskMatrixLabSimulator } from "./RiskMatrixLabSimulator";
import { WebRequestFlowSimulator } from "./WebRequestFlowSimulator";
import { CRAPDesignStudio } from "./CRAPDesignStudio";
import { PDCAAndABTestingLab } from "./PDCAAndABTestingLab";

interface Props {
  simulatorId: string;
}

export function SimulatorRenderer({ simulatorId }: Props) {
  switch (simulatorId) {
    // Chapter 1
    case "moores-law-sim":
      return <MooreLawSimulator />;
    case "ai-hierarchy-sim":
      return <AIHierarchySimulator />;

    // Chapter 2: Lesson 2-1
    case "crypto-lab-sim":
    case "crypto-auth-sim":
      return <CryptoLabSimulator />;
    case "tls-handshake-sim":
      return <TLSHandshakeSimulator />;
    case "mfa-matrix-lab-sim":
      return <MFAMatrixSimulator />;

    // Chapter 2: Lesson 2-2
    case "dmz-architecture-sim":
      return <DMZArchitectureSimulator />;
    case "firewall-packet-filter-sim":
      return <FirewallFilterSimulator />;
    case "zero-trust-battleground-sim":
      return <ZeroTrustSimulator />;
    case "network-defense-sim":
      return <DMZArchitectureSimulator />;

    // Chapter 2: Lesson 2-3
    case "incident-response-soc-sim":
      return <IncidentResponseSOCSimulator />;
    case "risk-matrix-lab-sim":
      return <RiskMatrixLabSimulator />;
    case "incident-response-sim":
      return <IncidentResponseSOCSimulator />;

    // Chapter 3
    case "web-request-flow-sim":
    case "http-api-inspector-sim":
      return <WebRequestFlowSimulator />;

    // Chapter 4
    case "crap-design-studio-sim":
      return <CRAPDesignStudio />;
    case "metrics-calculator-sim":
    case "ab-test-lab-sim":
      return <PDCAAndABTestingLab />;

    default:
      return null;
  }
}

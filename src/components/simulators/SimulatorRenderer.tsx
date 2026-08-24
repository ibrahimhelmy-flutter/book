"use client";

import React from "react";
import { MooreLawSimulator } from "./MooreLawSimulator";
import { AIHierarchySimulator } from "./AIHierarchySimulator";
import { TLSHandshakeSimulator } from "./TLSHandshakeSimulator";
import { NetworkDefenseSimulator } from "./NetworkDefenseSimulator";
import { IncidentResponseSimulator } from "./IncidentResponseSimulator";
import { WebRequestFlowSimulator } from "./WebRequestFlowSimulator";
import { CRAPDesignStudio } from "./CRAPDesignStudio";
import { PDCAAndABTestingLab } from "./PDCAAndABTestingLab";

interface Props {
  simulatorId: string;
}

export function SimulatorRenderer({ simulatorId }: Props) {
  switch (simulatorId) {
    case "moores-law-sim":
      return <MooreLawSimulator />;
    case "ai-hierarchy-sim":
      return <AIHierarchySimulator />;
    case "tls-handshake-sim":
      return <TLSHandshakeSimulator />;
    case "network-defense-sim":
      return <NetworkDefenseSimulator />;
    case "incident-response-sim":
      return <IncidentResponseSimulator />;
    case "web-request-flow-sim":
    case "http-api-inspector-sim":
      return <WebRequestFlowSimulator />;
    case "crap-design-studio-sim":
      return <CRAPDesignStudio />;
    case "metrics-calculator-sim":
    case "ab-test-lab-sim":
      return <PDCAAndABTestingLab />;
    default:
      return null;
  }
}

import React from "react";
import {
  BarChart3,
  BookOpen,
  Brain,
  Cpu,
  Database,
  Filter,
  Globe,
  Key,
  Layers,
  Layout,
  Lock,
  Palette,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/** Icon names that content JSON may reference (book.json chapters, catalog books, simulators.json). */
const ICONS: Record<string, LucideIcon> = {
  BarChart3,
  BookOpen,
  Brain,
  Cpu,
  Database,
  Filter,
  Globe,
  Key,
  Layers,
  Layout,
  Lock,
  Palette,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
};

export function ContentIcon({ name, fallback = BookOpen, ...props }: { name?: string; fallback?: LucideIcon } & LucideProps) {
  const Icon = (name && ICONS[name]) || fallback;
  return <Icon {...props} />;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type NavEntry = {
  label: string;
  href: string;
  icon: ReactNode;
};

// Inline SVG icons — no external icon library needed
function IconRadar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="2" x2="12" y2="7" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <line x1="2" y1="12" x2="7" y2="12" />
      <line x1="17" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconSatellite() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M6.6 6.6 4.4 4.4" />
      <path d="M17.4 6.6l2.2-2.2" />
      <path d="M6.6 17.4l-2.2 2.2" />
      <path d="M17.4 17.4l2.2 2.2" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconFlask() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 3h6M9 3v8l-4.5 9a1 1 0 0 0 .9 1.5h13.2a1 1 0 0 0 .9-1.5L15 11V3" />
      <line x1="6" y1="15" x2="18" y2="15" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

const NAV_ENTRIES: NavEntry[] = [
  { label: "Dashboard", href: "/dashboard", icon: <IconGrid /> },
  { label: "Live Ops", href: "/operations/live", icon: <IconRadar /> },
  { label: "Conjunctions", href: "/conjunctions", icon: <IconLink /> },
  { label: "Objects", href: "/objects", icon: <IconSatellite /> },
  { label: "Alerts", href: "/alerts", icon: <IconBell /> },
  { label: "Simulations", href: "/simulations", icon: <IconFlask /> },
  { label: "Settings", href: "/settings/feeds", icon: <IconSettings /> }
];

function MissionClockDisplay() {
  const [utcTime, setUtcTime] = useState<string | null>(null);

  useEffect(() => {
    setUtcTime(new Date().toISOString());
    const id = setInterval(() => {
      setUtcTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!utcTime) return null;

  // Format: 2026-03-24T14:32:07Z
  const [datePart, timeFull] = utcTime.split("T");
  const timePart = timeFull?.slice(0, 8) ?? "--:--:--";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        lineHeight: 1.2
      }}
    >
      <span
        style={{
          fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: "var(--accent)"
        }}
      >
        {timePart}
        <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>UTC</span>
      </span>
      <span
        style={{
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.06em"
        }}
      >
        {datePart}
      </span>
    </div>
  );
}

function SidebarNavItem({ entry, isActive }: { entry: NavEntry; isActive: boolean }) {
  return (
    <Link
      href={entry.href}
      aria-current={isActive ? "page" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 16px",
        borderRadius: 10,
        margin: "2px 8px",
        fontSize: 13,
        fontWeight: isActive ? 600 : 400,
        letterSpacing: "0.02em",
        color: isActive ? "var(--accent)" : "var(--muted)",
        background: isActive ? "rgba(83, 194, 255, 0.1)" : "transparent",
        borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
        transition: "background 0.15s, color 0.15s, border-color 0.15s"
      }}
    >
      <span
        style={{
          display: "flex",
          flexShrink: 0,
          opacity: isActive ? 1 : 0.65
        }}
      >
        {entry.icon}
      </span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {entry.label}
      </span>
    </Link>
  );
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar */}
      <div className="topbar">
        {/* Branding block — sits in the sidebar column width */}
        <div
          style={{
            width: "var(--sidebar-width)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 16px",
            borderRight: "1px solid var(--panel-border)",
            height: "100%"
          }}
        >
          {/* Pulse dot */}
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 6px var(--accent)",
              flexShrink: 0
            }}
          />
          <span
            style={{
              fontFamily: '"SF Mono", "Fira Code", monospace',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.14em",
              color: "var(--text)"
            }}
          >
            SDMPS
          </span>
        </div>

        {/* Page status region — stretches to fill the content column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 12
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "var(--muted)",
              textTransform: "uppercase"
            }}
          >
            Space Debris Mapping and Prediction System
          </span>
        </div>

        {/* Mission clock — right side of topbar */}
        <div style={{ padding: "0 20px", flexShrink: 0 }}>
          <MissionClockDisplay />
        </div>
      </div>

      {/* Sidebar */}
      <nav className="sidebar" aria-label="Main navigation">
        {/* Nav section label */}
        <div
          style={{
            padding: "20px 24px 8px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)"
          }}
        >
          Navigation
        </div>

        {/* Nav items */}
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {NAV_ENTRIES.map((entry) => {
            const isActive =
              entry.href === "/operations/live"
                ? pathname.startsWith("/operations")
                : entry.href === "/settings/feeds"
                ? pathname.startsWith("/settings")
                : pathname.startsWith(entry.href);

            return (
              <li key={entry.href}>
                <SidebarNavItem entry={entry} isActive={isActive} />
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div
          style={{
            margin: "16px 16px 0",
            height: 1,
            background: "var(--panel-border)"
          }}
        />

        {/* System status footer */}
        <div
          style={{
            padding: "12px 24px",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.04em",
            lineHeight: 1.6
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--success)",
                boxShadow: "0 0 5px var(--success)",
                flexShrink: 0
              }}
            />
            <span>Operator Console</span>
          </div>
          <div style={{ marginTop: 4, paddingLeft: 12 }}>v2.0 — Active</div>
        </div>
      </nav>
    </>
  );
}

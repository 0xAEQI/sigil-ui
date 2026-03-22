"use client";

import Link from "next/link";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export default function Header({ title, breadcrumbs, actions }: HeaderProps) {
  return (
    <header className="page-header">
      <div className="header-content">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="breadcrumbs">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="breadcrumb-item">
                {i > 0 && <span className="breadcrumb-sep">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="breadcrumb-link">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="breadcrumb-current">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="page-title">{title}</h1>
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
}

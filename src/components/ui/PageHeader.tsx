"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className = "",
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 ${className}`}>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          {actions}
        </div>
      )}
    </div>
  );
};

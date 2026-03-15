'use client';

import { useState, useCallback, useMemo } from 'react';
import { DASHBOARD_TEMPLATES, getTemplateNames, generateKPIsFromTemplate } from '@/lib/templates';
import { useI18n } from '@/i18n/I18nContext';

export function TemplateSelector({ onSelect, }: { onSelect: (templateId: string) => void }) {
  const templates = getTemplateNames();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {templates.map(template => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-transparent hover:border-primary/30 transition-all duration-200"
        >
          <span className="text-3xl mb-2">{template.icon}</span>
          <span className="text-sm font-medium">{template.name}</span>
        </button>
      ))}
    </div>
  );
}

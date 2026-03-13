import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StepConfig from './StepConfig';
import { I18nProvider } from '@/i18n/I18nContext';

vi.mock('@/i18n/I18nContext', () => {
  const t = {
    onboarding: {
      sources: {
        gsheets: { label: 'Google Sheets' },
        csv: { label: 'CSV' },
        kobo: { label: 'Kobo' },
        api: { label: 'API' },
        dhis2: { label: 'DHIS2' },
      },
      config: {
        back: 'Retour',
        fields: { url: 'URL', refresh: 'Actualisation' },
        placeholders: { url: 'URL placeholder', refresh: '30' },
        tips: {
          gsheets: { title: 'Tip GSheets', lines: ['Ligne 1'] },
          kobo: { title: 'Tip Kobo', lines: ['L1', 'L2', 'L3'] },
          api: { title: 'Tip API', lines: ['L1', 'L2', 'L3'] },
          dhis2: { title: 'Tip DHIS2', lines: ['L1'] },
        }
      }
    },
    common: { error: 'Erreur', back: 'Retour' }
  };

  return {
    useI18n: () => ({ t }),
    I18nProvider: ({ children }: any) => <div>{children}</div>
  };
});

describe('StepConfig', () => {
  const mockOnBack = vi.fn();
  const mockOnLoaded = vi.fn();

  it('affiche un message d\'erreur pour un sourceType inconnu', () => {
    // @ts-ignore - On force un type invalide pour le test
    render(<StepConfig sourceType="inconnu" onBack={mockOnBack} onLoaded={mockOnLoaded} />);
    
    expect(screen.getByText(/Source inconnue/i)).toBeDefined();
    expect(screen.getByText(/Le type de source "inconnu" n'est pas reconnu/i)).toBeDefined();
  });

  it('affiche le formulaire pour un sourceType valide (gsheets)', () => {
    render(<StepConfig sourceType="gsheets" onBack={mockOnBack} onLoaded={mockOnLoaded} />);
    
    expect(screen.getByText(/Google Sheets/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/URL placeholder/i)).toBeDefined();
  });
});

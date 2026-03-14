# Guide de Contribution DataGN

Merci de votre intérêt pour contribuer à DataGN ! Ce document détaille le processus de contribution et les standards à respecter.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Commits](#commits)
- [Pull Requests](#pull-requests)

## Code de Conduite

En participant à ce projet, vous acceptez de maintenir un environnement respectueux et inclusif. Tout comportement inapproprié ne sera pas toléré.

## Comment Contribuer

### Rapporter un Bug

1. Vérifiez que le bug n'a pas déjà été rapporté dans [Issues](https://github.com/skaba89/datagn/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez:
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs observé
   - Captures d'écran si pertinent
   - Environnement (OS, navigateur, version)

### Proposer une Fonctionnalité

1. Ouvrez une issue avec le template "Feature Request"
2. Décrivez clairement la fonctionnalité et sa valeur ajoutée
3. Attendez validation avant de commencer le développement

### Soumettre du Code

1. Forkez le repository
2. Créez une branche depuis `main`:
   ```bash
   git checkout -b feature/ma-fonctionnalite
   # ou
   git checkout -b fix/mon-correctif
   ```
3. Développez et testez
4. Soumettez une Pull Request

## Standards de Code

### TypeScript

- **Strict mode activé** — Pas de `any` sans justification
- **Types explicites** pour les fonctions publiques
- **Interfaces** préférées aux types pour les objets

```typescript
// ✅ Bon
interface User {
  id: string;
  email: string;
  name?: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Éviter
function getUser(id: any): any {
  // ...
}
```

### React

- **Functional components** avec hooks
- **Props typées** avec interface
- **Nomination PascalCase** pour les composants

```typescript
// ✅ Bon
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Style

- **CSS Variables** pour le theming
- **Inline styles** acceptés pour les styles dynamiques
- **Classes utilitaires** pour les styles statiques

### Fichier

```typescript
// 1. Imports (groupés et ordonnés)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

// 2. Types & Interfaces
interface Props {
  // ...
}

// 3. Constantes
const DEFAULT_LIMIT = 10;

// 4. Composant/Fonction principal
export function MyComponent({ }: Props) {
  // ...
}

// 5. Exports secondaires
export { helper };
```

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composant | PascalCase | `DashboardCard` |
| Fonction | camelCase | `fetchUserData` |
| Constante | UPPER_SNAKE | `MAX_RETRIES` |
| Fichier composant | PascalCase | `DashboardCard.tsx` |
| Fichier utilitaire | camelCase | `fetcher.ts` |
| Fichier test | `.test.ts` | `fetcher.test.ts` |

## Tests

### Structure des Tests

```
src/
├── lib/
│   ├── parser.ts
│   └── parser.test.ts      # Tests à côté du fichier
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
```

### Standards de Tests

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Module', () => {
  beforeEach(() => {
    // Setup
  });

  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      // Test edge cases
    });

    it('should throw on invalid input', () => {
      expect(() => functionUnderTest(null)).toThrow();
    });
  });
});
```

### Couverture Minimum

- **Lignes**: 80%
- **Branches**: 75%
- **Fonctions**: 80%

```bash
# Vérifier la couverture
npm run test:coverage
```

## Commits

### Format

Nous suivons [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage (pas de changement de code) |
| `refactor` | Refactoring sans changement fonctionnel |
| `test` | Ajout/modification de tests |
| `chore` | Tâches de maintenance |
| `perf` | Amélioration de performance |
| `ci` | Configuration CI/CD |

### Exemples

```bash
feat(dashboard): add export to PDF feature
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
test(parser): add edge case tests for CSV parsing
refactor(api): extract error handling to middleware
```

### Hooks Pre-commit

Le projet utilise lint-staged pour vérifier automatiquement:

- ESLint sur les fichiers `.ts/.tsx`
- Prettier sur tous les fichiers

```bash
# Les vérifications sont automatiques avant chaque commit
git commit -m "feat: new feature"
```

## Pull Requests

### Checklist

Avant de soumettre:

- [ ] Code formaté (`npm run format`)
- [ ] Lint passe (`npm run lint`)
- [ ] Tests passent (`npm run test`)
- [ ] TypeScript compile (`npm run typecheck`)
- [ ] Pas de secrets dans le code
- [ ] Documentation mise à jour si nécessaire

### Template PR

```markdown
## Description
Brève description des changements.

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Comment tester
1. Étape 1
2. Étape 2
3. Résultat attendu

## Screenshots
Si applicable.

## Issues liées
Fixes #123
```

### Processus de Review

1. **Automated checks** — CI doit passer
2. **Code review** — Au moins 1 approval requis
3. **Address feedback** — Répondre à tous les commentaires
4. **Squash & merge** — Les PRs sont squashed

## Structure des Branches

```
main           # Production
├── develop    # Développement
├── feature/*  # Nouvelles fonctionnalités
├── fix/*      # Corrections de bugs
├── refactor/* # Refactoring
└── release/*  # Préparation des releases
```

## Besoin d'Aide?

- Ouvrez une [Discussion](https://github.com/skaba89/datagn/discussions)
- Contactez l'équipe: dev@datagn.com

---

Merci de contribuer à DataGN! 🚀

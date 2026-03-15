import { describe, it, from 'vitest';
import { validateCreateDashboard, validateCreateKPI } from '../lib/validations';

describe('Dashboard Validations', () => {
  it('should validate a valid dashboard', () => {
    const result = validateCreateDashboard({
      name: 'Sales Dashboard',
      description: 'Track sales metrics',
      icon: '📊',
      color: '#10B981',
      layout: 'grid'
    });
    
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Sales Dashboard');
  });
  
  it('should reject invalid color format', () => {
    const result = validateCreateDashboard({
      name: 'Test',
      color: 'invalid-color'
    });
    
    expect(result.success).toBe(false);
  });
  
  it('should reject empty name', () => {
    const result = validateCreateDashboard({
      name: ''
    });
    
    expect(result.success).toBe(false);
  });
  
  it('should reject name longer than 100 characters', () => {
    const result = validateCreateDashboard({
      name: 'a'.repeat(101)
    });
    
    expect(result.success).toBe(false);
  });
});

describe('KPI Validations', () => {
  it('should validate a valid KPI', () => {
    const result = validateCreateKPI({
      name: 'Revenue',
      value: 285000,
      category: 'Finance',
      vizType: 'sparkline',
      color: '#10B981'
    });
    
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid vizType', () => {
    const result = validateCreateKPI({
      name: 'Test KPI',
      vizType: 'invalid-type'
    });
    
    expect(result.success).toBe(false);
  });
  
  it('should reject invalid size', () => {
    const result = validateCreateKPI({
      name: 'Test KPI',
      size: 'giant' // invalid
    });
    
    expect(result.success).toBe(false);
  });
});

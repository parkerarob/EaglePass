/**
 * Unit tests for usePass hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePass } from './usePass';
import { createMockPass } from '../lib/test-utils';

describe('usePass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null pass state', () => {
    const { result } = renderHook(() => usePass());

    expect(result.current.pass).toBe(null);
    expect(typeof result.current.setPass).toBe('function');
  });

  it('should update pass state when setPass is called', () => {
    const { result } = renderHook(() => usePass());

    const mockPass = createMockPass();

    act(() => {
      result.current.setPass(mockPass);
    });

    expect(result.current.pass).toEqual(mockPass);
  });

  it('should allow setting pass to null', () => {
    const { result } = renderHook(() => usePass());

    const mockPass = createMockPass();

    // First set a pass
    act(() => {
      result.current.setPass(mockPass);
    });

    // Then set it back to null
    act(() => {
      result.current.setPass(null);
    });

    expect(result.current.pass).toBe(null);
  });

  it('should maintain pass state across re-renders', () => {
    const { result, rerender } = renderHook(() => usePass());

    const mockPass = createMockPass();

    act(() => {
      result.current.setPass(mockPass);
    });

    // Re-render the hook
    rerender();

    expect(result.current.pass).toEqual(mockPass);
  });
}); 
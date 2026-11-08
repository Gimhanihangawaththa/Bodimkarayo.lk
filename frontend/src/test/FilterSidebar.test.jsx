import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterSidebar from '../components/FilterSidebar';

describe('FilterSidebar Component', () => {
  it('renders filter header and quick preset buttons', () => {
    render(<FilterSidebar onFiltersChange={vi.fn()} />);

    expect(screen.getByText(/filter properties/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /under 25k/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /single rooms/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /furnished/i })).toBeInTheDocument();
  });

  it('triggers onFiltersChange when clicking quick filter preset Under 25k', () => {
    const onFiltersChangeMock = vi.fn();
    render(<FilterSidebar onFiltersChange={onFiltersChangeMock} />);

    const under25kBtn = screen.getByRole('button', { name: /under 25k/i });
    fireEvent.click(under25kBtn);

    expect(onFiltersChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        maxPrice: 25000,
      })
    );
  });

  it('triggers onFiltersChange when toggling Furnished preset', () => {
    const onFiltersChangeMock = vi.fn();
    render(<FilterSidebar onFiltersChange={onFiltersChangeMock} />);

    const furnishedBtn = screen.getByRole('button', { name: /furnished/i });
    fireEvent.click(furnishedBtn);

    expect(onFiltersChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        furnished: true,
      })
    );
  });

  it('resets all filters to defaults when Reset button is clicked', () => {
    const onFiltersChangeMock = vi.fn();
    render(<FilterSidebar onFiltersChange={onFiltersChangeMock} />);

    // First change a preset
    const under25kBtn = screen.getByRole('button', { name: /under 25k/i });
    fireEvent.click(under25kBtn);

    // Then click reset
    const resetButtons = screen.getAllByRole('button', { name: /reset all/i });
    fireEvent.click(resetButtons[0]);

    expect(onFiltersChangeMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        propertyType: 'Any',
        genderPreference: 'Any',
        suitableFor: 'Any',
        maxPrice: 300000,
        furnished: false,
        parking: false,
        petAllowed: false,
      })
    );
  });

  it('toggles mobile filter expansion drawer', () => {
    render(<FilterSidebar onFiltersChange={vi.fn()} />);

    // Mobile button starts by showing "Show Filters ▼"
    const toggleBtn = screen.getByRole('button', { name: /show filters/i });
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/hide ▲/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/hide ▲/i));
    expect(screen.getByText(/show filters ▼/i)).toBeInTheDocument();
  });

  it('emits current filters when Apply Filters button is clicked', () => {
    const onFiltersChangeMock = vi.fn();
    render(<FilterSidebar onFiltersChange={onFiltersChangeMock} />);

    const applyBtn = screen.getByRole('button', { name: /apply filters/i });
    fireEvent.click(applyBtn);

    expect(onFiltersChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyType: 'Any',
        maxPrice: 300000,
      })
    );
  });
});

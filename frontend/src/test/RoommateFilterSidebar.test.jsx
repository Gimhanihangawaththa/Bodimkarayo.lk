import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RoommateFilterSidebar from '../components/RoommateFilterSidebar';

describe('RoommateFilterSidebar Component', () => {
  it('renders filter header and roommate presets', () => {
    render(<RoommateFilterSidebar onFiltersChange={vi.fn()} />);

    expect(screen.getByText(/filter roommates/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /under 25k/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /students/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /females/i })).toBeInTheDocument();
  });

  it('triggers onFiltersChange when selecting Students preset', () => {
    const onFiltersChangeMock = vi.fn();
    render(<RoommateFilterSidebar onFiltersChange={onFiltersChangeMock} />);

    const studentBtn = screen.getByRole('button', { name: /students/i });
    fireEvent.click(studentBtn);

    expect(onFiltersChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        occupation: 'Student',
      })
    );
  });

  it('triggers onFiltersChange when selecting Females preset', () => {
    const onFiltersChangeMock = vi.fn();
    render(<RoommateFilterSidebar onFiltersChange={onFiltersChangeMock} />);

    const femaleBtn = screen.getByRole('button', { name: /females/i });
    fireEvent.click(femaleBtn);

    expect(onFiltersChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        genderPreference: 'Female',
      })
    );
  });

  it('resets all filters to defaults on Reset button click', () => {
    const onFiltersChangeMock = vi.fn();
    render(<RoommateFilterSidebar onFiltersChange={onFiltersChangeMock} />);

    // Change a preset first
    const femaleBtn = screen.getByRole('button', { name: /females/i });
    fireEvent.click(femaleBtn);

    // Click reset
    const resetButtons = screen.getAllByRole('button', { name: /reset all/i });
    fireEvent.click(resetButtons[0]);

    expect(onFiltersChangeMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        budgetRange: 80000,
        minAge: 18,
        maxAge: 65,
        location: '',
        genderPreference: 'Any',
        occupation: 'Any',
        roomType: 'Any',
        smokingPreference: false,
        petFriendly: false,
        foodPreference: 'Any',
      })
    );
  });

  it('toggles mobile filter drawer', () => {
    render(<RoommateFilterSidebar onFiltersChange={vi.fn()} />);

    const toggleBtn = screen.getByRole('button', { name: /show filters/i });
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/hide ▲/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/hide ▲/i));
    expect(screen.getByText(/show filters ▼/i)).toBeInTheDocument();
  });

  it('emits current filters when Apply Filters button is clicked', () => {
    const onFiltersChangeMock = vi.fn();
    render(<RoommateFilterSidebar onFiltersChange={onFiltersChangeMock} />);

    const applyBtn = screen.getByRole('button', { name: /apply filters/i });
    fireEvent.click(applyBtn);

    expect(onFiltersChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        budgetRange: 80000,
        occupation: 'Any',
      })
    );
  });
});

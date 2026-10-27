import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormInput } from '../components/FormInput';

describe('FormInput Component', () => {
  it('renders input with label and placeholder', () => {
    render(
      <FormInput
        label="Email Address"
        placeholder="Enter your email"
        name="email"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('renders input without label when label prop is omitted', () => {
    render(
      <FormInput
        placeholder="Search keywords"
        name="search"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByPlaceholderText('Search keywords')).toBeInTheDocument();
    expect(screen.queryByRole('label')).toBeNull();
  });

  it('triggers onChange handler when user types', () => {
    const handleChange = vi.fn();
    render(
      <FormInput
        label="Full Name"
        placeholder="Enter name"
        name="fullName"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByPlaceholderText('Enter name');
    fireEvent.change(input, { target: { value: 'Thamindu Bandara' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('correctly applies custom input types like password', () => {
    render(
      <FormInput
        label="Password"
        type="password"
        placeholder="Enter password"
        name="password"
        value="secret123"
        onChange={() => {}}
      />
    );

    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveValue('secret123');
  });
});

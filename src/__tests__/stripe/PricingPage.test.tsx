import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PricingPage from '../../pages/PricingPage';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PricingPage', () => {
  it('renders pricing calculator correctly', () => {
    renderWithRouter(<PricingPage />);
    
    expect(screen.getByText('Simple, Transparent Pricing')).toBeInTheDocument();
    expect(screen.getByText('Pool Pricing Calculator')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calculates price correctly for different entry counts', async () => {
    renderWithRouter(<PricingPage />);
    
    const select = screen.getByRole('combobox');
    
    // Test base tier (10 entries)
    expect(screen.getByText('$20.00')).toBeInTheDocument();
    
    // Test second tier (50 entries)
    await userEvent.selectOptions(select, '50');
    expect(screen.getByText('$90.00')).toBeInTheDocument();
    
    // Test third tier (100 entries)
    await userEvent.selectOptions(select, '100');
    expect(screen.getByText('$165.00')).toBeInTheDocument();
  });

  it('displays pricing breakdown correctly', async () => {
    renderWithRouter(<PricingPage />);
    
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, '50');
    
    expect(screen.getByText('$20 base fee')).toBeInTheDocument();
    expect(screen.getByText('40 entries × $1.75 = $70.00')).toBeInTheDocument();
  });

  it('shows error message when payment fails', async () => {
    renderWithRouter(<PricingPage />);
    
    const payButton = screen.getByText('Pay with Stripe');
    await userEvent.click(payButton);
    
    await waitFor(() => {
      expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
    });
  });
});
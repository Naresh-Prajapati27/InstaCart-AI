// Utility functions to format customer data for Storefront vs Admin & Delivery Portals

export const isGuestMode = (currentCustomer?: any): boolean => {
  if (!currentCustomer) return false;
  if (currentCustomer.isGuest || currentCustomer.email === 'guest@demo.com' || currentCustomer.id === 'guest_user') {
    return true;
  }
  return false;
};

export const maskCustomerName = (name: string, isGuest: boolean = false): string => {
  if (!isGuest) return name || 'Customer';
  if (!name) return 'Customer (Demo User)';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0][0] + '*** (Guest)';
  }
  return `${parts[0][0]}*** ${parts[parts.length - 1][0]}*** (Guest)`;
};

export const maskCustomerPhone = (phone: string, isGuest: boolean = false): string => {
  if (!isGuest) return phone || '+91 98765 43210';
  if (!phone) return '+91 98*** ****0';
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length >= 10) {
    return `+91 ${digits.slice(0, 2)}*** ***${digits.slice(-2)} (Masked)`;
  }
  return phone.slice(0, 4) + ' ***** ' + phone.slice(-2) + ' (Masked)';
};

export const maskCustomerEmail = (email: string, isGuest: boolean = false): string => {
  if (!isGuest) return email || 'customer@example.com';
  if (!email) return 'demo.user@privacy.protected';
  const parts = email.split('@');
  if (parts.length < 2) return 'demo.user@privacy.protected';
  const namePart = parts[0];
  const maskedName = namePart.length > 2 ? namePart.slice(0, 2) + '***' : namePart[0] + '***';
  return `${maskedName}@${parts[1]}`;
};

export const maskCustomerAddress = (address: string, isGuest: boolean = false): string => {
  if (!isGuest) return address || 'Customer Delivery Address';
  if (!address) return 'Express Delivery Zone, Demo Region';
  const parts = address.split(',');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim();
    return `Flat/Unit ***, ${lastPart} (Demo View)`;
  }
  return address.slice(0, 10) + '... (Demo View)';
};

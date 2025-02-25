// Type definitions for stored data
export interface StoredInvoice {
  id: string;
  fileName: string;
  status: 'processing' | 'completed' | 'error';
  data?: {
    invoiceNo: string;
    gstin: string;
    amount: number;
    taxAmount: number;
    date: string;
  };
  error?: string;
  createdAt: string;
}

export interface StoredTaxEstimate {
  id: string;
  income: number;
  expenses: number;
  gstLiability: number;
  date: string;
}

export interface StoredITCMismatch {
  id: string;
  supplier: string;
  invoiceNo: string;
  amount: number;
  issue: string;
  status: 'pending' | 'resolved';
  date: string;
}

export interface StoredComplianceIssue {
  id: string;
  type: 'Critical' | 'Warning';
  message: string;
  affected: string;
  details: string;
  date: string;
  status: 'open' | 'resolved';
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  password: string; // In real app, this would be hashed
  role: 'admin' | 'user';
  createdAt: string;
}

export interface BusinessSettings {
  id: string;
  userId: string;
  businessName: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  taxationScheme: 'regular' | 'composition';
  financialYear: string;
  updatedAt: string;
}

export interface BillingInfo {
  id: string;
  userId: string;
  plan: 'free' | 'basic' | 'premium';
  status: 'active' | 'inactive';
  nextBillingDate: string;
  paymentMethod?: {
    type: 'card' | 'upi';
    last4?: string;
    expiryDate?: string;
  };
  billingHistory: {
    id: string;
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'failed';
  }[];
}

// Local storage keys
const STORAGE_KEYS = {
  INVOICES: 'gst_invoices',
  TAX_ESTIMATES: 'gst_tax_estimates',
  ITC_MISMATCHES: 'gst_itc_mismatches',
  COMPLIANCE_ISSUES: 'gst_compliance_issues',
  USER_PROFILES: 'gst_user_profiles',
  BUSINESS_SETTINGS: 'gst_business_settings',
  BILLING_INFO: 'gst_billing_info',
  CURRENT_USER: 'gst_current_user',
} as const;

// Generic storage operations
const getStoredData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error retrieving data from ${key}:`, error);
    return [];
  }
};

const setStoredData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing data to ${key}:`, error);
  }
};

// User management
export const userStorage = {
  register: (email: string, password: string, name: string): UserProfile | null => {
    const users = getStoredData<UserProfile>(STORAGE_KEYS.USER_PROFILES);
    if (users.find(u => u.email === email)) {
      return null; // Email already exists
    }

    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password, // In real app, this would be hashed
      name,
      role: users.length === 0 ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };

    setStoredData(STORAGE_KEYS.USER_PROFILES, [...users, newUser]);
    return newUser;
  },

  login: (email: string, password: string): UserProfile | null => {
    const users = getStoredData<UserProfile>(STORAGE_KEYS.USER_PROFILES);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): UserProfile | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  updateProfile: (userId: string, updates: Partial<UserProfile>) => {
    const users = getStoredData<UserProfile>(STORAGE_KEYS.USER_PROFILES).map(user =>
      user.id === userId ? { ...user, ...updates } : user
    );
    setStoredData(STORAGE_KEYS.USER_PROFILES, users);
    
    // Update current user if it's the same user
    const currentUser = userStorage.getCurrentUser();
    if (currentUser?.id === userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...currentUser, ...updates }));
    }
  }
};

// Business settings management
export const businessSettingsStorage = {
  get: (userId: string): BusinessSettings | null => {
    const settings = getStoredData<BusinessSettings>(STORAGE_KEYS.BUSINESS_SETTINGS);
    return settings.find(s => s.userId === userId) || null;
  },

  update: (userId: string, updates: Partial<BusinessSettings>) => {
    const settings = getStoredData<BusinessSettings>(STORAGE_KEYS.BUSINESS_SETTINGS);
    const existing = settings.find(s => s.userId === userId);

    if (existing) {
      const updated = settings.map(s =>
        s.userId === userId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      );
      setStoredData(STORAGE_KEYS.BUSINESS_SETTINGS, updated);
    } else {
      const newSettings: BusinessSettings = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        businessName: '',
        gstin: '',
        address: '',
        phone: '',
        email: '',
        taxationScheme: 'regular',
        financialYear: new Date().getFullYear().toString(),
        updatedAt: new Date().toISOString(),
        ...updates
      };
      setStoredData(STORAGE_KEYS.BUSINESS_SETTINGS, [...settings, newSettings]);
    }
  }
};

// Billing management
export const billingStorage = {
  get: (userId: string): BillingInfo | null => {
    const billing = getStoredData<BillingInfo>(STORAGE_KEYS.BILLING_INFO);
    return billing.find(b => b.userId === userId) || null;
  },

  update: (userId: string, updates: Partial<BillingInfo>) => {
    const billing = getStoredData<BillingInfo>(STORAGE_KEYS.BILLING_INFO);
    const existing = billing.find(b => b.userId === userId);

    if (existing) {
      const updated = billing.map(b =>
        b.userId === userId ? { ...b, ...updates } : b
      );
      setStoredData(STORAGE_KEYS.BILLING_INFO, updated);
    } else {
      const newBilling: BillingInfo = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        plan: 'free',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        billingHistory: [],
        ...updates
      };
      setStoredData(STORAGE_KEYS.BILLING_INFO, [...billing, newBilling]);
    }
  },

  addPayment: (userId: string, amount: number) => {
    const billing = getStoredData<BillingInfo>(STORAGE_KEYS.BILLING_INFO);
    const userBilling = billing.find(b => b.userId === userId);

    if (userBilling) {
      const payment = {
        id: Math.random().toString(36).substr(2, 9),
        amount,
        date: new Date().toISOString(),
        status: 'paid' as const
      };

      const updated = billing.map(b =>
        b.userId === userId
          ? { ...b, billingHistory: [...b.billingHistory, payment] }
          : b
      );
      setStoredData(STORAGE_KEYS.BILLING_INFO, updated);
    }
  }
};

// Existing storage operations
export const invoiceStorage = {
  getAll: (): StoredInvoice[] => getStoredData(STORAGE_KEYS.INVOICES),
  add: (invoice: StoredInvoice) => {
    const invoices = [...getStoredData<StoredInvoice>(STORAGE_KEYS.INVOICES), invoice];
    setStoredData(STORAGE_KEYS.INVOICES, invoices);
    return invoice;
  },
  update: (id: string, updates: Partial<StoredInvoice>) => {
    const invoices = getStoredData<StoredInvoice>(STORAGE_KEYS.INVOICES).map(inv =>
      inv.id === id ? { ...inv, ...updates } : inv
    );
    setStoredData(STORAGE_KEYS.INVOICES, invoices);
  },
  remove: (id: string) => {
    const invoices = getStoredData<StoredInvoice>(STORAGE_KEYS.INVOICES).filter(
      inv => inv.id !== id
    );
    setStoredData(STORAGE_KEYS.INVOICES, invoices);
  },
  clear: () => setStoredData(STORAGE_KEYS.INVOICES, []),
};

export const taxEstimateStorage = {
  getAll: (): StoredTaxEstimate[] => getStoredData(STORAGE_KEYS.TAX_ESTIMATES),
  add: (estimate: StoredTaxEstimate) => {
    const estimates = [...getStoredData<StoredTaxEstimate>(STORAGE_KEYS.TAX_ESTIMATES), estimate];
    setStoredData(STORAGE_KEYS.TAX_ESTIMATES, estimates);
    return estimate;
  },
  clear: () => setStoredData(STORAGE_KEYS.TAX_ESTIMATES, []),
};

export const itcMismatchStorage = {
  getAll: (): StoredITCMismatch[] => getStoredData(STORAGE_KEYS.ITC_MISMATCHES),
  update: (id: string, updates: Partial<StoredITCMismatch>) => {
    const mismatches = getStoredData<StoredITCMismatch>(STORAGE_KEYS.ITC_MISMATCHES).map(
      mismatch => (mismatch.id === id ? { ...mismatch, ...updates } : mismatch)
    );
    setStoredData(STORAGE_KEYS.ITC_MISMATCHES, mismatches);
  },
  add: (mismatch: StoredITCMismatch) => {
    const mismatches = [...getStoredData<StoredITCMismatch>(STORAGE_KEYS.ITC_MISMATCHES), mismatch];
    setStoredData(STORAGE_KEYS.ITC_MISMATCHES, mismatches);
    return mismatch;
  },
  clear: () => setStoredData(STORAGE_KEYS.ITC_MISMATCHES, []),
};

export const complianceStorage = {
  getAll: (): StoredComplianceIssue[] => getStoredData(STORAGE_KEYS.COMPLIANCE_ISSUES),
  add: (issue: StoredComplianceIssue) => {
    const issues = [...getStoredData<StoredComplianceIssue>(STORAGE_KEYS.COMPLIANCE_ISSUES), issue];
    setStoredData(STORAGE_KEYS.COMPLIANCE_ISSUES, issues);
    return issue;
  },
  update: (id: string, updates: Partial<StoredComplianceIssue>) => {
    const issues = getStoredData<StoredComplianceIssue>(STORAGE_KEYS.COMPLIANCE_ISSUES).map(
      issue => (issue.id === id ? { ...issue, ...updates } : issue)
    );
    setStoredData(STORAGE_KEYS.COMPLIANCE_ISSUES, issues);
  },
  clear: () => setStoredData(STORAGE_KEYS.COMPLIANCE_ISSUES, []),
};
/**
 * Shared constants and helper utilities for Automation Practice Hub tests.
 * Centralizes selectors, test data, and reusable navigation functions
 * so that changes only need to happen in one place.
 */

// ─── Navigation Selectors ───────────────────────────────────────────────
export const NAV = {
  menu: '#navMenu',
  home: '[data-page="welcome"]',
  login: '[data-page="login"]',
  register: '[data-page="register"]',
  checkboxes: '[data-page="checkboxes"]',
  webtables: '[data-page="webtables"]',
  calculator: '[data-page="calculator"]',
  kmart: '[data-page="kmart"]',
  dropdowns: '[data-page="dropdowns"]',
  upload: '[data-page="upload"]',
  interactions: '[data-page="interactions"]',
} as const;

// ─── Page Section Selectors ─────────────────────────────────────────────
export const SECTIONS = {
  welcome: '#page-welcome',
  login: '#page-login',
  register: '#page-register',
  checkboxes: '#page-checkboxes',
  webtables: '#page-webtables',
  calculator: '#page-calculator',
  kmart: '#page-kmart',
  dropdowns: '#page-dropdowns',
  upload: '#page-upload',
  interactions: '#page-interactions',
} as const;

// ─── Login Test Data ────────────────────────────────────────────────────
export const LOGIN = {
  validUsername: 'nagarjun',
  validPassword: 'Test@123',
  invalidUsername: 'wronguser',
  invalidPassword: 'WrongPass',
  selectors: {
    form: '#loginForm',
    usernameInput: '#loginUser',
    passwordInput: '#loginPass',
    descriptionInput: '#loginUserDesc',
    submitButton: '#loginForm button[type="submit"]',
    message: '#loginMsg',
  },
  messages: {
    success: 'Login successful! Welcome, nagarjun.',
    invalidCreds: 'Invalid username or password. Please try again.',
    emptyFields: 'Please fill in all required fields.',
  },
} as const;

// ─── Registration Test Data ─────────────────────────────────────────────
export const REGISTER = {
  validData: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    gender: 'Male',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
    username: 'johndoe',
    password: 'SecureP@ss1',
    confirmPassword: 'SecureP@ss1',
  },
  selectors: {
    form: '#registerForm',
    firstName: '#regFirst',
    lastName: '#regLast',
    email: '#regEmail',
    phone: '#regPhone',
    gender: '#regGender',
    address: '#regAddr',
    city: '#regCity',
    state: '#regState',
    zip: '#regZip',
    country: '#regCountry',
    username: '#regUser',
    password: '#regPass',
    confirmPassword: '#regConfirm',
    submitButton: '#registerForm button[type="submit"]',
    resetButton: '#registerForm button[type="reset"]',
    message: '#regMsg',
  },
} as const;

// ─── Checkbox Test Data ─────────────────────────────────────────────────
export const CHECKBOXES = {
  selectors: {
    list: '#cbList',
    selectAllBtn: '#cbSelectAll',
    deselectAllBtn: '#cbDeselectAll',
    output: '#cbOutput',
    allCheckboxes: '#cbList input[type="checkbox"]',
    enabledCheckboxes: '#cbList input[type="checkbox"]:not(:disabled)',
    disabledCheckboxes: '#cbList input[type="checkbox"]:disabled',
  },
  items: [
    'Receive email notifications',
    'Enable dark mode',
    'Subscribe to newsletter',
    'Share usage analytics',
    'Enable two-factor authentication',
    'Auto-save drafts',
  ],
  readonlyItems: [
    'Accept Terms and Conditions',
    'Required cookies',
  ],
} as const;

// ─── Webtables Test Data ────────────────────────────────────────────────
export const WEBTABLES = {
  selectors: {
    searchInput: '#tableSearch',
    addUserBtn: '#addUserBtn',
    table: '#webTable',
    tableBody: '#tableBody',
    modal: '#addUserModal',
    modalTitle: '#modalTitle',
    modalFirstName: '#muFirst',
    modalLastName: '#muLast',
    modalUserName: '#muUserName',
    modalCustomer: '#muCustomer',
    modalRole: '#muRole',
    modalEmail: '#muEmail',
    modalPhone: '#muPhone',
    modalSaveBtn: '#modalSaveBtn',
    modalCancelBtn: '#modalCancelBtn',
  },
  newUser: {
    firstName: 'Test',
    lastName: 'User',
    userName: 'tuser',
    customer: 'Company AAA',
    role: 'Admin',
    email: 'test.user@example.com',
    phone: '5551234567',
  },
  initialRowCount: 6,
} as const;

// ─── Calculator Test Data ───────────────────────────────────────────────
export const CALCULATOR = {
  selectors: {
    display: '#calcDisplay',
    button: (val: string) => `.calc-btn[data-val="${val}"]`,
  },
} as const;

// ─── KMart Test Data ────────────────────────────────────────────────────
export const KMART = {
  selectors: {
    searchInput: '#kmartSearch',
    productGrid: '#productGrid',
    cartItems: '#cartItems',
    cartTotal: '#cartTotal',
    incrementBtn: (idx: number) => `button[data-action="inc"][data-idx="${idx}"]`,
    decrementBtn: (idx: number) => `button[data-action="dec"][data-idx="${idx}"]`,
    qtyDisplay: (idx: number) => `#qty-${idx}`,
  },
  products: [
    { name: 'Broccoli - 1 Kg', price: 120 },
    { name: 'Cauliflower - 1 Kg', price: 60 },
    { name: 'Cucumber - 1 Kg', price: 48 },
    { name: 'Beetroot - 1 Kg', price: 32 },
    { name: 'Carrot - 1 Kg', price: 44 },
    { name: 'Tomato - 1 Kg', price: 56 },
    { name: 'Beans - 1 Kg', price: 62 },
    { name: 'Brinjal - 1 Kg', price: 36 },
    { name: 'Mushroom - 1 Kg', price: 250 },
    { name: 'Potato - 1 Kg', price: 24 },
    { name: 'Pumpkin - 1 Kg', price: 48 },
    { name: 'Corn - 1 Kg', price: 80 },
  ],
} as const;

// ─── Dropdowns Test Data ────────────────────────────────────────────────
export const DROPDOWNS = {
  selectors: {
    country: '#ddCountry',
    currency: '#ddCurrency',
    language: '#ddLanguage',
    framework: '#ddFramework',
    output: '#ddOutput',
  },
  options: {
    country: ['India', 'USA', 'UK', 'Germany', 'Australia'],
    currency: ['INR', 'USD', 'GBP', 'EUR', 'AUD'],
    language: ['English', 'Hindi', 'Telugu', 'Kannada', 'Malayalam'],
    framework: ['Playwright', 'Selenium', 'Cypress', 'Puppeteer'],
  },
} as const;

// ─── Upload / Download Test Data ────────────────────────────────────────
export const UPLOAD = {
  selectors: {
    uploadZone: '#uploadZone',
    fileInput: '#fileInput',
    fileList: '#fileList',
    downloadTxt: '#dlText',
    downloadCsv: '#dlCsv',
  },
} as const;

// ─── Interactions Test Data ─────────────────────────────────────────────
export const INTERACTIONS = {
  radio: {
    selectors: {
      group: '#radioGroup',
      output: '#radioOutput',
      option: (value: string) => `input[name="techStack"][value="${value}"]`,
    },
    options: ['Java', 'Python', 'JavaScript', 'C#', 'TypeScript'],
  },
  dialogs: {
    selectors: {
      alertBtn: '#btnAlert',
      confirmBtn: '#btnConfirm',
      promptBtn: '#btnPrompt',
      output: '#dialogOutput',
    },
  },
  iframe: {
    selectors: {
      frame: '#sampleIframe',
    },
  },
  childWindow: {
    selectors: {
      openBtn: '#btnChildWindow',
      closeBtn: '#btnCloseChild',
      output: '#childWindowOutput',
    },
  },
  dragDrop: {
    selectors: {
      source: '#dndSource',
      target: '#dndTarget',
      output: '#dndOutput',
      item: (id: number) => `.dnd-item[data-id="${id}"]`,
    },
    items: ['Apple', 'Banana', 'Cherry', 'Orange'],
  },
  slider: {
    selectors: {
      range: '#sliderRange',
      value: '#sliderValue',
      output: '#sliderOutput',
    },
  },
  hover: {
    selectors: {
      grid: '#hoverGrid',
      tooltip: '#hoverTooltip',
      output: '#hoverOutput',
    },
    boxes: [
      { color: 'blue', tooltip: 'Blue — Primary actions' },
      { color: 'green', tooltip: 'Green — Success status' },
      { color: 'purple', tooltip: 'Purple — Creative zone' },
      { color: 'orange', tooltip: 'Orange — Warning level' },
      { color: 'pink', tooltip: 'Pink — Highlight item' },
    ],
  },
  datePicker: {
    selectors: {
      input: '#dpInput',
      toggleBtn: '#dpToggle',
      calendar: '#dpCalendar',
      monthYear: '#dpMonthYear',
      days: '#dpDays',
      prevBtn: '#dpPrev',
      nextBtn: '#dpNext',
      output: '#dpOutput',
    },
  },
} as const;

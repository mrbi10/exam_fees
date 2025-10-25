import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LogIn, User, DollarSign, CheckCircle, Clock, XCircle, Loader2, Phone, Mail } from 'lucide-react';

// --- CONFIGURATION ---

// 1. Placeholder ID for the Google Sheet (You MUST publish your sheet to the web: File > Share > Publish to the web)
const SPREADSHEET_ID_PLACEHOLDER = '1FPhTioeWlhNwJBNvePIObpSPjZLZX2f0JeatFLC3xwA';
// 2. GID is the unique identifier for the specific sheet tab (usually 0 for the first sheet)
const SHEET_GID_PLACEHOLDER = '1308953105';

// UPI Configuration
const UPI_PHONE_NUMBER = '6369189844';
const UPI_VPA_SUFFIX = '@superyes'; 
const DEVELOPER_NAME = 'Mrbi💙';
const CONTACT_EMAIL = 'abinanthan1006@gmail.com';

// Function to construct the URL for public JSON output (Google Visualization API)
const getSheetUrl = (spreadsheetId, gid) =>
  `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

// Utility function to format currency
const formatCurrency = (amount) => {
  const safeAmount = Number(amount) || 0;
  // Using 'en-IN' locale for Indian Rupee styling, as this appears to be a local use case
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(safeAmount);
};

// Function to generate the UPI Deep Link
const getUpiLink = (amount) => {
  if (amount <= 0) return '#';
  const vpa = `hetmyerwi@okaxis`;
  const note = "Exam Fee Payment - Reg No. Check";
  // Constructs a deep link attempting to launch a UPI app (might require user interaction)
  // am is set dynamically to the exact due amount
  return `upi://pay?pa=${vpa}&pn=${DEVELOPER_NAME}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
};

// --- STYLES (Injected using a <style> tag) ---
const GlobalStyles = () => (
  <style jsx="true">{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

    /* BASE STYLES & LAYOUT */
    .app-root {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #f4f7f9; /* Light, soft background */
      padding: 20px;
    }

    .main-content {
      width: 100%;
      max-width: 480px; /* Mobile-first, centered card layout */
      margin: auto;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* HEADER */
    .app-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .app-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1f2937;
      border-bottom: 3px solid #3b82f6;
      display: inline-block;
      padding-bottom: 5px;
    }

    /* CARD BASE */
    .card-base {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      padding: 30px;
    }

    /* FORM & INPUTS */
    .form-layout {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .input-field-container {
      display: flex;
      flex-direction: column;
    }

    .input-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #4b5563;
      margin-bottom: 6px;
    }
    .input-required {
      color: #ef4444;
    }

    .input-base {
      padding: 12px 15px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
      color: #1f2937;
      transition: border-color 0.2s, box-shadow 0.2s;
      background-color: #f9fafb;
    }
    .input-base:focus {
      border-color: #3b82f6;
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    /* BUTTONS */
    .button-base {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s, box-shadow 0.2s;
    }

    .button-active {
      background-color: #3b82f6;
      color: white;
    }
    .button-active:hover {
      background-color: #2563eb;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
    }

    .button-disabled {
      background-color: #d1d5db;
      color: #9ca3af;
      cursor: not-allowed;
    }

    /* RESULT CARD */
    .result-card {
      ${'/* Inherits from card-base */'}
      display: flex;
      flex-direction: column;
      gap: 25px;
      border-left: 5px solid #10b981;
    }

    .summary-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #10b981;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 10px;
    }

    .data-grid {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .data-row-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
    }

    .data-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #4b5563;
    }

    .data-value {
      font-weight: 700;
      color: #1f2937;
      text-align: right;
    }

    /* STATUS BADGES */
    .status-badge {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 9999px; /* Pill shape */
      font-size: 0.9rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-success {
      background-color: #ecfdf5; /* Green light background */
      color: #059669; /* Green text */
    }

    .status-partial {
      background-color: #fffbeb; /* Yellow light background */
      color: #f59e0b; /* Yellow text */
    }

    .status-outstanding {
      background-color: #fee2e2; /* Red light background */
      color: #ef4444; /* Red text */
    }

    /* PAY BUTTON (Conditional) */
    .pay-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
      background-color: #ef4444; /* Red for urgent action */
      color: white;
      transition: background-color 0.2s, box-shadow 0.2s;
    }
    .pay-button:hover {
      background-color: #dc2626;
      box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4);
    }

    /* ERROR ALERT */
    .error-alert {
      background-color: #fee2e2;
      color: #b91c1c;
      padding: 10px 15px;
      border: 1px solid #fca5a5;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    /* LOADING SCREEN */
    .loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #f4f7f9;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      transition: opacity 0.3s;
    }
    .loading-box {
      text-align: center;
      padding: 30px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
    }
    .loading-icon {
      width: 40px;
      height: 40px;
      color: #3b82f6;
      animation: spin 1.5s linear infinite;
      margin-bottom: 15px;
    }
    .loading-text-main {
      font-size: 1.2rem;
      font-weight: 600;
      color: #1f2937;
    }
    .loading-text-sub {
      font-size: 0.85rem;
      color: #9ca3af;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* FOOTER STYLES */
    .app-footer {
        width: 100%;
        max-width: 480px;
        margin-top: 30px;
        padding: 15px 0;
        text-align: center;
        border-top: 1px solid #e5e7eb;
    }
    .footer-dev-text {
        font-size: 0.85rem;
        color: #6b7280;
        margin-bottom: 10px;
    }
    .footer-contact-grid {
        display: flex;
        justify-content: center;
        gap: 15px;
        flex-wrap: wrap;
    }
    .contact-item {
        display: flex;
        align-items: center;
        font-size: 0.8rem;
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
    }
    .contact-item:hover {
        color: #2563eb;
    }

    /* ANIMATIONS */
    .animate-fadeInUp {
      animation: fadeInUp 0.5s ease-out forwards;
      opacity: 0;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>
);

// --- MAIN APPLICATION COMPONENT ---
const App = () => {
  const [regNo, setRegNo] = useState('');
  const [dob, setDob] = useState('');
  const [studentData, setStudentData] = useState([]);
  const [isSheetLoading, setIsSheetLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. DATA FETCHING EFFECT
  useEffect(() => {
    const fetchSheetData = async () => {
      setIsSheetLoading(true);
      const url = getSheetUrl(SPREADSHEET_ID_PLACEHOLDER, SHEET_GID_PLACEHOLDER);

      try {
        const response = await fetch(url);
        const text = await response.text();

        // Clean up JSONP wrapper
        const jsonText = text.substring(47).slice(0, -2);
        const data = JSON.parse(jsonText);

        if (!data.table || !data.table.cols || !data.table.rows) {
          throw new Error("Invalid sheet structure. Ensure headers are in Row 1.");
        }

        // Extract column labels (used as property keys)
        const cols = data.table.cols.map(col => col.label.toLowerCase().replace(/\s/g, ''));

        const rows = data.table.rows.map(row => {
          let item = {};
          let hasRegNo = false;
          let hasDob = false;

          row.c.forEach((cell, i) => {
            if (!cell) return;
            const key = cols[i];

            if (key === 'regno') {
              const regNoValue = cell.f || cell.v;
              if (regNoValue != null) {
                item.regNo = String(regNoValue).trim().toUpperCase();
                hasRegNo = true;
              }
            } else if (key === 'dob') {
              const dobValue = cell.f || cell.v;
              if (dobValue != null) {
                // Tries to parse Google Sheet date format if it's a number (days since 1899-12-30) or a date string
                let normalizedDob = dobValue;
                if (!isNaN(dobValue) && dobValue > 0) {
                  // Basic conversion for Google Sheets date numbers to ISO format
                  const days = dobValue - 1; // Google sheets date origin is Dec 30, 1899. JS Date is Jan 1, 1970
                  const date = new Date(Date.UTC(1899, 11, 30 + days));
                  normalizedDob = date.toISOString().split('T')[0];
                } else if (typeof dobValue === 'string') {
                    // Try to normalize a YYYY-MM-DD format
                    const match = dobValue.match(/(\d{4})-(\d{2})-(\d{2})/);
                    if (match) {
                        normalizedDob = dobValue;
                    } else {
                        // Attempt to parse as a simple date if possible
                        const date = new Date(dobValue);
                        if (!isNaN(date)) {
                            normalizedDob = date.toISOString().split('T')[0];
                        }
                    }
                }
                item.dob = normalizedDob.trim();
                hasDob = true;
              }
            } else if (key === 'name') {
              item.name = (cell.v || cell.f || '').trim();
            } else if (key === 'totaldue') {
              item.totalDue = parseFloat(cell.v ?? cell.f ?? 0);
            } else if (key === 'paid') {
              item.paid = parseFloat(cell.v ?? cell.f ?? 0);
            }
          });

          if (hasRegNo && hasDob) {
            item.key = `${item.regNo}-${item.dob}`;
            return item;
          }
          return null;
        }).filter(Boolean);

        setStudentData(rows);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch or parse data:", err);
        setError(`Error fetching data: ${err.message}. Please ensure the sheet is published to the web.`);
        setStudentData([]);
      } finally {
        setIsSheetLoading(false);
      }
    };
    fetchSheetData();
  }, []);

  // Reset error/result whenever inputs change
  useEffect(() => {
    setError(null);
    if (result) setResult(null);
  }, [regNo, dob]);

  // Handle the "login" and data retrieval logic
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    const cleanRegNo = regNo.trim().toUpperCase();
    const cleanDob = dob.trim();

    if (!cleanRegNo || !cleanDob) {
      setError('Please enter both the Registration Number and Date of Birth.');
      return;
    }
    if (isSheetLoading) {
      setError('Data is still loading. Please wait.');
      return;
    }
    if (studentData.length === 0 && !error) {
      setError('A server error occurred or no data was loaded.');
      return;
    }


    setIsLoading(true);
    setError(null);
    setResult(null);

    // Minor delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    // Construct the unique key for array lookup
    const searchKey = `${cleanRegNo}-${cleanDob}`;

    // Search the fetched studentData array
    const data = studentData.find(student => student.key === searchKey);


    if (!data) {
      setIsLoading(false);
      setError('Credentials not found. Please check your Registration Number and DOB.');
      return;
    }

    // --- Core Status Logic Implementation ---
    const totalDue = Number(data.totalDue) || 0;
    const paid = Number(data.paid) || 0;
    const amountYetToPay = totalDue - paid;

    let status = '';
    let statusClass = '';
    let statusIcon = null;

    if (amountYetToPay <= 0) {
      status = 'Success (Fully Paid)';
      statusClass = 'status-success';
      statusIcon = <CheckCircle className="w-5 h-5 mr-2" />;
    } else if (paid > 0 && amountYetToPay > 0) {
      status = 'Partial Payment Pending';
      statusClass = 'status-partial';
      statusIcon = <Clock className="w-5 h-5 mr-2" />;
    } else { // amountYetToPay > 0 and paid is 0
      status = 'Not Paid (Outstanding)';
      statusClass = 'status-outstanding';
      statusIcon = <XCircle className="w-5 h-5 mr-2" />;
    }

    setResult({
      name: data.name,
      paid: paid,
      due: amountYetToPay,
      status: status,
      statusClass: statusClass,
      statusIcon: statusIcon,
    });

    setIsLoading(false);
  }, [regNo, dob, isSheetLoading, studentData, error]);

  // Helper to determine button state
  const isFormValid = regNo && dob;

  // Render the result card when data is available
  const ResultCard = useMemo(() => {
    if (!result) return null;

    const { name, paid, due, status, statusClass, statusIcon } = result;

    const showPayButton = due > 0;

    return (
      <div
        className="card-base result-card animate-fadeInUp"
        style={{ animationDelay: '0.1s' }}
      >
        <h3 className="summary-title">Account Summary</h3>

        <div className="data-grid">
          {/* Name */}
          <DataRow icon={<User />} label="Name" value={name} />

          {/* Amount Paid */}
          <DataRow icon={<DollarSign />} label="Amount Paid" value={formatCurrency(paid)} />

          {/* Amount Due */}
          <DataRow icon={<DollarSign />} label="Amount Due" value={formatCurrency(due)} />

          {/* Status Badge */}
          <div className="data-row-container">
            <span className="data-label">Payment Status</span>
            <div className={`status-badge ${statusClass}`}>
              {statusIcon}
              <span>{status}</span>
            </div>
          </div>
        </div>

        {/* {showPayButton && (
          <a
            href={getUpiLink(due)}
            target="_blank"
            rel="noopener noreferrer"
            className="pay-button"
            title="Redirects to UPI App/Gateway"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Pay Now {formatCurrency(due)}
          </a>
        )} */}
      </div>
    );
  }, [result]);

  // Show initial loading screen while sheet data loads
  if (isSheetLoading) {
    return (
      <>
        <GlobalStyles />
        <div className="loading-screen">
          <div className="loading-box">
            <Loader2 className="loading-icon" />
            <p className="loading-text-main">Loading Data...</p>
            <p className="loading-text-sub">Fetching records from Google Sheet</p>
          </div>
        </div>
      </>
    );
  }


  return (
    <div className="app-root">
      <GlobalStyles />
      <div className="main-content">
        {/* Title Card */}
        <header className="app-header">
          <h1 className="app-title">Exam Fee Status Checker</h1>
        </header>

        {/* Login Card */}
        <div className="card-base">
          <form onSubmit={handleLogin} className="form-layout">
            <div className="input-group">
              <Input
                id="regNo"
                label="Registration Number"
                type="text"
                placeholder="e.g., 311622104..."
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                required
              />
              <Input
                id="dob"
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            {error && <div role="alert" className="error-alert">{error}</div>}

            <button
              type="submit"
              disabled={isLoading || !isFormValid || isSheetLoading}
              className={`button-base ${isFormValid && !isSheetLoading ? 'button-active' : 'button-disabled'}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="loading-spinner w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  View Status
                </>
              )}
            </button>
          </form>
        </div>

        {ResultCard}
      </div>
      <AppFooter />
    </div>

  );
};

// --- SUB-COMPONENTS ---

// Reusable elegant input field component
const Input = ({ id, label, type, placeholder, value, onChange, required }) => (
  <div className="input-field-container">
    <label htmlFor={id} className="input-label">
      {label} {required && <span className="input-required">*</span>}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="input-base"
    />
  </div>
);

// Reusable component for displaying a row of data in the result card
const DataRow = ({ icon, label, value }) => (
  <div className="data-row-container">
    <span className="data-label">
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      <span>{label}</span>
    </span>
    <span className="data-value">{value}</span>
  </div>
);

// Footer Component
const AppFooter = () => (
    <footer className="app-footer">
        <p className="footer-dev-text">
            Developed by <strong>{DEVELOPER_NAME}</strong>
        </p>
        <div className="footer-contact-grid">
            <a href={`tel:${UPI_PHONE_NUMBER}`} className="contact-item">
                <Phone className="w-4 h-4 mr-1" />
                   {UPI_PHONE_NUMBER}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="contact-item">
                <Mail className="w-4 h-4 mr-1" />
                   {CONTACT_EMAIL}
            </a>
        </div>
    </footer>
);

export default App;

import React, { useState, useMemo, useEffect } from 'react';
import { LogIn, User, DollarSign, CheckCircle, Clock, XCircle, Loader2, Database } from 'lucide-react';

// --- STYLES ---
const customStyles = `
/* Global Styles */
.app-root {
  min-height: 100vh;
  background-color: #f9fafb; /* bg-gray-50 */
  padding: 1rem; /* p-4 */
  display: flex;
  align-items: flex-start; /* items-start */
  justify-content: center;
  font-family: 'Inter', sans-serif;
}
@media (min-width: 640px) { /* sm:p-8 */
  .app-root {
    padding: 2rem;
  }
}
.main-content {
  width: 100%;
  max-width: 48rem; /* max-w-xl */
  margin-left: auto;
  margin-right: auto;
  padding-top: 3rem; /* py-12 */
  padding-bottom: 3rem; /* py-12 */
}

/* Header */
.app-header {
  margin-bottom: 2rem; /* mb-8 */
  text-align: center;
}
.app-title {
  font-size: 1.875rem; /* text-3xl */
  font-weight: 800; /* font-extrabold */
  color: #1f2937; /* text-gray-900 */
  letter-spacing: -0.025em; /* tracking-tight */
}
.app-subtitle {
  margin-top: 0.5rem; /* mt-2 */
  font-size: 1.125rem; /* text-lg */
  color: #6b7280; /* text-gray-500 */
  display: flex;
  align-items: center;
  justify-content: center;
}
.app-subtitle svg {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  margin-right: 0.5rem; /* mr-2 */
  color: #9ca3af; /* text-gray-400 */
}

/* Card Base */
.card-base {
  background-color: white;
  padding: 1.5rem; /* p-6 */
  border-radius: 1rem; /* rounded-2xl */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); /* shadow-xl */
  border: 1px solid #f3f4f6; /* border-gray-100 */
  transition: all 300ms ease-in-out;
}
.card-base:hover {
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.08); /* custom hover shadow */
}
@media (min-width: 640px) {
  .card-base {
    padding: 2rem; /* sm:p-8 */
  }
}

/* Form and Inputs */
.form-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* space-y-6 */
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* space-y-4 */
}
.input-field-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* space-y-1 */
}
.input-label {
  display: block;
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  color: #374151; /* text-gray-700 */
}
.input-required {
  color: #ef4444; /* text-red-500 */
}
.input-base {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem; /* px-4 py-2 */
  background-color: #f9fafb; /* bg-gray-50 */
  border: 1px solid #d1d5db; /* border-gray-300 */
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  font-size: 1rem; /* text-base */
  transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out;
}
.input-base:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-color: #3b82f6; /* focus:border-blue-500 */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); /* focus:ring-blue-500/50 */
}

/* Error Alert */
.error-alert {
  padding: 0.75rem; /* p-3 */
  background-color: #fef2f2; /* bg-red-50 */
  color: #b91c1c; /* text-red-700 */
  border-radius: 0.5rem; /* rounded-lg */
  font-size: 0.875rem; /* text-sm */
  transition: opacity 300ms ease-in-out;
  opacity: 1;
}

/* Button */
.button-base {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 1rem; /* py-3 px-4 */
  border: 1px solid transparent;
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); /* shadow-md */
  color: white;
  font-weight: 500; /* font-medium */
  transition: all 200ms ease-in-out;
}
.button-active {
  background-color: #2563eb; /* bg-blue-600 */
}
.button-active:hover {
  background-color: #1d4ed8; /* hover:bg-blue-700 */
}
.button-active:focus {
  outline: 4px solid rgba(59, 130, 246, 0.5); /* focus:ring-4 focus:ring-blue-500/50 */
  outline-offset: 0;
}
.button-disabled {
  background-color: #60a5fa; /* bg-blue-400 */
  cursor: not-allowed;
}

/* Loading Spinner */
.loading-spinner {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  margin-right: 0.5rem; /* mr-2 */
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Result Card */
.result-card {
  margin-top: 2rem; /* mt-8 */
  padding: 1.5rem; /* p-6 */
  background-color: white;
  border: 1px solid #f3f4f6; /* border-gray-100 */
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); /* shadow-lg */
  transition: opacity 500ms ease-out;
}
.summary-title {
  font-size: 1.25rem; /* text-xl */
  font-weight: 600; /* font-semibold */
  color: #1f2937; /* text-gray-800 */
  margin-bottom: 1rem; /* mb-4 */
  border-bottom: 1px solid #e5e7eb; /* border-b */
  padding-bottom: 0.5rem; /* pb-2 */
}
.data-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem 1.5rem; /* gap-y-4 gap-x-6 */
}
@media (min-width: 768px) {
  .data-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.data-row-container {
  display: flex;
  flex-direction: column;
}
.data-label {
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  color: #6b7280; /* text-gray-500 */
  margin-bottom: 0.25rem; /* mb-1 */
  display: flex;
  align-items: center;
}
.data-label svg {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  color: #6b7280; /* text-gray-500 */
}
.data-label span {
  margin-left: 0.5rem; /* ml-2 */
}
.data-value {
  font-size: 1.125rem; /* text-lg */
  font-weight: 600; /* font-semibold */
  color: #1f2937; /* text-gray-900 */
}

/* Status Badges */
.status-badge {
  display: flex;
  align-items: center;
  padding: 0.375rem 0.75rem; /* px-3 py-1.5 */
  border-radius: 9999px; /* rounded-full */
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  border: 1px solid; /* ring-1 */
  transition: background-color 200ms ease-in-out, color 200ms ease-in-out;
}
.status-success {
  background-color: #f0fff4; /* bg-emerald-50 */
  color: #047857; /* text-emerald-700 */
  border-color: #a7f3d0; /* ring-emerald-200 */
}
.status-partial {
  background-color: #fffbeb; /* bg-amber-50 */
  color: #b45309; /* text-amber-700 */
  border-color: #fde68a; /* ring-amber-200 */
}
.status-outstanding {
  background-color: #fef2f2; /* bg-red-50 */
  color: #b91c1c; /* text-red-700 */
  border-color: #fca5a5; /* ring-red-200 */
}
.status-badge svg {
  margin-right: 0.5rem; /* mr-2 */
}

/* Footer Hint */
.footer-hint {
  margin-top: 3rem; /* mt-12 */
  text-align: center;
  font-size: 0.875rem; /* text-sm */
  color: #9ca3af; /* text-gray-400 */
}
.footer-title {
  font-weight: 600; /* font-semibold */
  color: #4b5563; /* text-gray-600 */
  margin-bottom: 0.5rem; /* mb-2 */
}
.footer-hint p {
  margin-bottom: 0.25rem;
}
.footer-code {
  font-size: 0.75rem; /* text-xs */
  font-family: monospace;
  background-color: #e5e7eb; /* bg-gray-200 */
  padding: 0.125rem 0.25rem; /* p-1 */
  border-radius: 0.25rem; /* rounded */
}
.footer-hint strong {
    font-weight: 700;
}

/* Animations */
.animate-fadeInUp {
    animation: fadeInUp 0.5s ease-out forwards;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading Screen */
.loading-screen {
    min-height: 100vh;
    background-color: #f9fafb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
}
.loading-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background-color: white;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}
.loading-icon {
    width: 2rem;
    height: 2rem;
    color: #3b82f6;
    animation: spin 1s linear infinite;
    margin-bottom: 0.75rem;
}
.loading-text-main {
    font-size: 1.125rem;
    font-weight: 500;
    color: #4b5563;
}
.loading-text-sub {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
}
`;

const SPREADSHEET_ID_PLACEHOLDER = '1FPhTioeWlhNwJBNvePIObpSPjZLZX2f0JeatFLC3xwA';

// 2. GID is the unique identifier for the specific sheet tab (usually 0 for the first sheet)
const SHEET_GID_PLACEHOLDER = '1308953105';

// Function to construct the URL for public JSON output (Google Visualization API)
// NOTE: Your sheet MUST be published to the web (File > Share > Publish to the web) for this to work.
const getSheetUrl = (spreadsheetId, gid) =>
  `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}`;


// Utility function to format currency
const formatCurrency = (amount) => {
  // Ensure we display numbers correctly, even if they are null/zero
  const safeAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(safeAmount);
};

// --- MAIN APPLICATION COMPONENT ---
const App = () => {
  const [regNo, setRegNo] = useState('');
  const [dob, setDob] = useState('');
  const [studentData, setStudentData] = useState([]); // State for fetched sheet data (array of objects)
  const [isSheetLoading, setIsSheetLoading] = useState(true); // State for initial sheet data fetch
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State for login attempt

  // 1. DATA FETCHING EFFECT
  useEffect(() => {
    const fetchSheetData = async () => {

      setIsSheetLoading(true);
      const url = getSheetUrl(SPREADSHEET_ID_PLACEHOLDER, SHEET_GID_PLACEHOLDER);

      try {
        const response = await fetch(url);
        const text = await response.text();

        // The gviz API returns JSONP, so we need to clean up the wrapper.
        const jsonText = text.substring(47).slice(0, -2);
        const data = JSON.parse(jsonText);

        if (!data.table || !data.table.cols || !data.table.rows) {
          throw new Error("Invalid sheet structure. Ensure headers are in Row 1.");
        }

        // Extract column labels (used as property keys)
        const cols = data.table.cols.map(col => col.label.toLowerCase().replace(/\s/g, ''));

        const rows = data.table.rows.map(row => {
          console.log("✅ Parsed student data:", row);
          let item = {};

          row.c.forEach((cell, i) => {
            if (!cell) return;
            const key = cols[i].toLowerCase();
            console.log(`🔑 Processing cell for key: ${key}`, cell);

            if (key === 'regno') {
              const regNoValue = cell.f || cell.v;
              if (regNoValue != null) {
                item.regNo = String(regNoValue).trim().toUpperCase();
              }
            } else if (key === 'dob') {
              const dobValue = cell.f || cell.v;
              if (dobValue != null) {
                const normalizedDob = dobValue.includes('-')
                  ? dobValue
                  : new Date(dobValue).toISOString().split('T')[0];
                item.dob = normalizedDob.trim();
              }
            } else if (key === 'name') {
              item.name = (cell.v || cell.f || '').trim();
            } else if (key === 'totaldue') {
              item.totalDue = parseFloat(cell.v ?? cell.f ?? 0);
            } else if (key === 'paid') {
              item.paid = parseFloat(cell.v ?? cell.f ?? 0);
            }
          });

          if (item.regNo && item.dob) {
            item.key = `${item.regNo}-${item.dob}`;
            return item;
          }
          return null;
        }).filter(Boolean);


        setStudentData(rows);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch or parse Google Sheet data:", err);
        setError('Data loading failed. Check your Sheet ID, GID, and ensure the sheet is published to the web.');
        setStudentData([]);
      } finally {
        setIsSheetLoading(false);
      }
    };
    fetchSheetData();
  }, []); // Run only once on mount

  // Reset error/result whenever inputs change
  useEffect(() => {
    setError(null);
    if (result) setResult(null);
  }, [regNo, dob]);

  // Handle the "login" and data retrieval logic
  const handleLogin = async (e) => {
    console.log("🔍 Submitted values:", { regNo, dob });
    e.preventDefault();
    if (!regNo || !dob) {
      setError('Please enter both the Registration Number and Date of Birth.');
      return;
    }
    if (isSheetLoading) {
      setError('Data is still loading from Google Sheet. Please wait.');
      return;
    }
    if (studentData.length === 0 && !error) {
      setError('No student data available to check. Check sheet configuration.');
      return;
    }


    setIsLoading(true);
    setError(null);
    setResult(null);

    // Minor delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));



    // Construct the unique key for array lookup
    const searchKey = `${regNo.trim().toUpperCase()}-${dob.trim()}`;
    console.log("🔑 Constructed search key:", searchKey);
    console.log("📚 Available student keys:", studentData.map(s => s.key));

    // Search the fetched studentData array
    const data = studentData.find(student => student.key === searchKey);
    console.log("🎯 Matched student record:", data);


    if (!data) {
      setIsLoading(false);
      setError('Credentials not found. Please check your Registration Number and DOB.');
      return;
    }

    // --- Core Status Logic Implementation (Unchanged) ---
    const amountYetToPay = data.totalDue - data.paid;
    let status = '';
    let statusClass = '';
    let statusIcon = null;

    if (amountYetToPay === 0) {
      status = 'Success (Fully Paid)';
      statusClass = 'status-success';
      statusIcon = <CheckCircle className="w-5 h-5 mr-2" />;
    } else if (data.paid > 0 && amountYetToPay > 0) {
      status = 'Partial Payment';
      statusClass = 'status-partial';
      statusIcon = <Clock className="w-5 h-5 mr-2" />;
    } else if (amountYetToPay > 0 && data.paid === 0) {
      status = 'Not Paid (Outstanding)';
      statusClass = 'status-outstanding';
      statusIcon = <XCircle className="w-5 h-5 mr-2" />;
    }

    setResult({
      name: data.name,
      paid: data.paid,
      due: amountYetToPay,
      status: status,
      statusClass: statusClass,
      statusIcon: statusIcon,
    });

    setIsLoading(false);
  };

  // Helper to determine button state
  const isFormValid = regNo && dob;

  // Render the result card when data is available
  const ResultCard = useMemo(() => {
    if (!result) return null;

    const { name, paid, due, status, statusClass, statusIcon } = result;

    return (
      <div
        className="result-card animate-fadeInUp"
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
      </div>
    );
  }, [result]);

  // Show initial loading screen while sheet data loads
  if (isSheetLoading) {
    return (
      <div className="loading-screen">
        {/* Inject Styles */}
        <style>{customStyles}</style>
        <div className="loading-box">
          <Loader2 className="loading-icon" />
          <p className="loading-text-main">Loading Data...</p>
          <p className="loading-text-sub">Fetching records</p>
        </div>
      </div>
    );
  }


  return (
    <div className="app-root">
      {/* Inject Styles */}
      <style>{customStyles}</style>

      <div className="main-content">
        {/* Title Card */}
        <header className="app-header">
          <h1 className="app-title">
            Exam Fee Status Checker
          </h1>

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

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="error-alert"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid || isSheetLoading}
              className={`button-base ${(isFormValid && !isSheetLoading)
                ? 'button-active'
                : 'button-disabled'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="loading-spinner" />
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

        {/* Results */}
        {ResultCard}


      </div>
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

export default App;

import React, { useState, useMemo, useEffect } from 'react';
import { LogIn, User, DollarSign, CheckCircle, Clock, XCircle, Loader2, Database } from 'lucide-react';
import './App.css';
// --- STYLES ---

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

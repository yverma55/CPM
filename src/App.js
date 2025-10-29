import React, { useState, useMemo, useEffect } from "react";
import "./App.css"; // Import the CSS file

// --- MOCK DATA ---
const mockCustomerData = Array.from({ length: 55 }, (_, i) => ({
  id: `Customer ID${i + 1}`,
  name: [
    "Steven Fleming",
    "Glenn Phillips",
    "Andrew Jackson",
    "Garry Ferguson",
    "John Hopkins",
    "Matthew Harold",
    "P. Langford",
    "Nathan Lyonn",
    "Ross Taylor",
    "Ricky Martin",
    "Sarah Connor",
    "John Doe",
    "Jane Smith",
    "Peter Jones",
    "Mary Williams",
    "David Brown",
    "Susan Miller",
    "Michael Davis",
    "Linda Wilson",
    "James Johnson",
  ][i % 20],
  territory: `Territory ${Math.ceil((i + 1) / 10)}`,
  product: `Product ${(i % 2) + 1}`,
  segment: ["A", "B", "C", "D"][i % 4],
  refinedSegment: ["A", "B", "C", "D", ""][i % 5],
  calls: Math.floor(Math.random() * 5) + 8,
  refinedCalls: Math.floor(Math.random() * 5) + 8,
  reasonForChange: [
    "Limited Access",
    "High Potential",
    "New Practice",
    "Competitor Block",
  ][i % 4],
  comments: "",
  status: ["unchanged", "updated", "deleted"][i % 3],
  team: `Team ${(i % 2) + 1}`,
  repId: `Rep ID${(i % 10) + 1}`,
  repName: [
    "Steven Fleming",
    "Glenn Phillips",
    "Andrew Jackson",
    "Garry Ferguson",
    "John Hopkins",
    "Matthew Harold",
    "P. Langford",
    "Nathan Lyonn",
    "Ross Taylor",
    "Ricky Martin",
  ][i % 10],
}));
const mockExcelData = Array.from({ length: 95 }, (_, i) => ({
  "Customer ID": `ID${1001 + i}`,
  "Customer Name": [
    "Barry John",
    "Glenn Phillips",
    "Andrew Jackson",
    "John Hopkins",
    "Matthew Harold",
    "P. Langford",
    "Nathan Lyonn",
    "Ricky Martin",
  ][i % 8],
  Segment: ["A", "B", "C", "D"][i % 4],
  Product: `Product ${Math.floor(i / 10) + 1}`,
  Territory: `Territory ${Math.floor(i / 20) + 1}`,
}));
const mockUsers = {
  rep: { password: "password", role: "rep", status: "approved" },
  dm: { password: "password", role: "dm", status: "approved" },
  pending: { password: "password", role: "rep", status: "pending" },
  denied: { password: "password", role: "rep", status: "denied" },
};

// --- HELPER FUNCTIONS ---
const formatDate = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
const naturalSort = (a, b, key) => {
  const re = /(\d+)/g;
  const aStr = String(a[key] || "");
  const bStr = String(b[key] || "");
  const aParts = aStr.replace(re, "\0$1\0").split("\0");
  const bParts = bStr.replace(re, "\0$1\0").split("\0");
  for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
    let aPart = aParts[i];
    let bPart = bParts[i];
    if (i % 2) {
      const aNum = parseInt(aPart, 10);
      const bNum = parseInt(bPart, 10);
      if (aNum !== bNum) return aNum - bNum;
    } else if (aPart !== bPart) return aPart.localeCompare(bPart);
  }
  return aParts.length - bParts.length;
};

// --- SVG Icons ---
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon icon-info"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon icon-trash"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
const PlusCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon icon-plus-circle"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);
const ExportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon icon-export"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const SortIcon = ({ sortKey, currentSortKey, direction }) => {
  const isActive = sortKey === currentSortKey;
  const isAscending = direction === "ascending";
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon icon-sort ${isActive ? "active" : ""} ${
        isActive && !isAscending ? "desc" : "asc"
      }`}
    >
      <line x1="3" y1="12" x2="9" y2="12"></line>
      <line x1="3" y1="6" x2="9" y2="6"></line>
      <line x1="3" y1="18" x2="9" y2="18"></line>
      <polyline points="15 9 18 6 21 9"></polyline>
      <line x1="18" y1="6" x2="18" y2="18"></line>
    </svg>
  );
};

// --- Main Application Component ---
export default function App() {
  const [view, setView] = useState("login"); // 'login', 'signup', 'pending', 'denied', 'dashboard', 'territory'
  const [user, setUser] = useState(null);

  const handleLogin = (username, password) => {
    const userData = mockUsers[username];
    if (userData && userData.password === password) {
      setUser({ username, ...userData });
      switch (userData.status) {
        case "approved":
          setView(userData.role === "rep" ? "dashboard" : "territory");
          break;
        case "pending":
          setView("pending");
          break;
        case "denied":
          setView("denied");
          break;
        default:
          setView("login");
      }
      return true;
    }
    return false;
  };

  const handleSignUp = (newUserData) => {
    mockUsers[newUserData.username] = { ...newUserData, status: "pending" };
    console.log("New user pending approval:", mockUsers);
    setView("pending");
  };

  const handleLogout = () => {
    setUser(null);
    setView("login");
  };

  const renderView = () => {
    switch (view) {
      case "login":
        return (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToSignUp={() => setView("signup")}
          />
        );
      case "signup":
        return (
          <SignUpPage
            onSignUp={handleSignUp}
            onNavigateToLogin={() => setView("login")}
          />
        );
      case "pending":
        return <StatusPage status="pending" onNavigateToLogin={handleLogout} />;
      case "denied":
        return <StatusPage status="denied" onNavigateToLogin={handleLogout} />;
      case "dashboard":
        return <CallPlanReviewPage user={user} onLogout={handleLogout} />;
      case "territory":
        return <TerritorySelectionPage user={user} onLogout={handleLogout} />;
      default:
        return (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToSignUp={() => setView("signup")}
          />
        );
    }
  };

  return <div className="app-container">{renderView()}</div>;
}

// --- Pages & Views ---

function LoginPage({ onLogin, onNavigateToSignUp }) {
  const [username, setUsername] = useState("rep");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onLogin(username, password)) {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="page-center">
      <div className="login-card card">
        <div className="login-header">
          <h1 className="app-title">
            <span className="title-accent">CALL PLAN</span> SYSTEM
          </h1>
          <p className="app-subtitle">Pharma Solutions Login</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              className="form-input"
              id="username"
              type="text"
              placeholder="e.g., 'rep' or 'dm'"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-input"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="button-group-vertical">
            <button type="submit" className="button button-primary button-full">
              Login
            </button>
          </div>
        </form>
        <p className="link-text">
          Don't have an account?{" "}
          <button onClick={onNavigateToSignUp} className="link">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

function SignUpPage({ onSignUp, onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "rep",
    district: "District 1",
    region: "Region A",
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSignUp(formData);
  };

  return (
    <div className="page-center">
      <div className="card signup-card">
        <h2 className="card-title">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              className="form-input"
              id="username"
              name="username"
              type="text"
              required
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-input"
              id="password"
              name="password"
              type="password"
              required
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Role
            </label>
            <select
              name="role"
              id="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="rep">Sales Representative</option>
              <option value="dm">District Manager</option>
              <option value="rm">Regional Manager</option>
            </select>
          </div>
          <div className="form-group-inline">
            <div className="form-group">
              <label className="form-label" htmlFor="district">
                District
              </label>
              <select
                name="district"
                id="district"
                className="form-select"
                value={formData.district}
                onChange={handleChange}
              >
                <option>District 1</option>
                <option>District 2</option>
                <option>District 3</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="region">
                Region
              </label>
              <select
                name="region"
                id="region"
                className="form-select"
                value={formData.region}
                onChange={handleChange}
              >
                <option>Region A</option>
                <option>Region B</option>
                <option>Region C</option>
              </select>
            </div>
          </div>
          <button type="submit" className="button button-primary button-full">
            Sign Up
          </button>
        </form>
        <p className="link-text">
          Already have an account?{" "}
          <button onClick={onNavigateToLogin} className="link">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

function StatusPage({ status, onNavigateToLogin }) {
  const messages = {
    pending: {
      title: "Approval Pending",
      text: "Your account is awaiting approval. You will receive an email once it has been reviewed by your manager.",
    },
    denied: {
      title: "Access Denied",
      text: "Your registration request has been denied. Please contact your administrator for more information.",
    },
  };
  const message = messages[status];

  return (
    <div className="page-center">
      <div className="card status-card">
        <h2 className="card-title">{message.title}</h2>
        <p className="card-text">{message.text}</p>
        <button onClick={onNavigateToLogin} className="button button-primary">
          Back to Login
        </button>
      </div>
    </div>
  );
}

function TerritorySelectionPage({ user, onLogout }) {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Territory Selection (DM View)</h1>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </header>
      <p className="welcome-text">
        Welcome, {user.username}. This is a placeholder for your territory
        selection page.
      </p>
    </div>
  );
}

function CallPlanReviewPage({ user, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [customers, setCustomers] = useState(mockCustomerData);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [refreshDate, setRefreshDate] = useState(
    formatDate(new Date("2024-01-02"))
  );
  const [activeTab, setActiveTab] = useState("review");
  const [filters, setFilters] = useState(null);
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const filteredCustomers = useMemo(() => {
    if (!filters) return customers;
    return customers.filter((customer) =>
      Object.entries(filters).every(([key, filter]) => {
        if (!filter.value) return true;
        const customerValue = customer[key]?.toString().toLowerCase();
        const filterValue = filter.value.toString().toLowerCase();
        if (filter.condition === "equals") return customerValue === filterValue;
        if (filter.condition === "contains")
          return customerValue?.includes(filterValue);
        return true;
      })
    );
  }, [customers, filters]);
  const sortedCustomers = useMemo(() => {
    let sortableItems = [...filteredCustomers];
    if (sortConfig.key !== null)
      sortableItems.sort((a, b) => {
        const comparison = naturalSort(a, b, sortConfig.key);
        return sortConfig.direction === "ascending" ? comparison : -comparison;
      });
    return sortableItems;
  }, [filteredCustomers, sortConfig]);
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  const handleAddCustomer = (customerToAdd) => {
    const newCustomer = {
      id: customerToAdd["Customer ID"],
      name: customerToAdd["Customer Name"],
      territory: customerToAdd["Territory"],
      product: customerToAdd["Product"],
      segment: customerToAdd["Segment"],
      refinedSegment: "",
      calls: 0,
      refinedCalls: 0,
      reasonForChange: "",
      comments: "",
      status: "updated",
    };
    if (
      !customers.some(
        (c) => c.id === newCustomer.id && c.product === newCustomer.product
      )
    ) {
      setCustomers((prev) => [newCustomer, ...prev]);
      setCurrentPage(1);
    }
  };
  const handleUpdateCustomer = (id, field, value) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              [field]: value,
              status: c.status === "unchanged" ? "updated" : c.status,
            }
          : c
      )
    );
  };
  const handleDeleteCustomer = (id) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "deleted" ? "unchanged" : "deleted" }
          : c
      )
    );
  };
  const handleSubmitPlan = () => {
    setIsEditing(false);
    setRefreshDate(formatDate(new Date()));
  };
  const handleSearch = (searchCriteria) => {
    setFilters(searchCriteria);
    setCurrentPage(1);
    setShowSearchModal(false);
    const results = customers.filter((customer) =>
      Object.entries(searchCriteria).every(([key, filter]) => {
        if (!filter.value) return true;
        const customerValue = customer[key]?.toString().toLowerCase();
        const filterValue = filter.value.toString().toLowerCase();
        if (filter.condition === "equals") return customerValue === filterValue;
        if (filter.condition === "contains")
          return customerValue?.includes(filterValue);
        return true;
      })
    );
    if (results.length === 1) {
      setHighlightedRowId(results[0].id);
    } else {
      setHighlightedRowId(null);
    }
  };
  const clearSearch = () => {
    setFilters(null);
    setHighlightedRowId(null);
    setCurrentPage(1);
  };
  const existingCustomerIds = useMemo(
    () => new Set(customers.map((c) => `${c.id}-${c.product}`)),
    [customers]
  );

  return (
    <div className="page-container dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <h1 className="header-logo">Digitally Distinct</h1>
        </div>
        <div className="header-info">
          <span>Welcome, {user.username}</span>
          <span>Report Refresh Date: {refreshDate}</span>
          <InfoIcon />
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <main className="dashboard-main card">
        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab("review")}
            className={`tab-button ${activeTab === "review" ? "active" : ""}`}
          >
            Call Plan Review
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`tab-button ${activeTab === "summary" ? "active" : ""}`}
          >
            Summary
          </button>
        </div>
        {activeTab === "review" && (
          <ReviewView
            customers={sortedCustomers}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={Math.ceil(sortedCustomers.length / 20)}
            itemsPerPage={20}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            setShowAddCustomerModal={setShowAddCustomerModal}
            setShowSearchModal={setShowSearchModal}
            handleSubmitPlan={handleSubmitPlan}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            requestSort={requestSort}
            sortConfig={sortConfig}
            clearSearch={clearSearch}
            highlightedRowId={highlightedRowId}
          />
        )}
        {activeTab === "summary" && <SummaryView customers={customers} />}
      </main>
      {showAddCustomerModal && (
        <AddCustomerModal
          onClose={() => setShowAddCustomerModal(false)}
          onAddCustomer={handleAddCustomer}
          existingCustomerIds={existingCustomerIds}
        />
      )}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onSearch={handleSearch}
        />
      )}
    </div>
  );
}

const ReviewView = ({
  customers,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  isEditing,
  setIsEditing,
  setShowAddCustomerModal,
  setShowSearchModal,
  handleSubmitPlan,
  onUpdateCustomer,
  onDeleteCustomer,
  requestSort,
  sortConfig,
  clearSearch,
  highlightedRowId,
}) => {
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return customers.slice(startIndex, endIndex);
  }, [customers, currentPage, itemsPerPage]);
  const SortableTableHeader = ({ children, sortKey }) => (
    <th scope="col">
      <div className="sortable-header" onClick={() => requestSort(sortKey)}>
        {children}
        <SortIcon
          sortKey={sortKey}
          currentSortKey={sortConfig.key}
          direction={sortConfig.direction}
        />
      </div>
    </th>
  );
  return (
    <>
      {" "}
      <div className="dashboard-controls-section">
        <div className="cycle-info">
          <span>SF:</span> Team 1{" "}
          <span className="cycle-info-divider">Cycle:</span> Q1 2024
        </div>
        <div className="button-group">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isEditing}
            className="button button-primary"
          >
            Edit Plan
          </button>
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="button button-primary"
          >
            Add Customer
          </button>
          <button
            onClick={handleSubmitPlan}
            disabled={!isEditing}
            className="button button-secondary"
          >
            Submit Updated Plan
          </button>
        </div>
      </div>{" "}
      <div className="toolbar">
        <div className="toolbar-left">
          <button
            onClick={() => setShowSearchModal(true)}
            className="button button-outline"
          >
            Search
          </button>
          <button onClick={clearSearch} className="button button-outline">
            Clear
          </button>
        </div>
        <div className="toolbar-center legend">
          <div className="legend-item">
            <div className="status-box updated"></div>
            <span>Updated</span>
          </div>
          <div className="legend-item">
            <div className="status-box deleted"></div>
            <span>Deleted</span>
          </div>
          <div className="legend-item">
            <div className="status-box unchanged"></div>
            <span>Unchanged</span>
          </div>
        </div>
        <div className="toolbar-right">
          <button className="button button-primary button-with-icon">
            <ExportIcon />
            Export
          </button>
        </div>
      </div>{" "}
      <div className="table-container">
        {" "}
        <table className="data-table">
          <thead>
            <tr>
              <th>Record Status</th>
              <SortableTableHeader sortKey="id">
                Customer ID
              </SortableTableHeader>
              <SortableTableHeader sortKey="name">
                Customer Name
              </SortableTableHeader>
              <SortableTableHeader sortKey="territory">
                Territory
              </SortableTableHeader>
              <SortableTableHeader sortKey="product">
                Product
              </SortableTableHeader>
              <SortableTableHeader sortKey="segment">
                Segment
              </SortableTableHeader>
              <th>Refined Segment</th>
              <th>Calls</th>
              <th>Refined Calls</th>
              <th>Reason for Change</th>
              <th>Comments</th>
              <th></th>
            </tr>
          </thead>{" "}
          <tbody>
            {paginatedCustomers.map((customer) => (
              <CustomerRow
                key={`${customer.id}-${customer.product}`}
                customer={customer}
                isEditing={isEditing}
                onUpdate={onUpdateCustomer}
                onDelete={onDeleteCustomer}
                isHighlighted={customer.id === highlightedRowId}
              />
            ))}
          </tbody>{" "}
        </table>{" "}
      </div>{" "}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}{" "}
    </>
  );
};
const SummaryView = ({ customers }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "repId",
    direction: "ascending",
  });
  const ITEMS_PER_PAGE = 10;
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  const summaryData = useMemo(() => {
    const groups = {};
    customers.forEach((customer) => {
      const key = `${customer.repId}-${customer.territory}-${customer.product}-${customer.segment}`;
      if (!groups[key]) {
        groups[key] = {
          repId: customer.repId,
          repName: customer.repName,
          territory: customer.territory,
          product: customer.product,
          segment: customer.segment,
          customers: [],
        };
      }
      groups[key].customers.push(customer);
    });
    const aggregatedData = Object.values(groups).map((group) => {
      const totalCustomers = group.customers.length;
      const refinedCustomers = group.customers.filter(
        (c) => c.status !== "deleted"
      );
      const refinedCustomersCount = refinedCustomers.length;
      const totalCalls = group.customers.reduce(
        (sum, c) => sum + (c.calls || 0),
        0
      );
      const refinedTotalCalls = refinedCustomers.reduce(
        (sum, c) => sum + (c.refinedCalls || 0),
        0
      );
      const avgFrequency =
        totalCustomers > 0 ? (totalCalls / totalCustomers).toFixed(2) : 0;
      const refinedAvgFrequency =
        refinedCustomersCount > 0
          ? (refinedTotalCalls / refinedCustomersCount).toFixed(2)
          : 0;
      const coverage =
        totalCustomers > 0
          ? `${Math.round((refinedCustomersCount / totalCustomers) * 100)}%`
          : "0%";
      const refinedCoverage = coverage;
      return {
        ...group,
        noOfCustomers: totalCustomers,
        refinedNoOfCustomers: refinedCustomersCount,
        totalCalls,
        refinedTotalCalls,
        avgFrequency,
        refinedAvgFrequency,
        coverage,
        refinedCoverage,
      };
    });
    if (sortConfig.key !== null) {
      aggregatedData.sort((a, b) => {
        const comparison = naturalSort(a, b, sortConfig.key);
        return sortConfig.direction === "ascending" ? comparison : -comparison;
      });
    }
    return aggregatedData;
  }, [customers, sortConfig]);
  const totalPages = Math.ceil(summaryData.length / ITEMS_PER_PAGE);
  const paginatedData = summaryData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const SortableHeader = ({ children, sortKey }) => (
    <th scope="col">
      {" "}
      <div className="sortable-header" onClick={() => requestSort(sortKey)}>
        {" "}
        <SortIcon
          sortKey={sortKey}
          currentSortKey={sortConfig.key}
          direction={sortConfig.direction}
        />{" "}
        <span className="header-text">{children}</span>{" "}
      </div>{" "}
    </th>
  );
  return (
    <div className="summary-view">
      {" "}
      <h2 className="view-title">Call Plan Review</h2>{" "}
      <div className="toolbar">
        {" "}
        <div className="toolbar-left">
          {" "}
          <button className="button button-outline">Search</button>{" "}
          <button className="button button-outline">Clear</button>{" "}
        </div>{" "}
        <div className="toolbar-right">
          {" "}
          <button className="button button-primary button-with-icon">
            {" "}
            <ExportIcon /> Export{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="table-container">
        {" "}
        <table className="data-table summary-table">
          {" "}
          <thead>
            {" "}
            <tr>
              {" "}
              <SortableHeader sortKey="repId">Rep ID</SortableHeader>{" "}
              <SortableHeader sortKey="repName">Rep Name</SortableHeader>{" "}
              <SortableHeader sortKey="territory">Territory</SortableHeader>{" "}
              <SortableHeader sortKey="product">Product</SortableHeader>{" "}
              <SortableHeader sortKey="segment">Segment</SortableHeader>{" "}
              <th>No. of Customers</th> <th>Refined No. of Customers</th>{" "}
              <th>Total Calls</th> <th>Refined Total Calls</th>{" "}
              <th>Average Frequency</th> <th>Refined Average Frequency</th>{" "}
              <th>Coverage</th> <th>Refined</th>{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody>
            {" "}
            {paginatedData.map((row) => (
              <tr
                key={`${row.repId}-${row.territory}-${row.product}-${row.segment}`}
              >
                {" "}
                <td>{row.repId}</td> <td>{row.repName}</td>{" "}
                <td>{row.territory}</td> <td>{row.product}</td>{" "}
                <td>{row.segment}</td> <td>{row.noOfCustomers}</td>{" "}
                <td>{row.refinedNoOfCustomers}</td> <td>{row.totalCalls}</td>{" "}
                <td>{row.refinedTotalCalls}</td> <td>{row.avgFrequency}</td>{" "}
                <td>{row.refinedAvgFrequency}</td> <td>{row.coverage}</td>{" "}
                <td>{row.refinedCoverage}</td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
      </div>{" "}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}{" "}
    </div>
  );
};
const CustomerRow = ({
  customer,
  isEditing,
  onUpdate,
  onDelete,
  isHighlighted,
}) => {
  const isDeleted = customer.status === "deleted";
  const statusIcons = {
    updated: <div className="status-box updated">✓</div>,
    deleted: <div className="status-box deleted">✕</div>,
    unchanged: <div className="status-box unchanged"></div>,
  };
  return (
    <tr
      className={`table-row ${isDeleted ? "deleted-row" : ""} ${
        isHighlighted ? "highlighted-row" : ""
      }`}
    >
      <td className="status-cell">{statusIcons[customer.status]}</td>
      <td className="cell-id">{customer.id}</td>
      <td>{customer.name}</td>
      <td>{customer.territory}</td>
      <td>{customer.product}</td>
      <td>{customer.segment}</td>
      <td>
        {isEditing && !isDeleted ? (
          <select
            value={customer.refinedSegment}
            onChange={(e) =>
              onUpdate(customer.id, "refinedSegment", e.target.value)
            }
            className="form-select-table"
          >
            <option value=""></option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        ) : (
          customer.refinedSegment
        )}
      </td>
      <td>{customer.calls}</td>
      <td>
        {isEditing && !isDeleted ? (
          <input
            type="number"
            value={customer.refinedCalls}
            onChange={(e) =>
              onUpdate(customer.id, "refinedCalls", e.target.value)
            }
            className="form-input-table number-input"
          />
        ) : (
          customer.refinedCalls
        )}
      </td>
      <td>
        {isEditing && !isDeleted ? (
          <select
            value={customer.reasonForChange}
            onChange={(e) =>
              onUpdate(customer.id, "reasonForChange", e.target.value)
            }
            className="form-select-table reason-select"
          >
            <option>Limited Access</option>
            <option>High Potential</option>
            <option>New Practice</option>
            <option>Competitor Block</option>
          </select>
        ) : (
          customer.reasonForChange
        )}
      </td>
      <td>
        {isEditing && !isDeleted ? (
          <input
            type="text"
            value={customer.comments}
            onChange={(e) => onUpdate(customer.id, "comments", e.target.value)}
            className="form-input-table comment-input"
          />
        ) : (
          customer.comments
        )}
      </td>
      <td className="action-cell">
        <button onClick={() => onDelete(customer.id)} className="action-button">
          {isDeleted ? <PlusCircleIcon /> : <TrashIcon />}
        </button>
      </td>
    </tr>
  );
};
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  const createPagination = () => {
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) pageNumbers.push("...");
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) end = 4;
      if (currentPage >= totalPages - 2) start = totalPages - 3;
      for (let i = start; i <= end; i++) pageNumbers.push(i);
      if (currentPage < totalPages - 2) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };
  return (
    <nav className="pagination">
      <ul className="pagination-list">
        <li>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            &lt;
          </button>
        </li>
        {createPagination().map((page, index) => (
          <li key={index}>
            {page === "..." ? (
              <span className="pagination-ellipsis">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`pagination-button ${
                  currentPage === page ? "active" : ""
                }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
};
const Modal = ({ children, onClose, title, size = "large" }) => (
  <div className="modal-overlay">
    {" "}
    <div className={`modal modal-${size}`}>
      {" "}
      <div className="modal-header">
        {" "}
        <h3 className="modal-title">{title}</h3>{" "}
        <button onClick={onClose} className="modal-close-button">
          &times;
        </button>{" "}
      </div>{" "}
      <div className="modal-body">{children}</div>{" "}
    </div>{" "}
  </div>
);
function AddCustomerModal({ onClose, onAddCustomer, existingCustomerIds }) {
  const [availableCustomers, setAvailableCustomers] = useState(mockExcelData);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;
  const filteredCustomers = useMemo(() => {
    return availableCustomers.filter(
      (customer) =>
        customer["Customer Name"]
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        customer["Customer ID"].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, availableCustomers]);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage]);
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  return (
    <Modal onClose={onClose} title="Select Customer Product Combination">
      <div className="modal-toolbar">
        <div className="modal-search">
          <input
            type="text"
            placeholder="Search by Customer ID or Name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="form-input"
          />
          <button className="button button-outline">Search</button>
          <button
            onClick={() => setSearchTerm("")}
            className="button button-outline"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="table-container modal-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Segment</th>
              <th>Product</th>
              <th>Territory</th>
              <th>Add Call Plan</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((cust) => {
              const uniqueId = `${cust["Customer ID"]}-${cust["Product"]}`;
              const isAdded = existingCustomerIds.has(uniqueId);
              return (
                <tr key={uniqueId}>
                  <td>{cust["Customer ID"]}</td>
                  <td>{cust["Customer Name"]}</td>
                  <td>{cust["Segment"]}</td>
                  <td>{cust["Product"]}</td>
                  <td>{cust["Territory"]}</td>
                  <td>
                    <button
                      onClick={() => onAddCustomer(cust)}
                      disabled={isAdded}
                      className="button button-small button-add"
                    >
                      {isAdded ? "Added" : "Add"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="modal-footer">
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
        <button
          onClick={onClose}
          className="button button-primary button-close"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
const SearchField = ({
  label,
  field,
  criteria,
  handleValueChange,
  handleConditionChange,
}) => (
  <div className="search-field">
    {" "}
    <label className="form-label">{label}</label>{" "}
    <div className="search-field-inputs">
      {" "}
      <select
        value={criteria[field].condition}
        onChange={(e) => handleConditionChange(field, e.target.value)}
        className="form-select condition-select"
      >
        {" "}
        <option value="contains">Contains</option>{" "}
        <option value="equals">Equals</option>{" "}
      </select>{" "}
      {field === "status" ? (
        <select
          value={criteria[field].value}
          onChange={(e) => handleValueChange(field, e.target.value)}
          className="form-select value-select"
        >
          {" "}
          <option value="">Select</option>{" "}
          <option value="updated">Updated</option>{" "}
          <option value="deleted">Deleted</option>{" "}
          <option value="unchanged">Unchanged</option>{" "}
        </select>
      ) : (
        <input
          type={field === "calls" ? "number" : "text"}
          value={criteria[field].value}
          onChange={(e) => handleValueChange(field, e.target.value)}
          className="form-input value-input"
        />
      )}{" "}
    </div>{" "}
  </div>
);
function SearchModal({ onClose, onSearch }) {
  const initialCriteria = {
    status: { condition: "equals", value: "" },
    name: { condition: "contains", value: "" },
    id: { condition: "contains", value: "" },
    product: { condition: "contains", value: "" },
    segment: { condition: "contains", value: "" },
    refinedSegment: { condition: "contains", value: "" },
    territory: { condition: "contains", value: "" },
    team: { condition: "contains", value: "" },
    calls: { condition: "equals", value: "" },
  };
  const [criteria, setCriteria] = useState(initialCriteria);
  const handleValueChange = (field, value) => {
    setCriteria((prev) => ({ ...prev, [field]: { ...prev[field], value } }));
  };
  const handleConditionChange = (field, condition) => {
    setCriteria((prev) => ({
      ...prev,
      [field]: { ...prev[field], condition },
    }));
  };
  const handleSearch = () => {
    onSearch(criteria);
  };
  return (
    <Modal onClose={onClose} title="Search" size="medium">
      {" "}
      <div className="search-modal-grid">
        {" "}
        <SearchField
          label="Record Status"
          field="status"
          criteria={criteria}
          handleValueChange={handleValueChange}
          handleConditionChange={handleConditionChange}
        />{" "}
        <SearchField
          label="Customer Name"
          field="name"
          criteria={criteria}
          handleValueChange={handleValueChange}
          handleConditionChange={handleConditionChange}
        />{" "}
        <SearchField
          label="Customer ID"
          field="id"
          criteria={criteria}
          handleValueChange={handleValueChange}
          handleConditionChange={handleConditionChange}
        />{" "}
        <SearchField
          label="Product"
          field="product"
          criteria={criteria}
          handleValueChange={handleValueChange}
          handleConditionChange={handleConditionChange}
        />{" "}
        <SearchField
          label="Segment"
          field="segment"
          criteria={criteria}
          handleValueChange={handleValueChange}
          handleConditionChange={handleConditionChange}
        />{" "}
        <SearchField
          label="Refined Segment"
          field="refinedSegment"
          criteria={criteria}
          handleValueChange={handleValueChange}
          handleConditionChange={handleConditionChange}
        />{" "}
        <SearchField
          label="Territory"
          field="territory"
          criteria={criteria}
          handleValueChange={handleValueChange}
          handleConditionChange={handleConditionChange}
        />{" "}
        <SearchField
          label="Team"
          field="team"
          criteria={criteria}
          handleValueChange={handleValueChange}
          handleConditionChange={handleConditionChange}
        />{" "}
        <SearchField
          label="Calls"
          field="calls"
          criteria={criteria}
          handleValueChange={handleValueChange}
          handleConditionChange={handleConditionChange}
        />{" "}
      </div>{" "}
      <div className="modal-footer spaced">
        {" "}
        <button onClick={onClose} className="button button-outline">
          Cancel
        </button>{" "}
        <button onClick={handleSearch} className="button button-primary">
          Search
        </button>{" "}
      </div>{" "}
    </Modal>
  );
}

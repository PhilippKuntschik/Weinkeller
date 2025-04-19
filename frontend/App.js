import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AddProducer from './views/AddProducer';
import AllProducers from './views/AllProducers';
import AddWine from './views/AddWine';
import AllWines from './views/AllWines';
import AddToInventory from './views/AddToInventory';
import ConsumeWine from './views/ConsumeWine';
import InventoryOverview from './views/InventoryOverview';
import AllAssessments from './views/AllAssessments';
import AssessmentForm from './views/AssessmentForm';
import ImportExport from './views/ImportExport';
import WineAnalytics from './views/WineAnalytics';
import LanguageSwitcher from './components/LanguageSwitcher';
import './i18n';
import './styles/navbar.css';
import './styles/footer.css';

// Import Google Fonts
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

function App() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">Weinkeller</Link>
        
        <button 
          className={`navbar-toggle ${mobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        
        <div className={`navbar-container ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-links main-links">
            <li>
              <Link to="/all-producers" onClick={handleLinkClick}>{t('producers')}</Link>
            </li>
            
            <li>
              <Link to="/all-wines" onClick={handleLinkClick}>{t('wines')}</Link>
            </li>
            
            <li>
              <Link to="/inventory-overview" onClick={handleLinkClick}>{t('inventory')}</Link>
            </li>

            <li>
              <Link to="/wine-analytics" onClick={handleLinkClick}>{t('analytics')}</Link>
            </li>

            <li>
              <Link to="/all-assessments" onClick={handleLinkClick}>{t('assessments')}</Link>
            </li>
            
            <li>
              <Link to="/import-export" onClick={handleLinkClick}>{t('importExport')}</Link>
            </li>

          </ul>
        </div>
        
        <LanguageSwitcher />
      </nav>
      
      <main className="page animate-fade-in">
        <Routes>
          <Route path="/" element={<Navigate to="/inventory-overview" replace />} />
          <Route path="/add-producer" element={<AddProducer />} />
          <Route path="/all-producers" element={<AllProducers />} />
          <Route path="/edit-producer/:id" element={<AddProducer />} />
          <Route path="/add-wine" element={<AddWine />} />
          <Route path="/all-wines" element={<AllWines />} />
          <Route path="/edit-wine/:id" element={<AddWine />} />
          <Route path="/add-to-inventory" element={<AddToInventory />} />
          <Route path="/consume-wine" element={<ConsumeWine />} />
          <Route path="/inventory-overview" element={<InventoryOverview />} />
          <Route path="/all-assessments" element={<AllAssessments />} />
          <Route path="/add-assessment" element={<AssessmentForm />} />
          <Route path="/edit-assessment/:id" element={<AssessmentForm />} />
          <Route path="/import-export" element={<ImportExport />} />
          <Route path="/wine-analytics" element={<WineAnalytics />} />
        </Routes>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p className="text-center text-wine-light">
            &copy; {new Date().getFullYear()} Weinkeller - {t('wineManagementApp')}
          </p>
        </div>
      </footer>
    </Router>
  );
}

export default App;

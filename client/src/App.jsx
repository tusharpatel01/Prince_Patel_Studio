import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import RequirementBuilder from './pages/RequirementBuilder';
import BudgetEstimator from './pages/BudgetEstimator';
import Pricing from './pages/Pricing';
import AdminRoot from './admin/AuthContext';
import AdminLayout from './admin/AdminLayout';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import Inquiries from './admin/Inquiries';
import InquiryDetail from './admin/InquiryDetail';
import Quotes from './admin/Quotes';
import QuoteEditor from './admin/QuoteEditor';
import Analytics from './admin/Analytics';
import Resource from './admin/Resource';
import { configs } from './admin/configs';
import Media from './admin/Media';
import Settings from './admin/Settings';
import EstimatorEditor from './admin/EstimatorEditor';
import ProjectPreview from './admin/ProjectPreview';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import RequestQuote from './pages/RequestQuote';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Gallery from './pages/Gallery';
import PlotFinder from './pages/PlotFinder';
import { About, Process, FAQ, Privacy, Terms } from './pages/Static';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminRoot />}>
        <Route path="login" element={<Login />} />
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="inquiries/:id" element={<InquiryDetail />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="quotes/:id" element={<QuoteEditor />} />
          <Route path="analytics" element={<Analytics />} />
          {Object.values(configs).map((c) => <Route key={c.path} path={c.path} element={<Resource key={c.path} cfg={c} />} />)}
          <Route path="projects/:id/preview" element={<ProjectPreview />} />
          <Route path="media" element={<Media />} />
          <Route path="settings" element={<Settings />} />
          <Route path="estimator" element={<EstimatorEditor />} />
        </Route>
      </Route>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="requirement-builder" element={<RequirementBuilder />} />
        <Route path="budget-estimator" element={<BudgetEstimator />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="contact" element={<Contact />} />
        <Route path="request-quote" element={<RequestQuote />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:slug" element={<ServiceDetail />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="floor-plans" element={<Gallery kind="plan" title="2D Floor Plan Gallery" intro="Layouts that show how rooms connect." />} />
        <Route path="elevations" element={<Gallery kind="elevation" title="3D Elevation Gallery" intro="How the outside of a house can look." />} />
        <Route path="plot-finder" element={<PlotFinder />} />
        <Route path="about" element={<About />} />
        <Route path="process" element={<Process />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

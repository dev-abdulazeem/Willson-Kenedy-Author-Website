import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import About from './pages/About';
import Blog from './pages/Blog';
import PostDetail from './pages/PostDetail';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminPosts from './pages/admin/AdminPosts';
import AdminSite from './pages/admin/AdminSite';
import AdminSubscribers from './pages/admin/AdminSubscribers';

// Layout wrapper that conditionally shows navbar/footer
function Layout({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/books" element={<Layout><Books /></Layout>} />
      <Route path="/books/:slug" element={<Layout><BookDetail /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/blog" element={<Layout><Blog /></Layout>} />
      <Route path="/blog/:slug" element={<Layout><PostDetail /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      
      {/* Admin Routes — NO navbar, NO footer */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/books" element={<AdminBooks />} />
      <Route path="/admin/posts" element={<AdminPosts />} />
      <Route path="/admin/site" element={<AdminSite />} />
      <Route path="/admin/subscribers" element={<AdminSubscribers />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
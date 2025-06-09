import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from './components/Layout';
import HomePage from './components/pages/HomePage';
import NotFound from './pages/NotFound';
import { routes } from './config/routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
<Route index element={<HomePage />} />
          {Object.values(routes).map(route => (
            <Route 
              key={route.id}
              path={route.path}
              element={<route.component />}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="z-[9999]"
        toastClassName="shadow-lg"
        progressClassName="bg-primary"
      />
    </BrowserRouter>
  )
}

export default App
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
    </div>
  );
}

export default Layout;
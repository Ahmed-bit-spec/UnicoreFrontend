// LandingLayout.jsx
import { Outlet } from "react-router-dom";
import LandingHeader from "../components/LandingHeader";
import LandingFooter from "../components/LandingFooter";

const LandingLayout = () => (
  <div className="min-h-screen text-gray-900 dark:text-white overflow-x-hidden bg-white  transition-colors duration-300">
    <LandingHeader />
    <main>
      <Outlet />
    </main>
    <LandingFooter />
  </div>
);

export default LandingLayout;
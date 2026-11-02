import { Outlet } from "react-router";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ProjectModalProvider from "@/components/ProjectModalProvider";

export default function SiteLayout() {
  return (
    <>
      <Header />
      <Sidebar />
      <div className="lg:pl-60">
        <ProjectModalProvider>
          <div className="content-wrapper">
            <Outlet />
          </div>
        </ProjectModalProvider>
        <Footer />
      </div>
    </>
  );
}

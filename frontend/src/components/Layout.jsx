import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="flex">
      <Navbar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}
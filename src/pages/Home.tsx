import Navbar from "../components/Navbar";
import ProductList from "../components/ProductList";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="pt-10 flex flex-col items-center px-4">
        <h1 className="text-3xl font-bold mb-6">Gestion de stock</h1>
        <ProductList />
      </div>
    </div>
  );
}

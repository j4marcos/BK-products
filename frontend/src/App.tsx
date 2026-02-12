import { DashboardSection } from "@/components/sections/DashboardSection";
import { OrdersSection } from "@/components/sections/OrdersSection";
import { ProductsSection } from "@/components/sections/ProductsSection";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Seção 1 — Dashboard */}
        <DashboardSection />

        {/* Seção 2 — Pedidos */}
        <OrdersSection />

        {/* Seção 3 — Produtos e Custos */}
        <ProductsSection />
      </div>
    </div>
  );
}

export default App;

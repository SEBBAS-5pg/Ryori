// src/app/admin/new/page.tsx

// 1. Importa el componente que acabamos de crear
import RecipeForm from "@/components/RecipeForm";

// 2. Esta página ahora es un Componente de Servidor (simple)
export default function NewRecipePage() {
  
  // 3. Simplemente renderiza el componente de formulario
  return (
    <RecipeForm />
  );
}
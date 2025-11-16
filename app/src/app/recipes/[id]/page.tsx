// src/app/recipes/[id]/page.tsx
import apiClient from "@/lib/axios-internal";
import Link from "next/link";
import { notFound } from "next/navigation";

// --- (Interfaces sin cambios) ---
interface Ingredient {
  ID: number;
  name: string;
  quantity: string;
}
interface Step {
  ID: number;
  step_number: number;
  instructions: string;
}
interface RecipeDetails {
  ID: number;
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  image_path: string;
  ingredients: Ingredient[];
  steps: Step[];
  categories: Category[];
}
interface Category {
  ID: number;
  Name: string;
}
// --- (getRecipeDetails sin cambios) ---
async function getRecipeDetails(id: string) {
  try {
    const response = await apiClient.get<RecipeDetails>(`/recipes/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      notFound();
    }
    console.error("Error fetching recipe details:", error);
    notFound();
  }
}

// --- ¡LA CORRECCIÓN ESTÁ AQUÍ! ---

// 1. Cambiamos el 'tipo' de params. Le decimos a TypeScript
//    que 'params' es una PROMESA que se resolverá a un objeto.
export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  
  // 2. ¡Usamos 'await' para 'desenvolver' la promesa!
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // 3. Ahora que SÍ tenemos el 'id', llamamos a la función
  const recipe = await getRecipeDetails(id);

  // --- (El resto del componente 'return' es idéntico) ---
  const sortedSteps = recipe.steps.sort((a, b) => a.step_number - b.step_number);

  return (
    <main className="container mx-auto p-8 max-w-4xl">
      <Link href="/" className="text-green-500 hover:text-green-400 mb-6 block">
        &larr; Volver a todas las recetas
      </Link>

      {recipe.image_path && (
        <div className="w-full h-96 md:h-[400px] relative rounded-lg overflow-hidden mb-8"> 
          <img
            src={`http://localhost:8080${recipe.image_path}`}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover" 
          />
        </div>
      )}
      
      <h1 className="text-4xl font-bold text-white mb-4">{recipe.title}</h1>
      <p className="text-lg text-gray-400 mb-6">{recipe.description}</p>
       <div className="flex flex-wrap gap-2 mb-8">
          {recipe.categories && recipe.categories.map((category) => (
            <span
              key={category.ID}
              className="bg-green-600 text-white px-3 py-1 rounded-full text-sm"
            >
              {category.Name}
            </span>
          ))}
        </div>
      <div className="flex space-x-8 mb-8 text-gray-300">
        <div>
          <span className="font-semibold">Preparación: </span>
          {recipe.prep_time} min
        </div>
        <div>
          <span className="font-semibold">Cocción: </span>
          {recipe.cook_time} min
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">Ingredientes</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            {recipe.ingredients.map((ing) => (
              <li key={ing.ID}>
                {ing.quantity} {ing.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold text-white mb-4">Pasos</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-300">
            {sortedSteps.map((step) => (
              <li key={step.ID} className="ml-4">
                {step.instructions}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
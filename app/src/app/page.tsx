// src/app/page.tsx
import Link from "next/link";
import apiClient from "@/lib/axios-internal"; // Importamos nuestro cliente axios

// 1. Definimos el tipo de dato para una Receta (solo lo que esperamos)
interface Recipe {
  ID: number;
  title: string;
  description: string;
  image_path: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

// 2. Función para obtener los datos desde el API
// Next.js la manejará en el servidor y pondrá en caché el resultado
async function getRecipes(category?: string) {
  try {
    let url = "/recipes";
    if (category) {
      url += `?category=${category}`;
    }
    const response = await apiClient.get<Recipe[]>(url);

    return response.data;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

// funcion para cargar las categorias
async function getCategories() {
  try {
    const response = await apiClient.get<{ ID: number; Name: string }[]>(
      "/categories"
    );
    return response.data; // Esto
  } catch (error) {
    console.error("Error fetching categories:", error);
    return []; // Retornamos un array vacío en caso de error
  }
}

// 3. Este es el componente de la página (¡es async!)
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedCategory = resolvedSearchParams.category;
  const [recipes, categories] = await Promise.all([
    getRecipes(selectedCategory),
    getCategories(),
  ]);

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-center items-center mb-8">
        <h1 className="text-4xl font-bold text-green-500">Ryori Recetario</h1>
      </div>
      <div className="flex justify-center mb-6">
        <Link
          href="/admin/new"
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          + Crear Receta
        </Link>
      </div>
      <div className="flex justify-center flex-wrap gap-3 mb-10">
        <Link
          href="/"
          className={`px-4 py-2 rounded-full font-semibold ${
            !selectedCategory
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            key={category.ID}
            href={`/?category=${category.Name}`}
            className={`px-4 py-2 rounded-full font-semibold ${
              selectedCategory === category.Name
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {category.Name}
          </Link>
        ))}
      </div>

      {/* Grid de Recetas (sin cambios) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <Link
              href={`/recipes/${recipe.ID}`}
              key={recipe.ID}
              className="block bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors overflow-hidden"
            >
              {recipe.image_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`http://localhost:8080${recipe.image_path}`}
                  alt={recipe.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2 text-white">
                  {recipe.title}
                </h2>
                <p className="text-gray-400">{recipe.description}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">
            No se encontraron recetas (o ninguna en esta categoría).
          </p>
        )}
      </div>

      {/* (Eliminamos el 'div' del botón que estaba aquí abajo) */}
    </main>
  );
}

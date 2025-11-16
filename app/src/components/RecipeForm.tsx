// src/components/RecipeForm.tsx

"use client"; // ¡Importante! Este componente maneja estado

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import Link from "next/link";

// (Tipos de datos... sin cambios)
type IngredientField = {
  name: string;
  quantity: string;
};

type StepField = {
  instructions: string;
};

type Category = {
  ID: number;
  Name: string;
};

// ¡El componente ahora se llama RecipeForm!
export default function RecipeForm() {
  const router = useRouter();

  // --- (Todos los 'useState' son idénticos a antes) ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [ingredients, setIngredients] = useState<IngredientField[]>([
    { name: "", quantity: "" },
  ]);
  const [steps, setSteps] = useState<StepField[]>([{ instructions: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- (Todas las funciones 'handle' y 'add' son idénticas) ---
  const handleIngredientChange = (
    index: number,
    field: keyof IngredientField,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };
  const addIngredientField = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };
  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].instructions = value;
    setSteps(newSteps);
  };
  const addStepField = () => {
    setSteps([...steps, { instructions: "" }]);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIDs, setSelectedCategoryIDs] = useState<number[]>([]);

  // useEffect para cargar categorias
  useEffect(() => {
    // Función async para cargar las categorías
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<Category[]>("/categories");
        setAllCategories(response.data);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    fetchCategories(); // Llama a la función
  }, []);

  // --- (La función 'handleSubmit' es idéntica) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!image) {
      setError("Por favor, selecciona una imagen.");
      setLoading(false);
      return;
    }
    const categoriesToLink = selectedCategoryIDs.map((id) => ({ ID: id }));

    const recipeData = {
      title,
      description,
      prep_time: Number(prepTime),
      cook_time: Number(cookTime),
      steps: steps.map((step, index) => ({
        step_number: index + 1,
        instructions: step.instructions,
      })),
      ingredients: ingredients,
      categories: categoriesToLink,
    };

    try {
      // PASO 1: Subir texto
      const recipeResponse = await apiClient.post("/recipes", recipeData);
      const newRecipeId = recipeResponse.data.ID;

      // PASO 2: Subir imagen
      const formData = new FormData();
      formData.append("image", image);

      await apiClient.post(`/recipes/${newRecipeId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // PASO 3: Redirigir
      router.push(`/recipes/${newRecipeId}`);
    } catch (err: any) {
      console.error(err);
      setError("Hubo un error al crear la receta. Revisa la consola.");
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryID: number) => {
    setSelectedCategoryIDs((prevIDs) => {
      if (prevIDs.includes(categoryID)) {
        return prevIDs.filter((id) => id !== categoryID);
      } else {
        return [...prevIDs, categoryID];
      }
    });
  };



  // --- (El JSX es idéntico, solo que no está dentro de un 'page') ---
  // Usamos <main> aquí para mantener el layout
  return (
    <main className="container mx-auto p-8 max-w-3xl">
      <Link href="/" className="text-green-500 hover:text-green-400 mb-6 block">
        &larr; Volver al inicio
      </Link>

      <h1 className="text-4xl font-bold text-white mb-8">Crear Nueva Receta</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- Sección Principal (sin cambios) --- */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          {/* ... (Título, Descripción, Tiempos, Imagen) ... */}
           <h2 className="text-2xl font-semibold text-white">
            Información Básica
          </h2>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300"
            >
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300"
            >
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label
                htmlFor="prepTime"
                className="block text-sm font-medium text-gray-300"
              >
                Tiempo Prep (min)
              </label>
              <input
                type="number"
                id="prepTime"
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                required
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="cookTime"
                className="block text-sm font-medium text-gray-300"
              >
                Tiempo Cocción (min)
              </label>
              <input
                type="number"
                id="cookTime"
                value={cookTime}
                onChange={(e) => setCookTime(Number(e.target.value))}
                required
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-300"
            >
              Imagen de Portada
            </label>
            <input
              type="file"
              id="image"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              required
              className="mt-1 block w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700"
            />
          </div>
        </div>

        {/* --- Sección Categorías --- */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h2 className="text-2xl font-semibold text-white">Categorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allCategories.length > 0 ? (
              allCategories.map((category) => (
                <label 
                  key={category.ID} 
                  className="flex items-center space-x-2 text-gray-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-green-600 focus:ring-green-500"
                    onChange={() => handleCategoryChange(category.ID)}
                    checked={selectedCategoryIDs.includes(category.ID)}
                  />
                  {/* <-- ¡CAMBIO AQUÍ! (de 'category.name' a 'category.Name') */}
                  <span>{category.Name}</span> 
                </label>
              ))
            ) : (
              <p className="text-gray-500">Cargando categorías...</p>
            )}
          </div>
        </div>

        {/* --- Sección Ingredientes (sin cambios) --- */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          {/* ... (JSX de Ingredientes) ... */}
           <h2 className="text-2xl font-semibold text-white">Ingredientes</h2>
          {ingredients.map((ing, index) => (
            <div key={index} className="flex space-x-4">
              <input
                type="text"
                placeholder="Cantidad (ej. 2 tazas)"
                value={ing.quantity}
                onChange={(e) =>
                  handleIngredientChange(index, "quantity", e.target.value)
                }
                required
                className="block w-1/3 bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2"
              />
              <input
                type="text"
                placeholder="Nombre (ej. Harina)"
                value={ing.name}
                onChange={(e) =>
                  handleIngredientChange(index, "name", e.target.value)
                }
                required
                className="block w-2/3 bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredientField}
            className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md"
          >
            + Añadir Ingrediente
          </button>
        </div>

        {/* --- Sección Pasos (sin cambios) --- */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          {/* ... (JSX de Pasos) ... */}
           <h2 className="text-2xl font-semibold text-white">Pasos</h2>
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4">
              <span className="text-gray-400 font-bold pt-2">{index + 1}.</span>
              <textarea
                placeholder="Instrucciones del paso..."
                value={step.instructions}
                onChange={(e) => handleStepChange(index, e.target.value)}
                required
                rows={2}
                className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addStepField}
            className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md"
          >
            + Añadir Paso
          </button>
        </div>

        {/* --- Botón de Envío (sin cambios) --- */}
        <div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md disabled:bg-gray-500"
          >
            {loading ? "Creando Receta..." : "Crear Receta"}
          </button>
        </div>
      </form>
    </main>
  );
}

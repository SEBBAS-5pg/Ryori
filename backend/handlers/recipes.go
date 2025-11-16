package handlers

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/SEBBAS-5pg/ryori/backend/models"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

// DB variable para pasar la conexion a los handlers
var DB *gorm.DB                       // Variable global para la conexion GORM
var MongoCollection *mongo.Collection // Variable global para MongoDB

// Handler para POST/api/v1/recipes
func CreateRecipeHandler(w http.ResponseWriter, r *http.Request) {
	var recipe models.Recipe

	// Decodifica el cuerpo de la solicitud JSON
	if err := json.NewDecoder(r.Body).Decode(&recipe); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// GORM crea la receta
	if result := DB.Create(&recipe); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Responde con la receta creada (incluye el ID)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(recipe)
}

func GetRecipesHandler(w http.ResponseWriter, r *http.Request) {
	var recipes []models.Recipe
	query := DB.Model(&models.Recipe{})
	categoryName := r.URL.Query().Get("category")

	// lee el query param /api/v1/recipes?category
	if categoryName != "" {
		query = query.Joins("JOIN recipe_categories ON recipe_categories.recipe_id = recipes.id").
			Joins("JOIN categories ON categories.id = recipe_categories.category_id").
			Where("categories.name = ?", categoryName)
	}

	//Gorm encuentra todas las recetas
	if result := query.Find(&recipes); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Si no hay recetas, devuelve el array vacio
	if len(recipes) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode([]models.Recipe{})
		return
	}

	// Obtener imagenes de MongoDB
	recipeIDs := make([]uint, len(recipes))
	for i, recipe := range recipes {
		recipeIDs[i] = recipe.ID
	}

	// Busca en Mongo todas las imagenes
	var imageDocs []models.RecipeImage
	filter := bson.M{"recipe_sql_id": bson.M{"$in": recipeIDs}}

	cursor, err := MongoCollection.Find(context.TODO(), filter)

	// --- ¡ESTA ES LA LÓGICA CORREGIDA! ---
	if err == nil {

		if err = cursor.All(context.TODO(), &imageDocs); err != nil {
			// ...manejamos el error de decodificación
			log.Printf("Error al decodificar imagenes de Mongo: %v", err)
		}
	} else {
		// ...manejamos el error de la búsqueda (Find)
		log.Printf("Error al buscar imagenes en Mongo: %v", err)
	}

	// Mapea las imagenes a las recetas
	imageMap := make(map[uint]string)
	for _, img := range imageDocs {
		imageMap[img.RecipeSQLID] = img.ImagePath
	}

	// Adjunta las rutas de imagenes con las recetas
	for i := range recipes {
		if path, ok := imageMap[recipes[i].ID]; ok {
			recipes[i].ImagePath = path
		}
	}

	// Responde con el JSON fusionado
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(recipes)

}

// Handler para GET/api/v1/recipes/{id}
func GetRecipeHandler(w http.ResponseWriter, r *http.Request) {
	// Obtenemos el {id} de la URL
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid recipe ID", http.StatusBadRequest)
		return
	}

	var recipe models.Recipe

	// Usamos GORM para encontrar la receta por ID.
	// ¡Usamos Preload() para cargar automáticamente las relaciones!
	if result := DB.Preload("Ingredients").Preload("Steps").Preload("Categories").First(&recipe, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Recipe not found", http.StatusNotFound)
		} else {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Busca en Mongo un documento 'recipe_sql_id'
	var imageDoc models.RecipeImage
	// Usa bson.M para la consulta
	filter := bson.M{"recipe_sql_id": uint(id)}

	// FindOne devuelve el resultado
	// Err() sera nulo si lo encuentra
	err = MongoCollection.FindOne(context.TODO(), filter).Decode(&imageDoc)

	if err == nil {
		// Si se encuentra la ruta
		recipe.ImagePath = imageDoc.ImagePath
	} else if err != mongo.ErrNoDocuments {
		// Se loguea el error
		log.Printf("Error al buscar imagen en Mongo: %v", err)
	}

	// Responde con el JSON fusinado
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(recipe)

}

func UploadRecipeImageHandler(w http.ResponseWriter, r *http.Request) {
	// Obtiene el ID de la receta de la URL
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid recipe ID", http.StatusBadRequest)
		return
	}

	// Parsea el formulario (max 10MB de tamaño de imagen)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Could not parse multipart form", http.StatusBadRequest)
		return
	}
	// Obtiene el archivo del formulario
	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Could not get uploaded file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Crea un nombre de archivo unico
	ext := filepath.Ext(handler.Filename)
	newFilename := uuid.New().String() + ext

	// Definir la ruta de deestino (backend/upoads/uuid-aleatorio.png)
	dsPath := filepath.Join("uploads", newFilename)

	// Crea el archivo en el servidor
	dst, err := os.Create(dsPath)
	if err != nil {
		http.Error(w, "Could not create file on server", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copia el contenido del archivo subido al archivo de destino
	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Error saving the file", http.StatusInternalServerError)
		return
	}

	// Guarda la metadata en MongoDB
	// (/uploads/) es el URL publico
	webPath := "/uploads/" + newFilename
	imageDoc := models.RecipeImage{
		RecipeSQLID: uint(id),
		ImagePath:   webPath,
	}

	// por simplicidad usa context.TODO()
	_, err = MongoCollection.InsertOne(context.TODO(), imageDoc)
	if err != nil {
		http.Error(w, "Error saving image metadata", http.StatusInternalServerError)
		return
	}

	// Responde con exito
	log.Printf("Imagen subida para receta %d: %s", id, webPath)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Image uploaded successfully",
		"path":    webPath,
	})
}

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	// Tus handlers locales
	"github.com/SEBBAS-5pg/ryori/backend/handlers"
	"github.com/SEBBAS-5pg/ryori/backend/models"

	// Paquete de CORS con el alias 'cors'
	cors "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// responde con unJSON para verificar que el API esta viva
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	// Establece el tipo de contenido JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Preparamos la respuesta
	response := map[string]string{
		"status":  "ok",
		"message": "API de Ryori is healtycheck",
	}

	// Envia la respuesta
	json.NewEncoder(w).Encode(response)
}

func initDatabase() {
	var err error

	godotenv.Load() // Carga variables de entorno

	// Leemos las variables de entorno
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	// Creamos el "DNS" (data source Name) para Postgres
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		dbHost, dbUser, dbPassword, dbName, dbPort)

	// Conectamos a la base de datos
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	log.Println("Database (PostgreSQL) successfully connected.")

	err = db.AutoMigrate(&models.Recipe{}, &models.Category{}, &models.Ingredient{}, &models.Step{})
	if err != nil {
		log.Fatal("Database migrated successfully.", err)
	}

	log.Println("Database migrated successfully.")

	handlers.DB = db // Pasamos la conexion a los handlers
}

func initMongo() {
	godotenv.Load()
	mongoURI := os.Getenv("MONGO_URI")
	mongoDBName := os.Getenv("MONGO_DB_NAME")

	if mongoURI == "" || mongoDBName == "" {
		log.Fatal("MONGO_URI y MONGO_DB_NAME deben estar en el .env")
	}

	// Establece conexion
	client, err := mongo.NewClient(options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Error al crear cliente de Mongo:", err)
	}
	// Conecta un Timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal("Error al conectar a Mongo:", err)
	}

	// Verifica conexion (ping)
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Error al hacer Ping a Mongo:", err)
	}

	log.Println("Database (MongoDB) successfully connected.")

	// Pasa la colleccion a los handlers
	// collection llamada "images"
	collection := client.Database(mongoDBName).Collection("images")
	handlers.MongoCollection = collection
}

func main() {

	initDatabase() // COnecta Postgres
	initMongo()    // Conecta Mongo

	// Crea un nuevo router
	r := mux.NewRouter()
	// sub-router para /api/v1
	api := r.PathPrefix("/api/v1").Subrouter()

	// Rutas de Recetas
	api.HandleFunc("/recipes", handlers.CreateRecipeHandler).Methods("POST")
	api.HandleFunc("/recipes", handlers.GetRecipesHandler).Methods("GET")
	api.HandleFunc("/recipes/{id:[0-9]+}", handlers.GetRecipeHandler).Methods("GET")

	// Ruta Imagenes
	api.HandleFunc("/recipes/{id:[0-9]+}/upload", handlers.UploadRecipeImageHandler).Methods("POST")

	// Rutas de Categorias
	api.HandleFunc("/categories", handlers.CreateCategoryHandler).Methods("POST")
	api.HandleFunc("/categories", handlers.GetCategoriesHandler).Methods("GET")

	// path "./uploads/"
	fileServer := http.FileServer(http.Dir("./uploads/"))
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", fileServer))
	// Definimos nuestro enpoint de prueba
	r.HandleFunc("/health", healthCheckHandler).Methods("GET")

	// Configura CORS
	allowedOrigins := cors.AllowedOrigins([]string{"http://localhost:3000"})
	allowedMethods := cors.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"})
	allowedHeaders := cors.AllowedHeaders([]string{"Content-Type"})

	log.Println("Runing Server in http://localhost:8080")

	log.Fatal(http.ListenAndServe(":8080", cors.CORS(allowedOrigins, allowedMethods, allowedHeaders)(r)))
}

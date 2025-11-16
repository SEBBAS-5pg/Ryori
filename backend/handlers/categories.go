package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/SEBBAS-5pg/ryori/backend/models"
)

// Handler para POST /api/v1/categories
func CreateCategoryHandler(w http.ResponseWriter, r *http.Request) {
	var category models.Category

	// Decodifica el JSON
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// GORM la crea en la base de datos (postgres
	if result := DB.Create(&category); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Respondemos con la categoria creada
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(category)
}

// Handler para GET /api/v1/categories
func GetCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	var categories []models.Category

	// Buscamos todas las categorias
	if result := DB.Find(&categories); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(categories)

}

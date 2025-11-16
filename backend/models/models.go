package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"gorm.io/gorm"
)

// gorm.model añade campos: ID, CreateAt, ...

// Recipe (receta)
type Recipe struct {
	gorm.Model
	Title       string `json:"title"`
	Description string `json:"description"`
	PrepTime    int    `json:"prep_time"` // tiempo min
	CookTime    int    `json:"cook_time"` // tiempo min

	// "adjunta" la imagen
	ImagePath string `gorm:"-" json:"image_path,omitempty"`
	// --- relaciones ----
	// Una receta tiene muchos ingredientes
	Ingredients []Ingredient `json:"ingredients"`
	// Una receta tiene muchos pasos
	Steps []Step `json:"steps"`
	// una Receta pertenece a muchas categorias
	Categories []Category `gorm:"many2many:recipe_categories;" json:"categories"`
}

// Category (categoria)
type Category struct {
	gorm.Model
	Name string `json:"Name"`
}

// ingredient (ingredtiente)
type Ingredient struct {
	gorm.Model
	Name     string `json:"name"`
	Quantity string `json:"quantity"`
	RecipeID uint   `json:"recipe_id"` // clave foranea para Recipe
}

// Step (paso)
type Step struct {
	gorm.Model
	StepNumber   int    `json:"step_number"`
	Instructions string `json:"instructions"`
	RecipeID     uint   `json:"recipe_id"` // Clave foranea para Recipe
}

type RecipeImage struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	RecipeSQLID uint               `bson:"recipe_sql_id" json:"recipe_sql_id"`
	ImagePath   string             `bson:"image_path" json:"image_path"`
}

// recipe_categories (tabla pivote)
// GORM la crea automaticamente por la etiqueta many2many en Recipe

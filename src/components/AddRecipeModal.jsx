import { useState } from "react";
//import recipeApi from "../api/recipe";

export default function AddRecipeModal({ onClose, onSubmit }) {

  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [servings, setServings] = useState("");
  const [instructions, setInstructions] = useState("");
  const [keywords, setKeywords] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState("dinner");
  const [visibility, setVisibility] = useState("public");

  const [ingredients, setIngredients] = useState([
    { name: "", amount: "", unit: "" },
  ]);

  function normalizeTime(t) {
    if (!t) return "00:00:00";
    return t + ":00";
  }

  function updateIngredient(index, field, value) {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  }

  function addIngredient() {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  }

  function removeIngredient(index) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("recipe_name", recipeName);
    formData.append("description", description);
    formData.append("cooking_time", normalizeTime(cookingTime));
    formData.append("total_time", normalizeTime(totalTime));
    formData.append("servings", Number(servings));
    formData.append(
      "ingredients",
      JSON.stringify(
        ingredients.map((ing) => ({
          name: ing.name,
          amount: Number(ing.amount),
          unit: ing.unit,
        }))
      )
    );
    formData.append("instructions", instructions);
    if (keywords) formData.append("keywords", keywords);
    formData.append("visibility", visibility);
    formData.append("category", category);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    onSubmit(formData);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-xl relative overflow-y-auto max-h-[90vh]">

        <button
          className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4">Add New Recipe</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Recipe name"
            className="border rounded-lg px-3 py-2"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            required
          />

          <textarea
            placeholder="Description"
            className="border rounded-lg px-3 py-2"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="font-semibold text-gray-700">Cooking Time</label>
          <input
            type="time"
            className="border rounded-lg px-3 py-2"
            value={cookingTime}
            onChange={(e) => setCookingTime(e.target.value)}
            required
          />

          <label className="font-semibold text-gray-700">Total Time</label>
          <input
            type="time"
            className="border rounded-lg px-3 py-2"
            value={totalTime}
            onChange={(e) => setTotalTime(e.target.value)}
            required
          />

          <input
            type="number"
            min="1"
            className="border rounded-lg px-3 py-2"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="Servings"
            required
          />

          <div>
            <label className="font-semibold">Ingredients:</label>

            {ingredients.map((ing, index) => (
              <div key={index} className="flex gap-2 mt-2">

                <input
                  type="text"
                  placeholder="Name"
                  className="border rounded-lg px-3 py-2 flex-1"
                  value={ing.name}
                  onChange={(e) =>
                    updateIngredient(index, "name", e.target.value)
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Amount"
                  className="border rounded-lg px-3 py-2 w-24"
                  value={ing.amount}
                  onChange={(e) =>
                    updateIngredient(index, "amount", e.target.value)
                  }
                  required
                />

                <select
                  className="border rounded-lg px-3 py-2 w-24"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                  required
                >
                  <option value="">Unit</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="tsp">tsp</option>
                  <option value="tbsp">tbsp</option>
                  <option value="cup">cup</option>
                  <option value="pcs">pcs</option>
                </select>

                {ingredients.length > 1 && (
                  <button
                    type="button"
                    className="text-red-500 font-bold"
                    onClick={() => removeIngredient(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="mt-2 text-black underline"
              onClick={addIngredient}
            >
              + Add Ingredient
            </button>
          </div>

          <textarea
            placeholder="Instructions"
            className="border rounded-lg px-3 py-2"
            rows={5}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Keywords (optional)"
            className="border rounded-lg px-3 py-2"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-semibold text-gray-700">Category</label>
              <select
                className="mt-1 border rounded-lg px-3 py-2 w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="font-semibold text-gray-700">Visibility</label>
              <select
                className="mt-1 border rounded-lg px-3 py-2 w-full"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <label className="font-semibold text-gray-700">Recipe Image</label>
          <input
            type="file"
            accept="image/*"
            className="border rounded-lg px-3 py-2"
            onChange={(e) => setImageFile(e.target.files[0])}
            required
          />

          {imageFile && (
            <p className="text-sm text-gray-600">
              Selected: {imageFile.name}
            </p>
          )}

          <button
            type="submit"
            className="mt-4 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
          >
            Publish Recipe
          </button>
        </form>
      </div>
    </div>
  );
}

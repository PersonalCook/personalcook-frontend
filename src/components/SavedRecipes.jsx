import { useState, useMemo } from "react";
import SearchBar from "./SearchBar";
import FilterSidebar from "./FilterSidebar";
import RecipeCard from "./RecipeCard";
import CartModal from "./CartModal";
import RecipeDetailModal from "./RecipeDetailModal";

export default function SavedRecipes({ recipes }) {

  // SEARCH + FILTERING
  const [search, setSearch] = useState("");
  const [maxTime, setMaxTime] = useState(60);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

  // LIKE STATE (save je vedno true!)
  const [likedRecipes, setLikedRecipes] = useState([]);

  // CART MODAL
  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);

  // DETAIL MODAL
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // -------------------------
  function toggleCategory(cat) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  function timeToMinutes(t) {
    if (!t) return 999;
    const [h, m, s] = t.split(":").map(Number);
    return h * 60 + m + Math.floor((s || 0) / 60);
  }

  const filteredRecipes = useMemo(() => {
    let items = recipes || [];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(r => r.recipe_name.toLowerCase().includes(q));
    }

    if (selectedCategories.length > 0) {
      items = items.filter(r => selectedCategories.includes(r.category));
    }

    items = items.filter(r => timeToMinutes(r.total_time) <= maxTime);

    return items;
  }, [search, maxTime, selectedCategories, recipes]);

  function toggleLike(recipeId) {
    setLikedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  }

  function openCartModal(recipe) {
    setActiveCartRecipe(recipe);
    setShowCartModal(true);
  }

  function closeCartModal() {
    setActiveCartRecipe(null);
    setShowCartModal(false);
  }

  function openDetail(recipe) {
    setSelectedRecipe({
      ...recipe,
      isLiked: likedRecipes.includes(recipe.recipe_id),
      isSaved: true, // always saved
    });
  }

  function closeDetail() {
    setSelectedRecipe(null);
  }


  return (
    <div className="flex gap-6 px-8 py-6">

      <div className="flex-1 flex flex-col gap-6">
        <SearchBar search={search} setSearch={setSearch} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {filteredRecipes.map(r => (
            <RecipeCard
              key={r.recipe_id}
              recipe={r}

              onOpen={() => openDetail(r)}

              onToggleSave={() => {}} // saved = always true
              onToggleLike={() => toggleLike(r.recipe_id)}
              onOpenCart={() => openCartModal(r)}
              onOpenComments={() => openDetail(r)}

              isSaved={true}
              isLiked={likedRecipes.includes(r.recipe_id)}
            />
          ))}

          {filteredRecipes.length === 0 && (
            <p className="text-center text-gray-500 col-span-full py-10">
              No saved recipes found.
            </p>
          )}
        </div>
      </div>

      <FilterSidebar
        maxTime={maxTime}
        setMaxTime={setMaxTime}
        categories={categories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
      />

      {showCartModal && (
        <CartModal recipe={activeCartRecipe} onClose={closeCartModal} />
      )}

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={closeDetail}

          isLiked={likedRecipes.includes(selectedRecipe.recipe_id)}
          isSaved={true}

          onToggleLike={() => toggleLike(selectedRecipe.recipe_id)}
          onToggleSave={() => {}}
          onOpenCart={() => openCartModal(selectedRecipe)}
        />
      )}

    </div>
  );
}

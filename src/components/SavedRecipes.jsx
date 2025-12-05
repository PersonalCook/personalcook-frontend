import { useState, useMemo } from "react";
import SearchBar from "./SearchBar";
import FilterSidebar from "./FilterSideBar";
import RecipeCard from "./RecipeCard";
import CartModal from "./CartModal";      // <-- dodaj

export default function SavedRecipes({ recipes, onOpenRecipe }) {

  // SEARCH + FILTERING
  const [search, setSearch] = useState("");
  const [maxTime, setMaxTime] = useState(60);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

  // LIKE + SAVE
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);

  // CART MODAL STATE
  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);

  // COMMENTS PANEL
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // -------------------------
  function toggleCategory(cat) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  function timeToMinutes(timeStr) {
    if (!timeStr) return 999;
    const [h, m, s] = timeStr.split(":").map(Number);
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

  // -------------------------
  function toggleLike(recipeId) {
    setLikedRecipes(prev =>
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
  }

  function toggleSave(recipeId) {
    setSavedRecipes(prev =>
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
  }

  // ---------- CART MODAL ----------
  function openCartModal(recipe) {
    setActiveCartRecipe(recipe);
    setShowCartModal(true);
  }

  function closeCartModal() {
    setShowCartModal(false);
    setActiveCartRecipe(null);
  }

  // ---------- COMMENTS PANEL ----------
  function openComments(recipe) {
    setSelectedRecipe(recipe);
  }

  function closeComments() {
    setSelectedRecipe(null);
  }

  // -------------------------

  return (
    <div className="flex gap-6 px-8 py-6">

      {/* LEFT SIDE */}
      <div className="flex-1 flex flex-col gap-6">
        <SearchBar search={search} setSearch={setSearch} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map(r => (
            <RecipeCard
              key={r.recipe_id}
              recipe={r}
              onOpen={() => onOpenRecipe(r)}
              onToggleSave={() => toggleSave(r.recipe_id)}
              onToggleLike={() => toggleLike(r.recipe_id)}
              onOpenCart={() => openCartModal(r)}
              onOpenComments={() => onOpenRecipe(r)}
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

      {/* RIGHT SIDE — FILTERS */}
      <FilterSidebar
        maxTime={maxTime}
        setMaxTime={setMaxTime}
        categories={categories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
      />

      {/* 🚛 CART MODAL */}
      {showCartModal && (
        <CartModal recipe={activeCartRecipe} onClose={closeCartModal} />
      )}

      {/* 💬 COMMENTS PANEL */}
      {selectedRecipe && (
        <CommentsPanel recipe={selectedRecipe} onClose={closeComments} />
      )}

    </div>
  );
}



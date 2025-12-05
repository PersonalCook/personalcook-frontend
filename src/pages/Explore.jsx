import { useState, useMemo } from "react";
import { mockFeedRecipes } from "../mock";
import RecipeCard from "../components/RecipeCard";
import RecipeDetailModal from "../components/RecipeDetailModal";
import CartModal from "../components/CartModal";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSideBar";


export default function Explore() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [maxTime, setMaxTime] = useState(60);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

  const [savedRecipes, setSavedRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);

  const [showCartModal, setShowCartModal] = useState(false);
  const [activeCartRecipe, setActiveCartRecipe] = useState(null);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);


  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  // FILTER + SORT
  const visibleRecipes = useMemo(() => {
    let filtered = mockFeedRecipes;

    // SEARCH by recipe or author
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.recipe_name.toLowerCase().includes(q) ||
          r.author_name.toLowerCase().includes(q)
      );
    }

    // SORT newest first
    if (sortBy === "newest") {
      return [...filtered].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    if (sortBy === "alphabetical") {
      return [...filtered].sort((a, b) =>
        a.recipe_name.localeCompare(b.recipe_name)
      );
    }

    return filtered;
  }, [search, sortBy]);

  function toggleSave(recipeId) {
    setSavedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  
    // TODO: API request:
    // if (savedRecipes.includes(recipeId)) await recipeApi.delete("/saved", { recipeId })
    // else await recipeApi.post("/saved", { recipeId })
  }
  
  function toggleLike(recipeId) {
    setLikedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  
    // TODO API later
  }
  function openCartModal(recipe) {
    setActiveCartRecipe(recipe);
    setShowCartModal(true);
  }
  
  function closeCartModal() {
    setShowCartModal(false);
    setActiveCartRecipe(null);
  }

  return (
    <div className="flex gap-6 px-8 py-6">

      {/* LEFT SIDE: Search + cards */}
      <div className="flex-1 flex flex-col gap-6">

        {/* SEARCH BAR */}
        <SearchBar search={search} setSearch={setSearch} />

        {/* GRID RECIPE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.recipe_id}
              recipe={recipe}
              onOpen={() => {
                setSelectedRecipe(recipe);
                setShowCommentsPanel(false);  
              }}
              onToggleSave={() => toggleSave(recipe.recipe_id)}
              onToggleLike={() => toggleLike(recipe.recipe_id)}
              onOpenComments={() => {
                setSelectedRecipe(recipe);      
                setShowCommentsPanel(true);
              }}
              
              onOpenCart={() => openCartModal(recipe)}
              isSaved={savedRecipes.includes(recipe.recipe_id)}
              isLiked={likedRecipes.includes(recipe.recipe_id)}
            />
          ))}

          {visibleRecipes.length === 0 && (
            <div className="col-span-full text-gray-500 text-center py-10">
              No recipes found.
            </div>
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
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          showComments={showCommentsPanel}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
      {showCartModal && (
          <CartModal
            recipe={activeCartRecipe}
            onClose={closeCartModal}
          />
        )}

    </div>
  );
}




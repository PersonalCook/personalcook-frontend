import { useState } from "react";
import { mockFeedRecipes } from "../mock";

import {
  ChatBubbleOvalLeftEllipsisIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";

import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";

import RecipeDetailModal from "../components/RecipeDetailModal";


export default function Feed() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);

  function toggleSave(recipeId) {
    setSavedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  }

  function toggleLike(recipeId) {
    setLikedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  }

  const sortedFeed = [...mockFeedRecipes].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="px-6 py-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-6 text-gray-800">Following</h1>

      <div className="flex flex-col gap-8 pb-20">

        {sortedFeed.map((recipe) => (
          <div
            key={recipe.recipe_id}
            className="bg-gray-50 border border-gray-200 rounded-md shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
            onClick={() => setSelectedRecipe(recipe)}
          >
            {/* HEADER */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                {recipe.author_name?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-800">
                {recipe.author_name}
              </span>
            </div>

            {/* IMAGE */}
            <div className="w-full h-80 overflow-hidden">
              <img
                src={recipe.img}
                className="w-full h-full object-cover"
                alt={recipe.recipe_name}
              />
            </div>

            {/* CONTENT */}
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg text-gray-800 truncate">
                  {recipe.recipe_name}
                </p>

                {/* ACTION ICONS */}
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {savedRecipes.includes(recipe.recipe_id) ? (
                    <BookmarkSolid
                      onClick={() => toggleSave(recipe.recipe_id)}
                      className="h-5 w-5 text-blue-600 cursor-pointer transition"
                    />
                  ) : (
                    <BookmarkOutline
                      onClick={() => toggleSave(recipe.recipe_id)}
                      className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600 transition"
                    />
                  )}

                  {likedRecipes.includes(recipe.recipe_id) ? (
                    <HeartSolid
                      onClick={() => toggleLike(recipe.recipe_id)}
                      className="h-5 w-5 text-red-500 cursor-pointer transition"
                    />
                  ) : (
                    <HeartOutline
                      onClick={() => toggleLike(recipe.recipe_id)}
                      className="h-5 w-5 text-gray-400 cursor-pointer hover:text-red-400 transition"
                    />
                  )}

                  <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  <ShoppingCartIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </div>
              </div>

              {/* CAPTION */}
              {recipe.caption && (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {recipe.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ⬅️ RECIPE DETAIL MODAL */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}

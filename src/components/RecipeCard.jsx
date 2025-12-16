import {
    BookmarkIcon as BookmarkOutline,
    ChatBubbleOvalLeftEllipsisIcon,
    ShoppingCartIcon,
    HeartIcon as HeartOutline
  } from "@heroicons/react/24/outline";
  import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
  import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
  
  export default function RecipeCard({
    recipe,
    onOpen,
    onToggleSave,
    onToggleLike,
    onOpenComments,
    onOpenCart,
    isSaved,
    isLiked
  }) {
    const imageSrc =
      recipe.img ||
      recipe.image_url ||
      recipe.image ||
      recipe.imageUrl ||
      recipe.thumbnail ||
      recipe.thumbnail_url ||
      recipe.image_path ||
      recipe.imagePath ||
      recipe.photo ||
      recipe.photo_url ||
      (recipe.recipe && (recipe.recipe.img || recipe.recipe.image_url || recipe.recipe.image)) ||
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

    return (
      <div
        onClick={onOpen}
        className="bg-gray-50 border border-gray-200 rounded-md shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
      >
        {/* IMAGE */}
        <div className="h-40 w-full overflow-hidden">
          <img
            src={imageSrc}
            alt={recipe.recipe_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            }}
          />
        </div>
  
        {/* CONTENT */}
        <div className="p-4 flex flex-col gap-1">
          <h3 className="font-semibold text-lg truncate">
            {recipe.recipe_name}
          </h3>
  
          {/* Author + Icons */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 truncate">
              by {recipe.authorName}
            </p>
  
            <div
              className="flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* SAVE */}
              {isSaved ? (
                <BookmarkSolid
                  onClick={onToggleSave}
                  className="h-5 w-5 text-blue-500 cursor-pointer transition"
                />
              ) : (
                <BookmarkOutline
                  onClick={onToggleSave}
                  className="h-5 w-5 text-gray-400 cursor-pointer transition hover:text-blue-400"
                />
              )}
  
              {/* LIKE */}
              {isLiked ? (
                <HeartSolid
                  onClick={onToggleLike}
                  className="h-5 w-5 text-red-500 cursor-pointer transition"
                />
              ) : (
                <HeartOutline
                  onClick={onToggleLike}
                  className="h-5 w-5 text-gray-400 cursor-pointer transition hover:text-red-400"
                />
              )}
  
              {/* COMMENTS */}
              <ChatBubbleOvalLeftEllipsisIcon
                onClick={onOpenComments}
                className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
              />
  
              {/* CART */}
              <ShoppingCartIcon
                onClick={onOpenCart}
                className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
              />
            </div>
          </div>
  
          {/* CAPTION */}
          {recipe.caption && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {recipe.caption}
            </p>
          )}
        </div>
      </div>
    );
  }
  

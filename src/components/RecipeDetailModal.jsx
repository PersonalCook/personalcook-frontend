import { useEffect, useMemo, useState } from "react";
import {
  BookmarkIcon as BookmarkOutline,
  ShoppingCartIcon,
  HeartIcon as HeartOutline,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import socialApi from "../api/social";
import userApi from "../api/user";
import recipeApi from "../api/recipe";

export default function RecipeDetailModal({
  recipe,
  user,
  onClose,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onOpenCart,
}) {
  if (!recipe) return null;

  const recipeId = useMemo(() => recipe.id || recipe.recipe_id, [recipe]);
  const authorId = recipe.user_id ?? recipe.recipe?.user_id ?? recipe.author_id;
  const isMe = user && String(user.user_id) === String(authorId);

  // COMMENTS state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  // NEW COMMENT state
  const [commentContent, setCommentContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  // === NUTRITION STATE ===
  const [nutrition, setNutrition] = useState(null);
  const [nutritionView, setNutritionView] = useState("total"); // "total" | "per100g" | "perServing"
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState(null);

  // normalized ingredients for backend
  const nutritionIngredients = useMemo(() => {
    if (!Array.isArray(recipe.ingredients)) return [];
    return recipe.ingredients.map((ing) => ({
      name: ing.name,
      amount: Number(ing.amount ?? 0),
      unit: ing.unit || "g",
    }));
  }, [recipe.ingredients]);

  // pick active view (total, per100g, perServing)
  const activeNutrition = useMemo(() => {
    if (!nutrition) return null;

    if (nutritionView === "per100g") return nutrition.per_100g;
    if (nutritionView === "perServing") return nutrition.per_serving;
    return nutrition.totals;
  }, [nutrition, nutritionView]);

  const activeLabel =
    nutritionView === "per100g"
      ? "per 100 g of the prepared dish"
      : nutritionView === "perServing"
      ? "per 1 serving"
      : "for the whole dish";

  async function handleFetchNutrition() {
    if (!nutritionIngredients.length) return;

    setNutritionLoading(true);
    setNutritionError(null);

    try {
      const servings =
        recipe.servings && recipe.servings > 0 ? recipe.servings : 1;

      const res = await recipeApi.post(
        `/nutrition?servings=${servings}`,
        { ingredients: nutritionIngredients }
      );

      setNutrition(res.data);
      setNutritionView("total");
    } catch (err) {
      console.error("Error fetching nutrition:", err);
      setNutritionError("An error occurred while calculating nutrition.");
    } finally {
      setNutritionLoading(false);
    }
  }

  // FETCH comments on open / recipe change
  useEffect(() => {
    if (!recipeId) {
      setCommentsError(
        "Missing recipeId (recipe.id/recipe.recipe_id is undefined)"
      );
      return;
    }

    let isMounted = true;
    setComments([]);
    setCommentsError(null);

    (async () => {
      try {
        setCommentsLoading(true);

        // GET comments
        const res = await socialApi.get(`/comments/recipe/${recipeId}`);
        const list = res.data?.results ?? res.data ?? [];
        const normalizedList = Array.isArray(list) ? list : [list];

        const ids = Array.from(
          new Set(
            (normalizedList || [])
              .map((c) => c?.user_id)
              .filter(Boolean)
              .map((id) => id.toString())
          )
        );

        const authorMap = new Map();
        await Promise.all(
          ids.map(async (idStr) => {
            const id = Number.isNaN(Number(idStr)) ? idStr : Number(idStr);
            try {
              const userRes = await userApi.get(`/users/${id}`);
              const u = userRes.data || {};
              authorMap.set(idStr, {
                name: u.public_name || "",
                username: u.username || "",
              });
            } catch (err) {
              console.error("Failed to load comment author", id, err);
            }
          })
        );

        if (!isMounted) return;
        setComments(
          normalizedList.map((c) => {
            const idRaw = c?.user_id;
            const idKey = idRaw != null ? idRaw.toString() : null;
            const info = idKey ? authorMap.get(idKey) || {} : {};
            return {
              ...c,
              authorName: c.public_name || info.name || "",
              authorUsername: c.authorUsername || info.username || "",
            };
          })
        );
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.error("Failed to load comments", { status, data, err });

        if (isMounted) {
          setCommentsError(
            `Failed to load comments${status ? ` (HTTP ${status})` : ""}${
              data ? `: ${JSON.stringify(data)}` : ""
            }`
          );
        }
      } finally {
        if (isMounted) setCommentsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [recipeId]);

  // POST comment
  async function handlePostComment() {
    const content = commentContent.trim();
    if (!recipeId) {
      setPostError("Missing recipeId");
      return;
    }
    if (!content || posting) return;

    setPosting(true);
    setPostError(null);

    try {
      // POST comment (backend expects "content")
      const res = await socialApi.post(`/comments/${recipeId}`, { content });
      const created = res.data;
      const currentName = user?.public_name || "";

      // Add new comment at top
      setComments((prev) => [
        {
          ...created,
          authorName: created?.public_name || currentName,
          authorUsername: created?.authorUsername || user?.username || "",
        },
        ...prev,
      ]);
      setCommentContent("");
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error("Failed to post comment", { status, data, err });

      setPostError(
        `Failed to post comment${status ? ` (HTTP ${status})` : ""}${
          data ? `: ${JSON.stringify(data)}` : ""
        }`
      );
    } finally {
      setPosting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!commentId || deletingCommentId) return;
    setDeletingCommentId(commentId);
    try {
      await socialApi.delete(`/comments/${commentId}`);
      setComments((prev) =>
        prev.filter((c) => (c.id ?? c.comment_id) !== commentId)
      );
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error("Failed to delete comment", { status, data, err });
      setCommentsError(
        `Failed to delete comment${status ? ` (HTTP ${status})` : ""}${
          data ? `: ${JSON.stringify(data)}` : ""
        }`
      );
    } finally {
      setDeletingCommentId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT PANEL */}
        <div className="flex-1 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="w-full h-80 bg-gray-200 overflow-hidden flex-shrink-0">
            <img
              src={recipe.img}
              alt={recipe.recipe_name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 overflow-y-auto">
            <h2 className="text-3xl font-bold mb-3">{recipe.recipe_name}</h2>

            {recipe.description && (
              <p className="text-gray-700 mb-4">{recipe.description}</p>
            )}

            <div className="flex gap-6 mt-2 text-gray-700 text-sm mb-6">
              {recipe.total_time && (
                <p>
                  <strong>Total time:</strong> {recipe.total_time}
                </p>
              )}
              {recipe.servings && (
                <p>
                  <strong>Servings:</strong> {recipe.servings}
                </p>
              )}
            </div>

            {recipe.ingredients?.length > 0 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc ml-6 text-gray-700">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i}>
                      {ing.amount} {ing.unit} {ing.name}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {recipe.instructions && (
              <>
                <h3 className="text-xl font-semibold mt-6 mb-2">
                  Instructions
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {recipe.instructions}
                </p>
              </>
            )}

            {/* NUTRITION SECTION (moved below Instructions) */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-3">
                Nutrition information
              </h3>

              {nutritionError && (
                <p className="text-sm text-red-600 mb-2">{nutritionError}</p>
              )}

              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={handleFetchNutrition}
                  disabled={nutritionLoading || !nutritionIngredients.length}
                  className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
                >
                  {nutritionLoading
                    ? "Calculating..."
                    : "Show nutrition information"}
                </button>
              </div>

              {nutrition && (
                <div className="mt-2">
                  <div className="flex gap-2 mb-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setNutritionView("total")}
                      className={`px-2 py-1 rounded-full border ${
                        nutritionView === "total"
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      For whole dish
                    </button>
                    <button
                      type="button"
                      onClick={() => setNutritionView("per100g")}
                      className={`px-2 py-1 rounded-full border ${
                        nutritionView === "per100g"
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      Per 100 g
                    </button>
                    <button
                      type="button"
                      onClick={() => setNutritionView("perServing")}
                      className={`px-2 py-1 rounded-full border ${
                        nutritionView === "perServing"
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      Per serving
                    </button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Total weight of dish:{" "}
                    {nutrition.total_weight_g?.toFixed(1)} g
                  </p>
                  <p className="text-xs italic text-gray-500 mb-2">
                    Displayed values: {activeLabel}
                  </p>

                  {activeNutrition && (
                    <table className="w-full text-xs text-gray-700">
                      <tbody>
                        <tr>
                          <td className="py-0.5 pr-2">Total fat</td>
                          <td className="py-0.5 text-right">
                            {(activeNutrition.fat_total_g ?? 0).toFixed(2)} g
                          </td>
                        </tr>
                        <tr>
                          <td className="py-0.5 pr-2">Saturated fat</td>
                          <td className="py-0.5 text-right">
                            {(activeNutrition.fat_saturated_g ?? 0).toFixed(2)} g
                          </td>
                        </tr>
                        <tr>
                          <td className="py-0.5 pr-2">Carbohydrates</td>
                          <td className="py-0.5 text-right">
                            {(activeNutrition.carbohydrates_total_g ?? 0).toFixed(
                              2
                            )}{" "}
                            g
                          </td>
                        </tr>
                        <tr>
                          <td className="py-0.5 pr-2">Fiber</td>
                          <td className="py-0.5 text-right">
                            {(activeNutrition.fiber_g ?? 0).toFixed(2)} g
                          </td>
                        </tr>
                        <tr>
                          <td className="py-0.5 pr-2">Sugar</td>
                          <td className="py-0.5 text-right">
                            {(activeNutrition.sugar_g ?? 0).toFixed(2)} g
                          </td>
                        </tr>
                        <tr>
                          <td className="py-0.5 pr-2">Sodium</td>
                          <td className="py-0.5 text-right">
                            {(activeNutrition.sodium_mg ?? 0).toFixed(2)} mg
                          </td>
                        </tr>
                        <tr>
                          <td className="py-0.5 pr-2">Potassium</td>
                          <td className="py-0.5 text-right">
                            {(activeNutrition.potassium_mg ?? 0).toFixed(2)} mg
                          </td>
                        </tr>
                        <tr>
                          <td className="py-0.5 pr-2">Cholesterol</td>
                          <td className="py-0.5 text-right">
                            {(activeNutrition.cholesterol_mg ?? 0).toFixed(2)} mg
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-96 flex flex-col bg-white">
          {/* TOP — AUTHOR INFO */}
          <Link
            to={isMe ? "/" : `/profile/${authorId}`}
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white cursor-pointer hover:bg-gray-50"
          >
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
              {(recipe.authorName?.charAt(0) || "?").toUpperCase()}
            </div>
            <span className="font-medium text-gray-800">
              {recipe.authorName || "Unknown"}
            </span>
          </Link>

          {/* MIDDLE — COMMENTS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {commentsLoading && (
              <p className="text-gray-500">Loading comments...</p>
            )}

            {commentsError && (
              <p className="text-red-600 text-sm whitespace-pre-wrap">
                {commentsError}
              </p>
            )}

            {!commentsLoading && !commentsError && comments.length === 0 && (
              <p className="text-gray-500">No comments yet.</p>
            )}

            {comments.map((c, i) => {
              const commentId = c.id ?? c.comment_id;
              return (
                <div key={commentId ?? i} className="border-b pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">
                      {c.authorName ||
                        (c.user_id != null ? `User #${c.user_id}` : "Unknown")}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(commentId)}
                      disabled={!commentId || deletingCommentId === commentId}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      aria-label="Delete comment"
                    >
                      X
                    </button>
                  </div>
                  <p className="text-gray-700">
                    {c.content ?? c.text ?? c.comment ?? ""}
                  </p>
                </div>
              );
            })}
          </div>

          {/* BOTTOM — ACTIONS + ADD COMMENT */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-4 mb-2">
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

              <ShoppingCartIcon
                onClick={onOpenCart}
                className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
              />
            </div>

            <p className="text-sm font-semibold mb-3">
              {recipe.likes ?? 0} likes
            </p>

            {postError && (
              <p className="text-red-600 text-sm mb-2 whitespace-pre-wrap">
                {postError}
              </p>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePostComment();
                }}
              />
              <button
                onClick={handlePostComment}
                disabled={posting || !commentContent.trim()}
                className="text-blue-600 font-semibold disabled:opacity-50"
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
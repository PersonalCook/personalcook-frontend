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

  // NEW COMMENT state
  const [commentContent, setCommentContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  // FETCH comments on open / recipe change
  useEffect(() => {
    if (!recipeId) {
      setCommentsError("Missing recipeId (recipe.id/recipe.recipe_id is undefined)");
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

        if (!isMounted) return;
        setComments(Array.isArray(list) ? list : [list]);
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

      // Add new comment at top
      setComments((prev) => [created, ...prev]);
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
            {/*iz user_id je treba pridobit username, da se potem prikaže */}
            {comments.map((c, i) => (
              <div key={c.id ?? i} className="border-b pb-3">
                <p className="font-semibold">
                  {String(c.user_id) === String(user?.user_id) ? "You" : `User #${c.user_id}`}
                </p>
                <p className="text-gray-700">
                  {c.content ?? c.text ?? c.comment ?? ""}
                </p>
              </div>
            ))}
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
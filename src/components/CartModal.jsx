export default function CartModal({ recipe, onClose }) {
    if (!recipe) return null;
  
    return (
      <div className="fixed bottom-6 right-6 bg-white border border-gray-300 shadow-lg rounded-xl p-4 w-72 z-[60]">
        <h3 className="font-semibold text-lg mb-3">Add to Cart</h3>
  
        <p className="text-gray-600 mb-4">
          {recipe.recipe_name}
        </p>
  
        <button className="w-full bg-blue-500 text-white rounded-lg py-2 mb-3">
          Create new cart
        </button>
  
        <p className="text-sm text-gray-500 mb-2">Add to existing cart:</p>
  
        <div className="flex flex-col gap-2">
          {/* Dummy sample carts for now */}
          <button className="border rounded-lg p-2 hover:bg-gray-100 text-left">
            Weekly meals
          </button>
          <button className="border rounded-lg p-2 hover:bg-gray-100 text-left">
            Grocery run
          </button>
        </div>
  
        <button
          onClick={onClose}
          className="text-red-500 text-sm mt-4 hover:underline"
        >
          Close
        </button>
      </div>
    );
  }
  
export default function ShoppingCartDetail({ cart, onClose }) {
    if (!cart) return null;
  
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-xl relative max-h-[90vh] overflow-y-auto flex gap-8">
  
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-black"
          >
            ×
          </button>
  
          {/* LEFT SIDE */}
          <div className="w-1/2">
            <h2 className="text-2xl font-bold mb-4">{cart.name}</h2>
  
            <h3 className="text-xl font-semibold mb-2">Recipes</h3>
  
            <div className="flex flex-col gap-4">
              {cart.recipes.map((r) => (
                <div
                  key={r.recipe_id}
                  className="flex items-center gap-4 border rounded-lg p-2"
                >
                  <img
                    src={r.img}
                    className="w-20 h-20 object-cover rounded-lg"
                    alt={r.recipe_name}
                  />
                  <span className="text-lg">{r.recipe_name}</span>
                </div>
              ))}
            </div>
          </div>
  
          {/* RIGHT SIDE */}
          <div className="w-1/2">
            <h3 className="text-xl font-semibold mb-2">Shopping List</h3>
  
            <ul className="list-disc ml-5 text-gray-700">
              {cart.shopping_list.map((item, idx) => (
                <li key={idx}>
                  {item.amount} {item.unit} {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
export default function ShoppingCartGrid({ carts, onOpenCart }) {
    return (
      <div className="grid grid-cols-3 gap-4 mt-6">
        {carts.length === 0 && (
          <div className="col-span-3 text-gray-500 text-center">
            You don't have any shopping carts yet.
          </div>
        )}
  
        {carts.map((cart) => (
          <div
            key={cart.cart_id}
            onClick={() => onOpenCart(cart)}
            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition shadow-sm"
          >
            <h2 className="text-lg font-bold">{cart.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{cart.recipes.length} recipes</p>
          </div>
        ))}
      </div>
    );
  }
  
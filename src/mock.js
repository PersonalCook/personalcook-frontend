export const mockUser = {
    user_id: 1,
    username: "blablapia",
    public_name: "Pia Example",
    email: "pia@example.com",
    token: "mock-token"
  };

export const mockRecipes = [
  {
    recipe_id: 1,
    user_id: 1,
    created_at: "2025-01-01T12:00:00",
    recipe_name: "Creamy Mushroom Pasta",
    description: "A rich and simple pasta with mushrooms and cream.",
    cooking_time: "00:20:00",
    total_time: "00:30:00",
    
    servings: 2,

    ingredients: [
      { name: "Pasta", amount: 200, unit: "g" },
      { name: "Mushrooms", amount: 150, unit: "g" },
      { name: "Cooking cream", amount: 1, unit: "dl" },
      { name: "Salt", amount: 1, unit: "tsp" },
      { name: "Pepper", amount: 1, unit: "tsp" }
    ],

    instructions: "Cook pasta. Sauté mushrooms. Add cream and season. Mix together.",
    keywords: "pasta, mushroom, creamy",
    img: "https://assets.bonappetit.com/photos/5d4ddd602c815a00080f9771/3:2/w_3131,h_2087,c_limit/BA-0919-Creamy-Pasta-Crispy-Mushroom-Playbook.jpg",

    visibility: "public",
    category: "dinner"
  },

  {
    recipe_id: 2,
    user_id: 1,
    created_at: "2025-01-03T09:30:00",
    recipe_name: "Banana Oat Pancakes",
    description: "Healthy 3-ingredient breakfast pancakes.",
    
    cooking_time: "00:10:00",
    total_time: "00:10:00",
    
    servings: 1,

    ingredients: [
      { name: "Banana", amount: 1, unit: "piece" },
      { name: "Egg", amount: 1, unit: "piece" },
      { name: "Oats", amount: 50, unit: "g" }
    ],

    instructions: "Blend all ingredients. Cook on a pan. Serve warm.",
    keywords: "pancakes, banana, breakfast",
    img: "https://simply-delicious-food.com/wp-content/uploads/2016/09/banana-oat-pancakes-3.jpg",

    visibility: "public",
    category: "breakfast"
  }
];


export const mockSavedRecipes = [
  {
    recipe_id: 101,
    user_id: 2,  
    recipe_name: "Crispy Chicken Tacos",
    description: "Crunchy tacos with savory chicken filling.",
    
    cooking_time: "00:20:00",
    total_time: "00:30:00",

    servings: 2,

    ingredients: [
      { name: "Chicken breast", amount: 200, unit: "g" },
      { name: "Taco shells", amount: 6, unit: "pcs" },
      { name: "Lettuce", amount: 50, unit: "g" },
      { name: "Cheese", amount: 30, unit: "g" },
    ],

    instructions: "Cook chicken. Assemble tacos. Serve fresh.",
    keywords: "tacos, chicken, mexican",
    img: "https://static01.nyt.com/images/2025/05/14/multimedia/kf-easy-chicken-tacos-gwfh/kf-easy-chicken-tacos-gwfh-mediumSquareAt3X.jpg",

    visibility: "public",
    category: "dinner"
  },

  {
    recipe_id: 102,
    user_id: 5,
    recipe_name: "Blueberry Smoothie Bowl",
    description: "A refreshing and healthy smoothie bowl.",
    
    cooking_time: "00:05:00",
    total_time: "00:05:00",

    servings: 1,

    ingredients: [
      { name: "Blueberries", amount: 150, unit: "g" },
      { name: "Banana", amount: 1, unit: "pcs" },
      { name: "Greek yogurt", amount: 100, unit: "g" },
      { name: "Granola", amount: 30, unit: "g" },
    ],

    instructions: "Blend ingredients. Pour into bowl. Add toppings.",
    keywords: "smoothie, blueberry, breakfast",
    img: "https://shortgirltallorder.com/wp-content/uploads/2021/04/blueberry-lemon-smoothie-bowl-square.jpg",

    visibility: "public",
    category: "breakfast"
  },

  {
    recipe_id: 103,
    user_id: 7,
    recipe_name: "Classic Chocolate Cake",
    description: "Rich and moist chocolate cake.",
    
    cooking_time: "00:40:00",
    total_time: "01:00:00",

    servings: 8,

    ingredients: [
      { name: "Flour", amount: 200, unit: "g" },
      { name: "Cocoa powder", amount: 50, unit: "g" },
      { name: "Eggs", amount: 3, unit: "pcs" },
      { name: "Butter", amount: 100, unit: "g" },
    ],

    instructions: "Mix ingredients. Bake at 180°C for 40 minutes.",
    keywords: "cake, chocolate, dessert",
    img: "https://ichef.bbci.co.uk/food/ic/food_16x9_1600/recipes/easy_chocolate_cake_31070_16x9.jpg",

    visibility: "public",
    category: "dessert"
  },
  {
    recipe_id: 104,
    user_id: 4,
    created_at: "2025-02-15T12:10:00",
    recipe_name: "Creamy Garlic Pasta",
    description: "Rich, creamy pasta with garlic and parmesan.",
    
    cooking_time: "00:15:00",
    total_time: "00:20:00",
    servings: 2,
  
    ingredients: [
      { name: "Pasta", amount: 200, unit: "g" },
      { name: "Garlic cloves", amount: 3, unit: "pcs" },
      { name: "Heavy cream", amount: 150, unit: "ml" },
      { name: "Parmesan", amount: 40, unit: "g" }
    ],
  
    instructions: "Cook pasta. Prepare sauce. Combine and serve.",
    keywords: "pasta, garlic, creamy",
    img: "https://www.allrecipes.com/thmb/QiGptPjQB5mqSXGVxE4sLPMJs_4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-269500-creamy-garlic-pasta-Beauties-2x1-bcd9cb83138849e4b17104a1cd51d063.jpg",
    visibility: "public",
    category: "dinner"
  },
  {
    recipe_id: 105,
    user_id: 8,
    created_at: "2025-02-08T18:40:00",
    recipe_name: "Mediterranean Chickpea Salad",
    description: "Fresh chickpea salad with lemon dressing.",
    
    cooking_time: "00:00:00",
    total_time: "00:10:00",
    servings: 3,
  
    ingredients: [
      { name: "Chickpeas", amount: 240, unit: "g" },
      { name: "Cherry tomatoes", amount: 150, unit: "g" },
      { name: "Cucumber", amount: 1, unit: "pcs" },
      { name: "Olive oil", amount: 2, unit: "tbsp" }
    ],
  
    instructions: "Chop vegetables. Mix with chickpeas. Add dressing.",
    keywords: "salad, healthy, chickpeas",
    img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    visibility: "public",
    category: "lunch"
  }
];


export const mockCarts = [
  {
    cart_id: 1,
    name: "Weekend Dinner",
    recipes: [
      {
        recipe_id: 101,
        recipe_name: "Crispy Chicken Tacos",
        img: "https://via.placeholder.com/200"
      },
      {
        recipe_id: 104,
        recipe_name: "Creamy Garlic Pasta",
        img: "https://via.placeholder.com/200"
      }
    ],
    shopping_list: [
      { name: "Chicken breast", amount: 200, unit: "g" },
      { name: "Garlic cloves", amount: 3, unit: "pcs" },
      { name: "Heavy cream", amount: 150, unit: "ml" },
      { name: "Taco shells", amount: 6, unit: "pcs" }
    ]
  },

  {
    cart_id: 2,
    name: "Healthy Meal Prep",
    recipes: [
      {
        recipe_id: 105,
        recipe_name: "Mediterranean Chickpea Salad",
        img: "https://via.placeholder.com/200"
      }
    ],
    shopping_list: [
      { name: "Chickpeas", amount: 240, unit: "g" },
      { name: "Cherry tomatoes", amount: 150, unit: "g" },
      { name: "Olive oil", amount: 2, unit: "tbsp" }
    ]
  }
];

export const mockUsers = [
  {
    user_id: 5,
    username: "pia",
    public_name: "Pia Sotlar",
    avatar: null
  },
  {
    user_id: 2,
    username: "andrejk",
    public_name: "Andrej Kregar",
    avatar: null
  },
  {
    user_id: 3,
    username: "tomasd",
    public_name: "Tomaž Dolenc",
    avatar: null
  },
  {
    user_id: 4,
    username: "nejcc",
    public_name: "Nejc Česen",
    avatar: null
  }
];

export const mockFeedRecipes = [
  {
    recipe_id: 201,
    recipe_name: "Caprese Sandwich",
    user_id: 2,
    author_name: "Andrej Kregar",
    created_at: "2025-02-15T10:20:00",
    img: "https://cdn.loveandlemons.com/wp-content/uploads/2020/06/caprese-sandwich.jpg",
  },
  {
    recipe_id: 202,
    recipe_name: "Fresh Spring Rolls",
    user_id: 3,
    author_name: "Tomaž Dolenc",
    created_at: "2025-02-14T18:05:00",
    img: "https://assets.epicurious.com/photos/65aee4e026ff5c4836d56426/1:1/w_3839,h_3839,c_limit/Fresh-Spring-Rolls_RECIPE.jpg",
  },
  {
    recipe_id: 203,
    recipe_name: "Lemon Cheesecake",
    user_id: 4,
    author_name: "Nejc Česen",
    created_at: "2025-02-13T12:48:00",
    img: "https://tornadoughalli.com/wp-content/uploads/2020/02/LEMON-CHEESECAKE-3-2.jpg",
  }
];
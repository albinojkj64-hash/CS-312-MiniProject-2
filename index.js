import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const API = "https://www.thecocktaildb.com/api/json/v1/1";

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Turn the API's strIngredient1..15 / strMeasure1..15 fields into a clean array
function formatDrink(drink) {
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const name = drink[`strIngredient${i}`];
    if (name) {
      const measure = drink[`strMeasure${i}`];
      ingredients.push(measure ? `${measure.trim()} ${name}` : name);
    }
  }
  return {
    name: drink.strDrink,
    image: drink.strDrinkThumb,
    category: drink.strCategory,
    glass: drink.strGlass,
    alcoholic: drink.strAlcoholic,
    instructions: drink.strInstructions,
    ingredients,
  };
}

// Route to the page with the input form
app.get("/", (req, res) => {
  res.render("index", { error: null });
});

// Search by name (form submission -> POST -> Axios GET to the API)
app.post("/search", async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    return res.render("index", { error: "Please enter a cocktail name." });
  }
  try {
    const response = await axios.get(`${API}/search.php`, { params: { s: name } });
    const drinks = response.data.drinks;
    if (!drinks) {
      return res.render("index", {
        error: `No cocktails found for "${name}". Try another name.`,
      });
    }
    res.render("result", {
      drinks: drinks.map(formatDrink),
      heading: `Results for "${name}"`,
    });
  } catch (err) {
    console.error(err.message);
    res.render("index", {
      error: "Could not reach the cocktail service. Please try again.",
    });
  }
});

// Random cocktail
app.post("/random", async (req, res) => {
  try {
    const response = await axios.get(`${API}/random.php`);
    res.render("result", {
      drinks: response.data.drinks.map(formatDrink),
      heading: "Your random cocktail",
    });
  } catch (err) {
    console.error(err.message);
    res.render("index", {
      error: "Could not fetch a random cocktail. Please try again.",
    });
  }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

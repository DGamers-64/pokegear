import express from "express";
import cors from "cors";
import getLocalizaciones from "./controllers/localizacion.js";
import getPokemonInfo from "./controllers/pokemon.js";

const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.static("public"))

app.get("/api/localizacion", getLocalizaciones)

app.get("/api/pokemon", getPokemonInfo)

app.listen(PORT, () => {
    console.log(`Servidor levantado en http://localhost:${PORT}`)
})
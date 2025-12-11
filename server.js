import express from "express";
import cors from "cors";

const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.static("public"))



app.listen(PORT, () => {
    console.log(`Servidor levantado en http://localhost:${PORT}`)
})
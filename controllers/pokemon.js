import Database from "better-sqlite3";

export default function getPokemonInfo(req, res) {
    const db = new Database("./data/pokemon.sqlite", { readonly: true })
    let pokemon
    if (req.query.nombre) {
        pokemon = db.prepare("SELECT * FROM pokemon WHERE id = ?").get(req.query.nombre.toUpperCase())
    } else if (req.query.n_pkdx) {
        pokemon = db.prepare("SELECT * FROM pokemon WHERE n_pkdx = ?").get(req.query.n_pkdx)
    }
    res.send(pokemon)
}
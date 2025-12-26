import Database from "better-sqlite3";

export default function getEvoluciones(req, res) {
    const db = new Database("./data/pokemon.sqlite", { readonly: true })

    const n_pkdx = parseInt(req.query.n_pkdx)
    if (!n_pkdx) {
        db.close()
        return res.status(400).json({ error: "n_pkdx no recibido" })
    }

    // Obtener el nombre inicial
    const row = db.prepare("SELECT id FROM pokemon WHERE n_pkdx = ?").get(n_pkdx)
    if (!row) {
        db.close()
        return res.status(404).json({ error: "Pokémon no encontrado" })
    }

    const nombreInicio = row.id

    // Función recursiva para construir toda la cadena evolutiva
    function obtenerEvoluciones(pokemon) {
        const evoluciones = db
          .prepare("SELECT * FROM evoluciones WHERE poke1 = ?")
          .all(pokemon)

        if (evoluciones.length === 0) return []

        // Por cada evolución, obtener sus evoluciones recursivamente
        return evoluciones.map(e => ({
            poke1: e.poke1,
            poke2: e.poke2,
            metodo: e.metodo,
            evoluciones: obtenerEvoluciones(e.poke2) // rama
        }))
    }

    const resultado = obtenerEvoluciones(nombreInicio)
    db.close()
    res.json(resultado)
}

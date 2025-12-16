import Database from "better-sqlite3";

export default function getLocalizaciones(req, res) {
    const db = new Database("./data/pokemon.sqlite", { readonly: true })
    const localizaciones = db.prepare(`
        SELECT r.nombre AS ruta, l.version, l.metodo, l.momento, l.nivel, l.porcentaje
        FROM localizaciones AS l
        JOIN rutas AS r
            ON r.id = l.ruta
        WHERE pokemon = ?
        ORDER BY
            CASE
                WHEN r.nombre LIKE 'Ruta %' THEN 0
                ELSE 1
            END,
            CASE
                WHEN r.nombre LIKE 'Ruta %'
                THEN CAST(SUBSTR(r.nombre, 6) AS INTEGER)
            END,
            r.nombre`
    ).all(req.query.nombre.toUpperCase());
    const encsPrimeraFiltrada = Object.values(
        localizaciones.reduce((acc, item) => {
            const clave = `${item.ruta}-${item.momento}-${item.metodo}-${item.version}`

            if (!acc[clave]) {
                acc[clave] = {
                    ruta: item.ruta,
                    version: item.version,
                    momento: item.momento,
                    metodo: item.metodo,
                    nivel: [],
                    porcentaje: 0
                }
            }

            acc[clave].porcentaje += item.porcentaje
            acc[clave].nivel.push(Number(item.nivel))
            return acc
        }, {})
    ).map(item => {
        const min = Math.min(...item.nivel)
        const max = Math.max(...item.nivel)

        return {
            ruta: item.ruta,
            momento: item.momento,
            metodo: item.metodo,
            version: item.version,
            nivel: min === max ? `${min}` : `${min}-${max}`,
            porcentaje: item.porcentaje
        }
    })

    const encsSegundaFiltrada = Object.values(encsPrimeraFiltrada.reduce((acc, item) => {
        const clave = `${item.ruta}-${item.momento}-${item.metodo}-${item.nivel}-${item.porcentaje}`

        if (!acc[clave]) {
            acc[clave] = {
                ruta: item.ruta,
                version: new Set(),
                momento: item.momento,
                metodo: item.metodo,
                nivel: item.nivel,
                porcentaje: item.porcentaje
            }
        }

        acc[clave].version.add(item.version)
        return acc
    }, {})).map(item => {
        return {
            ...item,
            version: Array.from(item.version)
        }
    })

    const encsTerceraFiltrada = Object.values(
        encsSegundaFiltrada.reduce((acc, item) => {
            const clave = `${item.ruta}-${item.metodo}-${item.nivel}-${item.porcentaje}-${item.version.join("/")}`

            if (!acc[clave]) {
                acc[clave] = {
                    base: {
                        ruta: item.ruta,
                        metodo: item.metodo,
                        nivel: item.nivel,
                        porcentaje: item.porcentaje,
                        version: item.version
                    },
                    porMomento: {}
                }
            }

            acc[clave].porMomento[item.momento] = item
            return acc
        }, {})
    )

    const resultadosFinales = {
        morning: [],
        day: [],
        night: [],
        todo: []
    }

    const MOMENTOS = ["morning", "day", "night"]

    encsTerceraFiltrada.forEach(grupo => {
        const momentosPresentes = Object.keys(grupo.porMomento)

        if (MOMENTOS.every(m => momentosPresentes.includes(m))) {
            resultadosFinales.todo.push({ ...grupo.base })
        } else {
            momentosPresentes.forEach(m => {
                const { momento, ...resto } = grupo.porMomento[m]
                resultadosFinales[m].push(resto)
            })
        }
    })
    res.send(resultadosFinales)
}
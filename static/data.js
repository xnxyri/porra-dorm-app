// Almacén central de datos para la aplicación

const escudos = {
    "Real Madrid": "https://media.api-sports.io/football/teams/541.png",
    "FC Barcelona": "https://media.api-sports.io/football/teams/529.png",
    "Atlético de Madrid": "https://media.api-sports.io/football/teams/530.png",
    "CA Osasuna": "https://media.api-sports.io/football/teams/727.png",
    "RCD Mallorca": "https://media.api-sports.io/football/teams/798.png",
    "Real Oviedo": "https://media.api-sports.io/football/teams/718.png"
    // ...etc
};

// --- NUEVO ALMACÉN DE PLANTILLAS ---
const plantillasEquipos = {
    "Real Madrid": [
        "Thibaut Courtois", "Andriy Lunin", 
        "Dani Carvajal", "Éder Militão", "David Alaba", "Trent Alexander-Arnold", "Alvaro Carreras", "Fran García", "Antonio Rüdiger", "Ferland Mendy", "Dean Huijsen",
        "Jude Bellingham", "Eduardo Camavinga", "Fede Valverde", "Aurélien Tchouameni", "Arda Güler", "Dani Ceballos",
        "Vini Jr.", "Kylian Mbappé", "Rodrygo", "Endrick", "Brahim Díaz"
    ],
    "CA Osasuna": [
        "Sergio Herrera", "Aitor Fernández", "Enzo Boyomo",
        "Jorge Hernando", "Alejandro Catena", "Abel Bretones", "Juan Cruz", "Jesús Areso", "Valentín Rosier",
        "Lucas Torró", "Iker Muñoz", "Jon Moncayola", "Aimar Oroz",
        "Moi Gómez", "Víctor Muñoz", "Iker Benito", "Kike Barja", "Ante Budimir", "Raúl García"
    ],
    "Real Oviedo": [
        "Aarón Escandell",
        "David Costas", "Dani Calvo", "Oier Luengo", "Rahim Alhassane", "Carlos Pomares", "Nacho Vidal", "Lucas Ahijado", "Álvaro Lemos",
        "Santiago Colombatto", "Alberto Reina", "Kwasi Sibo", "Alberto del Moral", "Yayo González", "Santi Cazorla", "Brandon Dominguès", "Alex Cardero",
        "Ilyas Chaira", "Borja Sánchez", "Haissem Hassan", "Paulino de la Fuente", "Federico Viñas", "Daniel Paraschiv", "Salomón Rondón"
    ],
        "RCD Mallorca": [
        "Dominik Grief", "Leo Román", "Lucas Bergström", "Ivan Cuellar",
        "Martin Veljent", "José Copete", "Siebe Van der Heyden", "Antonio Raíllo", "David López", "Johan Mojica", "Toni Lato", "Pablo Maffeo", "Mateu Morey",
        "Samú Costa", "Omar Mascarell", "Sergi Darder", "Manu Morlanes", "Antonio Sánchez", "Pablo Torre", "Dani Rodríguez", "Daniel Luna",
        "Javi Llabrés", "Takuma Asano", "Vedat Muriqi", "Cyle Larin", "Abdon Prats", "Marc Domènech"
    ]
    // Para añadir un nuevo equipo, simplemente añade una nueva entrada:
    // "Nombre del Equipo": ["Jugador 1", "Jugador 2", ...]

}
// --- DICCIONARIO DE ALIAS DE USUARIO ---
// La clave es el "Nombre_Usuario_Discord" exacto que se usa en las predicciones,
// y el valor es el alias que quieres que se muestre.
const aliasUsuarios = {
    "xyri#3288": "Xyri",
    "Varoppo#2842": "Varoppo",
    "MikeSullivanZero#4038": "MikeSullivanZero",
    "Davis14#9710": "Davis14",
    "Loki_Cat12#7511": "Loki_Cat12",
    "elratedx#7229": "elratedx",
    "sonfiL#5122": "sonfil",
    "MRajoy#6824": "MRajoy",
    "cfreire#2340": "Freyre",
    "Babeta#1705": "Babeta",
    "Sempai#9746": "Leagrove",
    "Sinso#8330": "Sinso",
    "Purelonie#7791": "Purelonie",
    "Samawoodo#0195": "Samawoodo",
    "Sorakabanana#0360": "Sorakbanana",
    "CharlieZen#4751": "Hamau",


    // Añade aquí a todos los participantes
};
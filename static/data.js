// Listener que se asegura de que la página está lista antes de aplicar el tema
document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
    }
});

// Almacén central de datos para la aplicación

const escudos = {
    "Real Madrid": "https://media.api-sports.io/football/teams/541.png",
    "FC Barcelona": "https://media.api-sports.io/football/teams/529.png",
    "Atlético de Madrid": "https://media.api-sports.io/football/teams/530.png",
    "CA Osasuna": "https://media.api-sports.io/football/teams/727.png",
    "RCD Mallorca": "https://media.api-sports.io/football/teams/798.png",
    "Real Oviedo": "https://media.api-sports.io/football/teams/724.png"
    // ...etc
};

const plantillasEquipos = {
    "Real Madrid": [
        "Thibaut Courtois", "Andriy Lunin", "Dani Carvajal", "Éder Militão", "David Alaba", 
        "Nacho", "Antonio Rüdiger", "Ferland Mendy", "Fran García", "Aurélien Tchouaméni", 
        "Toni Kroos", "Luka Modrić", "Eduardo Camavinga", "Fede Valverde", "Jude Bellingham", 
        "Dani Ceballos", "Arda Güler", "Brahim Díaz", "Vinicius Jr.", "Rodrygo", "Joselu", 
        "Endrick", "Kylian Mbappé"
    ],
    "CA Osasuna": [
        "Sergio Herrera", "Aitor Fernández", "Unai García", "David García", "Juan Cruz", 
        "Jesús Areso", "Johan Mojica", "Lucas Torró", "Jon Moncayola", "Aimar Oroz", 
        "Moi Gómez", "Rubén García", "Ante Budimir"
    ],
    "Real Oviedo": [
        "Leo Román", "Quentin Braat", "Dani Calvo", "Oier Luengo", "Abel Bretones", 
        "Mario Hernández", "Jaime Seoane", "Santiago Colombatto", "Paulino de la Fuente", 
        "Borja Bastón", "Alemão"
    ],
    "RCD Mallorca": [
        "Dominik Greif", "Leo Román", "Predrag Rajković", "Martin Valjent", "José Copete", 
        "Antonio Raíllo", "Johan Mojica", "Toni Lato", "Pablo Maffeo", "Samú Costa", 
        "Omar Mascarell", "Sergi Darder", "Manu Morlanes", "Dani Rodríguez", "Vedat Muriqi", 
        "Cyle Larin"
    ]
};

const factousData = [
    {
        text: "Zi no hubiera zio por las predicciones especiale, Hamau era Top 3 del DORM y me zua to loh cohone",
        image: "https://cdn.futwiz.com/assets/img/fc25/faces/278349.png?25" 
    },
    {
        text: "MRajoy último en el més de Abril. Automáticamente: eu farei 10x se for preciso",
        image: "https://sortitoutsidospaces.b-cdn.net/megapacks/cutoutfaces/originals/2024.12/19302146.png" 
    },
    {
        text: "Dije bloque bajo, no ir de los últimos de la tabla, vaffanculo",
        image: "https://cdn.fctoolshub.com/game_assets/fc25/managers/237388.png"
    }
];
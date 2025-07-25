// Listener que se asegura de que la página está lista antes de aplicar el tema
document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
    }
});

// Almacén central de datos para la aplicación
const escudos = {
    "Athletic Club": "https://media.api-sports.io/football/teams/531.png",
    "Atlético de Madrid": "https://media.api-sports.io/football/teams/530.png",
    "CA Osasuna": "https://media.api-sports.io/football/teams/727.png",
    "RC Celta": "https://media.api-sports.io/football/teams/538.png",
    "Deportivo Alavés": "https://media.api-sports.io/football/teams/542.png",
    "Elche FC": "https://media.api-sports.io/football/teams/797.png",
    "FC Barcelona": "https://media.api-sports.io/football/teams/529.png",
    "Getafe CF": "https://media.api-sports.io/football/teams/546.png",
    "Girona FC": "https://media.api-sports.io/football/teams/547.png",
    "Levante UD": "https://media.api-sports.io/football/teams/539.png",
    "Rayo Vallecano": "https://media.api-sports.io/football/teams/728.png",
    "RCD Espanyol": "https://media.api-sports.io/football/teams/540.png",
    "RCD Mallorca": "https://media.api-sports.io/football/teams/798.png",
    "Real Betis": "https://media.api-sports.io/football/teams/543.png",
    "Real Madrid": "https://media.api-sports.io/football/teams/541.png",
    "Real Oviedo": "https://media.api-sports.io/football/teams/718.png",
    "Real Sociedad": "https://media.api-sports.io/football/teams/548.png",
    "Sevilla FC": "https://media.api-sports.io/football/teams/536.png",
    "Valencia CF": "https://media.api-sports.io/football/teams/532.png",
    "Villarreal CF": "https://media.api-sports.io/football/teams/533.png",
};

const equiposLaLiga = [
    "Athletic Club", "Atlético de Madrid", "CA Osasuna", "RC Celta", "Deportivo Alavés",
    "Elche CF", "FC Barcelona", "Getafe CF", "Girona FC", "Levante UD",
    "Rayo Vallecano", "RCD Espanyol", "RCD Mallorca", "Real Betis", "Real Madrid",
    "Real Oviedo", "Real Sociedad", "Sevilla FC", "Valencia CF", "Villarreal CF",
];

const plantillasEquipos = {
    
    "Athletic Club": [
        { nombre: "Unai Simón", posicion: "POR", nacionalidad: "España" },
        { nombre: "Agirrezabala", posicion: "POR", nacionalidad: "España" },
        { nombre: "Vivian", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Paredes", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Yuri", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Gorosabel", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Yeray", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Unai Gómez", posicion: "MED", nacionalidad: "España" },
        { nombre: "Sancet", posicion: "MED", nacionalidad: "España" },
        { nombre: "Jaureguizar", posicion: "MED", nacionalidad: "España" },
        { nombre: "Ruiz de Galarreta", posicion: "MED", nacionalidad: "España" },
        { nombre: "Vencedor", posicion: "MED", nacionalidad: "España" },
        { nombre: "Prados", posicion: "MED", nacionalidad: "España" },
        { nombre: "Vesga", posicion: "MED", nacionalidad: "España" },
        { nombre: "Guruzeta", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Nico Williams", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Martón", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Nico Serrano", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Adu Ares", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Maroan", posicion: "DEL", nacionalidad: "Marruecos" },
        { nombre: "Berenguer", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Djalo", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Iñaki Williams", posicion: "DEL", nacionalidad: "España" },
    ],
    "Atlético de Madrid": [
        { nombre: "Musso", posicion: "POR", nacionalidad: "Argentina" },
        { nombre: "Oblak", posicion: "POR", nacionalidad: "Eslovenia" },
        { nombre: "Moldovan", posicion: "POR", nacionalidad: "Rumanía" },
        { nombre: "Lenglet", posicion: "DEF", nacionalidad: "Francia" },
        { nombre: "Giménez", posicion: "DEF", nacionalidad: "Uruguay" },
        { nombre: "Le Normand", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Molina", posicion: "DEF", nacionalidad: "Argentina" },
        { nombre: "Koke", posicion: "MED", nacionalidad: "España" },
        { nombre: "M. Llorente", posicion: "MED", nacionalidad: "España" },
        { nombre: "Lemar", posicion: "MED", nacionalidad: "Francia" },
        { nombre: "Gallagher", posicion: "MED", nacionalidad: "Inglaterra" },
        { nombre: "De Paul", posicion: "MED", nacionalidad: "Argentina" },
        { nombre: "Barrios", posicion: "MED", nacionalidad: "España" },
        { nombre: "Alex Baena", posicion: "MED", nacionalidad: "España" },
        { nombre: "Ruggeri", posicion: "MED", nacionalidad: "Italia" },
        { nombre: "Johnny", posicion: "MED", nacionalidad: "Estados Unidos" },
        { nombre: "Javi Galán", posicion: "MED", nacionalidad: "España" },
        { nombre: "Carlos Martín", posicion: "MED", nacionalidad: "España" },
        { nombre: "Julián Álvarez", posicion: "DEL", nacionalidad: "Argentina" },
        { nombre: "Sørloth", posicion: "DEL", nacionalidad: "Noruega" },
        { nombre: "Giuliano", posicion: "DEL", nacionalidad: "Argentina" },
        { nombre: "Samu Lino", posicion: "DEL", nacionalidad: "Brasil" },
        { nombre: "Griezmann", posicion: "DEL", nacionalidad: "Francia" },
    ],
    "CA Osasuna": [
        { nombre: "Sergio Herrera", posicion: "POR", nacionalidad: "España" },
        { nombre: "Aitor Fernández", posicion: "POR", nacionalidad: "España" },
        { nombre: "Boyomo", posicion: "DEF", nacionalidad: "Camerún" },
        { nombre: "Juan Cruz", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Areso", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Catena", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Herrando", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Lucas Torró", posicion: "MED", nacionalidad: "España" },
        { nombre: "Moncayola", posicion: "MED", nacionalidad: "España" },
        { nombre: "Moi Gómez", posicion: "MED", nacionalidad: "España" },
        { nombre: "Abel Bretones", posicion: "MED", nacionalidad: "España" },
        { nombre: "Kike Barja", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Budimir", posicion: "DEL", nacionalidad: "Croacia" },
        { nombre: "Aimar Oroz", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Rubén García", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Raúl García", posicion: "DEL", nacionalidad: "España" },
    ],
    "RC Celta": [
        { nombre: "Iván Villar", posicion: "POR", nacionalidad: "España" },
        { nombre: "Marcos Alonso", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Oscar Mingueza", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Starfelt", posicion: "DEF", nacionalidad: "Suecia" },
        { nombre: "Ristic", posicion: "DEF", nacionalidad: "Serbia" },
        { nombre: "Carlos Domínguez", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Damián", posicion: "MED", nacionalidad: "España" },
        { nombre: "Fran Beltrán", posicion: "MED", nacionalidad: "España" },
        { nombre: "Williot", posicion: "MED", nacionalidad: "Suecia" },
        { nombre: "Hugo Sotélo", posicion: "MED", nacionalidad: "España" },
        { nombre: "Hugo Álvarez", posicion: "MED", nacionalidad: "España" },
        { nombre: "Franco Cervi", posicion: "DEL", nacionalidad: "Argentina" },
        { nombre: "Carles Pérez", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Pablo Durán", posicion: "DEL", nacionalidad: "España" },
    ],
    "Deportivo Alavés": [
        { nombre: "Sivera", posicion: "POR", nacionalidad: "España" },
        { nombre: "Owono", posicion: "POR", nacionalidad: "Guinea Ecuatorial" },
        { nombre: "Mouriño", posicion: "DEF", nacionalidad: "Uruguay" },
        { nombre: "Facundo Garcés", posicion: "DEF", nacionalidad: "Malasia" },
        { nombre: "Nahuel Tenaglia", posicion: "DEF", nacionalidad: "Argentina" },
        { nombre: "Moussa Diarra", posicion: "DEF", nacionalidad: "Mali" },
        { nombre: "Hugo Novoa", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Protesoni", posicion: "MED", nacionalidad: "Uruguay" },
        { nombre: "Guridi", posicion: "MED", nacionalidad: "España" },
        { nombre: "Tomas Conechny", posicion: "MED", nacionalidad: "Argentina" },
        { nombre: "Ander Guevara", posicion: "MED", nacionalidad: "España" },
        { nombre: "Antonio Blanco", posicion: "MED", nacionalidad: "España" },
        { nombre: "Toni Martínez", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Carlos Vicente", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Villalibre", posicion: "DEL", nacionalidad: "España" },
    ],
    "Elche CF": [
        { nombre: "Bambo Diaby", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Affengruber", posicion: "DEF", nacionalidad: "Austria" },
        { nombre: "John C", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Álvaro Nuñez", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Nico Castro", posicion: "MED", nacionalidad: "Argentina" },
        { nombre: "Yago Santiago", posicion: "MED", nacionalidad: "España" },
        { nombre: "Nico Fernández", posicion: "MED", nacionalidad: "Argentina" },
        { nombre: "Marc Aguado", posicion: "MED", nacionalidad: "España" },
        { nombre: "Febas", posicion: "MED", nacionalidad: "España" },
        { nombre: "Jairo", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Mourad", posicion: "DEL", nacionalidad: "España" },
    ],
    "FC Barcelona": [
        { nombre: "Iñaki Peña", posicion: "POR", nacionalidad: "España" },
        { nombre: "Ter Stegen", posicion: "POR", nacionalidad: "Alemania" },
        { nombre: "Christensen", posicion: "DEF", nacionalidad: "Dinamarca" },
        { nombre: "Eric García", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Koundé", posicion: "DEF", nacionalidad: "Francia" },
        { nombre: "Araujo", posicion: "DEF", nacionalidad: "Uruguay" },
        { nombre: "Balde", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Cubarsí", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Iñigo Martínez", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Frenkie De Jong", posicion: "MED", nacionalidad: "Países Bajos" },
        { nombre: "Pedri", posicion: "MED", nacionalidad: "España" },
        { nombre: "Ferran Torres", posicion: "MED", nacionalidad: "España" },
        { nombre: "Gavi", posicion: "MED", nacionalidad: "España" },
        { nombre: "Pau Víctor", posicion: "MED", nacionalidad: "España" },
        { nombre: "Dani Olmo", posicion: "MED", nacionalidad: "España" },
        { nombre: "Fermín", posicion: "MED", nacionalidad: "España" },
        { nombre: "Marc Casadó", posicion: "MED", nacionalidad: "España" },
        { nombre: "Lewandowski", posicion: "DEL", nacionalidad: "Polonia" },
        { nombre: "Raphinha", posicion: "DEL", nacionalidad: "Brasil" },
        { nombre: "Ansu Fati", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Lamine Yamal", posicion: "DEL", nacionalidad: "España" },
    ],
    "Getafe CF": [
        { nombre: "David Soria", posicion: "POR", nacionalidad: "España" },
        { nombre: "Letacek", posicion: "POR", nacionalidad: "República Checa" },
        { nombre: "Juan Berrocal", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Juan Iglésias", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Domingos Duarte", posicion: "DEF", nacionalidad: "Portugal" },
        { nombre: "Alderete", posicion: "DEF", nacionalidad: "Paraguay" },
        { nombre: "Diego Rico", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Álex Sola", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Luis Milla", posicion: "MED", nacionalidad: "España" },
        { nombre: "Mauri Arambarri", posicion: "MED", nacionalidad: "Uruguay" },
        { nombre: "Peter Federico", posicion: "MED", nacionalidad: "República Dominicana" },
        { nombre: "Christantus Uche", posicion: "MED", nacionalidad: "Nigeria" },
        { nombre: "Borja Mayoral", posicion: "DEL", nacionalidad: "España" },
    ],
    "Girona FC": [
        { nombre: "Gazzaniga", posicion: "POR", nacionalidad: "Argentina" },
        { nombre: "Juan Carlos", posicion: "POR", nacionalidad: "España" },
        { nombre: "Krapyvtsov", posicion: "POR", nacionalidad: "Ucrania" },
        { nombre: "Francés", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Krejci", posicion: "DEF", nacionalidad: "República Checa" },
        { nombre: "Arnau Martínez", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Miguel Gutiérrez", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Blind", posicion: "DEF", nacionalidad: "Países Bajos" },
        { nombre: "David Lopez", posicion: "MED", nacionalidad: "España" },
        { nombre: "Iván Martín", posicion: "MED", nacionalidad: "España" },
        { nombre: "Yangel Herrera", posicion: "MED", nacionalidad: "Venezuela" },
        { nombre: "Portu", posicion: "MED", nacionalidad: "España" },
        { nombre: "Jhon Solis", posicion: "MED", nacionalidad: "Colombia" },
        { nombre: "Miovski", posicion: "DEL", nacionalidad: "Macedonia" },
        { nombre: "Abel Ruiz", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Van De Beek", posicion: "DEL", nacionalidad: "Países Bajos" },
        { nombre: "Asprilla", posicion: "DEL", nacionalidad: "Colombia" },
        { nombre: "Stuani", posicion: "DEL", nacionalidad: "Argentina" },
        { nombre: "Tsygankov", posicion: "DEL", nacionalidad: "Ucrania" },
    ],
    "Levante UD": [
        { nombre: "Dela", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Sergio Lozano", posicion: "MED", nacionalidad: "España" },
        { nombre: "Iván Romero", posicion: "DEL", nacionalidad: "España" },
    ],
    "Rayo Vallecano": [
        { nombre: "Dani Cárdenas", posicion: "POR", nacionalidad: "España" },
        { nombre: "Pep Chavarria", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Mumin", posicion: "DEF", nacionalidad: "Ghana" },
        { nombre: "Lejeune", posicion: "DEF", nacionalidad: "Francia" },
        { nombre: "Andrei Ratiu", posicion: "DEF", nacionalidad: "Rumanía" },
        { nombre: "Álvaro García", posicion: "MED", nacionalidad: "España" },
        { nombre: "Oscar Valentín", posicion: "MED", nacionalidad: "España" },
        { nombre: "Isi Palazón", posicion: "MED", nacionalidad: "España" },
        { nombre: "Pathé Ciss", posicion: "MED", nacionalidad: "Senegal" },
        { nombre: "Unai Lopez", posicion: "MED", nacionalidad: "España" },
        { nombre: "Pedro Díaz", posicion: "MED", nacionalidad: "España" },
        { nombre: "Nteka", posicion: "MED", nacionalidad: "Angola" },
        { nombre: "De Frutos", posicion: "MED", nacionalidad: "España" },
        { nombre: "Sergio Camello", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Raúl de Tomás", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Óscar Trejo", posicion: "DEL", nacionalidad: "Argentina" },
    ],
    "RCD Espanyol": [
        { nombre: "Dmitrovic", posicion: "POR", nacionalidad: "Serbia" },
        { nombre: "Cabrera", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Salinas", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Miguel Rubio", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Fernando Calero", posicion: "DEF", nacionalidad: "España" },
        { nombre: "El Hilali", posicion: "DEF", nacionalidad: "Marruecos" },
        { nombre: "Rubén Sánchez", posicion: "MED", nacionalidad: "España" },
        { nombre: "Pablo Ramón", posicion: "MED", nacionalidad: "España" },
        { nombre: "Puado", posicion: "MED", nacionalidad: "España" },
        { nombre: "Edu Expósito", posicion: "MED", nacionalidad: "España" },
        { nombre: "Vencedor", posicion: "MED", nacionalidad: "España" },
        { nombre: "José Gragera", posicion: "MED", nacionalidad: "España" },
        { nombre: "Pol Lozano", posicion: "MED", nacionalidad: "España" },
        { nombre: "Kike García", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Jofre", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Pere Milla", posicion: "DEL", nacionalidad: "España" },
    ],
    "RCD Mallorca": [
        { nombre: "Greif", posicion: "POR", nacionalidad: "Eslovaquia" },
        { nombre: "Leo Román", posicion: "POR", nacionalidad: "España" },
        { nombre: "Raillo", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Valjent", posicion: "DEF", nacionalidad: "Eslovaquia" },
        { nombre: "Copete", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Maffeo", posicion: "DEF", nacionalidad: "Argentina" },
        { nombre: "Toni Lato", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Dani Rodríguez", posicion: "MED", nacionalidad: "España" },
        { nombre: "Antonio Sánchez", posicion: "MED", nacionalidad: "España" },
        { nombre: "Johan Mojica", posicion: "MED", nacionalidad: "Colombia" },
        { nombre: "Omar Mascarell", posicion: "MED", nacionalidad: "Guinea Ecuatorial" },
        { nombre: "Manu Morlanes", posicion: "MED", nacionalidad: "España" },
        { nombre: "Samú Costa", posicion: "MED", nacionalidad: "Portugal" },
        { nombre: "Sergi Darder", posicion: "MED", nacionalidad: "España" },
        { nombre: "Abdón Prats", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Takuma Asano", posicion: "DEL", nacionalidad: "Japón" },
        { nombre: "Muriqi", posicion: "DEL", nacionalidad: "Kosovo" },
        { nombre: "Larin", posicion: "DEL", nacionalidad: "Canadá" },
    ],
    "Real Betis": [
        { nombre: "Fran Vieites", posicion: "POR", nacionalidad: "España" },
        { nombre: "Adrián", posicion: "POR", nacionalidad: "España" },
        { nombre: "Bellerín", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Perraud", posicion: "DEF", nacionalidad: "Francia" },
        { nombre: "Diego Llorente", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Lo Celso", posicion: "MED", nacionalidad: "España" },
        { nombre: "Fornals", posicion: "MED", nacionalidad: "España" },
        { nombre: "Isco", posicion: "MED", nacionalidad: "España" },
        { nombre: "Altimira", posicion: "MED", nacionalidad: "España" },
        { nombre: "Marc Roca", posicion: "MED", nacionalidad: "España" },
        { nombre: "Aitor Ruibal", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Bakambu", posicion: "DEL", nacionalidad: "RD Congo" },
        { nombre: "Chimy Ávila", posicion: "DEL", nacionalidad: "Argentina" },
        { nombre: "Ez Abde", posicion: "DEL", nacionalidad: "Marruecos" },
    ],
    "Real Madrid": [
        { nombre: "Courtois", posicion: "POR", nacionalidad: "Bélgica" },
        { nombre: "Lunin", posicion: "POR", nacionalidad: "Ucrania" },
        { nombre: "Carvajal", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Dean Huijsen", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Trent", posicion: "DEF", nacionalidad: "Inglaterra" },
        { nombre: "Ferland Mendy", posicion: "DEF", nacionalidad: "Francia" },
        { nombre: "Éder Militão", posicion: "DEF", nacionalidad: "Brasil" },
        { nombre: "Alaba", posicion: "DEF", nacionalidad: "Austria" },
        { nombre: "Rüdiger", posicion: "DEF", nacionalidad: "Alemania" },
        { nombre: "Fran García", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Álvaro Carreras", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Valverde", posicion: "MED", nacionalidad: "Uruguay" },
        { nombre: "Camavinga", posicion: "MED", nacionalidad: "Francia" },
        { nombre: "Tchouameni", posicion: "MED", nacionalidad: "Francia" },
        { nombre: "Arda Güler", posicion: "MED", nacionalidad: "Turquía" },
        { nombre: "Brahim Díaz", posicion: "MED", nacionalidad: "Marruecos" },
        { nombre: "Dani Ceballos", posicion: "MED", nacionalidad: "España" },
        { nombre: "Jude Bellingham", posicion: "MED", nacionalidad: "Inglaterra" },
        { nombre: "Endrick", posicion: "DEL", nacionalidad: "Brasil" },
        { nombre: "Vini Jr", posicion: "DEL", nacionalidad: "Brasil" },
        { nombre: "Rodrygo", posicion: "DEL", nacionalidad: "Brasil" },
        { nombre: "Kylian Mbappé", posicion: "DEL", nacionalidad: "Francia" }
    ],
    "Real Oviedo": [
        { nombre: "Aarón", posicion: "POR", nacionalidad: "España" },
        { nombre: "Rahim", posicion: "DEF", nacionalidad: "Niger" },
        { nombre: "Nacho Vidal", posicion: "DEF", nacionalidad: "España" },
        { nombre: "David Costas", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Luengo", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Pomares", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Hassan", posicion: "MED", nacionalidad: "Francia" },
        { nombre: "Sibo", posicion: "MED", nacionalidad: "Ghana" },
        { nombre: "César de la Hoz", posicion: "MED", nacionalidad: "España" },
        { nombre: "Paraschiv", posicion: "DEL", nacionalidad: "Rumanía" },
    ],
    "Real Sociedad": [
        { nombre: "Álex Remiro", posicion: "POR", nacionalidad: "España" },
        { nombre: "Unai Marrero", posicion: "POR", nacionalidad: "España" },
        { nombre: "Aritz Elustondo", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Aihen Muñoz", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Pacheco", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Javi López", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Hamari Traoré", posicion: "DEF", nacionalidad: "Mali" },
        { nombre: "Álvaro Odriozola", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Aramburu", posicion: "MED", nacionalidad: "Venezuela" },
        { nombre: "Zubeldia", posicion: "MED", nacionalidad: "España" },
        { nombre: "Brais Méndez", posicion: "MED", nacionalidad: "España" },
        { nombre: "Take Kubo", posicion: "MED", nacionalidad: "Japón" },
        { nombre: "Sucic", posicion: "MED", nacionalidad: "Croacia" },
        { nombre: "Turrientes", posicion: "MED", nacionalidad: "España" },
        { nombre: "Zakharyan", posicion: "MED", nacionalidad: "Rusia" },
        { nombre: "Becker", posicion: "MED", nacionalidad: "Surinam" },
        { nombre: "Sergio Gómez", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Oyarzabal", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Barrenetxea", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Oskarsson", posicion: "DEL", nacionalidad: "Islandia" },
    ],
    "Sevilla FC": [
        { nombre: "Nyland", posicion: "POR", nacionalidad: "Noruega" },
        { nombre: "Marcao", posicion: "DEF", nacionalidad: "Brasil" },
        { nombre: "Nianzou", posicion: "DEF", nacionalidad: "Francia" },
        { nombre: "Pedrosa", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Badé", posicion: "DEF", nacionalidad: "Francia" },
        { nombre: "Carmona", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Kike Salas", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Gudelj", posicion: "MED", nacionalidad: "Serbia" },
        { nombre: "Sow", posicion: "MED", nacionalidad: "Suiza" },
        { nombre: "Juanlu", posicion: "MED", nacionalidad: "España" },
        { nombre: "Agoumé", posicion: "MED", nacionalidad: "Francia" },
        { nombre: "Ejuke", posicion: "DEL", nacionalidad: "Nigeria" },
        { nombre: "Peque", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Lukébakio", posicion: "DEL", nacionalidad: "Bélgica" },
        { nombre: "Isaac", posicion: "DEL", nacionalidad: "España" },
    ],
    "Valencia CF": [
        { nombre: "Dimitrievski", posicion: "POR", nacionalidad: "Macedonia" },
        { nombre: "Gayà", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Diakhaby", posicion: "DEF", nacionalidad: "Guinea" },
        { nombre: "César Tárrega", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Hugo Guillamón", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Jesús Vázquez", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Cömert", posicion: "DEF", nacionalidad: "Suiza" },
        { nombre: "Cenk", posicion: "DEF", nacionalidad: "Turquía" },
        { nombre: "Thierry Correia", posicion: "DEF", nacionalidad: "Portugal" },
        { nombre: "Mosquera", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Luis Rioja", posicion: "MED", nacionalidad: "España" },
        { nombre: "André Almeida", posicion: "MED", nacionalidad: "Portugal" },
        { nombre: "Pepelu", posicion: "MED", nacionalidad: "España" },
        { nombre: "Fran Pérez", posicion: "MED", nacionalidad: "España" },
        { nombre: "Javi Guerra", posicion: "MED", nacionalidad: "España" },
        { nombre: "Hugo Duro", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Alberto Marí", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Diego López", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Sergio Canós", posicion: "DEL", nacionalidad: "España" },
    ],
    "Villarreal CF": [
        { nombre: "Luiz Júnior", posicion: "POR", nacionalidad: "Brasil" },
        { nombre: "Diego Conde", posicion: "POR", nacionalidad: "España" },
        { nombre: "Costa", posicion: "DEF", nacionalidad: "Cabo Verde" },
        { nombre: "Sergi Cardona", posicion: "DEF", nacionalidad: "España" },
        { nombre: "Foyth", posicion: "DEF", nacionalidad: "Argentina" },
        { nombre: "Kambwala", posicion: "DEF", nacionalidad: "Francia" },
        { nombre: "Parejo", posicion: "MED", nacionalidad: "España" },
        { nombre: "Pepe", posicion: "MED", nacionalidad: "Costa de Marfil" },
        { nombre: "Gueye", posicion: "MED", nacionalidad: "Senegal" },
        { nombre: "Denis Suárez", posicion: "MED", nacionalidad: "España" },
        { nombre: "Santi Comesaña", posicion: "MED", nacionalidad: "España" },
        { nombre: "Ramón Terrats", posicion: "MED", nacionalidad: "España" },
        { nombre: "Ayoze Pérez ", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Barry", posicion: "DEL", nacionalidad: "Francia" },
        { nombre: "Gerard Romero", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Pedraza", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Yeremy Pino", posicion: "DEL", nacionalidad: "España" },
        { nombre: "Ilias Akhomach", posicion: "DEL", nacionalidad: "Marruecos" },
    ],
};

const jugadoresEspañolesClave = [
    "Nacho", "Dani Carvajal", "Joselu", "Sergi Darder"
];
const porterosClaveLiga = [
    "Thibaut Courtois", "Andriy Lunin", "Sergio Herrera"
];
const jugadoresClaveLiga = [
    "Jude Bellingham", "Vinicius Jr.", "Kylian Mbappé", "Ante Budimir"
];

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


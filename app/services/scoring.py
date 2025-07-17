from ..db import models

# --- REGLAS DE PUNTUACIÓN ---
PUNTOS_1X2 = 50
PUNTOS_GOLES_RM = 15
PUNTOS_GOLES_RIVAL = 15
PUNTOS_DIFERENCIA = 10
PUNTOS_GOLEADOR = 20
PUNTOS_MVP = 30
BONUS_PLENO = 15

def calcular_puntos(prediccion: models.Prediccion, partido: models.Partido):
    """
    Calcula los puntos para una única predicción basándose en el resultado de un partido.
    NOTA: No incluye bonus comunitarios como el 'Bonus Diferencial'.
    """
    puntos_totales = 0
    acierto_1x2 = False

    # Asumimos que el Real Madrid es el equipo local para simplificar
    # En el futuro, podemos detectar si es local o visitante
    goles_rm_real = partido.Goles_Local
    goles_rival_real = partido.Goles_Visitante
    goles_rm_prediccion = prediccion.Prediccion_Goles_Local
    goles_rival_prediccion = prediccion.Prediccion_Goles_Visitante

    # --- CÁLCULO DE PUNTOS BASE ---
    aciertos = []

    # 1. Acierto de Resultado (1X2)
    resultado_real = 'X'
    if goles_rm_real > goles_rival_real:
        resultado_real = '1'
    elif goles_rm_real < goles_rival_real:
        resultado_real = '2'

    resultado_prediccion = 'X'
    if goles_rm_prediccion > goles_rival_prediccion:
        resultado_prediccion = '1'
    elif goles_rm_prediccion < goles_rival_prediccion:
        resultado_prediccion = '2'

    if resultado_real == resultado_prediccion:
        puntos_totales += PUNTOS_1X2
        acierto_1x2 = True
        aciertos.append("1X2")

    # 2. Acierto Goles del Real Madrid
    if goles_rm_real == goles_rm_prediccion:
        puntos_totales += PUNTOS_GOLES_RM
        aciertos.append("Goles RM")

    # 3. Acierto Goles del Rival
    if goles_rival_real == goles_rival_prediccion:
        puntos_totales += PUNTOS_GOLES_RIVAL
        aciertos.append("Goles Rival")

    # 4. Acierto Diferencia de Goles
    if (goles_rm_real - goles_rival_real) == (goles_rm_prediccion - goles_rival_prediccion):
        puntos_totales += PUNTOS_DIFERENCIA
        aciertos.append("Diferencia Goles")

    # 5. Acierto Goleador
    if partido.Goleador_Real and (partido.Goleador_Real.lower() == prediccion.Prediccion_Goleador.lower()):
        puntos_totales += PUNTOS_GOLEADOR
        aciertos.append("Goleador")

    # 6. Acierto MVP
    if partido.MVP_Real and (partido.MVP_Real.lower() == prediccion.Prediccion_MVP.lower()):
        puntos_totales += PUNTOS_MVP
        aciertos.append("MVP")

    # --- CÁLCULO DE BONUS ---

    # Bonus por PLENO (si ha acertado las 6 categorías)
    if len(aciertos) == 6:
        puntos_totales += BONUS_PLENO

    # Bonus BOOSTER Individual
    if prediccion.Booster_Activado and acierto_1x2: # Solo se aplica si acierta el 1X2
        puntos_booster = 0
        if "1X2" in aciertos: puntos_booster += PUNTOS_1X2
        if "Goles RM" in aciertos: puntos_booster += PUNTOS_GOLES_RM
        if "Goles Rival" in aciertos: puntos_booster += PUNTOS_GOLES_RIVAL
        if "Diferencia Goles" in aciertos: puntos_booster += PUNTOS_DIFERENCIA
        puntos_totales += puntos_booster

    return puntos_totales, acierto_1x2

    # Multiplicador por Partidazo DORM
    if partido.Es_Partidazo:
        puntos_totales *= 2

    return puntos_totales, acierto_1x2

def actualizar_racha_y_bonus(usuario: models.Usuario, acertado_1x2: bool, jornada_actual: int):
    """
    Actualiza la racha de aciertos 1X2 del usuario y devuelve los puntos de bonus.
    """
    BONUS_TENDENCIA = 10
    puntos_bonus = 0

    if acertado_1x2:
        # Si la última jornada que acertó es la anterior a esta, la racha continúa
        if usuario.Ultima_Jornada_Acertada_1X2 == jornada_actual - 1:
            usuario.Win_Streak_Consecutivos += 1
        else:
            # Si no, se reinicia la racha a 1
            usuario.Win_Streak_Consecutivos = 1

        # Se actualiza la última jornada acertada a la actual
        usuario.Ultima_Jornada_Acertada_1X2 = jornada_actual

        # Si la racha llega a 4 (3 aciertos seguidos + el actual), se aplica el bonus
        if usuario.Win_Streak_Consecutivos >= 4:
            puntos_bonus = BONUS_TENDENCIA
    else:
        # Si falla, la racha se resetea a 0
        usuario.Win_Streak_Consecutivos = 0

    return puntos_bonus
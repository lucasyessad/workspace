import turtle

# Configuration de la tortue
t = turtle.Turtle()
t.speed(3)  # Réglage de la vitesse

# Position initiale
t.penup()
t.goto(0, 0)  # Aller à (0, 0)
t.pendown()

# Début du tracé
for _ in range(2):  # Répéter 2 fois
    t.forward(60)   # Avancer de 60 unités
    t.left(45)      # Tourner de 45 degrés
    t.forward(60)   # Avancer de 60 unités
    t.left(135)     # Tourner de 135 degrés

# Terminer le dessin
turtle.done()

import os
from dotenv import load_dotenv
from groq import Groq

# Charger les variables d'environnement
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY introuvable dans le .env")

client = Groq(api_key=api_key)

# Demander une question à l'utilisateur
question = input("Pose ta question : ")

# 🔹 Afficher la question dans le terminal
print("\n--- QUESTION ---")
print(question)

# Envoyer la requête à Groq
response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {"role": "user", "content": question}
    ],
    temperature=0.7
)

# 🔹 Afficher la réponse
print("\n--- RÉPONSE ---")
print(response.choices[0].message.content)
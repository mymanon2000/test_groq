import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
from groq import Groq

# Charger les variables d'environnement
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY introuvable dans le .env")

client = Groq(api_key=api_key)

app = Flask(__name__)

# Historique de conversation
conversation_history = []

@app.route("/")
def index():
    """Page principale"""
    return render_template("index.html")

@app.route("/api/message", methods=["POST"])
def send_message():
    """Endpoint pour envoyer un message"""
    try:
        data = request.json
        user_message = data.get("message", "").strip()
        
        if not user_message:
            return jsonify({"error": "Le message ne peut pas être vide"}), 400
        
        # Ajouter le message utilisateur à l'historique
        conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        # Envoyer la requête à Groq
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=conversation_history,
            temperature=0.7
        )
        
        # Récupérer la réponse
        assistant_message = response.choices[0].message.content
        
        # Ajouter la réponse à l'historique
        conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })
        
        return jsonify({
            "success": True,
            "response": assistant_message
        })
    
    except Exception as e:
        return jsonify({
            "error": f"Erreur lors du traitement: {str(e)}"
        }), 500

@app.route("/api/clear", methods=["POST"])
def clear_conversation():
    """Efface l'historique de la conversation"""
    global conversation_history
    conversation_history = []
    return jsonify({"success": True, "message": "Conversation effacée"})

if __name__ == "__main__":
    print("🚀 Démarrage du serveur...")
    print("📺 Ouvrez http://localhost:5000 dans votre navigateur")
    app.run(debug=True, host="0.0.0.0", port=5000)
// Éléments du DOM
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messages');
const sendBtn = document.querySelector('.send-btn');
const clearBtn = document.getElementById('clearBtn');
const statusMessage = document.getElementById('statusMessage');

// Événements
chatForm.addEventListener('submit', handleSendMessage);
clearBtn.addEventListener('click', handleClearConversation);

// Fonction pour envoyer un message
async function handleSendMessage(event) {
    event.preventDefault();
    
    const message = messageInput.value.trim();
    
    if (!message) {
        showStatus('Veuillez entrer un message', 'error');
        return;
    }
    
    // Désactiver les contrôles pendant l'envoi
    messageInput.disabled = true;
    sendBtn.disabled = true;
    
    try {
        // Afficher le message utilisateur
        addMessage(message, 'user');
        messageInput.value = '';
        
        // Afficher l'indicateur de chargement
        showStatus('⏳ Groq répond...', 'loading');
        
        // Envoyer le message au serveur
        const response = await fetch('/api/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de l\'envoi du message');
        }
        
        // Afficher la réponse de Groq
        addMessage(data.response, 'bot');
        showStatus('');
        
    } catch (error) {
        console.error('Erreur:', error);
        showStatus('❌ ' + error.message, 'error');
        addMessage(`Erreur: ${error.message}`, 'bot');
    } finally {
        // Réactiver les contrôles
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// Fonction pour ajouter un message à la conversation
function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Formater le contenu (support du markdown basique)
    contentDiv.innerHTML = escapeHtml(content)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroller vers le bas
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Fonction pour effacer la conversation
async function handleClearConversation() {
    if (!confirm('Êtes-vous sûr de vouloir effacer toute la conversation?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/clear', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de l\'effacement');
        }
        
        // Vider les messages et ajouter un message de bienvenue
        messagesContainer.innerHTML = '';
        addMessage('Bonjour! Je suis Groq, votre assistant IA. Posez-moi vos questions! 👋', 'bot');
        showStatus('✓ Conversation effacée', 'loading');
        
        setTimeout(() => {
            showStatus('');
        }, 2000);
        
    } catch (error) {
        console.error('Erreur:', error);
        showStatus('❌ ' + error.message, 'error');
    }
}

// Fonction pour afficher un message de statut
function showStatus(message, className = '') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${className}`;
}

// Fonction pour échapper le HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Focus sur l'input au chargement
window.addEventListener('load', () => {
    messageInput.focus();
});

// Permettre le Enter pour envoyer le message
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

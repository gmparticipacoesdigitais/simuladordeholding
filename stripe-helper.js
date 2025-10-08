// ============================================================================
// STRIPE HELPER - Cliente JavaScript para Integração com Stripe
// Facilita chamadas às Cloud Functions e gerenciamento de estado
// ============================================================================

import { cloudFunctionUrl } from './firebase-config.js';

/**
 * Helper para gerenciar integração com Stripe no frontend
 */
class StripeHelper {
  constructor() {
    this.cloudFunctionUrl = cloudFunctionUrl;
  }

  /**
   * Cria uma sessão de checkout
   */
  async createCheckoutSession(userId, userEmail, userName, options = {}) {
    try {
      const response = await fetch(`${this.cloudFunctionUrl}/createCheckoutSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          userEmail,
          userName,
          priceId: options.priceId,
          trialDays: options.trialDays
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Erro ao criar sessão');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar checkout:', error);
      throw error;
    }
  }

  /**
   * Cria uma sessão do portal de cobrança
   */
  async createPortalSession(userId) {
    try {
      const response = await fetch(`${this.cloudFunctionUrl}/createPortalSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Erro ao criar portal');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar portal:', error);
      throw error;
    }
  }

  /**
   * Busca status da assinatura
   */
  async getSubscriptionStatus(userId) {
    try {
      const response = await fetch(`${this.cloudFunctionUrl}/getSubscriptionStatus?userId=${userId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Erro ao buscar status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar status:', error);
      throw error;
    }
  }

  /**
   * Cancela assinatura
   */
  async cancelSubscription(userId, immediate = false) {
    try {
      const response = await fetch(`${this.cloudFunctionUrl}/cancelSubscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, immediate })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Erro ao cancelar');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao cancelar:', error);
      throw error;
    }
  }

  /**
   * Redireciona para checkout
   */
  async redirectToCheckout(userId, userEmail, userName, options = {}) {
    try {
      const session = await this.createCheckoutSession(userId, userEmail, userName, options);

      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error) {
      console.error('❌ Erro ao redirecionar:', error);
      throw error;
    }
  }

  /**
   * Redireciona para portal
   */
  async redirectToPortal(userId) {
    try {
      const session = await this.createPortalSession(userId);

      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('URL do portal não retornada');
      }
    } catch (error) {
      console.error('❌ Erro ao redirecionar:', error);
      throw error;
    }
  }
}

/**
 * Gerenciador de UI para loading states
 */
class UIManager {
  /**
   * Mostra loading em um botão
   */
  static setButtonLoading(button, loading, originalText = null) {
    if (loading) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = '<span class="loading-spinner"></span> Processando...';
    } else {
      button.disabled = false;
      button.innerHTML = originalText || button.dataset.originalText || 'Continuar';
    }
  }

  /**
   * Mostra um alerta/notificação
   */
  static showNotification(message, type = 'info', duration = 5000) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? 'rgba(16, 185, 129, 0.95)' : type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(129, 140, 248, 0.95)'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      max-width: 400px;
    `;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    notification.innerHTML = `${icon} ${message}`;

    document.body.appendChild(notification);

    // Auto-remover
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  /**
   * Mostra modal de confirmação
   */
  static async confirm(title, message) {
    return new Promise((resolve) => {
      const result = window.confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  }
}

/**
 * Validador de dados
 */
class Validator {
  /**
   * Valida email
   */
  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Valida se todos os campos obrigatórios estão preenchidos
   */
  static validateRequired(data, fields) {
    const missing = [];

    for (const field of fields) {
      if (!data[field]) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios faltando: ${missing.join(', ')}`);
    }

    return true;
  }
}

/**
 * Formatadores de dados
 */
class Formatter {
  /**
   * Formata data para pt-BR
   */
  static formatDate(dateString) {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  }

  /**
   * Formata moeda BRL
   */
  static formatCurrency(amount) {
    if (!amount) return 'R$ 0,00';

    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount / 100); // Stripe usa centavos
    } catch (error) {
      console.error('Erro ao formatar moeda:', error);
      return `R$ ${amount}`;
    }
  }

  /**
   * Retorna badge HTML de status
   */
  static getStatusBadge(status) {
    const statusMap = {
      'active': { label: 'Ativa', color: '#10b981' },
      'trialing': { label: 'Trial', color: '#10b981' },
      'canceled': { label: 'Cancelada', color: '#f59e0b' },
      'incomplete': { label: 'Incompleta', color: '#ef4444' },
      'past_due': { label: 'Atrasada', color: '#ef4444' },
      'unpaid': { label: 'Não Paga', color: '#ef4444' }
    };

    const statusInfo = statusMap[status] || { label: status || 'Inativa', color: '#6b7280' };

    return `
      <span style="
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        background: ${statusInfo.color}20;
        color: ${statusInfo.color};
        border: 1px solid ${statusInfo.color}30;
      ">
        ${statusInfo.label}
      </span>
    `;
  }
}

/**
 * Gerenciador de erros
 */
class ErrorHandler {
  /**
   * Trata erros de forma amigável
   */
  static handle(error, context = '') {
    console.error(`❌ Erro${context ? ` em ${context}` : ''}:`, error);

    let message = 'Ocorreu um erro. Tente novamente.';

    if (error.message) {
      message = error.message;
    }

    // Mapear erros comuns
    const errorMessages = {
      'Network request failed': 'Erro de conexão. Verifique sua internet.',
      'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
      'permission-denied': 'Você não tem permissão para esta ação.',
      'unauthenticated': 'Você precisa estar autenticado.',
      'not-found': 'Recurso não encontrado.'
    };

    for (const [key, value] of Object.entries(errorMessages)) {
      if (message.includes(key)) {
        message = value;
        break;
      }
    }

    UIManager.showNotification(message, 'error');
    return message;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  StripeHelper,
  UIManager,
  Validator,
  Formatter,
  ErrorHandler
};

// Tornar disponível globalmente para scripts não-module
window.StripeHelper = StripeHelper;
window.UIManager = UIManager;
window.Validator = Validator;
window.Formatter = Formatter;
window.ErrorHandler = ErrorHandler;

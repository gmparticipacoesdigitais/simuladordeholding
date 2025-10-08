// ============================================================================
// DATACONNECT INTEGRATION - Sistema IRPF
// Integração com Firebase Data Connect
// ============================================================================

import { connectorConfig } from './src/dataconnect-generated';

// Configuração do Data Connect
const dataConnectConfig = {
  connector: connectorConfig.connector,
  service: connectorConfig.service,
  location: connectorConfig.location
};

// Importar queries e mutations
import {
  GetUser,
  GetUserByEmail,
  CheckPaymentStatus,
  GetLatestCalculation,
  GetCalculationHistory,
  GetUserPayments,
  GetLatestPayment,
  GetUserAuditLogs,
  UpsertUser,
  UpdateUserLogin,
  UpdatePaymentStatus,
  CreatePayment,
  UpdatePaymentStatus2,
  SaveCalculation,
  CreateAuditLog,
  DeleteUser
} from './src/dataconnect-generated';

// ============================================================================
// FUNÇÕES DE USUÁRIO
// ============================================================================

/**
 * Buscar ou criar usuário no Data Connect
 * @param {string} email
 * @param {string} displayName
 * @param {string} provider - 'email' ou 'google'
 */
export async function upsertUser(email, displayName, provider) {
  try {
    await UpsertUser({
      email,
      displayName,
      provider
    });
    console.log('✅ Usuário criado/atualizado no Data Connect');
  } catch (error) {
    console.error('❌ Erro ao upsert usuário:', error);
    throw error;
  }
}

/**
 * Buscar usuário por ID
 * @param {string} userId
 */
export async function getUser(userId) {
  try {
    const result = await GetUser({ userId });
    return result.data.user;
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return null;
  }
}

/**
 * Verificar status de pagamento
 * @param {string} userId
 */
export async function checkPaymentStatus(userId) {
  try {
    const result = await CheckPaymentStatus({ userId });
    return result.data.user?.hasPaid || false;
  } catch (error) {
    console.error('❌ Erro ao verificar pagamento:', error);
    return false;
  }
}

/**
 * Atualizar último login
 * @param {string} userId
 */
export async function updateUserLogin(userId) {
  try {
    await UpdateUserLogin({ userId });
    console.log('✅ Login atualizado');
  } catch (error) {
    console.error('❌ Erro ao atualizar login:', error);
  }
}

/**
 * Atualizar status de pagamento do usuário
 * @param {string} userId
 * @param {boolean} hasPaid
 * @param {string} stripeCustomerId
 */
export async function updatePaymentStatus(userId, hasPaid, stripeCustomerId) {
  try {
    await UpdatePaymentStatus({ userId, hasPaid, stripeCustomerId });
    console.log('✅ Status de pagamento atualizado');
  } catch (error) {
    console.error('❌ Erro ao atualizar status de pagamento:', error);
    throw error;
  }
}

// ============================================================================
// FUNÇÕES DE CÁLCULO
// ============================================================================

/**
 * Salvar novo cálculo IRPF
 */
export async function saveCalculation(userId, calculationData) {
  try {
    await SaveCalculation({
      userId,
      ...calculationData
    });
    console.log('✅ Cálculo salvo no Data Connect');
  } catch (error) {
    console.error('❌ Erro ao salvar cálculo:', error);
    throw error;
  }
}

/**
 * Buscar último cálculo do usuário
 */
export async function getLatestCalculation(userId) {
  try {
    const result = await GetLatestCalculation({ userId });
    return result.data.calculations?.[0] || null;
  } catch (error) {
    console.error('❌ Erro ao buscar último cálculo:', error);
    return null;
  }
}

/**
 * Buscar histórico de cálculos
 */
export async function getCalculationHistory(userId, limit = 10) {
  try {
    const result = await GetCalculationHistory({ userId, limit });
    return result.data.calculations || [];
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    return [];
  }
}

// ============================================================================
// FUNÇÕES DE PAGAMENTO
// ============================================================================

/**
 * Criar registro de pagamento
 */
export async function createPayment(userId, paymentData) {
  try {
    await CreatePayment({
      userId,
      ...paymentData
    });
    console.log('✅ Pagamento registrado');
  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    throw error;
  }
}

/**
 * Buscar pagamentos do usuário
 */
export async function getUserPayments(userId) {
  try {
    const result = await GetUserPayments({ userId });
    return result.data.payments || [];
  } catch (error) {
    console.error('❌ Erro ao buscar pagamentos:', error);
    return [];
  }
}

// ============================================================================
// FUNÇÕES DE AUDITORIA
// ============================================================================

/**
 * Criar log de auditoria
 */
export async function createAuditLog(userId, action, details = null) {
  try {
    await CreateAuditLog({
      userId,
      action,
      details,
      ipAddress: null,
      userAgent: navigator?.userAgent || null
    });
  } catch (error) {
    console.error('❌ Erro ao criar log:', error);
  }
}

/**
 * Buscar logs de auditoria
 */
export async function getUserAuditLogs(userId, limit = 20) {
  try {
    const result = await GetUserAuditLogs({ userId, limit });
    return result.data.auditLogs || [];
  } catch (error) {
    console.error('❌ Erro ao buscar logs:', error);
    return [];
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Deletar todos os dados do usuário (GDPR)
 */
export async function deleteUserData(userId) {
  try {
    await DeleteUser({ userId });
    console.log('✅ Dados do usuário deletados');
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    throw error;
  }
}

// Exportar todas as funções
export default {
  // Usuário
  upsertUser,
  getUser,
  checkPaymentStatus,
  updateUserLogin,
  updatePaymentStatus,

  // Cálculo
  saveCalculation,
  getLatestCalculation,
  getCalculationHistory,

  // Pagamento
  createPayment,
  getUserPayments,

  // Auditoria
  createAuditLog,
  getUserAuditLogs,

  // GDPR
  deleteUserData
};

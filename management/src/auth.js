export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export function authErrorMessage(error, t, patient = false) {
  let code = error?.code || error?.name || '';
  // Older Auth responses carry only a message, without a machine code.
  if (!error?.code && /invalid login credentials/i.test(error?.message || '')) code = 'invalid_credentials';
  if (!error?.code && /email not confirmed/i.test(error?.message || '')) code = 'email_not_confirmed';
  if (['invalid_credentials', 'credentials', 'invalid_grant'].includes(code)) {
    return patient
      ? t('CPF ou senha incorretos. Use a senha da Área do Paciente fornecida pela clínica.', 'Incorrect CPF or password. Use the Patient Area password provided by the clinic.')
      : t('Email ou senha incorretos. Confira o email ou use “Esqueci minha senha”.', 'Incorrect email or password. Check your email or use “Forgot my password”.');
  }
  if (code === 'email_not_confirmed') return t('Confirme seu email pelo convite antes de entrar.', 'Confirm your email through the invitation before signing in.');
  if (['membership_required', 'membership_inactive'].includes(code)) return t('Sua conta não tem acesso ativo à clínica. Entre em contato com a proprietária.', 'Your account has no active clinic access. Contact the clinic owner.');
  if (code === 'membership_invited') return t('Conclua o convite recebido por email para ativar seu acesso.', 'Complete the email invitation to activate your access.');
  if (['over_request_rate_limit', 'over_email_send_rate_limit', 'rate_limit', '429'].includes(code) || error?.status === 429) return t('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.', 'Too many attempts. Wait a few minutes before trying again.');
  if (['otp_expired', 'access_denied', 'bad_code_verifier', 'flow_state_expired', 'flow_state_not_found', 'callback_invalid'].includes(code)) return t('Link inválido ou expirado. Solicite um novo link de recuperação.', 'Invalid or expired link. Request a new recovery link.');
  if (['auth', 'session_not_found', 'refresh_token_not_found', 'refresh_token_already_used'].includes(code)) return t('Sua sessão expirou. Entre novamente.', 'Your session expired. Sign in again.');
  if (['portal_unavailable', 'membership_unavailable', 'request_failed', 'service_unavailable', 'TypeError', 'AbortError', 'TimeoutError', 'AuthRetryableFetchError'].includes(code) || error?.status >= 500) return t('O serviço de acesso está indisponível. Tente novamente em instantes. Se continuar, contate o suporte.', 'The sign-in service is unavailable. Try again shortly. If it continues, contact support.');
  return t('Não foi possível concluir o acesso. Tente novamente ou contate o suporte.', 'Could not complete sign-in. Try again or contact support.');
}

// Supabase supports query callbacks (PKCE/code and token_hash) as well as
// implicit-flow URL fragments. Never leave credentials in browser history.
export function authCallback(href) {
  const url = new URL(href);
  const fragment = new URLSearchParams(url.hash.slice(1));
  const get = (key) => fragment.get(key) || url.searchParams.get(key);
  const callback = {
    type: get('type'), token_hash: get('token_hash'),
    access_token: get('access_token'), refresh_token: get('refresh_token'),
    code: get('code'), error: get('error_code') || get('error')
  };
  const keys = ['type', 'token_hash', 'access_token', 'refresh_token', 'code', 'error', 'error_code', 'error_description', 'expires_at', 'expires_in', 'token_type'];
  for (const key of keys) { url.searchParams.delete(key); fragment.delete(key); }
  url.hash = fragment.toString();
  return { ...callback, cleanUrl: `${url.pathname}${url.search}${url.hash}` };
}

export async function acceptAuthCallback(auth, callback) {
  if (callback.error) throw { code: callback.error };
  const { type, token_hash, access_token, refresh_token, code } = callback;
  if (!token_hash && !access_token && !refresh_token && !code) return false;
  if (type && !['invite', 'recovery'].includes(type)) throw { code: 'callback_invalid' };
  let result;
  if (code) result = await auth.exchangeCodeForSession(code);
  else if (token_hash && type) result = await auth.verifyOtp({ token_hash, type });
  else if (access_token && refresh_token && type) result = await auth.setSession({ access_token, refresh_token });
  else throw { code: 'callback_invalid' };
  if (result.error) throw result.error;
  // PKCE recovery redirects may omit type. They must still open password setup.
  return type || 'setup';
}

// Promise-based dialogs keep destructive actions behind an explicit choice.
let queue = Promise.resolve();
function ask(message, { value, input = false, informational = false } = {}) {
  const next = queue.then(() => new Promise((resolve) => {
    const previous = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'sf-action-dialog';
    dialog.setAttribute('aria-labelledby', 'sf-action-dialog-title');
    const form = document.createElement('form');
    form.method = 'dialog';
    const heading = document.createElement('h2');
    heading.id = 'sf-action-dialog-title';
    heading.textContent = informational ? 'Informação' : input ? 'Editar informação' : 'Confirmar ação';
    const description = document.createElement('p');
    description.textContent = message;
    form.append(heading, description);
    let field;
    if (input) {
      field = document.createElement('input');
      field.type = 'text'; field.value = value || '';
      field.setAttribute('aria-label', message); field.required = true;
      form.append(field);
    }
    const actions = document.createElement('div');
    actions.className = 'sf-action-dialog__actions';
    if (!informational) {
      const cancel = document.createElement('button');
      cancel.type = 'button'; cancel.textContent = 'Cancelar';
      cancel.addEventListener('click', () => dialog.close('cancel'));
      actions.append(cancel);
    }
    const accept = document.createElement('button');
    accept.type = 'submit'; accept.textContent = informational ? 'Entendi' : input ? 'Salvar' : 'Confirmar';
    accept.className = 'primary'; actions.append(accept);
    form.append(actions); dialog.append(form); document.body.append(dialog);
    form.addEventListener('submit', (event) => { event.preventDefault(); dialog.close('accept'); });
    dialog.addEventListener('close', () => {
      const result = dialog.returnValue === 'accept' ? (input ? field.value.trim() : true) : (input ? null : false);
      dialog.remove(); previous?.focus(); resolve(result);
    }, { once: true });
    dialog.showModal();
    (field || actions.querySelector('button'))?.focus();
    field?.select();
  }));
  queue = next.catch(() => {});
  return next;
}
export const confirmAction = (message) => ask(message);
export const promptAction = (message, value = '') => ask(message, { value, input: true });
export const showMessage = (message) => ask(message, { informational: true });

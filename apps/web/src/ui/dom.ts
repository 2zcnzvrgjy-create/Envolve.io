/** Récupère un élément obligatoire de la page, avec un message clair s'il manque. */
export function requireElement<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) {
    throw new Error(`Élément #${id} introuvable ou de type inattendu`);
  }
  return element;
}

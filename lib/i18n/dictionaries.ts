export type Locale = "es" | "en";

export const locales: Locale[] = ["es", "en"];
export const defaultLocale: Locale = "es";

const dictionaries = {
  es: {
    app: {
      name: "Tablero de Equipo",
    },
    banner: {
      signedInAs: "Sesión: {name}",
      logout: "Cerrar sesión",
    },
    sidebar: {
      workspaces: "Espacios de trabajo",
      boards: "Tableros",
      collapse: "Contraer barra lateral",
      expand: "Expandir barra lateral",
    },
    columns: {
      todo: "Por hacer",
      doing: "En curso",
      done: "Hecho",
    },
    board: {
      addCard: "+ agregar tarjeta",
      addCardPlaceholder: "Escribe un título…",
      emptyColumn: "Nada por aquí todavía.",
      emptyColumnAction: "Agrega la primera tarjeta",
      unassigned: "Sin asignar",
      noBoards: "Este espacio de trabajo aún no tiene tableros.",
      selectBoard: "Selecciona un tablero para comenzar.",
    },
    task: {
      title: "Título",
      status: "Estado",
      assignee: "Responsable",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar tarjeta",
      close: "Cerrar",
      deleteConfirmTitle: "¿Eliminar esta tarjeta?",
      deleteConfirmBody: "Esta acción no se puede deshacer.",
    },
    theme: {
      light: "Claro",
      dark: "Oscuro",
      system: "Sistema",
      toggle: "Cambiar tema",
    },
    lang: {
      toggle: "Idioma",
    },
    errors: {
      loadFailed: "No se pudo cargar la información.",
      saveFailed: "No se pudo guardar el cambio.",
      genericTitle: "Algo salió mal",
    },
    auth: {
      title: "Iniciar sesión",
      email: "Correo electrónico",
      password: "Contraseña",
      submit: "Entrar",
      invalid: "Correo o contraseña inválidos",
      subtitle: "Usa una de las cuentas semilla (ver README) o una creada por un owner.",
    },
    members: {
      manage: "Gestionar usuarios",
      title: "Usuarios del espacio",
      addTitle: "Agregar usuario",
      name: "Nombre",
      email: "Correo",
      role: "Rol",
      roleOwner: "Owner",
      roleMember: "Member",
      add: "Agregar",
      remove: "Quitar",
      close: "Cerrar",
      temporaryPassword: "Contraseña temporal generada: {password}",
      ownerOnly: "Solo un owner de este espacio puede gestionar usuarios.",
      lastOwner: "El espacio debe mantener al menos un owner.",
    },
  },
  en: {
    app: {
      name: "Team Task Board",
    },
    banner: {
      signedInAs: "Signed in as: {name}",
      logout: "Log out",
    },
    sidebar: {
      workspaces: "Workspaces",
      boards: "Boards",
      collapse: "Collapse sidebar",
      expand: "Expand sidebar",
    },
    columns: {
      todo: "To do",
      doing: "Doing",
      done: "Done",
    },
    board: {
      addCard: "+ add card",
      addCardPlaceholder: "Type a title…",
      emptyColumn: "Nothing here yet.",
      emptyColumnAction: "Add the first card",
      unassigned: "Unassigned",
      noBoards: "This workspace has no boards yet.",
      selectBoard: "Select a board to get started.",
    },
    task: {
      title: "Title",
      status: "Status",
      assignee: "Assignee",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit card",
      close: "Close",
      deleteConfirmTitle: "Delete this card?",
      deleteConfirmBody: "This action cannot be undone.",
    },
    theme: {
      light: "Light",
      dark: "Dark",
      system: "System",
      toggle: "Toggle theme",
    },
    lang: {
      toggle: "Language",
    },
    errors: {
      loadFailed: "Couldn't load the data.",
      saveFailed: "Couldn't save the change.",
      genericTitle: "Something went wrong",
    },
    auth: {
      title: "Sign in",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      invalid: "Invalid email or password",
      subtitle: "Use one of the seed accounts (see README) or one created by an owner.",
    },
    members: {
      manage: "Manage users",
      title: "Workspace users",
      addTitle: "Add user",
      name: "Name",
      email: "Email",
      role: "Role",
      roleOwner: "Owner",
      roleMember: "Member",
      add: "Add",
      remove: "Remove",
      close: "Close",
      temporaryPassword: "Generated temporary password: {password}",
      ownerOnly: "Only a workspace owner can manage users.",
      lastOwner: "Workspace must keep at least one owner.",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type Locale = "es" | "en";

export const locales: Locale[] = ["es", "en"];
export const defaultLocale: Locale = "es";

const dictionaries = {
  es: {
    app: {
      name: "Tablero de Equipo",
    },
    banner: {
      signedInAs: "Sesión de prueba: {name} (usuario simulado)",
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
  },
  en: {
    app: {
      name: "Team Task Board",
    },
    banner: {
      signedInAs: "Signed in as: {name} (dev stub)",
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
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

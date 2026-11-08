export interface PublicSection {
  title: string;
  description: string;
  intro: string;
  groups: {
    title: string;
    items: string[];
  }[];
}

export const sections = {
  organizacion: {
    title: "Organización",
    description: "Conoce la organización y los órganos del IES Ramón Arcas Meca.",
    intro: "Información sobre las personas, equipos y recursos que organizan la vida del centro.",
    groups: [
      {
        title: "El centro",
        items: ["Quiénes somos", "Equipo directivo", "Consejo escolar", "Claustro"],
      },
      {
        title: "Coordinación y vida escolar",
        items: [
          "Comisión de coordinación pedagógica",
          "Departamentos",
          "Horarios",
          "Calendario escolar",
        ],
      },
      {
        title: "Documentación",
        items: ["Documentos institucionales"],
      },
    ],
  },
  familias: {
    title: "Familias",
    description: "Recursos, documentos y orientación para las familias del centro.",
    intro: "Un espacio de consulta para acompañar a las familias en la vida educativa.",
    groups: [
      {
        title: "Información y recursos",
        items: [
          "Documentos y enlaces de interés",
          "Criterios de evaluación y calificación",
          "Equipos docentes",
          "Atención a familias",
          "Tutoriales de acceso a plataformas",
        ],
      },
      {
        title: "Convivencia y participación",
        items: ["Buzón de quejas y sugerencias", "Guía de convivencia", "El rincón de pensar"],
      },
    ],
  },
  ensenanzas: {
    title: "Enseñanzas",
    description: "Consulta las etapas y enseñanzas que ofrece el centro.",
    intro: "La oferta educativa incluye las enseñanzas y materias que el centro imparta cada curso.",
    groups: [
      {
        title: "Etapas educativas",
        items: ["Educación Secundaria Obligatoria", "Bachillerato", "Formación Profesional"],
      },
      {
        title: "Oferta académica",
        items: ["Materias optativas"],
      },
    ],
  },
  secretaria: {
    title: "Secretaría",
    description: "Información sobre trámites administrativos y atención de Secretaría.",
    intro: "Consulta información para solicitar cita previa y realizar trámites administrativos.",
    groups: [
      {
        title: "Atención",
        items: ["Cita previa"],
      },
      {
        title: "Trámites",
        items: ["Matrícula", "Certificados", "Otros trámites administrativos"],
      },
    ],
  },
  programas: {
    title: "Programas",
    description: "Planes y programas educativos del IES Ramón Arcas Meca.",
    intro: "Los programas del centro se presentarán agrupados por categorías para facilitar su consulta.",
    groups: [
      {
        title: "Programas educativos",
        items: ["Erasmus+", "eTwinning", "Bachillerato Internacional", "Programas de Formación Profesional"],
      },
      {
        title: "Planes de centro",
        items: ["Plan Digital", "Bienestar", "Convivencia", "Igualdad"],
      },
      {
        title: "Actividades",
        items: ["Información de actividades y proyectos del centro"],
      },
    ],
  },
  noticias: {
    title: "Noticias",
    description: "Actualidad, eventos y novedades del centro educativo.",
    intro: "Blog de actualidad del centro. Las noticias se mostrarán aquí cuando se conecte el backend editorial.",
    groups: [
      {
        title: "Actualidad del centro",
        items: ["Próximamente se publicarán noticias y eventos."],
      },
    ],
  },
  contacto: {
    title: "Contacto",
    description: "Información de contacto del IES Ramón Arcas Meca.",
    intro: "En este apartado se publicarán los datos oficiales de contacto del centro.",
    groups: [
      {
        title: "Centro educativo",
        items: ["IES Ramón Arcas Meca", "Totana, Murcia", "Los datos de contacto se añadirán tras su validación."],
      },
    ],
  },
} satisfies Record<string, PublicSection>;

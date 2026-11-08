CREATE TABLE paginas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    padre_id BIGINT UNSIGNED NULL,
    slug VARCHAR(160) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    orden INT NOT NULL,
    tipo_contenido VARCHAR(40) NOT NULL,
    visible BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_paginas_slug (slug),
    KEY idx_paginas_padre_id (padre_id),
    CONSTRAINT fk_paginas_padre
        FOREIGN KEY (padre_id) REFERENCES paginas (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contenidos_paginas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    pagina_id BIGINT UNSIGNED NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    resumen TEXT NULL,
    cuerpo MEDIUMTEXT NOT NULL,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_contenidos_paginas_pagina_id (pagina_id),
    CONSTRAINT fk_contenidos_paginas_pagina
        FOREIGN KEY (pagina_id) REFERENCES paginas (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE documentos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    categoria VARCHAR(40) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    subido_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pagina_documentos (
    pagina_id BIGINT UNSIGNED NOT NULL,
    documento_id BIGINT UNSIGNED NOT NULL,
    orden INT NOT NULL,
    PRIMARY KEY (pagina_id, documento_id),
    KEY idx_pagina_documentos_documento_id (documento_id),
    CONSTRAINT fk_pagina_documentos_pagina
        FOREIGN KEY (pagina_id) REFERENCES paginas (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pagina_documentos_documento
        FOREIGN KEY (documento_id) REFERENCES documentos (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE programas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE programa_documentos (
    programa_id BIGINT UNSIGNED NOT NULL,
    documento_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (programa_id, documento_id),
    KEY idx_programa_documentos_documento_id (documento_id),
    CONSTRAINT fk_programa_documentos_programa
        FOREIGN KEY (programa_id) REFERENCES programas (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_programa_documentos_documento
        FOREIGN KEY (documento_id) REFERENCES documentos (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE departamentos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(160) NOT NULL,
    descripcion TEXT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_departamentos_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE departamento_programa (
    departamento_id BIGINT UNSIGNED NOT NULL,
    programa_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (departamento_id, programa_id),
    KEY idx_departamento_programa_programa_id (programa_id),
    CONSTRAINT fk_departamento_programa_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamentos (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_departamento_programa_programa
        FOREIGN KEY (programa_id) REFERENCES programas (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE noticias (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    resumen TEXT NULL,
    cuerpo MEDIUMTEXT NOT NULL,
    publicada_en DATETIME NULL,
    estado VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_noticias_estado (estado),
    KEY idx_noticias_publicada_en (publicada_en)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE personas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    cargo VARCHAR(160) NULL,
    orden INT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ensenanzas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(160) NOT NULL,
    descripcion TEXT NULL,
    orden INT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE materias_optativas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ensenanza_id BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(160) NOT NULL,
    descripcion TEXT NULL,
    PRIMARY KEY (id),
    KEY idx_materias_optativas_ensenanza_id (ensenanza_id),
    CONSTRAINT fk_materias_optativas_ensenanza
        FOREIGN KEY (ensenanza_id) REFERENCES ensenanzas (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE configuracion_centro (
    clave VARCHAR(100) NOT NULL,
    valor TEXT NOT NULL,
    PRIMARY KEY (clave)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE solicitudes_secretaria (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tipo VARCHAR(40) NOT NULL,
    nombre_solicitante VARCHAR(160) NOT NULL,
    email VARCHAR(254) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL,
    creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_solicitudes_secretaria_estado (estado)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

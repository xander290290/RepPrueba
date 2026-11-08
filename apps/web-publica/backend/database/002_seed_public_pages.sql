SET NAMES utf8mb4;

INSERT INTO paginas (slug, titulo, orden, tipo_contenido, visible)
VALUES
    ('inicio', 'Inicio', 0, 'inicio', TRUE),
    ('organizacion', 'Organización', 1, 'pagina', TRUE),
    ('familias', 'Familias', 2, 'pagina', TRUE),
    ('ensenanzas', 'Enseñanzas', 3, 'pagina', TRUE),
    ('secretaria', 'Secretaría', 4, 'pagina', TRUE),
    ('programas', 'Programas', 5, 'programas', TRUE),
    ('noticias', 'Noticias', 6, 'noticias', TRUE),
    ('contacto', 'Contacto', 7, 'pagina', TRUE)
ON DUPLICATE KEY UPDATE
    titulo = VALUES(titulo),
    orden = VALUES(orden),
    tipo_contenido = VALUES(tipo_contenido),
    visible = VALUES(visible);

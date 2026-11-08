SET NAMES utf8mb4;

INSERT INTO paginas (slug, titulo, orden, tipo_contenido, visible)
VALUES ('aula-creativa', 'Aula creativa', 8, 'pagina', TRUE)
ON DUPLICATE KEY UPDATE
    titulo = VALUES(titulo),
    orden = VALUES(orden),
    tipo_contenido = VALUES(tipo_contenido),
    visible = VALUES(visible);

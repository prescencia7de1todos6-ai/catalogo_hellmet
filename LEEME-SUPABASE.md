# HELLMET — Guía de conexión a Supabase

## 1. Pegar tus llaves

Archivo: `Services/Supabase.js` — pega `SUPABASE_URL` y `SUPABASE_ANON_KEY`
(Project Settings → API en tu proyecto de Supabase).

## 2. Login actual (usuario/contraseña directo)

Por decisión del momento, el login usa la tabla `administrador` directo
(columnas `usuario` y `contraseña`), no Supabase Auth. Es más simple para
seguir avanzando, pero ten en cuenta que no es seguro para producción —
cuando el sitio esté listo para publicarse de verdad, conviene retomar
Auth o mover la validación a una Edge Function.

## 3. Sucursal y Redes Sociales — esquema actual

`sucursal` = ubicación física. `red_social` = publicidad general del
negocio, ya NO depende de una sucursal, se relaciona con `administrador`.
`sucursal` separa la dirección en texto (`ubicacion`) del enlace de
Google Maps (`url_ubi`):

```sql
create table sucursal(
  id_sucursal varchar(15) not null primary key,
  nom_sucursal varchar(50) not null,
  celular varchar(15) not null,
  ubicacion varchar(150),
  url_ubi varchar(200),
  activo boolean not null default true,
  fec_reg timestamp not null default now(),
  id_admin_reg varchar(15) not null,
  fec_act timestamp,
  id_admin_act varchar(15),
  foreign key(id_admin_reg) references administrador(id_admin),
  foreign key(id_admin_act) references administrador(id_admin)
);

create table red_social(
  id_red varchar(15) not null primary key,
  nom_red varchar(30) not null,
  url_red varchar(150) not null,
  id_admin_reg varchar(15) not null,
  fec_act timestamp,
  id_admin_act varchar(15),
  foreign key(id_admin_reg) references administrador(id_admin),
  foreign key(id_admin_act) references administrador(id_admin)
);
```

Si tu tabla `sucursal` ya existía sin `url_ubi`:
```sql
alter table sucursal add column url_ubi varchar(200);
```

Funciones SQL actualizadas (ya incluyen `url_ubi`):

```sql
CREATE OR REPLACE FUNCTION insertar_sucursal(
    n_nombre varchar(50), n_celular varchar(15), n_ubicacion varchar(150),
    n_url_ubi varchar(200), n_admin varchar(15)
)
RETURNS VARCHAR(15) LANGUAGE plpgsql AS $$
DECLARE nuevo_id VARCHAR(15); numero INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(id_sucursal FROM 5) AS INTEGER)), 0) + 1
    INTO numero FROM sucursal WHERE id_sucursal LIKE 'SUC_%';
    nuevo_id := 'SUC_' || LPAD(numero::TEXT, 3, '0');
    INSERT INTO sucursal (id_sucursal, nom_sucursal, celular, ubicacion, url_ubi, id_admin_reg)
    VALUES (nuevo_id, n_nombre, n_celular, n_ubicacion, n_url_ubi, n_admin);
    RETURN nuevo_id;
END; $$;

CREATE OR REPLACE FUNCTION actualizar_sucursal(
    n_id_sucursal varchar(15), n_nombre varchar(50), n_celular varchar(15),
    n_ubicacion varchar(150), n_url_ubi varchar(200), n_admin varchar(15)
)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    UPDATE sucursal SET nom_sucursal = n_nombre, celular = n_celular,
        ubicacion = n_ubicacion, url_ubi = n_url_ubi, fec_act = now(), id_admin_act = n_admin
    WHERE id_sucursal = n_id_sucursal;
END; $$;
```

`Services/Sucursal_redes.js` ya está ajustado: `listarSucursales()` solo
consulta `sucursal`, `listarRedes()` solo consulta `red_social`.

Las redes sociales y las direcciones (como enlace a `url_ubi`) se muestran
automáticamente en el **footer de todas las páginas públicas**
(`Componentes/Footer.js`).

## 4. Columna "activo" en producto (obligatoria)

Las páginas de categoría y de producto identifican cada producto por su
`id_prod` (no se usa "slug" — se descartó esa idea, `id_prod` ya es único
y no hace falta agregar nada nuevo). Lo único que sí hace falta:

```sql
alter table producto add column activo boolean not null default true;
```

## 4.1 Tabla "caracteristica" (reemplaza a elemento + dato_extra)

Se descartó la idea de tener características "generales reutilizables"
(la tabla `elemento`) — el cliente pidió poder escribir libremente el
elemento y su cualidad para cada producto, aunque se repita el texto
entre productos distintos. Por eso `elemento` y `dato_extra` se
eliminaron, y se reemplazaron por una sola tabla, 1:N con `producto`:

```sql
drop table producto_elemento;
drop table elemento;
drop table dato_extra;

create table caracteristica(
  id_carac varchar(15) primary key not null,
  elemento varchar(100) not null,
  cualidad varchar(300),
  id_prod varchar(15),
  foreign key(id_prod) references producto(id_prod)
);

CREATE OR REPLACE FUNCTION insertar_caracteristica(
    n_etiqueta varchar(100),
    n_valor varchar(300),
    n_prod varchar(15)
)
RETURNS VARCHAR(15)
LANGUAGE plpgsql
AS $$
DECLARE
    nuevo_id VARCHAR(15);
    numero INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(id_carac FROM 7) AS INTEGER)), 0) + 1
    INTO numero
    FROM caracteristica
    WHERE id_carac LIKE 'CARAC_%';

    nuevo_id := 'CARAC_' || LPAD(numero::TEXT, 3, '0');

    INSERT INTO caracteristica (id_carac, elemento, cualidad, id_prod)
    VALUES (nuevo_id, n_etiqueta, n_valor, n_prod);
    RETURN nuevo_id;
END;
$$;
```

En el catálogo público, cada fila se muestra como `ELEMENTO: CUALIDAD`
(o solo `ELEMENTO` si no tiene cualidad), y al final de la lista se
agrega una línea `COLORES: ...` con los colores que el producto tenga
asignados desde `producto_color`.

No olvides la política de **escritura** para poder registrar/editar/
eliminar desde el panel (igual que hiciste con `producto`, `img_producto`,
etc.):
```sql
create policy "escritura publica" on caracteristica for all using (true) with check (true);
```

## 4.2 Columna "url_img" demasiado corta (bug real, ya corregido)

`img_producto.url_img` estaba como `varchar(200)`, y las URLs reales de
Supabase Storage + nombres de archivo largos (fotos de celular,
capturas de pantalla) a veces superaban ese límite. Cuando pasaba,
Supabase rechazaba la fila — pero la imagen ya se había subido a
Storage un paso antes, dejando archivos huérfanos ahí sin registrar en
la base de datos. Corre esto una sola vez:

```sql
alter table img_producto alter column url_img type text;
```

También se ajustó `Services/Productos.js` para generar nombres de
archivo cortos (timestamp + extensión) en vez de usar el nombre
original completo, reduciendo el riesgo de que esto vuelva a pasar.

Ya no hay límite de cantidad de imágenes por producto en el panel — se
había puesto un tope de 10 al principio, pero se quitó porque no hacía
falta.

**Nota**: los archivos que quedaron huérfanos en Storage antes de este
arreglo no se recuperan solos — si algún producto quedó sin imágenes
(como pasó), hay que volver a subirlas desde el panel. Los archivos
viejos sin usar en Storage se pueden borrar manualmente cuando quieras,
no afectan nada mientras estén ahí.

## 5. RLS pendiente

Para que las páginas públicas y el Dashboard carguen datos, cada tabla
que consultan necesita RLS activado + una política de lectura pública:

```sql
create policy "lectura publica" on categoria for select using (true);
create policy "lectura publica" on producto for select using (true);
create policy "lectura publica" on img_producto for select using (true);
create policy "lectura publica" on caracteristica for select using (true);
create policy "lectura publica" on sucursal for select using (true);
create policy "lectura publica" on red_social for select using (true);
```

`administrador` es la excepción — ahí NO conviene lectura 100% pública
en el sitio final (mantenla más restringida cuando termines de probar).

## 6. Reporte de cambios (vista)

La sección "Reporte de cambios" en `Administrador/Sucursal_redes.html`
lee una vista que hay que crear una sola vez en Supabase:

```sql
create or replace view vista_reporte_cambios as
select 'Producto' as tipo, p.id_prod as id_registro, p.nom_prod as nombre,
  p.fec_reg as fecha_registro,
  ar.nom_admin || ' ' || ar.ape_admin as registrado_por,
  null::timestamp as fecha_actualizacion, null::text as actualizado_por
from producto p
left join administrador ar on ar.id_admin = p.id_admin
union all
select 'Sucursal', s.id_sucursal, s.nom_sucursal, s.fec_reg,
  ar.nom_admin || ' ' || ar.ape_admin, s.fec_act,
  aa.nom_admin || ' ' || aa.ape_admin
from sucursal s
left join administrador ar on ar.id_admin = s.id_admin_reg
left join administrador aa on aa.id_admin = s.id_admin_act
union all
select 'Red social', r.id_red, r.nom_red, null::timestamp,
  ar.nom_admin || ' ' || ar.ape_admin, r.fec_act,
  aa.nom_admin || ' ' || aa.ape_admin
from red_social r
left join administrador ar on ar.id_admin = r.id_admin_reg
left join administrador aa on aa.id_admin = r.id_admin_act;

grant select on vista_reporte_cambios to anon, authenticated;
```

Limitaciones con el esquema actual (a propósito, para no modificar la
base de datos todavía): los **productos** no muestran quién los editó
(la tabla no tiene `id_admin_act` ni `fec_act`), y las **redes sociales**
no muestran fecha de registro (no tienen `fec_reg`). Esos campos salen
como "—" en el reporte.

## 7. Checklist rápido

- [ ] Pegar URL y anon key en `Services/Supabase.js`
- [ ] Columna `activo` en `producto`
- [ ] Tablas `sucursal` y `red_social` con el esquema de arriba
- [ ] RLS + políticas de lectura pública en las tablas del punto 5

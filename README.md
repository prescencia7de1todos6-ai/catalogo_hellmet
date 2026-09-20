# HELLMET

Catálogo web + panel de administración de HELLMET (equipos de cocción).

## Notas para subir esto a GitHub

- **`.nojekyll`**: no lo borres. GitHub Pages usa un motor llamado Jekyll
  por defecto, que ignora carpetas que empiezan con `_` y puede romper
  algunos archivos. Este archivo vacío le dice "sirve todo tal cual está".
- **Mayúsculas y minúsculas importan en GitHub** (a diferencia de Windows
  o Mac). Si renombras una carpeta o archivo cambiando solo mayúsculas
  por minúsculas, hazlo con cuidado — a veces Git no detecta el cambio
  bien en tu computadora, y termina subiendo ambas versiones. Evita
  renombrar así; si pasa, borra la carpeta del repo remoto y vuelve a
  subirla completa.
- **Rutas relativas**: todo el sitio usa rutas relativas (`../Assets/...`),
  así que funciona igual en tu computadora, en GitHub Pages, o dentro de
  la app empaquetada con Capacitor. No uses rutas que empiecen con `/`
  (barra al inicio) en ningún archivo nuevo que agregues, porque esas se
  rompen si el sitio no está en la raíz del dominio.
- **No subas tus llaves reales de Supabase a un repositorio público.**
  `Services/Supabase.js` es donde van, y ese archivo sí se sube (la
  anon key es segura para el navegador), pero si en algún momento usas
  una `service_role key`, esa nunca debe ir en ningún archivo de este
  proyecto.

## Estructura

```
HELLMET/
├── Administrador/     Login, Dashboard y páginas de gestión
├── Assets/             Css, Js, Img
├── Componentes/        Header, Footer, Navbar reutilizables
├── Paginas/             Categorias/ y Productos/ (público)
├── Services/            Toda la lógica de conexión a Supabase
└── Utils/               Mensajes/alertas compartidos
```

## Cómo probarlo localmente

Usa **Live Server** (extensión de VS Code) o cualquier servidor local.
No abras los archivos con doble clic (`file://`) — algunas funciones
(`fetch`, módulos, Supabase) no funcionan así.
